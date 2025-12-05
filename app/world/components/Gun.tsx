import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { GunDefinition, GUNS } from "../type";

export default function Gun({
  gunManager,
  shotFiredRef,
}: {
  gunManager: React.RefObject<{ current: GunDefinition }>;
  shotFiredRef: React.RefObject<boolean>;
}) {
  const gunRef = useRef<THREE.Group>(null);

  const pistolModel = useGLTF(GUNS.pistol.modelPath).scene;
  const shotgunModel = useGLTF(GUNS.shotgun.modelPath).scene;

  const recoilPos = useRef(0);
  const recoilRot = useRef(0);

  useFrame(() => {

    if (!gunRef.current) return;

    const def = gunManager.current.current;

    // recoil logic
    if (shotFiredRef.current) {
      recoilPos.current = THREE.MathUtils.lerp(
        recoilPos.current,
        def.recoil.posKick,
        def.recoil.kickSpeed
      );

      recoilRot.current = THREE.MathUtils.lerp(
        recoilRot.current,
        def.recoil.rotKick,
        def.recoil.kickSpeed
      );

      new Audio(def.sounds.shot).play();

      shotFiredRef.current = false;
    } else {
      recoilPos.current = THREE.MathUtils.lerp(
        recoilPos.current,
        0,
        def.recoil.recoverSpeed
      );

      recoilRot.current = THREE.MathUtils.lerp(
        recoilRot.current,
        0,
        def.recoil.recoverSpeed
      );
    }

    // apply recoil
    gunRef.current.position.z = -0.8 - recoilPos.current;
    gunRef.current.rotation.x = 0.3 + recoilRot.current;

    gunRef.current.children[0].visible = def.id === "pistol";
    gunRef.current.children[1].visible = def.id === "shotgun";
  });

  return (
    <group ref={gunRef}>
      {/* Pistol Model */}
      <group
        position={GUNS.pistol.modelOffset.position}
        rotation={GUNS.pistol.modelOffset.rotation}
        scale={GUNS.pistol.modelOffset.scale}
      >
        <primitive object={pistolModel} />
      </group>

      {/* Shotgun Model */}
      <group
        position={GUNS.shotgun.modelOffset.position}
        rotation={GUNS.shotgun.modelOffset.rotation}
        scale={GUNS.shotgun.modelOffset.scale}
      >
        <primitive object={shotgunModel} />
      </group>
    </group>
  );
}