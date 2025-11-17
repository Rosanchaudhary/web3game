"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [name, setName] = useState<string>("");

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  async function fetchRooms() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        console.warn("No token found");
        setRooms([]);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms/my`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch rooms:", res.status);
        setRooms([]);
        return;
      }

      const data: Room[] = await res.json();
      setRooms(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setRooms([]);
    }
  }

  async function createRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.warn("No token found");
      return;
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchRooms();
  }

  async function joinRoom(roomId: string) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.warn("No token found");
      return;
    }

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchRooms();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-white text-black">
      <div className="w-72 bg-gray-100 p-5 border-r overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Rooms</h2>

        <div className="space-y-3">
          {rooms.map((room) => {
            const joined = room.participants.some(
              (p) => p.userId === userId
            );

            return (
              <div
                key={room._id}
                className="p-3 bg-white border rounded flex justify-between"
              >
                <span>{room.name}</span>

                {joined ? (
                  <Link href={`/room/${room._id}`}>
                    <button className="bg-blue-500 text-white px-2 py-1 text-sm rounded">
                      Message
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => joinRoom(room._id)}
                    className="bg-green-600 text-white px-2 py-1 text-sm rounded"
                  >
                    Join
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={createRoom} className="mt-6 space-y-3">
          <h3 className="font-semibold text-lg">Create Room</h3>

          <input
            className="w-full p-2 border rounded"
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
}
