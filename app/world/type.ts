import * as THREE from "three";

export interface EnemyController {
  id: number;
  mesh: THREE.Mesh;
  health: number;
  onHit: (damage: number) => void;
}
