import CardGameRoom from "../../models/CardGameRoom.js";
import { startGame } from "../../utils/twocard/startGame.js";

export function parsePlayers(data) {
  const result = {};

  data.forEach((player) => {
    result[player.user._id.toString()] = {
      userId: player.user._id.toString(),
      name: player.user.name,
      center: player.center,
      throw: player.throw,
      hand: player.hand,
      count: player.hand.length,
    };
  });

  return result;
}

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
        const socketId = player.socketId;
        const hand = player.hand || [];
        io.to(socketId).emit("your-hand", hand);
      });
    }
  });
}
