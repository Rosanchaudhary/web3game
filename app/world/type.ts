import * as THREE from "three";

export interface EnemyController {
  id: number;
  mesh: THREE.Mesh;
  health: number;
  onHit: (damage: number) => void;
}

export type GunID = "pistol" | "shotgun";

export interface GunDefinition {
  id: GunID;
  modelPath: string;
  damage: number;
  fireRate: number;

  recoil: {
    posKick: number;
    rotKick: number;
    kickSpeed: number;
    recoverSpeed: number;
  };

  sounds: {
    shot: string;
    pump?: string;
  };

  modelOffset: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  };
}

export const GUNS: Record<GunID, GunDefinition> = {
  pistol: {
    id: "pistol",
    modelPath: "/3d/low-poly_msmc.glb",
    damage: 10,
    fireRate: 0.2,
    recoil: { posKick: 0.12, rotKick: 0.25, kickSpeed: 0.2, recoverSpeed: 0.1 },
    sounds: { shot: "/sfx/gun-fire-346766.mp3" },

    modelOffset: {
      position: [0.2, -0.5, -0.1],
      rotation: [0, 1.7, -0.1],
      scale: 0.4,
    },
  },

  shotgun: {
    id: "shotgun",
    modelPath: "/3d/low-poly_stolzer__son_double_deuce.glb",
    damage: 25,
    fireRate: 0.8,
    recoil: { posKick: 0.35, rotKick: 0.6, kickSpeed: 0.25, recoverSpeed: 0.05 },
    sounds: { shot: "/sfx/gun-fire-346766.mp3" },

    modelOffset: {
      position: [0.15, -1.2, -0.6],
      rotation: [0, 1.6, -0.1],
      scale: 0.01,
    },
  },
};

