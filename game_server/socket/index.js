// socket/index.js
import registerJoinRoom from "./handlers/joinRoomHandler.js";
import registerLeaveRoom from "./handlers/leaveRoomHandler.js";
import registerRoomMessage from "./handlers/roomMessageHandler.js";

export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔥 New client connected:", socket.id);

    registerJoinRoom(io, socket);
    registerLeaveRoom(io, socket);
    registerRoomMessage(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}

