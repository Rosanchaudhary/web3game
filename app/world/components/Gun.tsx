//components/Gun.tsx
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { GunDefinition, GUNS } from "../type";

export default function Gun({
  gunManager,
  shotFiredRef,
  isADS,
}: {
  gunManager: React.RefObject<{ current: GunDefinition }>;
  shotFiredRef: React.RefObject<boolean>;
  isADS: React.RefObject<boolean>;
}) {
  const gunRef = useRef<THREE.Group>(null);

  const pistolModel = useGLTF(GUNS.pistol.modelPath).scene;
  const shotgunModel = useGLTF(GUNS.shotgun.modelPath).scene;

  const recoilPos = useRef(0);
  const recoilRot = useRef(0);

  // ADS blend 0 → hipfire, 1 → ADS
  const adsLerp = useRef(0);

  useFrame(() => {
    if (!gunRef.current) return;

    const def = gunManager.current.current;

    /* -----------------------------
        ADS SMOOTH TRANSITION
    ----------------------------- */
    const targetADS = isADS.current ? 1 : 0;
    adsLerp.current = THREE.MathUtils.lerp(adsLerp.current, targetADS, 0.15);

    /* -----------------------------
        RECOIL
    ----------------------------- */
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

    /* -----------------------------
        APPLY HIPFIRE + ADS POSITION
    ----------------------------- */

    // hipfire position (your modelOffset Z relative placement)
    const hipPos = new THREE.Vector3(0, 0, -0.8 - recoilPos.current);

    // ADS moves weapon closer to camera center
    const adsPos = new THREE.Vector3(0, 0, -0.45 - recoilPos.current);

    // blend hip → ADS
    const blended = hipPos.lerp(adsPos, adsLerp.current);

    gunRef.current.position.copy(blended);

    /* -----------------------------
        ROTATION (ADS lowers tilt)
    ----------------------------- */
    const hipRotX = 0.3 + recoilRot.current;
    const adsRotX = 0.1 + recoilRot.current * 0.5;

    const finalRotX = THREE.MathUtils.lerp(hipRotX, adsRotX, adsLerp.current);

    gunRef.current.rotation.set(finalRotX, 0, 0);

    /* -----------------------------
        SHOW CORRECT WEAPON
    ----------------------------- */
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
