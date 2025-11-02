import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Score from "@/models/Score";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const topScores = await Score.find()
    .populate("userId", "walletAddress")
    .sort({ turns: 1 })
    .limit(10);
  return NextResponse.json(topScores);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { walletAddress, turns } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = await User.create({ walletAddress });
    }

    // Find user's existing score
    const existingScore = await Score.findOne({ userId: user._id });

    let updatedScore;
    if (existingScore) {
      // Update logic — choose your rule:
      if (turns < existingScore.turns) {
        existingScore.turns = turns;
        await existingScore.save();
        updatedScore = existingScore;
      } else {
        updatedScore = existingScore; // keep old score
      }

    } else {
      // New score for this user
      updatedScore = await Score.create({ userId: user._id, turns });
    }

    return NextResponse.json(updatedScore);
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
