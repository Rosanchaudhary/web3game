import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";

/* ------------------------------------------------------
   BLOCK CREATOR (AABB)
------------------------------------------------------ */
const createBlock = (x: number, y: number, z: number, w = 2, h = 2, d = 2) => {
  return new THREE.Box3(
    new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2),
    new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2)
  );
};

/* ------------------------------------------------------
   WORLD BLOCKS (Collision Map)
------------------------------------------------------ */
const WORLD_BLOCKS = [
  createBlock(0, 0, 0, 30, 1, 30), // ground
  createBlock(0, 2.5, -15, 30, 5, 1), // back
  createBlock(0, 2.5, 15, 30, 5, 1), // front
  createBlock(-15, 2.5, 0, 1, 5, 30), // left
  createBlock(15, 2.5, 0, 1, 5, 30), // right
];

export default function Player() {
  const pos = useRef(new THREE.Vector3(0, 1.6, 5));
  const vel = useRef(new THREE.Vector3(0, 0, 0));

  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});

  const speed = 7;
  const jumpStrength = 9;
  const gravity = -25;

  const onGround = useRef(false);

  const { camera, gl } = useThree();

  /* ----------------------------
    INPUT
  ---------------------------- */
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

  /* ----------------------------
    MOUSE LOOK
  ---------------------------- */
  useEffect(() => {
    const canvas = gl.domElement;

    const click = () => canvas.requestPointerLock();
    document.addEventListener("click", click);

    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;

      yaw.current -= e.movementX * 0.0025;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - e.movementY * 0.0025,
        -1.4,
        1.4
      );
    };

    window.addEventListener("mousemove", move);

    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("mousemove", move);
    };
  }, [gl.domElement]);

  /* ----------------------------
    COLLISION HELPERS
  ---------------------------- */
  function collideBox(next: THREE.Vector3) {
    const radius = 0.3;
    const height = 1.7;

    return new THREE.Box3(
      new THREE.Vector3(next.x - radius, next.y - height / 2, next.z - radius),
      new THREE.Vector3(next.x + radius, next.y + height / 2, next.z + radius)
    );
  }

  /**
   * Vertical collision check.
   * - If the player's vertical AABB intersects a world block we treat it as a landing/ceiling hit.
   * - We set onGround.current = true when landing or standing on a block (vy <= 0).
   * - Otherwise onGround.current = false.
   */
  function checkVertical(nextY: THREE.Vector3, vy: number) {
    const boxY = collideBox(nextY);

    for (const w of WORLD_BLOCKS) {
      if (!w.intersectsBox(boxY)) continue;

      // If we're intersecting vertically and moving down or stationary, we're on the ground.
      if (vy <= 0) onGround.current = true;

      // Clamp to previous Y (prevent penetration) and zero vertical velocity.
      return { y: pos.current.y, vy: 0 };
    }

    // No vertical intersection → airborne.
    onGround.current = false;
    return { y: nextY.y, vy };
  }

  /**
   * Horizontal collision check (X/Z).
   * Tries X and Z separately to allow sliding along walls.
   */
  function checkHorizontal(next: THREE.Vector3) {
    const box = collideBox(next);

    for (const w of WORLD_BLOCKS) {
      if (!w.intersectsBox(box)) continue;

      // sliding (X/Z separately)
      const fixed = pos.current.clone();

      const testX = collideBox(
        new THREE.Vector3(next.x, pos.current.y, pos.current.z)
      );
      if (!w.intersectsBox(testX)) fixed.x = next.x;

      const testZ = collideBox(
        new THREE.Vector3(pos.current.x, pos.current.y, next.z)
      );
      if (!w.intersectsBox(testZ)) fixed.z = next.z;

      return fixed;
    }

    return next;
  }

  /* ----------------------------
    UPDATE LOOP (useFrame)
  ---------------------------- */
  useFrame((_, dt) => {
    // update camera rotation from look
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    // ---- movement direction ----
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

    // Build movement vector from input
    const move = new THREE.Vector3();
    if (keys.current["w"]) move.add(forward);
    if (keys.current["s"]) move.sub(forward);
    if (keys.current["a"]) move.sub(right);
    if (keys.current["d"]) move.add(right);

    if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

    // -------------------------------------------------
    // HORIZONTAL STEP (XZ only)
    // -------------------------------------------------
    let nextPos = pos.current.clone().add(move);
    nextPos = checkHorizontal(nextPos);
    pos.current.copy(nextPos);

    // -------------------------------------------------
    // VERTICAL STEP
    //  - Apply gravity
    //  - Jump if requested AND we were on ground (onGround is from previous frame or set by checkVertical)
    //  - Move vertically and resolve collisions
    // -------------------------------------------------
    vel.current.y += gravity * dt;

    // Accept either ' ' (space char) or 'space' (some browsers)
    const wantsJump = Boolean(keys.current[" "] || keys.current["space"]);

    if (wantsJump && onGround.current) {
      vel.current.y = jumpStrength;
      // do NOT set onGround false here — we'll recompute after movement
    }

    const nextY = pos.current.clone();
    nextY.y += vel.current.y * dt;

    const vert = checkVertical(nextY, vel.current.y);
    pos.current.y = vert.y;
    vel.current.y = vert.vy;

    // final camera position
    camera.position.copy(pos.current);
  });

  return null;
}
