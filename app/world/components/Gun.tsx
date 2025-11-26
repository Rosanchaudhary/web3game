//component/Gun.tsx
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Gun({ camera }: { camera: THREE.Camera }) {
  const gun = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!gun.current) return;

    // Gun follows camera orientation
    gun.current.quaternion.copy(camera.quaternion);

    // Gun stays in front of camera
    const offset = new THREE.Vector3(0.25, -0.25, -0.6); // right, down, forward
    const pos = camera.localToWorld(offset.clone());
    gun.current.position.copy(pos);
  });

  return (
    <mesh ref={gun}>
      <boxGeometry args={[0.2, 0.2, 0.6]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}
