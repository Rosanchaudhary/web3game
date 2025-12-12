"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

// -----------------------------
// Types
// -----------------------------
export interface Message {
  _id: string;
  roomId: string;
  senderId: string | { _id: string };
  content: string;
  type: "text" | "image" | "system";
  createdAt: string;
  updatedAt: string;
}

// -----------------------------
// Component
// -----------------------------
export default function ChatPage() {
  const { id: roomId } = useParams<{ id: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") ?? "" : "";

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------------
  // Fetch old messages
  // -----------------------------
  async function fetchMessages() {
    const token = localStorage.getItem("token");
    if (!token) return console.warn("No token found");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages/${roomId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data: Message[] = await res.json();
    setMessages(data);
  }

  // -----------------------------
  // Send message
  // -----------------------------
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return console.warn("No token found");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId,
        content: text,
      }),
    });

    await res.json();
    //const sent: Message =
    //setMessages((prev) => [...prev, sent]);
    setText("");
  }

  // Fetch old messages + setup socket
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["polling"],
      upgrade: false,
      path: "/socket.io",
    });

    socketRef.current = socket;

    socket.emit("join-room", { roomId, userId });

    socket.on("new-message", (msg: Message) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const sender =
            typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;

          const mine = sender === userId;

          return (
            <div
              key={msg._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded max-w-xs ${
                  mine
                    ? "bg-blue-500 text-white"
                    : "bg-white border text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit" className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>
  );
}
