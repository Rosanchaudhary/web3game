//page.tsx
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
type Rotation = { x: number; y: number; z: number };
type PlayerData = {
  id: string;
  health: number;
  dead: boolean;
  position: Position;
  rotation:Rotation;
};

type PlayerMap = Record<string, PlayerData>;

export default function Page() {
  const roomId = "game-room-1";
  const [me, setMe] = useState<PlayerData | null>(null);

  const [enemies, setEnemies] = useState<PlayerMap>({});

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://192.168.2.4:3001");
    socketRef.current = socket;

    socket.emit("join-drone-game-room", { roomId });

    socket.on("drone-game-player-joined", (player) => {
      if (player.id === socket.id) {
        setMe(player);
        return;
      }
      setEnemies((prev) => ({ ...prev, [player.id]: player }));
    });

    socket.on("drone-game-player-state", (player) => {
      
      if (player.id === socket.id) {
        setMe(player);
      } else {
        setEnemies((prev) => ({
          ...prev,
          [player.id]: player,
        }));
      }
    });

    socket.on("drone-game-player-left", ({ playerId }) => {
      setEnemies((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
    });

    socket.on("drone-game-player-respawned", (player) => {
      if (player.id === socket.id) {
        setMe(player); // dead = false, position resets
      } else {
        setEnemies((prev) => ({ ...prev, [player.id]: player }));
      }
    });

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
      {me && <HealthBar health={me.health} />}
      {/* DEAD SCREEN OVERLAY */}
      {me && me.dead && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          YOU ARE DEAD
          <br />
          <span style={{ fontSize: "32px" }}>Respawning...</span>
        </div>
      )}

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

          {Object.values(enemies).map((enemy) =>
            enemy.dead ? null : (
              <Enemy
                key={enemy.id}
                id={enemy.id}
                position={[
                  enemy.position.x,
                  enemy.position.y,
                  enemy.position.z,
                ]}
                rotation={[
                  enemy.rotation.x,
                  enemy.rotation.y,
                  enemy.rotation.z,
                ]}
                socketRef={socketRef}
                roomId={roomId}
              />
            )
          )}

          {me && !me.dead && (
            <Player socketRef={socketRef} position={me.position} />
          )}
          <World />
        </Physics>
      </Canvas>
    </div>
  );
}
