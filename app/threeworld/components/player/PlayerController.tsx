import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PlayerCamera from "./PlayerCamera";
import { readMovement } from "./PlayerInput";
import { useWorld } from "../world/WorldManager";
import { PlayerState, collidePlayer } from "./PlayerPhysics";
import { clamp } from "../core/MathUtils";

export default function PlayerController() {
  const { camera, gl } = useThree();
  const { aabbs } = useWorld();

  const yaw = useRef(0);
  const pitch = useRef(0);

  // player's physical size
  const width = 0.6;
  const height = 1.8;

  // IMPORTANT: position is BODY CENTER (y = height / 2 when standing on ground)
  const state = useRef<PlayerState>({
    position: new THREE.Vector3(0, height / 2, 6), // center at half height
    velocity: new THREE.Vector3(),
    width,
    height,
  }).current;

  const canJump = useRef(true);

  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => canvas.requestPointerLock?.();
    document.addEventListener("click", onClick);

    const onPointerMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current -= e.movementX * 0.0025;
      pitch.current -= e.movementY * 0.0025;
      pitch.current = clamp(pitch.current, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
    };

    window.addEventListener("mousemove", onPointerMove);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onPointerMove);
    };
  }, [gl.domElement]);

  useFrame((_, delta) => {
    // rotate camera by yaw/pitch — camera transform updated below
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    const input = readMovement();

    // direction vectors (yaw only)
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const move = new THREE.Vector3();
    if (input.forward) move.add(forward);
    if (input.back) move.sub(forward);
    if (input.left) move.sub(right);
    if (input.right) move.add(right);
    if (move.lengthSq() > 0) move.normalize();

    const baseSpeed = input.sprint ? 8 : 5;
    // instant horizontal control
    state.velocity.x = move.x * baseSpeed;
    state.velocity.z = move.z * baseSpeed;

    // gravity
    state.velocity.y -= 9.8 * delta;

    // jump
    if (input.jump && canJump.current) {
      state.velocity.y = 6;
      canJump.current = false;
    }

    // integrate position
    state.position.addScaledVector(state.velocity, delta);

    // collision with world blocks — collidePlayer now returns `landed`
    const landed = collidePlayer(state, aabbs);
    if (landed) {
      canJump.current = true;
    }

    // ground plane collision (y = height/2 is standing on floor)
    if (state.position.y < state.height / 2) {
      state.position.y = state.height / 2;
      state.velocity.y = 0;
      canJump.current = true;
    }

    // set camera to eye position (centerY + height/2)
    camera.position.set(state.position.x, state.position.y + state.height / 2, state.position.z);
  });

  return <PlayerCamera />;
}
