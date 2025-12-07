"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Position = { x: number; y: number; z: number };
type PlayerMap = Record<string, Position>;

const MOVE_STEP = 0.2;
const roomId = "game-room-1";

export default function Game3DMovement() {
  const socketRef = useRef<Socket | null>(null);
  const [players, setPlayers] = useState<PlayerMap>({});

  // Movement function
  const move = (dx: number, dz: number) => {
    const socket = socketRef.current;
    if (!socket) return;

    const me = players[socket.id];
    if (!me) return;

    socket.emit("position", {
      roomId,
      x: me.x + dx,
      y: me.y,
      z: me.z + dz, // z does NOT change
    });
  };

  // Keyboard movement
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          move(0, MOVE_STEP);
          break;

        case "ArrowDown":
        case "s":
        case "S":
          move(0, -MOVE_STEP);
          break;

        case "ArrowLeft":
        case "a":
        case "A":
          move(-MOVE_STEP, 0);
          break;

        case "ArrowRight":
        case "d":
        case "D":
          move(MOVE_STEP, 0);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [players]);

  // Init socket + sync player positions
  useEffect(() => {
    const socket = io("http://192.168.2.4:3001");
    socketRef.current = socket;

    socket.emit("join-game-room", { roomId });

    // Server broadcast new position
    socket.on("new-position", ({ playerId, x, y, z }) => {
      setPlayers((prev) => ({
        ...prev,
        [playerId]: { x, y, z },
      }));
    });

    // New player joined
    socket.on("player-joined", ({ playerId }) => {
      setPlayers((prev) => ({
        ...prev,
        [playerId]: { x: 0, y: 0.5, z: -5 }, // default spawn
      }));
    });

    // Player leaves
    socket.on("player-left", ({ playerId }) => {
      setPlayers((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });
    });

    // Add myself
    socket.on("connect", () => {
      setPlayers((prev) => ({
        ...prev,
        [socket.id]: { x: 0, y: 0.5, z: -5 },
      }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-100">
      <h1 className="text-xl mb-6 text-gray-700">3D Multiplayer Movement</h1>

      <div className="p-4 bg-white shadow rounded">
        <p className="text-gray-600 mb-2 text-center">Controls</p>

        <div className="flex flex-col items-center gap-2">
          <button
            className="w-16 h-16 border rounded"
            onClick={() => move(0, MOVE_STEP)}
          >
            ↑
          </button>

          <div className="flex gap-3">
            <button
              className="w-16 h-16 border rounded"
              onClick={() => move(-MOVE_STEP, 0)}
            >
              ←
            </button>
            <button
              className="w-16 h-16 border rounded"
              onClick={() => move(MOVE_STEP, 0)}
            >
              →
            </button>
          </div>

          <button
            className="w-16 h-16 border rounded"
            onClick={() => move(0, -MOVE_STEP)}
          >
            ↓
          </button>
        </div>
      </div>

      {/* Debug player positions */}
      <pre className="mt-6 bg-white p-4 rounded shadow text-sm">
        {JSON.stringify(players, null, 2)}
      </pre>
    </main>
  );
}
