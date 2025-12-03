//components/Gun.tsx
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

  /* ------------------------------------------------------
     INITIAL SETUP — apply your EXACT previous rotation
  ------------------------------------------------------ */
useEffect(() => {
  gltf.scene.traverse((child: any) => (child.frustumCulled = false));

  // Recenter pivot
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);

  // Apply rotation to the MODEL, not the group
  gltf.scene.rotation.set(0, 0, 0); // clear just in case
  gltf.scene.rotateZ(0.1);
  gltf.scene.rotateY(1.5);
  gltf.scene.rotateX(1.5);

  console.log("Applied rotation to model:", gltf.scene.rotation);
}, [gltf]);


  /* ------------------------------------------------------
     MAIN LOOP
  ------------------------------------------------------ */
  useFrame(() => {
    if (!gun.current) return;

    // Aim gun with camera
    gun.current.quaternion.copy(camera.quaternion);

    // FPS gun offset
    const offset = new THREE.Vector3(0.3, -0.35, -0.7);

    // Recoil
    recoil.current *= 0.85;
    if (shootingRef.current) {
      recoil.current = Math.min(recoil.current + 0.05, 0.15);
    }
    offset.z -= recoil.current;

    // Convert to world space
    const world = offset.clone();
    camera.localToWorld(world);
    gun.current.position.copy(world);
  });

  return (
    <group ref={gun}>
      <primitive object={gltf.scene} scale={0.25} />
    </group>
  );
}

useGLTF.preload("/3d/lowpoly_rifle.glb");
