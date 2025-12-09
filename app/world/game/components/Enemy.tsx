import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

import {
  registerEnemy,
  unregisterEnemy,
  EnemyController,
} from "../stores/enemyStore";

import { Socket } from "socket.io-client";

interface EnemyProps {
  id: string;
  position: [number, number, number];

  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}

export default function Enemy({
  id,
  position = [0, 0.5, -5],

  socketRef,
  roomId,
}: EnemyProps) {

  const meshRef = useRef<THREE.Mesh>(null!);
  const enemyRef = useRef<EnemyController | null>(null);

  // 🔥 Load enemy model (replace with your model path)
  const { scene } = useGLTF("/3d/Robot Enemy Flying Gun.glb");
  scene.position.set(0, -0.9, 0);

  useEffect(() => {
    // Register enemy hitbox
    const enemy = registerEnemy(meshRef.current);
    enemyRef.current = enemy;

    enemy.onHit = (damage: number) => {
      socketRef.current?.emit("damage-player", {
        roomId,
        targetId: id,
        damage,
      });
    };

    return () => unregisterEnemy(enemy);
  }, [id, roomId, socketRef]);

  return (
    <RigidBody colliders="cuboid" position={position} mass={1}>
      {/* Invisible hitbox (or small cube) */}
      <mesh ref={meshRef} visible={true}>
        <boxGeometry args={[1, 0.9, 1.2]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>

      {/* Your 3D model */}
      <primitive object={scene} scale={2} />
    </RigidBody>
  );
}
