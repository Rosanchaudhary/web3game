import { useRef, useEffect } from "react";
import { PlayerInputState } from "./playerTypes";



export function usePlayerInput() {
    const input = useRef<PlayerInputState>({
        keys: {},
        isSprinting: false,
        isCrouching: false,
        isADS: false,
        mouseDown: false,
    });


    useEffect(() => {
        
        const down = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            input.current.keys[k] = true;
            if (k === "shift") input.current.isSprinting = true;
            if (k === "control") input.current.isCrouching = true;
        };


        const up = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            input.current.keys[k] = false;
            if (k === "shift") input.current.isSprinting = false;
            if (k === "control") input.current.isCrouching = false;
        };


        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);


    useEffect(() => {
        
        const mouseDown = (e: MouseEvent) => {
            
            if (e.button === 0) input.current.mouseDown = true;
            if (e.button === 2) input.current.isADS = true;
        
        };


        const mouseUp = (e: MouseEvent) => {
            if (e.button === 0) input.current.mouseDown = false;
            if (e.button === 2) input.current.isADS = false;
        };


        window.addEventListener("mousedown", mouseDown);
        window.addEventListener("mouseup", mouseUp);
        return () => {
            window.removeEventListener("mousedown", mouseDown);
            window.removeEventListener("mouseup", mouseUp);
        };
    }, []);


    return input;
}