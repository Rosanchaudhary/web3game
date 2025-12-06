export interface PlayerInputState {
    keys: Record<string, boolean>;
    isSprinting: boolean;
    isCrouching: boolean;
    isADS: boolean;
    mouseDown: boolean;
}