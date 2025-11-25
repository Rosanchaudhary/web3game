export default function registerGameRoom(io, socket) {
  socket.on("join-game-room", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("position", ({ roomId, x, y }) => {
    console.log("Position: x, y ",roomId, x, y);
    io.to(roomId).emit("new-position", { x, y });
  });

  socket.on("disconnect", () => {});
}
