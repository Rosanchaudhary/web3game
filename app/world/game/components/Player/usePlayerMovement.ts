import { useRef } from "react";
import * as THREE from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { PlayerInputState } from "./playerTypes";

export function usePlayerMovement(
  body: React.MutableRefObject<RapierRigidBody | null>,
  input: React.MutableRefObject<PlayerInputState>
) {
  const STAND_HEIGHT = 1.6;
  const CROUCH_HEIGHT = 1.0;
  const camHeight = useRef(STAND_HEIGHT);

  const WALK = 7;
  const SPRINT = 12;
  const CROUCH = 3;
  const AIR_CONTROL = 0.4;
  const JUMP = 6;

  function updateMovement(camera: THREE.Camera) {
    if (!body.current) return;

    const { keys, isCrouching, isSprinting } = input.current;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    /* CROUCH SMOOTH */
    const targetHeight = isCrouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    camHeight.current += (targetHeight - camHeight.current) * 0.15;

    let speed = WALK;
    if (isCrouching) speed = CROUCH;
    else if (isSprinting) speed = SPRINT;

    const move = new THREE.Vector3();
    if (keys["w"]) move.add(forward);
    if (keys["s"]) move.sub(forward);
    if (keys["a"]) move.sub(right);
    if (keys["d"]) move.add(right);

    const desired =
      move.length() > 0
        ? move.normalize().multiplyScalar(speed)
        : new THREE.Vector3();

    const vel = body.current.linvel();
    const grounded = Math.abs(vel.y) < 0.1;

    if (!grounded) desired.multiplyScalar(AIR_CONTROL);

    body.current.setLinvel({ x: desired.x, y: vel.y, z: desired.z }, true);

    if (keys[" "] && grounded)
      body.current.applyImpulse({ x: 0, y: JUMP, z: 0 }, true);

    const pos = body.current.translation();
    camera.position.set(pos.x, pos.y + camHeight.current, pos.z);
  }

  return { camHeight, updateMovement };
}
