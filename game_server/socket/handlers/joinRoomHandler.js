import CardGameRoom from "../../models/CardGameRoom.js";
import {startGame} from "../../utils/twocard/startGame.js";


export default function joinRoomHandler(io, socket) {
  socket.on("join-room", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Update DB
    await CardGameRoom.updateOne(
      { roomId, "players.user": userId },
      { $set: { "players.$.socketId": socket.id } }
    );

    const room = await CardGameRoom.findOne({ roomId });
    if (!room) return;

    const allConnected =
      room.players.length === 2 && room.players.every((p) => p.socketId);

    if (allConnected && room.status !== "in-progress") {
      console.log("Starting the game");
      startGame(io, room);
    }

    if (allConnected && room.status === "in-progress") {
      const p1 = room.players[0].user.toString();
      const p2 = room.players[1].user.toString();

      io.to(room.roomId).emit("game-started", {
        players: room.players.map((p) => p.user),
        turn: room.turn,
        counts: Object.fromEntries(
          room.players.map((p) => [p.user, room.hands.get(p.user).length])
        ),
        centerPile:room.centerPile
      });

      io.to(room.players[0].socketId).emit("your-hand", room.hands.get(p1));
      io.to(room.players[1].socketId).emit("your-hand", room.hands.get(p2));
    }
  });
};
