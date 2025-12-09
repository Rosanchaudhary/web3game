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

  const { scene } = useGLTF("/3d/Robot Enemy Flying Gun.glb");
  scene.position.set(0, -0.2, 0);
  scene.rotation.set(0, 0.19, 0);

  useEffect(() => {
    const enemy = registerEnemy(meshRef.current);
    enemy.onHit = (damage: number) => {
      socketRef.current?.emit("drone-game-damage-player", {
        roomId,
        targetId: id,
        damage,
      });
    };

    return () => unregisterEnemy(enemy);
  }, [id, roomId, socketRef]);

  // Keep updating position smoothly (NO physics forces)
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  }, [position, rotation]);

  return (
    <RigidBody colliders="cuboid" type="fixed">
      <group ref={groupRef}>
        {/* Visible hitbox */}
        <mesh ref={meshRef} visible={false}>
          <boxGeometry args={[1, 2.2, 1.2]} />
          <meshBasicMaterial color="white" wireframe />
        </mesh>

        <primitive object={scene} scale={2} />
      </group>
    </RigidBody>
  );
}
