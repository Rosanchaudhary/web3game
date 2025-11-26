//component/Player.tsx
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import Gun from "./Gun";

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

/* ------------------------------------------------------
   TEMP MESH FOR RAYCASTING AGAINST BOXES
------------------------------------------------------ */
function boxMeshFromAABB(box: THREE.Box3) {
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshBasicMaterial({ visible: false }) // invisible
  );
  mesh.position.copy(center);
  mesh.updateMatrixWorld();
  return mesh;
}

export default function Player() {
  const pos = useRef(new THREE.Vector3(0, 1.6, 5));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const onGround = useRef(false);

  // SHOOTING
  const raycaster = useRef(new THREE.Raycaster());
  const mouseDown = useRef(false);

  const speed = 7;
  const jumpStrength = 9;
  const gravity = -25;

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
    MOUSE SHOOT INPUT
  ---------------------------- */
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = true;
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

  function checkVertical(nextY: THREE.Vector3, vy: number) {
    const boxY = collideBox(nextY);

    for (const w of WORLD_BLOCKS) {
      if (!w.intersectsBox(boxY)) continue;

      if (vy < 0) onGround.current = true;
      return { y: pos.current.y, vy: 0 };
    }

    return { y: nextY.y, vy };
  }

  function checkHorizontal(next: THREE.Vector3) {
    const box = collideBox(next);

    for (const w of WORLD_BLOCKS) {
      if (!w.intersectsBox(box)) continue;

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

  /* ------------------------------------------------------
     MAIN LOOP
  ------------------------------------------------------ */
  useFrame((_, dt) => {
    /* CAMERA ROTATION */
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    /* MOVEMENT VECTORS */
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
        SHOOTING (Raycast)
    ------------------------------------------------- */
    if (mouseDown.current) {
      const direction = camera.getWorldDirection(new THREE.Vector3());

      raycaster.current.set(camera.position, direction);

      let closestHit: THREE.Vector3 | null = null;
      let closestDist = Infinity;

      for (const wb of WORLD_BLOCKS) {
        const mesh = boxMeshFromAABB(wb);
        const hits = raycaster.current.intersectObject(mesh, false);

        if (hits.length > 0 && hits[0].distance < closestDist) {
          closestDist = hits[0].distance;
          closestHit = hits[0].point.clone();
        }
      }

      if (closestHit) {
        console.log("🔫 HIT at:", closestHit);
      }
    }
  });

  return <Gun camera={camera} />;
}
