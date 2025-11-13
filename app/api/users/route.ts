import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/game_server/models/User";

export async function POST(req: Request) {
  await connectDB();

  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  let user = await User.findOne({ username });
  if (!user) {
    user = await User.create({ username });
  }

  return NextResponse.json(user);
}
