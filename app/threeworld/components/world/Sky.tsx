import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Sky() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#111827", 0.02);
  }, [scene]);

  return null;
}
