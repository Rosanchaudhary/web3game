//component/Player.tsx
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import Gun from "./Gun";
import { EnemyStore } from "../stores/enemyStore";

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
  const onGround = useRef(false);

  // SHOOTING
  const raycaster = useRef(new THREE.Raycaster());
  const mouseDown = useRef(false); // track hold state
  const justClicked = useRef(false); // single-shot trigger

  const speed = 7;
  const jumpStrength = 9;
  const gravity = -25;

  const { camera, gl } = useThree();

  /* ------------------------------------------------------
      PREBUILD COLLIDER MESHES (performance fix)
  ------------------------------------------------------ */
  const colliderMeshes = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    colliderMeshes.current = WORLD_BLOCKS.map((b) => {
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      b.getSize(size);
      b.getCenter(center);

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ visible: false }) // invisible
      );

      mesh.position.copy(center);
      mesh.updateMatrixWorld();

      return mesh;
    });
  }, []);

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
    MOUSE LOOK & POINTERLOCK
  ---------------------------- */
  useEffect(() => {
    const canvas = gl.domElement;

    const clickRequestLock = () => canvas.requestPointerLock();
    document.addEventListener("click", clickRequestLock);

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
      document.removeEventListener("click", clickRequestLock);
      window.removeEventListener("mousemove", move);
    };
  }, [gl.domElement]);

  /* ----------------------------
    MOUSE SHOOT INPUT (ONE-SHOT + HOLD)
    - justClicked becomes true on initial mousedown (fires once)
    - mouseDown tracks hold state (kept for future use if needed)
  ---------------------------- */
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!mouseDown.current) {
          justClicked.current = true;
        }
        mouseDown.current = true;
      }
    };
    const up = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseDown.current = false;
      }
    };

    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  /* ------------------------------------------------------
      COLLISION HELPERS
  ------------------------------------------------------ */
  function collideBox(next: THREE.Vector3) {
    const radius = 0.3;
    const height = 1.7;

    return new THREE.Box3(
      new THREE.Vector3(next.x - radius, next.y - height / 2, next.z - radius),
      new THREE.Vector3(next.x + radius, next.y + height / 2, next.z + radius)
    );
  }

  function checkVertical(nextY: THREE.Vector3, vy: number) {
    onGround.current = false; // important - reset before checks

    const boxY = collideBox(nextY);

    for (const w of WORLD_BLOCKS) {
      if (!w.intersectsBox(boxY)) continue;

      if (vy < 0) onGround.current = true;

      return { y: pos.current.y, vy: 0 };
    }

    return { y: nextY.y, vy };
  }

  function checkHorizontal(next: THREE.Vector3) {
    const fixed = next.clone();

    for (const w of WORLD_BLOCKS) {
      const testX = collideBox(
        new THREE.Vector3(next.x, pos.current.y, pos.current.z)
      );
      if (w.intersectsBox(testX)) fixed.x = pos.current.x;

      const testZ = collideBox(
        new THREE.Vector3(pos.current.x, pos.current.y, next.z)
      );
      if (w.intersectsBox(testZ)) fixed.z = pos.current.z;
    }

    return fixed;
  }

  /* ------------------------------------------------------
     MAIN LOOP
  ------------------------------------------------------ */
  useFrame((_, dt) => {
    /* CAMERA ROTATION */
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    /* MOVEMENT VECTORS */
    // TRUE forward from camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // flatten (FPS walking)
    forward.normalize();

    // TRUE right vector from camera
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();

    if (keys.current["w"]) move.add(forward);
    if (keys.current["s"]) move.sub(forward);
    if (keys.current["a"]) move.sub(right);
    if (keys.current["d"]) move.add(right);

    if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

    /* HORIZONTAL */
    let nextPos = pos.current.clone().add(move);
    nextPos = checkHorizontal(nextPos);
    pos.current.copy(nextPos);

    /* VERTICAL */
    vel.current.y += gravity * dt;

    if (keys.current[" "] && onGround.current) {
      vel.current.y = jumpStrength;
      onGround.current = false;
    }

    const nextY = pos.current.clone();
    nextY.y += vel.current.y * dt;

    const vert = checkVertical(nextY, vel.current.y);
    pos.current.y = vert.y;
    vel.current.y = vert.vy;

    /* UPDATE CAMERA */
    camera.position.copy(pos.current);

    /* -------------------------------------------------
    SHOOTING (ONE-SHOT per mousedown)
------------------------------------------------- */
    if (justClicked.current) {
      justClicked.current = false;

      const direction = camera.getWorldDirection(new THREE.Vector3());
      raycaster.current.set(camera.position.clone(), direction);

      // Only active enemies (still mounted)
      const enemyMeshes = EnemyStore.map((e) => e.mesh).filter(
        (m) => m && m.parent
      );

      const hits = raycaster.current.intersectObjects(enemyMeshes, false);

      if (hits.length > 0) {
        const mesh = hits[0].object;
        const enemy = EnemyStore.find((e) => e.mesh === mesh);

        if (enemy) {
          enemy.onHit(10);
          console.log("Hit enemy at:", hits[0].point);
        }
      }
    }
  });

  return <Gun shootingRef={mouseDown} />;
}
