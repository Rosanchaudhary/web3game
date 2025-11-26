"use client";

import { Canvas } from "@react-three/fiber";
import {
  AccumulativeShadows,
  Environment,
  RandomizedLight,
} from "@react-three/drei";
import Player from "./components/Player";

/* ------------------------------------------------------
   WORLD VISUALS
------------------------------------------------------ */
function World() {
  return (
    <>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshStandardMaterial color="#7a7a7a" />
      </mesh>

      <mesh position={[0, 2.5, -15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#8a7a7a" />
      </mesh>

      <mesh position={[0, 2.5, 15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#6a7a7a" />
      </mesh>

      <mesh position={[-15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#4a7a7a" />
      </mesh>

      <mesh position={[15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#5a7a7a" />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------
   PAGE
------------------------------------------------------ */
export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ fov: 70, position: [0, 1.6, 5] }}>
        <ambientLight intensity={0.3} />

        <Environment preset="city" />

        <AccumulativeShadows
          temporal
          frames={80}
          blend={80}
          opacity={0.8}
          scale={50}
          position={[0, 0.01, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={6}
            ambient={0.5}
            intensity={1}
            position={[5, 10, 5]}
            bias={0.001}
          />
        </AccumulativeShadows>

        <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />

        <Player />
        <World />
      </Canvas>
    </div>
  );
}
