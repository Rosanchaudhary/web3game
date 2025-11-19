import CardGameRoom from "../../models/CardGameRoom.js";

export default function playCardHandler(io, socket) {
  socket.on("play-card", async ({ roomId, userId, card }) => {
    const room = await CardGameRoom.findOne({ roomId });
    if (!room) return;

    // turn validation
    if (room.turn !== userId) {
      return socket.emit("error-message", "Not your turn");
    }

    // remove card
    const hand = room.hands.get(userId);
    const index = hand.indexOf(card);

    if (index === -1) {
      return socket.emit("error-message", "Invalid card");
    }

    hand.splice(index, 1);
    room.hands.set(userId, hand);
    room.markModified("hands");

    // switch turn
    const players = room.players.map((p) => p.user.toString());
    room.turn = players.find((p) => p !== userId);

    await room.save();

    // broadcast
    io.to(roomId).emit("card-played", { userId, card });
    io.to(roomId).emit("turn-updated", { turn: room.turn });
    io.to(roomId).emit("card-count-updated", {
      userId,
      count: hand.length,
    });
  });
};
