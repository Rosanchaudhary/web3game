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
  createBlock(0, 0, 0, 30, 1, 30),
  createBlock(0, 2.5, -15, 30, 5, 1),
  createBlock(0, 2.5, 15, 30, 5, 1),
  createBlock(-15, 2.5, 0, 1, 5, 30),
  createBlock(15, 2.5, 0, 1, 5, 30),
];

export default function Player() {
  const pos = useRef(new THREE.Vector3(0, 1.6, 5));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const onGround = useRef(false);

  // Sprint / Crouch
  const isSprinting = useRef(false);
  const isCrouching = useRef(false);

  const WALK_SPEED = 7;
  const SPRINT_SPEED = 12;
  const CROUCH_SPEED = 3;

  const CROUCH_HEIGHT = 1.0;
  const STAND_HEIGHT = 1.6;

  const AIR_CONTROL = 0.4;

  const camHeight = useRef(STAND_HEIGHT);

  // SHOOTING
  const raycaster = useRef(new THREE.Raycaster());
  const mouseDown = useRef(false);
  const justClicked = useRef(false);

  const jumpStrength = 9;
  const gravity = -25;

  const { camera, gl } = useThree();

  /* ------------------------------------------------------
      PREBUILD COLLIDER MESHES
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
        new THREE.MeshBasicMaterial({ visible: false })
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
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = true;

      if (k === "shift") isSprinting.current = true;
      if (k === "control") isCrouching.current = true;
    };

    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = false;

      if (k === "shift") isSprinting.current = false;
      if (k === "control") isCrouching.current = false;
    };

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
    SHOOT INPUT
  ---------------------------- */
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!mouseDown.current) justClicked.current = true;
        mouseDown.current = true;
      }
    };
    const up = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = false;
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
    const height = isCrouching.current ? CROUCH_HEIGHT : STAND_HEIGHT;

    return new THREE.Box3(
      new THREE.Vector3(next.x - radius, next.y - height / 2, next.z - radius),
      new THREE.Vector3(next.x + radius, next.y + height / 2, next.z + radius)
    );
  }

  function checkVertical(nextY: THREE.Vector3, vy: number) {
    onGround.current = false;

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

    /* CROUCH SMOOTH */
    /* CROUCH SMOOTH — modify camera height, NOT player position */
    const targetHeight = isCrouching.current ? CROUCH_HEIGHT : STAND_HEIGHT;

    camHeight.current += (targetHeight - camHeight.current) * 0.15;

    /* CHOOSE SPEED */
    let currentSpeed = WALK_SPEED;
    if (isCrouching.current) currentSpeed = CROUCH_SPEED;
    else if (isSprinting.current && onGround.current)
      currentSpeed = SPRINT_SPEED;

    /* MOVEMENT VECTORS - CAMERA BASED */
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (keys.current["w"]) move.add(forward);
    if (keys.current["s"]) move.sub(forward);
    if (keys.current["a"]) move.sub(right);
    if (keys.current["d"]) move.add(right);

    if (move.length() > 0) {
      move.normalize().multiplyScalar(currentSpeed * dt);

      if (!onGround.current) move.multiplyScalar(AIR_CONTROL);
    }

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
    camera.position.set(
      pos.current.x,
      pos.current.y + camHeight.current,
      pos.current.z
    );

    /* -------------------------------------------------
       SHOOTING
    ------------------------------------------------- */
    if (justClicked.current) {
      justClicked.current = false;

      const direction = camera.getWorldDirection(new THREE.Vector3());
      raycaster.current.set(camera.position.clone(), direction);

      const enemyMeshes = EnemyStore.map((e) => e.mesh).filter(
        (m) => m && m.parent
      );

      const hits = raycaster.current.intersectObjects(enemyMeshes, false);

      if (hits.length > 0) {
        const mesh = hits[0].object;
        const enemy = EnemyStore.find((e) => e.mesh === mesh);
        if (enemy) enemy.onHit(10);
      }
    }
  });

  return <Gun shootingRef={mouseDown} />;
}
