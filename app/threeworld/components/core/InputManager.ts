// Singleton for keyboard state

type Keys = Record<string, boolean>;

class InputManager {
  keys: Keys = {};
  constructor() {
    if (typeof window !== "undefined") this._bind();
  }

  _bind() {
    window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.code] = false));
  }

  is(code: string) {
    return !!this.keys[code];
  }
}

export default new InputManager();
