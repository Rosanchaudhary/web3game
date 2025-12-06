import * as THREE from "three";

export interface EnemyController {
  id: number;
  mesh: THREE.Mesh;
  health: number;
  onHit: (damage: number) => void;
}

export interface PlayerAPI {
  takeDamage: (amount: number) => void;
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
  range: {
    maxRange: number; // Hard cutoff distance
    falloffStart: number; // Distance at which damage starts reducing
  };

  sounds: {
    shot: string;
    pump?: string;
  };
  ads: {
    zoomFov: number;    // FOV when aiming
    speed: number;      // smooth speed (0–1)
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
    fireRate: 0.1,
    recoil: { posKick: 0.12, rotKick: 0.25, kickSpeed: 0.2, recoverSpeed: 0.1 },
    range: {
      falloffStart: 10,
      maxRange: 50,
    },
    sounds: { shot: "/sfx/arfire.mp3" },
    ads: {
      zoomFov: 50,     // slightly zoom
      speed: 0.12,     // transition speed
    },

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
    recoil: {
      posKick: 0.35,
      rotKick: 0.6,
      kickSpeed: 0.25,
      recoverSpeed: 0.05,
    },
    range: {
      falloffStart: 3,
      maxRange: 15,
    },
    ads: {
      zoomFov: 60,     // wider ADS (shotguns don’t zoom much)
      speed: 0.10,
    },
    sounds: { shot: "/sfx/shotgunfire.mp3" },

    modelOffset: {
      position: [0.15, -1.2, -0.6],
      rotation: [0, 1.6, -0.1],
      scale: 0.01,
    },
  },
};
