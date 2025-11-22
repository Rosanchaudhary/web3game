import CardGameRoom from "../../models/CardGameRoom.js";
import { parsePlayers } from "../../utils/twocard/parsePlayers.js";
import { startGame } from "../../utils/twocard/startGame.js";



export default function joinRoomHandler(io, socket) {
  socket.on("join-room", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Update DB
    const room = await CardGameRoom.findOneAndUpdate(
      { roomId, "players.user": userId },
      {
        $set: {
          "players.$.socketId": socket.id,
          "players.$.lastActive": new Date(),
        },
      },
      { new: true }
    ).populate("players.user", "name"); // only return the name field

    if (!room) return;

    if (room.status === "waiting") {
      // Broadcast to all players once
      io.to(room.roomId).emit("player-update", {
        playerState: parsePlayers(room.players),
        turn: room.turn,
      });
    }

    const allConnected =
      room.players.length === 2 && room.players.every((p) => p.socketId);

    if (allConnected && room.status !== "in-progress") {
      startGame(io, room);
    }

    if (allConnected && room.status === "in-progress") {
      const playerState = parsePlayers(room.players);

      // Broadcast to all players once
      io.to(room.roomId).emit("player-update", {
        playerState,
        turn: room.turn,
      });

      // Send each player their own hand privately
      room.players.forEach((player) => {
        io.to(player.socketId).emit("your-hand", player.hand);
      });
    }
  });
}
