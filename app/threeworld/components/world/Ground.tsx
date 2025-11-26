import React from "react";

export default function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#2b2f36" roughness={1} metalness={0.1} />
    </mesh>
  );
}
