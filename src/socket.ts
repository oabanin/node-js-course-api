let io:any;
import { Server } from "socket.io";

const init = (httpServer:any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000 ",
      methods: ["GET", "POST"],
      //allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });
  // io = require('socket.io')(httpServer,{
  //   cors: {
  //     origin: "http://localhost:3000 ",
  //    // methods: ["GET", "POST"],
  //     //allowedHeaders: ["my-custom-header"],
  //     credentials: true
  //   }
  // });
  return io;
}

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export {init,getIO}
