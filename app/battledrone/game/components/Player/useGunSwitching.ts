import { useEffect } from "react";
import { GunManager } from "../../manager/GunManager";

export function useGunSwitching(gunManagerRef: React.RefObject<GunManager>) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const gm = gunManagerRef.current;
            if (!gm) return;

            if (e.key === "1") gm.switchTo("pistol");
            if (e.key === "2") gm.switchTo("shotgun");
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [gunManagerRef]);
}
