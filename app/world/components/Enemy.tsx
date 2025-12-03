// components/Enemy.tsx
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { registerEnemy, unregisterEnemy, EnemyController } from "../stores/enemyStore";

export default function Enemy({
  position = [0, 0.5, -5] as [number, number, number]
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [color, setColor] = useState("red");

  const enemyRef = useRef<EnemyController | null>(null);

  useEffect(() => {
    const enemy = registerEnemy(meshRef.current);
    enemyRef.current = enemy;

    enemy.onHit = (damage: number) => {
      if (!enemyRef.current) return;
      const enemy = enemyRef.current;

      enemy.health -= damage;
      console.log(`Enemy #${enemy.id} HP:`, enemy.health);

      const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      setColor(`#${randomColor.getHexString()}`);

      if (enemy.health <= 0) {
        meshRef.current.visible = false;
        console.log(`Enemy #${enemy.id} died`);
      }
    };

    return () => unregisterEnemy(enemy);
  }, []);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
