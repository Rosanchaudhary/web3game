//page.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import Player from "./components/Player/Player";
import World from "./components/World";
import Crosshair from "./components/Crosshair";
import Enemies from "./components/Enemies";
import { Physics } from "@react-three/rapier";

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Crosshair />
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

          {/* Remove AccumulativeShadows & Environment */}
          {/* <Environment preset="city" /> */}
          {/* <AccumulativeShadows ... /> */}

          <Enemies />
          <Player />
          <World />
        </Physics>
      </Canvas>
    </div>
  );
}
