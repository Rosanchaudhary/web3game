"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCookie } from "@/utils/getCookie";

interface Participant {
  userId: string;
}

interface Room {
  _id: string;
  name: string;
  participants: Participant[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const token = getCookie("token");
  const userId = getCookie("userId");

  async function fetchRooms() {
    try {
      setLoading(true);

      if (!token) return setRooms([]);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/my`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) return setRooms([]);

      const data = await res.json();
      setRooms(data || []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (!token) return;

    setCreating(true);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    setName("");
    setCreating(false);
    fetchRooms();
  }

  async function joinRoom(roomId: string) {
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchRooms();
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-indigo-900/40 via-black/80 to-black -z-10" />
      <div className="absolute -top-40 right-40 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 left-40 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-full max-w-2xl text-left shadow-xl"
      >
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400 mb-8 text-center">
          Available Rooms 🎧
        </h2>

        {/* Rooms List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/30">
          {loading ? (
            <p className="text-gray-400 text-center">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="text-gray-400 text-center">No rooms yet.</p>
          ) : (
            rooms.map((room) => {
              const joined = room.participants.some((p) => p.userId === userId);

              return (
                <div
                  key={room._id}
                  className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl p-4 text-white"
                >
                  <span className="font-medium">{room.name}</span>

                  {joined ? (
                    <Link href={`/room/${room._id}`}>
                      <button className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-lg text-sm">
                        Enter
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => joinRoom(room._id)}
                      className="bg-green-600 px-4 py-2 rounded-lg text-sm"
                    >
                      Join
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create Room */}
        <form onSubmit={createRoom} className="mt-10">
          <h3 className="text-xl mb-3 text-gray-300 font-semibold">
            Create New Room
          </h3>

          <input
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <motion.button
            whileHover={!creating ? { scale: 1.05 } : {}}
            whileTap={!creating ? { scale: 0.95 } : {}}
            type="submit"
            disabled={creating}
            className={`w-full mt-4 py-3 rounded-xl shadow-lg transition text-white 
              ${
                creating
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30"
              }`}
          >
            {creating ? "Creating..." : "Create Room"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
