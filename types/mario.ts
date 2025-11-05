export interface Tile {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: "normal" | "hazard" | "coin" | "goal" | "decoration" | "movingHazard";
  image?: HTMLImageElement; // new property for decoration images
  imageSrc?: string;
  // movement properties for moving hazards
  startY?: number;
  endY?: number;
  speedY?: number;
  direction?: number;
}



export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  image?: HTMLImageElement; // new property for decoration images
  imageSrc?: string;
  onGround: boolean;
  lives: number;
  coins: number;
  invincible: boolean;
  invincibleTimer: number;
  direction: string;
  state: string;
  frameIndex: number,
  frameTimer: number,
  frameSpeed: number, // lower = faster animation
  runFrames: HTMLImageElement[],
  jumpFrames: HTMLImageElement[],
  idleFrames: HTMLImageElement[],


}
