"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";



export default function Page() {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white">
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 60 }}>
        <Scene />
      </Canvas>
      <div style={{ position: "absolute", left: 16, top: 16 }}>
        <HUD />
      </div>
    </div>
  );
}

function HUD() {
  return (
    <div style={{ background: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 6 }}>
      <div style={{ fontWeight: 600 }}>3D World — WASD / Arrow keys</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>
        Click to lock pointer and look around. Space to jump.
      </div>
    </div>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        intensity={0.8}
        position={[5, 10, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Player />

      <Ground />

      <Blocks />

      <Sky />
    </>
  );
}

function Sky() {
  // small sky color change using fog
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#111827", 0.02);
  }, [scene]);
  return null;
}

function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#2b2f36" metalness={0.1} roughness={1} />
    </mesh>
  );
}

function Blocks() {
  // simple grid of blocks
  const blocks = [];
  const size = 1;
  for (let x = -5; x <= 5; x += 2) {
    for (let z = -5; z <= 5; z += 2) {
      const h = 1 + Math.abs((x + z) % 3);
      blocks.push(
        <mesh
          key={`b-${x}-${z}`}
          position={[x * (size + 0.1), h / 2, z * (size + 0.1)]}
          castShadow
        >
          <boxGeometry args={[size, h, size]} />
          <meshStandardMaterial color={new THREE.Color(`hsl(${((x + 5) * 30 + (z + 5) * 15) % 360},60%,50%)`)} />
        </mesh>
      );
    }
  }
  // a few taller standing blocks
  blocks.push(
    <mesh key={`b-tall-1`} position={[6, 2.5, -2]} castShadow>
      <boxGeometry args={[1.5, 5, 1.5]} />
      <meshStandardMaterial color="#8b5cf6" />
    </mesh>
  );

  return <group>{blocks}</group>;
}

function Player() {
  // Controls and camera movement handled here.
  // Uses pointer lock for mouse look and keyboard for movement.

  const { camera, gl } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const upVector = new THREE.Vector3(0, 1, 0);

  // rotation state
  const yaw = useRef(0);
  const pitch = useRef(0);

  const keys = useRef({ forward: 0, backward: 0, left: 0, right: 0, jump: 0 });
  const canJump = useRef(true);

  useEffect(() => {
    // set initial camera position
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 2, 0);

    // pointer lock
    const onClick = () => {
      const canvas = gl.domElement;
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
    };

    const onPointerLockChange = () => {
      // do nothing now; mousemove will be ignored if not locked
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [camera, gl.domElement]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      const sensitivity = 0.0025;
      yaw.current -= movementX * sensitivity;
      pitch.current -= movementY * sensitivity;
      // clamp pitch between -85deg and 85deg
      const limit = Math.PI / 2 - 0.05;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = 1;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = 1;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = 1;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = 1;
          break;
        case "Space":
          if (canJump.current) {
            velocity.current.y += 6; // jump impulse
            canJump.current = false;
          }
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = 0;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = 0;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = 0;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = 0;
          break;
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [gl.domElement]);

  useFrame((_, delta) => {
    // update rotation to camera
    camera.rotation.order = "YXZ"; // yaw-pitch-roll order
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    // movement direction relative to camera orientation
    direction.current.set(0, 0, 0);
    if (keys.current.forward) direction.current.z -= 1;
    if (keys.current.backward) direction.current.z += 1;
    if (keys.current.left) direction.current.x -= 1;
    if (keys.current.right) direction.current.x += 1;
    direction.current.normalize();

    // rotate direction by camera yaw
    const rotMatrix = new THREE.Matrix4().makeRotationY(yaw.current);
    direction.current.applyMatrix4(rotMatrix);

    // acceleration & friction
    const accel = 20.0;
    const friction = 10.0;

    // apply acceleration
    velocity.current.x += direction.current.x * accel * delta;
    velocity.current.z += direction.current.z * accel * delta;

    // gravity
    velocity.current.y -= 9.8 * delta;

    // apply simple ground collision
    const pos = camera.position;
    pos.addScaledVector(velocity.current, delta);

    if (pos.y < 2) {
      // hit ground at y = 2 (player eye height)
      velocity.current.y = 0;
      pos.y = 2;
      canJump.current = true;
    }

    // simple horizontal friction
    velocity.current.x -= velocity.current.x * Math.min(friction * delta, 1);
    velocity.current.z -= velocity.current.z * Math.min(friction * delta, 1);

    // limit horizontal speed
    const maxSpeed = 6;
    const hSpeed = Math.sqrt(velocity.current.x * velocity.current.x + velocity.current.z * velocity.current.z);
    if (hSpeed > maxSpeed) {
      const scale = maxSpeed / hSpeed;
      velocity.current.x *= scale;
      velocity.current.z *= scale;
    }
  });

  return null;
}
