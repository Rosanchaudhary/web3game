//utils/twocard/startGame.js
export async function startGame(io, room) {
  room.status = "in-progress";

  const suits = ["S", "H", "D", "C"];
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  let deck = [];
  suits.forEach((s) => ranks.forEach((r) => deck.push(r + s)));

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const half = deck.length / 2;

  const p1 = room.players[0].user.toString();
  const p2 = room.players[1].user.toString();

  room.hands.set(p1, deck.slice(0, half));
  room.hands.set(p2, deck.slice(half));

  room.turn = p1;
  room.deck = deck;

  await room.save();

  // Broadcast game start
  io.to(room.roomId).emit("game-started", {
    players: room.players.map((p) => p.user),
    turn: room.turn,
    counts: Object.fromEntries(
      room.players.map((p) => [p.user, room.hands.get(p.user).length])
    ),
  });

  // Send each player's own hand
  const s1 = room.players[0].socketId;
  const s2 = room.players[1].socketId;

  io.to(s1).emit("your-hand", room.hands.get(p1));
  io.to(s2).emit("your-hand", room.hands.get(p2));

  console.log("🔥 Game started for room", room.roomId);
}
