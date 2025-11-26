import React from "react";
import { useWorld } from "./WorldManager";

export default function Blocks() {
  const { blocks } = useWorld();

  return (
    <group>
      {blocks.map((b) => (
        <mesh key={b.id} castShadow receiveShadow position={b.pos}>
          <boxGeometry args={b.size} /> 
          <meshStandardMaterial
            color={b.color ?? `hsl(${(b.pos[0] + 10) * 20}, 60%, 50%)`}
          />
        </mesh>
      ))}
    </group>
  );
}
