//component/Enemy.txt

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
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
  roomId:string;
}

export default function Enemy({
  id,
  position = [0, 0.5, -5] as [number, number, number],
  socketRef,
  roomId
}: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const enemyRef = useRef<EnemyController | null>(null);

  useEffect(() => {

    // Register enemy hitbox
    const enemy = registerEnemy(meshRef.current);
    enemyRef.current = enemy;

    // When local player shoots this enemy → send damage to server
    enemy.onHit = (damage: number) => {

      socketRef.current?.emit("damage-player", {
        roomId,
        targetId: id,
        damage,
      });
    };

    return () => unregisterEnemy(enemy);
  }, [id, socketRef]);

  return (
    <RigidBody colliders="cuboid" position={position} mass={1}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
    </RigidBody>
  );
}
