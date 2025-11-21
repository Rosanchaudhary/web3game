// models/CardGameRoom.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const PlayerStateSchema = new Schema(
  {
    name: { type: String },
    center: { type: String, default: null },
    throw: { type: Boolean, default: false },
    hand: { type: [String], default: [] },
    isTurn: { type: Boolean, default: false },
  },
  { _id: false }
);

const PlayerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    socketId: String,
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CardGameRoomSchema = new Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },

    players: [PlayerSchema],

    status: {
      type: String,
      enum: ["waiting", "ready", "in-progress", "finished"],
      default: "waiting",
    },

    deck: {
      type: [String],
      default: [],
    },

    playerState: {
      type: Map,
      of: PlayerStateSchema,
      default: {},
    },

    stateLocked: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

CardGameRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.CardGameRoom ||
  mongoose.model("CardGameRoom", CardGameRoomSchema);
