//app/twocard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GameRoom {
  roomId: string;
  players: { user: string }[];
  createdAt: string;
}

export default function GameLobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch active rooms
  const fetchRooms = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/twocard/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setRooms(data.rooms);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Join a room
  const joinRoom = async (roomId: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/twocard/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId }),
        }
      );
      if (res.ok) {
        router.push(`/twocard/${roomId}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join room");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create a new game
  const createGame = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/twocard/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.roomId) {
        router.push(`/twocard/${data.roomId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#0e0f12] text-white p-6 gap-6">
      {/* ---------- ACTIVE ROOMS ---------- */}
      <div className="flex-1 bg-[#18191f] p-6 overflow-y-auto rounded-lg">
        <h2 className="text-xl mb-4">Active Game Rooms</h2>
        {rooms.length === 0 && (
          <p className="opacity-60">No active rooms. Create one!</p>
        )}
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li
              key={room.roomId}
              className="flex justify-between items-center bg-[#242630] p-3 rounded-md"
            >
              <div>
                <span className="font-semibold">{room.roomId}</span>{" "}
                <span className="opacity-60">
                  ({room.players.length}/2)
                </span>
              </div>
              <button
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => joinRoom(room.roomId)}
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- CREATE GAME ---------- */}
      <div className="w-full md:w-1/3 flex flex-col justify-center items-center bg-[#18191f] p-6 rounded-lg">
        <h2 className="text-xl mb-6">Start New Game</h2>
        <button
          className={`bg-green-600 px-6 py-3 rounded hover:bg-green-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={createGame}
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Game"}
        </button>
      </div>
    </div>
  );
}
