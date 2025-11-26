import React from "react";
import { Canvas } from "@react-three/fiber";
import WorldManager from "./components/world/WorldManager";
import Ground from "./components/world/Ground";
import Blocks from "./components/world/Blocks";
import PlayerController from "./components/player/PlayerController";
import Sky from "./components/world/Sky";

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 1.8, 6], fov: 60 }}>
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        intensity={0.9}
        position={[5, 10, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <WorldManager>
        <Ground />
        <Blocks />
        <PlayerController />
      </WorldManager>

      <Sky />
    </Canvas>
  );
}
