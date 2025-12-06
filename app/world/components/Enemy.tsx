//component/Enemy.txt

import { useRef, useState, useEffect, RefObject } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import {
  registerEnemy,
  unregisterEnemy,
  EnemyController,
} from "../stores/enemyStore";
import { useFrame } from "@react-three/fiber";
import { PlayerAPI } from "../type";

interface EnemyProps {
  position: [number, number, number];
    playerRef: RefObject<PlayerAPI | null>;
}

export default function Enemy({
  position = [0, 0.5, -5] as [number, number, number],
  playerRef,
}: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const enemyRef = useRef<EnemyController | null>(null);

  const [hp, setHp] = useState(100);
  const [color, setColor] = useState("red");

  const attackCooldown = useRef(0);

  useEffect(() => {
    const enemy = registerEnemy(meshRef.current);
    enemyRef.current = enemy;

    enemy.onHit = (damage: number) => {
      setHp((h) => {
        const newHP = h - damage;

        const randomColor = new THREE.Color(
          Math.random(),
          Math.random(),
          Math.random()
        );
        setColor(`#${randomColor.getHexString()}`);

        return newHP;
      });
    };

    return () => unregisterEnemy(enemy);
  }, []);

  // ---- DAMAGE PLAYER WHEN CLOSE ----
  useFrame((_, delta) => {
    if (!playerRef?.current) return;
    if (hp <= 0) return;

    attackCooldown.current -= delta;

    const enemyPos = meshRef.current.getWorldPosition(new THREE.Vector3());
    const playerPos = _.camera.getWorldPosition(new THREE.Vector3());

    const dist = enemyPos.distanceTo(playerPos);

    if (dist < 1.7 && attackCooldown.current <= 0) {
      playerRef.current.takeDamage(10);
      attackCooldown.current = 1; // 1 second cooldown
    }
  });

  if (hp <= 0) return null;

  return (
    <RigidBody colliders="cuboid" position={position} mass={1}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
