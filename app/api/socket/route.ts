import { Server } from "socket.io";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/game_server/models/User";

const ioHandler = (req: Request) => {
  if (!(global as any).io) {
    const io = new Server(3001, {
      cors: { origin: "*" },
    });

    (global as any).io = io;

    io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      socket.on("join_room", async ({ userId, roomId }) => {
        await connectDB();
        await User.findByIdAndUpdate(userId, { currentRoom: roomId, isOnline: true });
        socket.join(roomId);
        io.to(roomId).emit("player_joined", { userId });
      });

      socket.on("disconnect", async () => {
        console.log("🔴 User disconnected:", socket.id);
      });
    });
  }

  return NextResponse.json({ status: "Socket server running" });
};

export const GET = ioHandler;
