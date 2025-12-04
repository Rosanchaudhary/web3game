//components/Gun.tsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Gun({
  shootingRef,
  activeGunRef,
}: {
  shootingRef: React.RefObject<boolean>;
  activeGunRef: React.RefObject<1 | 2>;
}) {
  const gunRef = useRef<THREE.Group>(null);

  // Load models
  const pistol = useGLTF("/3d/low-poly_kimber_k6s.glb").scene;
  const rifle = useGLTF("/3d/low-poly_g40.glb").scene;

  // Recoil state
  const recoilPos = useRef(0);
  const recoilRot = useRef(0);

  useFrame(() => {
    if (!gunRef.current) return;

    // recoil
    if (shootingRef.current) {
      recoilPos.current = THREE.MathUtils.lerp(recoilPos.current, 0.12, 0.2);
      recoilRot.current = THREE.MathUtils.lerp(recoilRot.current, 0.25, 0.2);
    } else {
      recoilPos.current = THREE.MathUtils.lerp(recoilPos.current, 0, 0.1);
      recoilRot.current = THREE.MathUtils.lerp(recoilRot.current, 0, 0.1);
    }

    gunRef.current.position.z = -0.8 - recoilPos.current;
    gunRef.current.rotation.x = 0.3 + recoilRot.current;

    // show active gun
    gunRef.current.children[0].visible = activeGunRef.current === 1;
    gunRef.current.children[1].visible = activeGunRef.current === 2;
  });

  return (
    <group
      ref={gunRef}
      position={[0.1, -0.5, -0.8]}
      rotation={[0, 1.7, -0.1]}
      scale={0.1}
    >
      <primitive object={pistol} />
      <primitive object={rifle} />
    </group>
  );
}
