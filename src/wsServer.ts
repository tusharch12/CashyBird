import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';

let waitingForRoom:any = null;
let rooms = new Map();
const pendingScores = new Map<string, { aScore: number | null; bScore: number | null }>();

export function setupWebSocketServer(server:any){
  const wss = new WebSocketServer({ server });
  wss.on("connection",(socket)=>{
   socket.on('message',(event)=>{
  
       const parsedMsg =  JSON.parse(event.toString());
       switch(parsedMsg.type){
        case 'findMatch' : {
          if(!waitingForRoom){
              const roomId = uuidv4();             // create room 
              const client = new Set([socket]);
              rooms.set(roomId,client);
            waitingForRoom = {roomId,client}
            const response = {
              type: "findMatch",
              roomId: roomId,
            };
     
            socket.send(JSON.stringify(response));
          } else {
            const clients = rooms.get(waitingForRoom.roomId);
            clients.add(socket);
  
            rooms.set(waitingForRoom.roomId,clients);
            pendingScores.set(waitingForRoom.roomId,{aScore:null,bScore:null})
  
           clients.forEach((peer:WebSocket) => {
            const response = {
              type:'joinedRoom',
              roomId:waitingForRoom.roomId,
            }
            peer.send(JSON.stringify(response))
           });
           waitingForRoom = null;
             
          }
          break;
        }
  
        case 'gameStart' : {
          console.log("Enter in game start........")
           
          const peers = rooms.get(parsedMsg.roomId);
          const response = {
            type:'gameStart',
            roomId: parsedMsg.roomId,
            payload : {
              msg:parsedMsg.payload.msg,
              gameStatus: parsedMsg.payload.status
            }
          }
  
  
          peers.forEach((peer:WebSocket)=>{
             peer==socket?'': peer.send(JSON.stringify(response))
          })
          break;
        }
  
        case 'gameOver':{
  
               let scores = pendingScores.get(parsedMsg.roomId);
               const peers = rooms.get(parsedMsg.roomId);
               const [peerA,peerB] = peers;
               console.log("scores 1...........", scores)
               if(scores){
                console.log("Inside loop")
  
                if(socket == peerA)
                  { scores.aScore = Number(parsedMsg.payload.msg);}
                else {scores.bScore= Number(parsedMsg.payload.msg);}
                
                if(scores.aScore !==null && scores.bScore !==null){
                 let winnerSocket, loserSocket;
             let winScore, loseScore;
             console.log("Both Stop game ......")
   
             if (scores.aScore > scores.bScore) {
                console.log("if condition")
               winnerSocket = peerA;
               loserSocket  = peerB;
               winScore     = scores.aScore;
               loseScore    = scores.bScore;
             } else {
              console.log("else condition")
               winnerSocket = peerB;
               loserSocket  = peerA;
               winScore     = scores.bScore;
               loseScore    = scores.aScore;
             }
             console.log("looser..............",loserSocket)
             console.log("winner..............",loserSocket)
   
             // Notify winner
             winnerSocket.send(JSON.stringify({
               type: 'gameResult',
               result: 'win',
               yourScore:    winScore,
               opponentScore: loseScore
             }));
   
             // Notify loser
             loserSocket.send(JSON.stringify({
               type: 'gameResult',
               result: 'lose',
               yourScore:    loseScore,
               opponentScore: winScore
             }));
   
              rooms.delete(parsedMsg.roomId);
              pendingScores.delete(parsedMsg.roomId)
                }
               }
               else{
                console.log("kuch nhi hai")
               }
               
              
             
             break;
        }
       }
   })
  })    
  
}
