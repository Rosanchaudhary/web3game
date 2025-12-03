import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { registerEnemy, unregisterEnemy, EnemyController } from "../stores/enemyStore";

export default function Enemy({
  position = [0, 0.5, -5] as [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const enemyRef = useRef<EnemyController | null>(null);

  const [hp, setHp] = useState(100);
  const [color, setColor] = useState("red");

  // ❗ All hooks must run before any return
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

    return () => {
      unregisterEnemy(enemy);
    };
  }, []);

  // ❗ After hooks → Now decide whether to render enemy
  if (hp <= 0) {
    return null; // Removes RigidBody + collider + mesh
  }

  return (
    <RigidBody colliders="cuboid" position={position} mass={1}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
