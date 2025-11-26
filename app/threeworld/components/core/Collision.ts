import * as THREE from "three";

export type AABB = {
  min: THREE.Vector3;
  max: THREE.Vector3;
  id?: string;
};

export const aabbFromPosSize = (
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number
): AABB => {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;

  return {
    min: new THREE.Vector3(x - hx, y - hy, z - hz),
    max: new THREE.Vector3(x + hx, y + hy, z + hz),
  };
};

export function aabbIntersect(a: AABB, b: AABB) {
  return (
    a.min.x <= b.max.x &&
    a.max.x >= b.min.x &&
    a.min.y <= b.max.y &&
    a.max.y >= b.min.y &&
    a.min.z <= b.max.z &&
    a.max.z >= b.min.z
  );
}

export function resolveAABB(subject: AABB, block: AABB) {
  const dx1 = block.max.x - subject.min.x;
  const dx2 = subject.max.x - block.min.x;
  const dy1 = block.max.y - subject.min.y;
  const dy2 = subject.max.y - block.min.y;
  const dz1 = block.max.z - subject.min.z;
  const dz2 = subject.max.z - block.min.z;

  const overlapX = Math.min(dx1, dx2);
  const overlapY = Math.min(dy1, dy2);
  const overlapZ = Math.min(dz1, dz2);

  const minOverlap = Math.min(overlapX, overlapY, overlapZ);
  const correction = new THREE.Vector3();

  if (minOverlap === overlapX) {
    correction.x = dx1 < dx2 ? -dx1 : dx2;
  } else if (minOverlap === overlapY) {
    correction.y = dy1 < dy2 ? -dy1 : dy2;
  } else {
    correction.z = dz1 < dz2 ? -dz1 : dz2;
  }

  return correction;
}
