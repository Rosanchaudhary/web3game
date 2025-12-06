import * as THREE from "three";
import { useRef } from "react";
import { EnemyStore } from "../../stores/enemyStore";
import { GunManager } from "../../manager/GunManager";
import { PlayerInputState } from "./playerTypes";


export function usePlayerShooting(input: React.RefObject<PlayerInputState>, gunManager: React.RefObject<GunManager>) {
    const raycaster = useRef(new THREE.Raycaster());
    const shotFiredRef = useRef(false);


    function updateShooting(camera: THREE.Camera) {
        const t = performance.now() / 1000;
        const gm = gunManager.current;


        if (!input.current.mouseDown) return;
        if (!gm.canShoot(t)) return;


        gm.recordShot(t);
        shotFiredRef.current = true;


        const dir = camera.getWorldDirection(new THREE.Vector3());
        raycaster.current.set(camera.position.clone(), dir);


        const meshes = EnemyStore.map(e => e.mesh).filter(m => m && m.parent);
        const hits = raycaster.current.intersectObjects(meshes);


        if (hits.length === 0) return;


        const hit = hits[0];
        const enemy = EnemyStore.find(e => e.mesh === hit.object);
        if (!enemy) return;


        const gun = gm.current;
        const dist = hit.point.distanceTo(camera.position);


        if (dist > gun.range.maxRange) return;


        let dmg = gun.damage;


        if (dist > gun.range.falloffStart) {
            const falloff = (dist - gun.range.falloffStart) / (gun.range.maxRange - gun.range.falloffStart);
            dmg *= 1 - THREE.MathUtils.clamp(falloff, 0, 1);
        }


        enemy.onHit(dmg);
    }


    return { shotFiredRef, updateShooting };
}