// enemyStore.ts
import * as THREE from "three";

export interface EnemyController {
  id: number;
  mesh: THREE.Mesh;
  health: number;
  onHit: (damage: number) => void;
}

export const EnemyStore: EnemyController[] = [];

let nextEnemyId = 1;

export function registerEnemy(mesh: THREE.Mesh): EnemyController {
  const enemy: EnemyController = {
    id: nextEnemyId++,
    mesh,
    health: 100,
    onHit: () => {}
  };

  EnemyStore.push(enemy);
  return enemy;
}

export function unregisterEnemy(enemy: EnemyController) {
  const i = EnemyStore.indexOf(enemy);
  if (i !== -1) EnemyStore.splice(i, 1);
}
