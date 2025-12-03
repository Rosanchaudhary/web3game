// components/Enemy.tsx
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { registerEnemy, unregisterEnemy } from "../stores/enemyStore";


export default function Enemy({ position = [0, 0.5, -5] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [color, setColor] = useState("red");
  const enemyRef = useRef<any>(null); // holds the enemy controller instance

  /* ------------------------------------------------------
     REGISTER ENEMY ON MOUNT
  ------------------------------------------------------ */
  useEffect(() => {
    const enemy = registerEnemy(meshRef.current);
    enemyRef.current = enemy;

    // Enemy specific behavior:
    enemy.onHit = (damage: number) => {
      // Reduce health
      enemy.health -= damage;
      console.log(`Enemy #${enemy.id} HP:`, enemy.health);

      // Color flash
      const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      setColor(`#${randomColor.getHexString()}`);

      // Death logic
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
