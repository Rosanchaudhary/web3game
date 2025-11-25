// socket/index.js
import registerJoinRoom from "./handlers/joinRoomHandler.js";
import registerLeaveRoom from "./handlers/leaveRoomHandler.js";
import registerRoomMessage from "./handlers/roomMessageHandler.js";
import registerGameRoom from "./multiplayergame/registerGameRoom.js";
import registerCallHandlers from "./webrtc/registerCallHandlers.js";
import registerWebRTCRoom from "./webrtc/registerWebRTCRoom.js";

export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔥 New client connected:", socket.id);

    registerGameRoom(io,socket);

    registerJoinRoom(io, socket);
    registerLeaveRoom(io, socket);
    registerRoomMessage(io, socket);

    // WebRTC / Voice / Video handlers
    registerWebRTCRoom(io, socket);
    registerCallHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}
