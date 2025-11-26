"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { AccumulativeShadows, Environment, RandomizedLight } from "@react-three/drei";

/* ------------------------------------------------------
   BLOCK CREATOR
------------------------------------------------------ */

function createBlock(x: number, y: number, z: number, w = 2, h = 2, d = 2) {
  const min = new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2);
  const max = new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2);
  return new THREE.Box3(min, max);
}

/* ------------------------------------------------------
   WORLD BLOCKS — ground + walls
------------------------------------------------------ */

const WORLD_BLOCKS = [
  // Ground (wide flat cube)
  createBlock(0, 0, 0, 30, 1, 30),

  // 4 Walls (big grey blocks around the ground)
  createBlock(0, 2.5, -15, 30, 5, 1), // back
  createBlock(0, 2.5, 15, 30, 5, 1), // front
  createBlock(-15, 2.5, 0, 1, 5, 30), // left
  createBlock(15, 2.5, 0, 1, 5, 30), // right
];

/* ------------------------------------------------------
   PLAYER CONTROLLER (FPS)
------------------------------------------------------ */

function Player() {
  const pos = useRef(new THREE.Vector3(0, 1.6, 5));
  const vel = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const speed = 7;

  const { camera, gl } = useThree();

  /* --- Input --- */
  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* --- Mouse Look --- */
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;
    const click = () => canvas.requestPointerLock();
    document.addEventListener("click", click);

    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current -= e.movementX * 0.0025;
      pitch.current -= e.movementY * 0.0025;
      pitch.current = Math.max(-1.4, Math.min(1.4, pitch.current));
    };
    window.addEventListener("mousemove", move);

    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("mousemove", move);
    };
  }, [gl.domElement]);

  /* --- Collision helper (slide) --- */
  function collide(next: THREE.Vector3) {
    const radius = 0.3;
    const height = 1.7;

    const box = new THREE.Box3(
      new THREE.Vector3(next.x - radius, next.y - height / 2, next.z - radius),
      new THREE.Vector3(next.x + radius, next.y + height / 2, next.z + radius)
    );

    for (const b of WORLD_BLOCKS) {
      if (!b.intersectsBox(box)) continue;

      const old = pos.current.clone();

      // Try X only
      const bx = box
        .clone()
        .translate(new THREE.Vector3(next.x - pos.current.x, 0, 0));
      if (!b.intersectsBox(bx)) {
        old.x = next.x;
      }

      // Try Z only
      const bz = box
        .clone()
        .translate(new THREE.Vector3(0, 0, next.z - pos.current.z));
      if (!b.intersectsBox(bz)) {
        old.z = next.z;
      }

      return old;
    }
    return next;
  }

  /* --- Update --- */
  useFrame((_, dt) => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    const forward = new THREE.Vector3(
      Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current)
    );

    const right = new THREE.Vector3(
      Math.cos(yaw.current),
      0,
      Math.sin(yaw.current)
    );

    vel.current.set(0, 0, 0);

    if (keys.current["w"]) vel.current.add(forward);
    if (keys.current["s"]) vel.current.sub(forward);
    if (keys.current["a"]) vel.current.sub(right);
    if (keys.current["d"]) vel.current.add(right);

    if (vel.current.length() > 0)
      vel.current.normalize().multiplyScalar(speed * dt);

    const next = pos.current.clone().add(vel.current);
    pos.current.copy(collide(next));

    camera.position.copy(pos.current);
  });

  return null;
}

/* ------------------------------------------------------
   VISUALS (GROUND + WALLS)
------------------------------------------------------ */

function World() {
  return (
    <>
      {/* Ground */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        <meshStandardMaterial color="#7a7a7a" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#8a7a7a" />
      </mesh>

      <mesh position={[0, 2.5, 15]} castShadow receiveShadow>
        <boxGeometry args={[30, 5, 1]} />
        <meshStandardMaterial color="#6a7a7a" />
      </mesh>

      <mesh position={[-15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#4a7a7a" />
      </mesh>

      <mesh position={[15, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 5, 30]} />
        <meshStandardMaterial color="#5a7a7a" />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------
   PAGE
------------------------------------------------------ */

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ fov: 70, position: [0, 1.6, 5] }}>
        <ambientLight intensity={0.3} />

        {/* HDR environment GI */}
        <Environment preset="city" />

        {/* Unreal GI shadow system */}
        <AccumulativeShadows
          temporal
          frames={80}
          blend={80}
          opacity={0.8}
          scale={50}
          position={[0, 0.01, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={6}
            ambient={0.5}
            intensity={1}
            position={[5, 10, 5]}
            bias={0.001}
          />
        </AccumulativeShadows>

        {/* Key light */}
        <directionalLight position={[5, 10, 5]} intensity={0.7} castShadow />

        <Player />
        <World />
      </Canvas>
    </div>
  );
}
