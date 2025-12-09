import * as THREE from "three";

import { PlayerInputState } from "./playerTypes";
import { GunManager } from "../../manager/GunManager";

export function usePlayerZoom(
  inputRef: React.RefObject<PlayerInputState>,
  gunManagerRef: React.RefObject<GunManager> 
) {
  // default hip-fire FOV
  const hipFov = 70;

  function updateZoom(camera: THREE.Camera) {
    // ensure perspective camera
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const gm = gunManagerRef?.current;
    if (!gm) {
      // fallback to hip-fire
      camera.fov += (hipFov - camera.fov) * 0.15;
      camera.updateProjectionMatrix();
      return;
    }

    const gun = gm.current; // your GunManager likely stores the active gun at `current`
    if (!gun) {
      camera.fov += (hipFov - camera.fov) * 0.15;
      camera.updateProjectionMatrix();
      return;
    }

    const isADS = inputRef.current.isADS;
    const targetFov = isADS ? gun.ads.zoomFov ?? hipFov : hipFov;

    // Use weapon-provided ads speed, fallback to smooth factor
    const speed = gun.ads?.speed ?? 0.15;

    // Smooth lerp
    // Note: keep changes small each frame, don't set directly
    camera.fov += (targetFov - camera.fov) * speed;

    camera.updateProjectionMatrix();
  }

  return { updateZoom };
}
