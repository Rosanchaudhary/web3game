import * as THREE from "three";
import { AABB, aabbFromPosSize, aabbIntersect, resolveAABB } from "../core/Collision";

export type PlayerState = {
  position: THREE.Vector3; // BODY CENTER (y = height/2 when standing)
  velocity: THREE.Vector3;
  width: number;
  height: number;
};

/** Build AABB using the player's body-center position */
export function makePlayerAABB(state: PlayerState): AABB {
  return aabbFromPosSize(
    state.position.x,
    state.position.y,
    state.position.z,
    state.width,
    state.height,
    state.width
  );
}

/**
 * Collide player AABB against blocks.
 * Applies position corrections directly to state.position and adjusts state.velocity.
 * Returns true if player landed (i.e., was pushed up onto block).
 */
export function collidePlayer(state: PlayerState, blocks: AABB[]): boolean {
  let landed = false;
  let playerAabb = makePlayerAABB(state);

  for (const b of blocks) {
    if (!aabbIntersect(playerAabb, b)) continue;

    const correction = resolveAABB(playerAabb, b);

    // Apply correction to position
    state.position.add(correction);

    // If correction was primarily vertical, treat as landing / head hit
    const absX = Math.abs(correction.x);
    const absY = Math.abs(correction.y);
    const absZ = Math.abs(correction.z);

    if (absY >= absX && absY >= absZ) {
      if (correction.y > 0) {
        // Pushed up => landed on block
        state.velocity.y = 0;
        landed = true;
      } else {
        // Pushed down => hit head, clamp upward velocity
        state.velocity.y = Math.min(state.velocity.y, 0);
      }
    } else {
      // horizontal push — slide along block, keep vertical velocity unchanged
      // (optionally damp horizontal velocity)
    }

    // recompute AABB for subsequent collisions
    playerAabb = makePlayerAABB(state);
  }

  return landed;
}
