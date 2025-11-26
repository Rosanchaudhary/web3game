import React from "react";
import { useThree } from "@react-three/fiber";

export default function PlayerCamera() {
  const { camera } = useThree();
  camera.fov = 60;
  camera.updateProjectionMatrix();
  return null;
}
