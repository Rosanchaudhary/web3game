"use client";

import { Canvas } from "@react-three/fiber";
import Player from "./components/Player/Player";
import World from "./components/World";
import Crosshair from "./components/Crosshair";
import { Physics } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import HealthBar from "./components/Player/HealthBar";
import Enemy from "./components/Enemy";
import { io, Socket } from "socket.io-client";

type Position = { x: number; y: number; z: number };
type PlayerMap = Record<string, Position>;

export default function Page() {
  const roomId = "game-room-1";

  const [health, setHealth] = useState(100);
  const [enemies, setEnemies] = useState<PlayerMap>({});

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://192.168.2.4:3001");
    socketRef.current = socket;

    socket.emit("join-game-room", { roomId });

    socket.on("new-position", ({ playerId, x, y, z }) => {
      if (playerId === socket.id) return;
      setEnemies((prev) => ({ ...prev, [playerId]: { x, y, z } }));
    });

    socket.on("player-joined", ({ playerId }) => {
      if (playerId === socket.id) return;
      setEnemies((prev) => ({
        ...prev,
        [playerId]: { x: 0, y: 0.5, z: -5 },
      }));
    });

    socket.on("player-left", ({ playerId }) => {
      setEnemies((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });
    });

    socket.on("health-update", (newHP: number) => setHealth(newHP));

    socket.on("connect", () => {
      console.log("My ID:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Crosshair />
      <HealthBar health={health} />

      <Canvas shadows camera={{ fov: 70, position: [0, 1.6, 5] }}>
        <Physics gravity={[0, -9.81, 0]}>
          <ambientLight intensity={0.5} />

          <directionalLight
            position={[10, 12, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          {Object.entries(enemies).map(([id, enemy]) => (
            <Enemy
              key={id}
              id={id}
              position={[enemy.x, enemy.y, enemy.z]}
              socketRef={socketRef}
            />
          ))}

          <Player socketRef={socketRef} />
          <World />
        </Physics>
      </Canvas>
    </div>
  );
}
