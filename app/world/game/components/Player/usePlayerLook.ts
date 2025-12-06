import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";


export function usePlayerLook() {
    const yaw = useRef(0);
    const pitch = useRef(0);
    const { gl } = useThree();


    useEffect(() => {
        const canvas = gl.domElement;
        const requestLock = () => canvas.requestPointerLock();
        document.addEventListener("click", requestLock);


        const move = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return;
            yaw.current -= e.movementX * 0.0025;
            pitch.current = THREE.MathUtils.clamp(
                pitch.current - e.movementY * 0.0025,
                -1.4,
                1.4
            );
        };


        window.addEventListener("mousemove", move);
        return () => {
            document.removeEventListener("click", requestLock);
            window.removeEventListener("mousemove", move);
        };
    }, [gl.domElement]);


    return { yaw, pitch };
}