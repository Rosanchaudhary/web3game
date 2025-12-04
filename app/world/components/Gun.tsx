"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

export default function Gun({
  shootingRef,
}: {
  shootingRef: React.RefObject<boolean>;
}) {
  const { camera, scene } = useThree();

  const gunRef = useRef<THREE.Group>(null!);
  const recoil = useRef(0);

  /* ---------------------------------------------------------
    LOAD + PREPARE MODEL (only runs once)
  --------------------------------------------------------- */
  const gltf = useGLTF("/3d/lowpoly_rifle.glb");

  const preparedModel = useMemo(() => {
    const sceneClone = gltf.scene.clone();

    sceneClone.traverse((child) => {
      child.frustumCulled = false; // prevent FPS popping
    });

    // Recenter pivot -------------
    const box = new THREE.Box3().setFromObject(sceneClone);
    const center = box.getCenter(new THREE.Vector3());
    sceneClone.position.sub(center);

    // Default FPS rotation ------
    sceneClone.rotation.set(1.9, 0.1, -1.7);

    return sceneClone;
  }, [gltf]);

  /* ---------------------------------------------------------
    ATTACH GUN TO CAMERA
  --------------------------------------------------------- */
  useEffect(() => {
    const gun = gunRef.current;
    if (!gun) return;

    camera.add(gun);
    scene.add(camera);

    // Cleanup on unmount or weapon swap
    return () => {
      camera.remove(gun);
    };
  }, [camera, scene]);

  /* ---------------------------------------------------------
    ANIMATION LOOP (recoil + local position)
  --------------------------------------------------------- */
  useFrame(() => {
    const gun = gunRef.current;
    if (!gun) return;

    // Local weapon offset (FPS position)
    gun.position.set(2.3, 0.35, 0.9);

    // Recoil decay
    recoil.current *= 0.85;

    // Apply recoil bump if shooting
    if (shootingRef.current) {
      recoil.current = Math.min(recoil.current + 0.05, 0.15);
    }

    gun.position.z -= recoil.current;
  });

  return (
    <group ref={gunRef}>
      <primitive object={preparedModel} scale={0.25} />
    </group>
  );
}
