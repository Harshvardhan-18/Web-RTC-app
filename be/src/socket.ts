import { Server } from "socket.io";


export const socket = (io: Server) => {
    const usernameToSocketIdMap = new Map<string, string>();
    const socketIdToUsernameMap = new Map<string, string>();
    
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on("join-room", (data) => {
      const {username,roomId} = data;
      console.log("User joined room", roomId, "with username", username);
      usernameToSocketIdMap.set(username,socket.id);
      socketIdToUsernameMap.set(socket.id,username);
      io.to(roomId).emit("user-joined",{username,socketId:socket.id});
      socket.join(roomId);
      io.to(socket.id).emit("room-join",data);
    });
    socket.on("call-user",(data)=>{
     const {offer,to}=data;
     io.to(to).emit("incoming-call",{from:socket.id,offer});      
    })
    socket.on("call-accepted",(data)=>{ 
      const {to,answer}=data;
      io.to(to).emit("call-accepted",{from:socket.id,answer});
    }) 
    socket.on("ice-candidate", (data) => {
        const { to, candidate } = data;
        io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });
  });
};