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
  const room = await CardGameRoom.findOne({ roomId });
  if (!room) return res.status(404).json({ error: "Not found" });

  if (room.players.length >= 2)
    return res.status(400).json({ error: "Room full" });

  // Add player
  room.players.push({ user: req.user.id });

  // No game start here!
  if (room.players.length === 1) room.status = "waiting";
  if (room.players.length === 2) room.status = "ready";

  await room.save();
  res.json({ status: "joined" });
});

export default router;
