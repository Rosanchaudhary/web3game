//components/Gun.tsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Gun({
  shootingRef,
}: {
  shootingRef: React.RefObject<boolean>;
}) {
  const gunRef = useRef<THREE.Group>(null);
  // const { scene } = useGLTF("/3d/low-poly_g40.glb");
  const { scene } = useGLTF("/3d/low-poly_kimber_k6s.glb");

  // Recoil state
  const recoilPos = useRef(0);
  const recoilRot = useRef(0);

  useFrame((_, delta) => {
    if (!gunRef.current) return;

    // If shooting, add recoil
    if (shootingRef.current) {
      recoilPos.current = THREE.MathUtils.lerp(
        recoilPos.current,
        0.12, // backward movement
        0.2
      );

      recoilRot.current = THREE.MathUtils.lerp(
        recoilRot.current,
        0.25, // rotation kick
        0.2
      );
    } else {
      // Smoothly return to rest
      recoilPos.current = THREE.MathUtils.lerp(recoilPos.current, 0, 0.1);

      recoilRot.current = THREE.MathUtils.lerp(recoilRot.current, 0, 0.1);
    }

    // Apply recoil to the gun
    gunRef.current.position.z = -0.8 - recoilPos.current;
    gunRef.current.rotation.x = 0.3 + recoilRot.current;
  });

  return (
    <group
      ref={gunRef}
      position={[0.1, -0.5, -0.8]}
      rotation={[0, 1.7, -0.1]}
      scale={0.1}
    >
      <primitive object={scene} />
    </group>
  );
}
