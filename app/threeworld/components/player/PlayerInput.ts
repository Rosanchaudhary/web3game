import InputManager from "../core/InputManager";

export function readMovement() {
  return {
    forward: InputManager.is("KeyW") || InputManager.is("ArrowUp"),
    back: InputManager.is("KeyS") || InputManager.is("ArrowDown"),
    left: InputManager.is("KeyA") || InputManager.is("ArrowLeft"),
    right: InputManager.is("KeyD") || InputManager.is("ArrowRight"),
    sprint: InputManager.is("ShiftLeft") || InputManager.is("ShiftRight"),
    jump: InputManager.is("Space"),
  };
}
