//page.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import Player from "./components/Player/Player";
import World from "./components/World";
import Crosshair from "./components/Crosshair";
import Enemies from "./components/Enemies";
import { Physics } from "@react-three/rapier";
import {  useRef, useState } from "react";
import HealthBar from "./components/Player/HealthBar";
import { PlayerAPI } from "./type";



export default function Page() {
  const [health, setHealth] = useState(100);
  const playerRef = useRef<PlayerAPI | null>(null);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Crosshair />
      <HealthBar health={health} />
      <Canvas shadows camera={{ fov: 70, position: [0, 1.6, 5] }}>
        <Physics gravity={[0, -9.81, 0]}>
          {/* Soft general lighting */}
          <ambientLight intensity={0.5} />
          {/* Main sunlight */}
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
          {/* Optional fill light for softer shadows */}
          <directionalLight
            position={[-8, 6, -5]}
            intensity={0.4}
            castShadow={false}
          />
          <Enemies playerRef={playerRef} /> {/* 👈 pass to enemies */}
          <Player setHealth={setHealth} playerRef={playerRef} />{" "}
          {/* 👈 pass to player */}
          <World />
        </Physics>
      </Canvas>
    </div>
  );
}
