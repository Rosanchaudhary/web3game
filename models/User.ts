import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  username: { type: String },
  walletAddress: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model("User", userSchema);
