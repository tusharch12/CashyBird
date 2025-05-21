
import http from 'http';
import app from './expressServer.js';
import {setupWebSocketServer} from './wsServer.js';
import db from './store/db.js';

const startServer = async ()=>{
  await db;
  const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(8080,()=>{
    console.log("Server running on 8080")
})
}

startServer().catch((err)=>{
   console.error("Server failed",err);
   process.exit(1);
});


