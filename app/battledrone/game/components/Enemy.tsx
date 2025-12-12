import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { Socket } from "socket.io-client";
import { registerEnemy, unregisterEnemy } from "../stores/enemyStore";

interface EnemyProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  socketRef: React.RefObject<Socket | null>;
  roomId: string;
}

export default function Enemy({
  id,
  position,
  rotation,
  socketRef,
  roomId,
}: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const { scene } = useGLTF("/3d/RobotEnemyFlyingGun.glb"); 
  scene.position.set(0, -0.2, 0);
  scene.rotation.set(0, 0.19, 0);

  // Knockback values
  const knockbackOffset = useRef(new THREE.Vector3(0, 0, 0));
  const KnockbackActive = useRef(false);


  // ----------------------------------------------------
  // KNOCKBACK EFFECT
  // ----------------------------------------------------
  const triggerKnockback = () => {
    if (!groupRef.current) return;

    KnockbackActive.current = true;

    const backward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(groupRef.current.quaternion)
      .normalize()
      .multiplyScalar(0.4);

    const start = performance.now();
    const duration = 120;

    const animate = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);

      knockbackOffset.current.copy(backward).multiplyScalar(1 - t);

      if (t < 1) requestAnimationFrame(animate);
      else {
        knockbackOffset.current.set(0, 0, 0);
        KnockbackActive.current = false;
      }
    };

    animate();
  };

  // ----------------------------------------------------
  // HIT EVENT
  // ----------------------------------------------------
  useEffect(() => {
    const enemy = registerEnemy(meshRef.current);

    enemy.onHit = (damage: number) => {
      socketRef.current?.emit("drone-game-damage-player", {
        roomId,
        targetId: id,
        damage,
      });


      triggerKnockback(); 
    };

    return () => unregisterEnemy(enemy);
  }, [id, roomId, socketRef]);

  // ----------------------------------------------------
  // UPDATE POSITION w/ OFFSET
  // ----------------------------------------------------
  useEffect(() => {
    if (!groupRef.current) return;

    const basePos = new THREE.Vector3(position[0], position[1], position[2]);
    basePos.add(knockbackOffset.current);

    groupRef.current.position.copy(basePos);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  }, [position, rotation]);

  return (
    <RigidBody colliders="cuboid" type="fixed">
      <group ref={groupRef}>
        <mesh ref={meshRef} visible={false}>
          <boxGeometry args={[1, 2.2, 1.2]} />
          <meshBasicMaterial color="white" wireframe />
        </mesh>

        <primitive object={scene} scale={2} />
      </group>
    </RigidBody>
  );
}
