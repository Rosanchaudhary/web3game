// utils/twocard/startGame.js
import CardGameRoom from "../../models/CardGameRoom.js";
import { parsePlayers } from "./parsePlayers.js";

export async function startGame(io, room) {
  // -------------------------------
  // 1. Build 52-card deck
  // -------------------------------
  const suits = ["S", "H", "D", "C"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

  let deck = [];
  suits.forEach(s => ranks.forEach(r => deck.push(r + s)));

  // -------------------------------
  // 2. Shuffle
  // -------------------------------
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // -------------------------------
  // 3. Split deck evenly per player
  // -------------------------------
  const totalPlayers = room.players.length;
  const cardsPerPlayer = Math.floor(deck.length / totalPlayers);

  const updates = [];
  let index = 0;

  for (let i = 0; i < totalPlayers; i++) {
    const playerId = room.players[i].user._id.toString();
    const hand = deck.slice(index, index + cardsPerPlayer);
    index += cardsPerPlayer;

    updates.push({
      updateOne: {
        filter: { roomId: room.roomId, "players.user": playerId },
        update: {
          $set: {
            "players.$.hand": hand,
            status: "in-progress",
            turn: room.players[0].user._id.toString(), // FIRST PLAYER TURN
          }
        }
      }
    });
  }

  // -------------------------------
  // 4. Save changes atomically
  // -------------------------------
  await CardGameRoom.bulkWrite(updates);

  // Fetch updated room
  const updatedRoom = await CardGameRoom.findOne({ roomId: room.roomId })
    .populate("players.user", "name");

  const playerState = parsePlayers(updatedRoom.players);

  // -------------------------------
  // 5. Broadcast player state + turn
  // -------------------------------
  io.to(room.roomId).emit("player-update", {
    playerState,
    turn: updatedRoom.turn,
  });

  // -------------------------------
  // 6. Emit each player’s private hand
  // -------------------------------
  updatedRoom.players.forEach(player => {
    io.to(player.socketId).emit("your-hand", player.hand);
  });
}
