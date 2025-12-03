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
  const { camera, scene } = useThree();
  const gun = useRef<THREE.Group>(null);
  const recoil = useRef(0);

  const gltf = useGLTF("/3d/lowpoly_rifle.glb");

  useEffect(() => {
    gltf.scene.traverse((child) => (child.frustumCulled = false));

    // Recenter pivot
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // Apply previous rotation
    gltf.scene.rotation.set(0, 0, 0);
    gltf.scene.rotateZ(0.1);
    gltf.scene.rotateY(1.5);
    gltf.scene.rotateX(1.5);
    if (!gun.current) return;

    // PARENT TO CAMERA → this removes flicker
    camera.add(gun.current);
    scene.add(camera);
  }, [camera, gltf, scene]);

  useFrame(() => {
    if (!gun.current) return;

    // Local offset (FPS weapon position)
    gun.current.position.set(0.3, -0.35, -0.7);

    // Recoil
    recoil.current *= 0.85;
    if (shootingRef.current) {
      recoil.current = Math.min(recoil.current + 0.05, 0.15);
    }
    gun.current.position.z -= recoil.current;
  });

  return (
    <group ref={gun}>
      <primitive object={gltf.scene} scale={0.25} />
    </group>
  );
}
