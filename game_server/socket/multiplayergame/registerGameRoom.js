export default function registerGameRoom(io, socket) {
  // When a player joins a game room
  socket.on("join-game-room", ({ roomId }) => {
    socket.join(roomId);

    // Notify other players in the room
    socket.to(roomId).emit("player-joined", {
      playerId: socket.id,
    });

    console.log(`🎮 Player joined room ${roomId}:`, socket.id);
  });

  // Player movement
  socket.on("position", ({ roomId, x, y, z }) => {

    io.to(roomId).emit("new-position", {
      playerId: socket.id,
      x,
      y,
      z,
    });
  });

  socket.on("damage-player", ({ targetId, damage }) => {
    console.log(targetId, damage);
    const targetSocket = io.sockets.sockets.get(targetId);
    if (!targetSocket) return;

    targetSocket.health = Math.max(0, (targetSocket.health || 100) - damage);

    // notify the target only
    targetSocket.emit("health-update", targetSocket.health);
  });

  // When player disconnects
  socket.on("disconnect", () => {
    // Inform ALL rooms this player was in
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);

    rooms.forEach((roomId) => {
      io.to(roomId).emit("player-left", { playerId: socket.id });
    });

    console.log("❌ Player disconnected:", socket.id);
  });
}
