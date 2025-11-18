import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CardGameRoomSchema = new Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },

    players: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        socketId: { type: String }, // helpful for disconnect/reconnect
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["waiting", "ready", "in-progress", "finished"],
      default: "waiting",
    },

    // --- GAME STATE ---
    deck: {
      type: [String], // ["AS", "5H", "KD", ...]
      default: [],
    },

    hands: {
      type: Map,
      of: [String], // { userId: ["AH", "2D", "9C"] }
      default: {},
    },

    centerPile: {
      type: [String],
      default: [],
    },

    turn: {
      type: String, // userId of current turn
      default: null,
    },

    // Cleanup or filtering
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60), // 1 hr expiry
    },
  },
  { timestamps: true }
);

// Auto-remove expired rooms (optional)
CardGameRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CardGameRoom =
  mongoose.models.CardGameRoom ||
  mongoose.model("CardGameRoom", CardGameRoomSchema);

export default CardGameRoom;
