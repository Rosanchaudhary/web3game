"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Gun({
  shootingRef,
}: {
  shootingRef: React.RefObject<boolean>;
}) {
  const { camera } = useThree();
  const gun = useRef<THREE.Group>(null);
  const recoil = useRef(0);

  const gltf = useGLTF("/3d/lowpoly_rifle.glb");

  // Disable culling + recenter pivot
  useEffect(() => {
    gltf.scene.traverse((child: any) => (child.frustumCulled = false));

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
  }, [gltf]);

  useFrame(() => {
    if (!gun.current) return;

    // gun faces same direction as camera
    gun.current.quaternion.copy(camera.quaternion);

    // FPS gun offset (in camera space)
    const offset = new THREE.Vector3(0.3, -0.35, -0.7);
    gun.current.rotateZ(0.1);
    gun.current.rotateY(1.5);
    gun.current.rotateX(1.5);
    // apply recoil
    recoil.current *= 0.85;
    if (shootingRef.current) {
      recoil.current = Math.min(recoil.current + 0.05, 0.15);
    }
    offset.z -= recoil.current;

    // convert camera-local offset to world space
    const worldPos = offset.clone();
    camera.localToWorld(worldPos);
    gun.current.position.copy(worldPos);
  });

  return (
    <group ref={gun}>
      <primitive object={gltf.scene} scale={0.25} />
    </group>
  );
}

useGLTF.preload("/3d/lowpoly_rifle.glb");
