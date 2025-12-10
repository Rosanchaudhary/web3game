import { RigidBody } from "@react-three/rapier";
import { FC } from "react";

const Wall: FC<{
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}> = ({ position, size, color = "#777" }) => (
  <RigidBody type="fixed" colliders="cuboid" position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
);

const BoxProp: FC<{
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}> = ({ position, size = [1, 1, 1], color = "#9c6" }) => (
  <RigidBody type="fixed" colliders="cuboid" position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
);

export default function World() {
  return (
    <>
      {/* MAIN GROUND */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[60, 1, 60]} />
          <meshStandardMaterial color="#7a7a7a" />
        </mesh>
      </RigidBody>

      {/* WALLS */}
      <Wall position={[0, 5, -30]} size={[60, 10, 2]} color="#8a7a7a" />
      <Wall position={[0, 5, 30]} size={[60, 10, 2]} color="#6a7a7a" />
      <Wall position={[-30, 5, 0]} size={[2, 10, 60]} color="#4a7a7a" />
      <Wall position={[30, 5, 0]} size={[2, 10, 60]} color="#5a7a7a" />

      {/* FIRST PLATFORM */}
      <Wall position={[0, 3.4, 0]} size={[20, 1, 20]} color="#999999" />

      {/* First supports */}
      <Wall position={[8, 1, 8]} size={[2, 4, 2]} color="#555" />
      <Wall position={[-8, 1, 8]} size={[2, 4, 2]} color="#555" />
      <Wall position={[8, 1, -8]} size={[2, 4, 2]} color="#555" />
      <Wall position={[-8, 1, -8]} size={[2, 4, 2]} color="#555" />

      {/* SECOND PLATFORM */}
      <Wall position={[18, 5, 0]} size={[14, 1, 14]} color="#777777" />

      {/* Second platform supports */}
      <Wall position={[18 + 6, 2, 6]} size={[1.7, 6, 1.7]} color="#444" />
      <Wall position={[18 - 6, 2, 6]} size={[1.7, 6, 1.7]} color="#444" />
      <Wall position={[18 + 6, 2, -6]} size={[1.7, 6, 1.7]} color="#444" />
      <Wall position={[18 - 6, 2, -6]} size={[1.7, 6, 1.7]} color="#444" />

      {/* RAMPS */}
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, 1, 14]}
        rotation={[Math.PI / 6, 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 1, 10]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={[0, 1, -14]}
        rotation={[-Math.PI / 6, 0, 0]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 1, 10]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </RigidBody>

      {/* PROPS */}
      <BoxProp position={[5, 0.5, 5]} size={[1.5, 1.5, 1.5]} color="#cc9955" />
      <BoxProp position={[-5, 0.5, -3]} size={[1.5, 1.5, 1.5]} color="#cc9955" />
      <BoxProp position={[8, 0.5, -10]} size={[2, 2, 2]} color="#aa7744" />

      {/* Barriers */}
      <Wall position={[10, 1, 0]} size={[0.5, 2, 6]} color="#666" />
      <Wall position={[-10, 1, 0]} size={[0.5, 2, 6]} color="#666" />

      {/* LIGHTING */}
      <ambientLight intensity={0.4} />
      <directionalLight castShadow position={[10, 20, 10]} intensity={1.2} />
    </>
  );
}
