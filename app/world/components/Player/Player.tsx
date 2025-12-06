//components/Player.tsx
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import Gun from "../Gun";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { GunManager } from "../../manager/GunManager";
import { usePlayerInput } from "./usePlayerInput";
import { usePlayerLook } from "./usePlayerLook";
import { usePlayerMovement } from "./usePlayerMovement";
import { usePlayerShooting } from "./usePlayerShooting";
import { usePlayerZoom } from "./usePlayerZoom";
import { useGunSwitching } from "./useGunSwitching";

export default function Player() {
  const body = useRef<RapierRigidBody | null>(null);

  const gunManager = useRef(new GunManager());
  const { yaw, pitch } = usePlayerLook();
  const input = usePlayerInput();
  const { updateMovement } = usePlayerMovement(body, input);

  const { camera } = useThree();

  const { shotFiredRef, updateShooting } = usePlayerShooting(input, gunManager);
  const { updateZoom } = usePlayerZoom(input, gunManager);
  useGunSwitching(gunManager);

  useFrame(() => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
    updateZoom(camera);
    updateMovement(camera);
    updateShooting(camera);
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
        <Gun
          gunManager={gunManager}
          shotFiredRef={shotFiredRef}
          inputRef={input}
        />
      </primitive>
    </>
  );
}
