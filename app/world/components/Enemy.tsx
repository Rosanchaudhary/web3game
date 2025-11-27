// Enemy.tsx
import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function Enemy({ position = [0, 0.5, -5] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [color, setColor] = useState("red");

  // Called from gun when shooting hits this enemy
  const onHit = () => {
    const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    setColor(`#${randomColor.getHexString()}`);
  };

  // Expose the onHit function to external callers
  (meshRef as any).currentHit = onHit;

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
