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

  const p1 = room.players[0].user._id.toString();
  const p2 = room.players[1].user._id.toString();

  // ---- Initialize playerState if missing ----
  if (!room.playerState.has(p1)) {
    room.playerState.set(p1, {
      name: room.players[0].user.name,
      hand: [],
      center: null,
      throw: false,
      count: 0,
      isTurn: false,
    });
  }

  if (!room.playerState.has(p2)) {
    room.playerState.set(p2, {
      name: room.players[1].user.name,
      hand: [],
      center: null,
      throw: false,
      count: 0,
      isTurn: false,
    });
  }

  // ---- Assign hands ----
  room.playerState.get(p1).hand = deck.slice(0, half);
  room.playerState.get(p2).hand = deck.slice(half);

  // ---- Set whose turn ----
  room.playerState.get(p1).isTurn = true;
  room.playerState.get(p2).isTurn = false;

  // ---- Save full deck (optional) ----
  room.deck = deck;

  await room.save();

  // Broadcast game start
  // Extract public player state for everyone
  const publicState = {};

  room.playerState.forEach((state, userId) => {
    publicState[userId] = {
      count: state.hand.length,
      center: null, // initial center is empty
      throw: false, // initial throw is false
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
    console.log("The hand", hand);

    io.to(socketId).emit("your-hand", hand);
  });
}
