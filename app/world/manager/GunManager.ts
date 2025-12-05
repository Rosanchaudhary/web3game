

import { GunID, GUNS, GunDefinition } from "../type";

export class GunManager {
  current: GunDefinition = GUNS.pistol;
  lastShotTime = 0;

  switchTo(id: GunID) {
    this.current = GUNS[id];
  }

  canShoot(time: number) {
    return time - this.lastShotTime >= this.current.fireRate;
  }

  recordShot(time: number) {
    this.lastShotTime = time;
  }
}
