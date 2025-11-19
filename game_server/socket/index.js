// socket/index.js
import registerJoinRoom from "./handlers/joinRoomHandler.js";
import registerPlayCard from "./handlers/playCardHandler.js";
import registerLeaveRoom from "./handlers/leaveRoomHandler.js";
import registerRoomMessage from "./handlers/roomMessageHandler.js";

export default function initializeSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔥 New client connected:", socket.id);

    registerJoinRoom(io, socket);
    registerPlayCard(io, socket);
    registerLeaveRoom(io, socket);
    registerRoomMessage(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}


// /**
//  * Socket Events
//  */
// io.on("connection", (socket) => {
//   console.log("🔥 New client connected:", socket.id);

//   // join room
//   socket.on("join-room", async ({ roomId, userId }) => {
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // update player socketId in DB
//     await CardGameRoom.updateOne(
//       { roomId, "players.user": userId },
//       { $set: { "players.$.socketId": socket.id } }
//     );

//     const room = await CardGameRoom.findOne({ roomId });

//     if (!room) return;

//     // Check if both players have socketIds
//     const allConnected =
//       room.players.length === 2 && room.players.every((p) => p.socketId);
//     console.log(allConnected, room.status);

//     if (allConnected && room.status !== "in-progress") {
//       console.log("Starting the game");
//       //START GAME NOW
//       startGame(io, room);
//     }
//     if (allConnected && room.status === "in-progress") {
//       console.log("getting room data");
//       const p1 = room.players[0].user.toString();
//       const p2 = room.players[1].user.toString();
//       // Broadcast game start
//       io.to(room.roomId).emit("game-started", {
//         players: room.players.map((p) => p.user),
//         turn: room.turn,
//         counts: Object.fromEntries(
//           room.players.map((p) => [p.user, room.hands.get(p.user).length])
//         ),
//       });

//       // Send each player's own hand
//       const s1 = room.players[0].socketId;
//       const s2 = room.players[1].socketId;

//       io.to(s1).emit("your-hand", room.hands.get(p1));
//       io.to(s2).emit("your-hand", room.hands.get(p2));
//     }
//   });

//   socket.on("play-card", async ({ roomId, userId, card }) => {
//     const room = await CardGameRoom.findOne({ roomId });

//     if (!room) return;

//     // 1. TURN VALIDATION
//     if (room.turn !== userId) {
//       socket.emit("error-message", "Not your turn");
//       return;
//     }

//     // 2. REMOVE CARD FROM PLAYER HAND
//     const hand = room.hands.get(userId);
//     const index = hand.findIndex((c) => c === card);

//     if (index === -1) {
//       socket.emit("error-message", "Invalid card");
//       return;
//     }

//     hand.splice(index, 1);

//     room.hands.set(userId, hand);

//     // Because hands is a Map (Mongoose type Map<String,Array>)
//     room.markModified("hands");

//     // 3. SWITCH TURN
//     const players = room.players.map((p) => p.user);
//     const next = players[0].toString() === userId ? players[1] : players[0];
//     room.turn = next;

//     // 4. SAVE DB UPDATED STATE
//     await room.save();

//     // 5. EMIT PLAYED CARD
//     io.to(roomId).emit("card-played", {
//       userId,
//       card,
//     });

//     // 6. EMIT TURN UPDATE
//     io.to(roomId).emit("turn-updated", { turn: room.turn });

//     // 7. EMIT CARD COUNT UPDATE
//     io.to(roomId).emit("card-count-updated", {
//       userId,
//       count: hand.length,
//     });
//   });

//   // leave room
//   socket.on("leave-room", ({ roomId, userId }) => {
//     socket.leave(roomId);
//     console.log(`User ${userId} left room ${roomId}`);

//     socket.to(roomId).emit("user-left", { userId });
//   });

//   // example event: message in room
//   socket.on("room-message", ({ roomId, userId, message }) => {
//     io.to(roomId).emit("room-message", {
//       userId,
//       message,
//       time: Date.now(),
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });