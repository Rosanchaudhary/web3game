//components/Player.tsx
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import Gun from "./Gun";
import { EnemyStore } from "../stores/enemyStore";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { GunManager } from "../manager/GunManager";

export default function Player() {
  const body = useRef<RapierRigidBody | null>(null);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const gunManager = useRef(new GunManager());

  // Sprint / Crouch
  const isSprinting = useRef(false);
  const isCrouching = useRef(false);
  const shotFiredRef = useRef(false);

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

  const jumpStrength = 6; // smaller since Rapier uses realistic mass/impulse

  const { camera, gl } = useThree();

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



  useEffect(() => {
    const down = (e: KeyboardEvent) => {

      if (e.key === "1") gunManager.current.switchTo("pistol");
      if (e.key === "2") gunManager.current.switchTo("shotgun");
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
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
     MAIN LOOP (Rapier-driven)
  ------------------------------------------------------ */
  useFrame((_, dt) => {
    if (!body.current) return;

    /* CAMERA ROTATION */
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    /* CROUCH SMOOTH */
    const targetHeight = isCrouching.current ? CROUCH_HEIGHT : STAND_HEIGHT;
    camHeight.current += (targetHeight - camHeight.current) * 0.15;

    /* CHOOSE SPEED */
    let currentSpeed = WALK_SPEED;
    if (isCrouching.current) currentSpeed = CROUCH_SPEED;
    else if (isSprinting.current) currentSpeed = SPRINT_SPEED;

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

    let desiredVel = new THREE.Vector3(0, 0, 0);
    if (move.length() > 0) {
      desiredVel = move.normalize().multiplyScalar(currentSpeed);
    }

    // Get current linear velocity from Rapier
    const linvel = body.current.linvel();

    // Apply air control multiplier if not grounded: approximate grounded by small y velocity
    const grounded = Math.abs(linvel.y) < 0.1; // approximation
    if (!grounded) desiredVel.multiplyScalar(AIR_CONTROL);

    // Set horizontal velocity while preserving vertical velocity handled by Rapier
    const nextVel = { x: desiredVel.x, y: linvel.y, z: desiredVel.z };

    body.current.setLinvel(nextVel, true);

    /* JUMP */
    if (keys.current[" "] && grounded) {
      // Apply an impulse upwards. Multiply by body mass roughly via impulse mode 'true'
      body.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true);
    }

    /* UPDATE CAMERA - follow rigidbody */
    const t = body.current.translation();
    camera.position.set(t.x, t.y + camHeight.current, t.z);

    /* -------------------------------------------------
       SHOOTING (raycast in three.js, enemies in scene)
    ------------------------------------------------- */
    /* -------------------------------------------------
   SHOOTING (raycast + GunManager)
------------------------------------------------- */
    const gm = gunManager.current;
    const time = performance.now() / 1000; // seconds

    if (mouseDown.current) {
      if (gm.canShoot(time)) {
        gm.recordShot(time);

        // notify gun component to play recoil + sound
        shotFiredRef.current = true;

        // ---- Raycast ----
        const direction = camera.getWorldDirection(new THREE.Vector3());
        raycaster.current.set(camera.position.clone(), direction);

        const enemyMeshes = EnemyStore.map((e) => e.mesh).filter(
          (m) => m && m.parent
        );

        const hits = raycaster.current.intersectObjects(enemyMeshes, false);

        if (hits.length > 0) {
          const mesh = hits[0].object;
          const enemy = EnemyStore.find((e) => e.mesh === mesh);

          if (enemy) {
            enemy.onHit(gm.current.damage);
          }
        }
      }
    }


  });

  return (
    <>
      {/* RigidBody that represents the player. We don't render the mesh here; the collider is separate. */}
      <RigidBody
        ref={body}
        colliders={false}
        type="dynamic"
        // lock rotations so the player doesn't tip over
        lockRotations
        linearDamping={2}
        angularDamping={1}
        position={[0, 1.6, 5]}
      >
       
        <CuboidCollider args={[0.3, 0.8, 0.3]} position={[0, 0.8, 0]} />
      </RigidBody>

      <primitive object={camera}>
        <Gun gunManager={gunManager} shotFiredRef={shotFiredRef} />
      </primitive>
    </>
  );
}
