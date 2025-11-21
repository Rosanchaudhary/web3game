//route/twocard.js
import express from "express";
import auth from "../middleware/auth.js";
import CardGameRoom from "../models/CardGameRoom.js";

const router = express.Router();

// play start
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    console.log(req.body);

    // Emit via Socket.IO
    const io = req.app.get("io");
    io.to(req.body.roomId).emit("card-message", req.body.card);

    res.json({ room: "" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ CREATE GAME ------------------
router.post("/create", auth, async (req, res) => {
  try {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newRoom = new CardGameRoom({
      roomId,
      players: [{ user: req.user.id }],
      status: "waiting",
    });

    await newRoom.save();

    return res.status(201).json({ roomId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ------------------ LIST ACTIVE GAMES ------------------
router.get("/active", async (req, res) => {
  try {
    const rooms = await CardGameRoom.find({ status: "waiting" }).select(
      "roomId players createdAt"
    );

    return res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ------------------ JOIN GAME ------------------
router.post("/join", auth, async (req, res) => {
  const { roomId } = req.body;

  let room = await CardGameRoom.findOne({ roomId });
  if (!room) return res.status(404).json({ error: "Not found" });

  // Prevent duplicate joining
  if (room.players.some((p) => p.user.toString() === req.user.id)) {
    return res.status(400).json({ error: "Already joined" });
  }

  // Room full
  if (room.players.length >= 2) {
    return res.status(400).json({ error: "Room full" });
  }

  // Add player
  room.players.push({ user: req.user.id });

  if (room.players.length === 2) {
    room.status = "ready";
  }

  await room.save();

  return res.json({ status: "joined" });
});

router.post("/play-card", async (req, res) => {
  const io = req.app.get("io");
  const { roomId, userId, card } = req.body;

  try {
    const room = await CardGameRoom.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const player = room.playerState.get(userId);
    if (!player) return res.status(404).json({ error: "Player not found" });

    // validate turn
    if (!player.isTurn) return res.status(403).json({ error: "Not your turn" });

    // validate card
    const cardIndex = player.hand.indexOf(card);
    if (cardIndex === -1)
      return res.status(400).json({ error: "Card not in hand" });

    // apply move
    player.hand.splice(cardIndex, 1);
    player.center = card;
    player.isTurn = false;
    player.throw = true;
    room.playerState.set(userId, player);

    // set turn for next player
    let assigned = false;
    for (const [id, p] of room.playerState.entries()) {
      if (!assigned && id !== userId) {
        p.isTurn = true;
        room.playerState.set(id, p);
        assigned = true;
      }
    }

    await room.save();

    // broadcast public state
    const publicState = {};
    room.playerState.forEach((state, uid) => {
      publicState[uid] = {
        name: state.name,
        count: state.hand.length,
        center: state.center,
        throw: state.throw,
        isTurn: state.isTurn,
      };
    });

    io.to(room.roomId).emit("player-update", publicState);

    // --- AUTO RESET WHEN ALL THROW = TRUE ---
    const allThrown = [...room.playerState.values()].every(
      (p) => p.throw === true
    );

    if (allThrown) {
      setTimeout(async () => {
        try {
          const freshRoom = await CardGameRoom.findOne({ roomId });
          if (!freshRoom) return;

          freshRoom.playerState.forEach((p, uid) => {
            p.throw = false;
            p.center = null;
            freshRoom.playerState.set(uid, p);
          });

          await freshRoom.save();

          const updatedState = {};
          freshRoom.playerState.forEach((state, uid) => {
            updatedState[uid] = {
              name: state.name,
              count: state.hand.length,
              center: state.center,
              throw: state.throw,
              isTurn: state.isTurn,
            };
          });

          io.to(freshRoom.roomId).emit("player-update", updatedState);
        } catch (err) {
          console.error("Throw reset failed:", err);
        }
      }, 2000);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("play-card route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
