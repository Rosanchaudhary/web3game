import CardGameRoom from "../../models/CardGameRoom.js";
import { parsePlayers } from "../../socket/handlers/joinRoomHandler.js";

//utils/twocard/startGame.js
export async function startGame(io, room) {
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

  await CardGameRoom.findOneAndUpdate(
    { roomId: room.roomId, "players.user": p1 },
    {
      $set: {
        "players.$.hand": deck.slice(0, half),
      },
    },
    { new: true }
  );

  const newRoom = await CardGameRoom.findOneAndUpdate(
    { roomId: room.roomId, "players.user": p2 },
    {
      $set: {
        "players.$.hand": deck.slice(half),
        status: "in-progress",
      },
    },
    { new: true }
  ).populate("players.user", "name");

  const playerState = parsePlayers(newRoom.players);
  io.to(room.roomId).emit("player-update", {
    playerState,
    turn: room.turn,
  });

  // Send each player their own hand privately
  newRoom.players.forEach((player) => {
    const socketId = player.socketId;
    const hand = player.hand || [];
    io.to(socketId).emit("your-hand", hand);
  });
}
