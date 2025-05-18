import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8081 });
import { v4 as uuidv4 } from 'uuid';
let waitingForRoom = null;
let rooms = new Map();
const pendingScores = new Map();
wss.on("connection", (socket) => {
    socket.on('message', (event) => {
        const parsedMsg = JSON.parse(event.toString());
        switch (parsedMsg.type) {
            case 'findMatch': {
                if (!waitingForRoom) {
                    const roomId = uuidv4(); // create room 
                    const client = new Set([socket]);
                    rooms.set(roomId, client);
                    waitingForRoom = { roomId, client };
                    const response = {
                        type: "findMatch",
                        roomId: roomId,
                    };
                    console.log("respone....", response);
                    console.log("json string....", JSON.stringify(response));
                    socket.send(JSON.stringify(response));
                }
                else {
                    const clients = rooms.get(waitingForRoom.roomId);
                    clients.add(socket);
                    rooms.set(waitingForRoom.roomId, clients);
                    pendingScores.set(waitingForRoom.roomId, { aScore: null, bScore: null });
                    clients.forEach((peer) => {
                        const response = {
                            type: 'joinedRoom',
                            roomId: waitingForRoom.roomId,
                        };
                        peer.send(JSON.stringify(response));
                    });
                    waitingForRoom = null;
                }
                break;
            }
            case 'gameStart': {
                console.log("Enter in game start........");
                const peers = rooms.get(parsedMsg.roomId);
                const response = {
                    type: 'gameStart',
                    roomId: parsedMsg.roomId,
                    payload: {
                        msg: parsedMsg.payload.msg,
                        gameStatus: parsedMsg.payload.status
                    }
                };
                peers.forEach((peer) => {
                    peer == socket ? '' : peer.send(JSON.stringify(response));
                });
                break;
            }
            case 'gameOver': {
                let scores = pendingScores.get(parsedMsg.roomId);
                const peers = rooms.get(parsedMsg.roomId);
                if (scores) {
                    if (socket == peers[0])
                        scores.aScore = Number(parsedMsg.payload.msg);
                    else
                        scores.aScore = Number(parsedMsg.payload.msg);
                    if (scores.aScore !== null && scores.bScore !== null) {
                        let winnerSocket, loserSocket;
                        let winScore, loseScore;
                        if (scores.aScore > scores.bScore) {
                            winnerSocket = peers[0];
                            loserSocket = peers[1];
                            winScore = scores.aScore;
                            loseScore = scores.bScore;
                        }
                        else {
                            winnerSocket = peers[1];
                            loserSocket = peers[0];
                            winScore = scores.bScore;
                            loseScore = scores.aScore;
                        }
                        // Notify winner
                        winnerSocket.send(JSON.stringify({
                            type: 'gameResult',
                            result: 'win',
                            yourScore: winScore,
                            opponentScore: loseScore
                        }));
                        // Notify loser
                        loserSocket.send(JSON.stringify({
                            type: 'gameResult',
                            result: 'lose',
                            yourScore: loseScore,
                            opponentScore: winScore
                        }));
                        rooms.delete(parsedMsg.roomId);
                        pendingScores.delete(parsedMsg.roomId);
                    }
                }
                else {
                    console.log("kuch nhi hai");
                }
                break;
            }
        }
    });
});
