// components/Gun.tsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Gun({
  activeGunRef,
  shotFiredRef,
}: {
  activeGunRef: React.RefObject<1 | 2>;
  shotFiredRef: React.RefObject<boolean>;
}) {
  const gunRef = useRef<THREE.Group>(null);

  const gunAGLTF = useGLTF("/3d/low-poly_msmc.glb").scene;
  const gunBGLTF = useGLTF("/3d/low-poly_stolzer__son_double_deuce.glb").scene;

  const recoilPos = useRef(0);
  const recoilRot = useRef(0);

  const recoilConfig = {
    1: { posKick: 0.12, rotKick: 0.25, recoverSpeed: 0.1, kickSpeed: 0.2 },
    2: { posKick: 0.35, rotKick: 0.6, recoverSpeed: 0.05, kickSpeed: 0.25 },
  };

  useFrame(() => {
    if (!gunRef.current) return;

    const gunID = activeGunRef.current;
    const rc = recoilConfig[gunID];

    if (shotFiredRef.current) {
      recoilPos.current = THREE.MathUtils.lerp(
        recoilPos.current,
        rc.posKick,
        rc.kickSpeed
      );
      recoilRot.current = THREE.MathUtils.lerp(
        recoilRot.current,
        rc.rotKick,
        rc.kickSpeed
      );
      shotFiredRef.current = false;
    } else {
      recoilPos.current = THREE.MathUtils.lerp(
        recoilPos.current,
        0,
        rc.recoverSpeed
      );
      recoilRot.current = THREE.MathUtils.lerp(
        recoilRot.current,
        0,
        rc.recoverSpeed
      );
    }

    // Apply recoil
    gunRef.current.position.z = -0.8 - recoilPos.current;
    gunRef.current.rotation.x = 0.3 + recoilRot.current;

    // Toggle gun visibility
    const isGunA = activeGunRef.current === 1;
    gunRef.current.children[0].visible = isGunA;
    gunRef.current.children[1].visible = !isGunA;
  });

  return (
    <group ref={gunRef}>
      <group position={[0.2, -0.5, -0.1]} rotation={[0, 1.7, -0.1]} scale={0.4}>
        <primitive object={gunAGLTF} />
      </group>

      <group
        position={[0.15, -1.2, -0.6]}
        rotation={[0, 1.6, -0.1]}
        scale={0.01}
      >
        <primitive object={gunBGLTF} />
      </group>
    </group>
  );
}
