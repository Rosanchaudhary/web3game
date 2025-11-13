"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function SocketTest() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    socket.emit("join_room", { userId: "123", roomId: "room-1" });
  }, []);

  return <div>Socket test</div>;
}
