import CardGameRoom from "../../models/CardGameRoom.js";
import { startGame } from "../../utils/twocard/startGame.js";

export default function joinRoomHandler(io, socket) {
  socket.on("join-room", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Update DB
    await CardGameRoom.updateOne(
      { roomId, "players.user": userId },
      { $set: { "players.$.socketId": socket.id } }
    );

    const room = await CardGameRoom.findOne({ roomId }).populate(
      "players.user",
      "name"
    );
    console.log(room.players[0].user);
    if (!room) return;

    const allConnected =
      room.players.length === 2 && room.players.every((p) => p.socketId);

    if (allConnected && room.status !== "in-progress") {
      startGame(io, room);
    }

    if (allConnected && room.status === "in-progress") {
      const publicState = {};

      room.playerState.forEach((state, userId) => {
        publicState[userId] = {
          count: state.hand.length,
          center: state.center,
          throw: state.throw,
          name: state.name,
          isTurn: state.isTurn,
        };
      });

      // Broadcast to all players once
      io.to(room.roomId).emit("player-update", publicState);

      // Send each player their own hand privately
      room.players.forEach((player) => {
        const userId = player.user._id.toString();
        const socketId = player.socketId;
        const hand = room.playerState.get(userId)?.hand || [];

        io.to(socketId).emit("your-hand", hand);
      });
    }
  });
}
