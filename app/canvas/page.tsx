"use client";
import { useEffect, useRef } from "react";

export default function CanvasPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🧩 Canvas setup
    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // 🌈 Environment
    const groundHeight = 100;
    const groundColor = "#5c4033";
    const skyColor = "#87CEEB";

    // 🧍 Player setup
    const player = {
      x: 100,
      y: height - groundHeight - 100,
      width: 64,
      height: 64,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpForce: 12,
      onGround: false,
      direction: "right" as "left" | "right",
      state: "idle" as "idle" | "walk" | "jump" | "fall",
    };

    // 🕐 Global animation speed (ms per frame)
    const ANIMATION_SPEED = 80;

    // 🖼️ Sprites
    const sprites = {
      idle: new Image(),
      fall: new Image(),
      runFrames: [] as HTMLImageElement[],
      jumpFrames: [] as HTMLImageElement[],
    };

    sprites.idle.src = "/player/Idle (1).png";
    sprites.fall.src = "/player/Hurt (1).png";

    // Load Run(1–8)
    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.src = `/player/Run (${i}).png`;
      sprites.runFrames.push(img);
    }

    // Load Jump(1–12)
    for (let i = 1; i <= 12; i++) {
      const img = new Image();
      img.src = `/player/Jump (${i}).png`;
      sprites.jumpFrames.push(img);
    }

    // 🎮 Controls
    const keys = { left: false, right: false, up: false };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w") keys.up = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w") keys.up = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // ⚙️ Physics
    const gravity = 0.6;
    const groundY = height - groundHeight - player.height;

    // 🎞️ Animation states
    let runFrame = 0;
    let jumpFrame = 0;
    const runFrameCount = 8;
    const jumpFrameCount = 12;
    let lastRunFrameTime = 0;
    let lastJumpFrameTime = 0;

    function update() {
      // Horizontal movement
      player.vx = 0;
      if (keys.left) {
        player.vx = -player.speed;
        player.direction = "left";
      }
      if (keys.right) {
        player.vx = player.speed;
        player.direction = "right";
      }
      player.x += player.vx;

      // Jump
      if (keys.up && player.onGround) {
        player.vy = -player.jumpForce;
        player.onGround = false;
        jumpFrame = 0; // reset jump animation
      }

      // Gravity
      player.vy += gravity;
      player.y += player.vy;

      // Ground collision
      if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        player.onGround = true;
      } else {
        player.onGround = false;
      }

      // Determine state
      if (!player.onGround) {
        player.state = player.vy < 0 ? "jump" : "fall";
      } else if (player.vx !== 0) {
        player.state = "walk";
      } else {
        player.state = "idle";
      }

      // Animation frame control
      const now = performance.now();
      if (player.state === "walk") {
        if (now - lastRunFrameTime > ANIMATION_SPEED) {
          runFrame = (runFrame + 1) % runFrameCount;
          lastRunFrameTime = now;
        }
      } else {
        runFrame = 0;
      }

      if (player.state === "jump") {
        if (now - lastJumpFrameTime > ANIMATION_SPEED) {
          if (jumpFrame < jumpFrameCount - 1) jumpFrame++;
          lastJumpFrameTime = now;
        }
      } else {
        jumpFrame = 0;
      }
    }

    function draw() {
      ctx.fillStyle = skyColor;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = groundColor;
      ctx.fillRect(0, height - groundHeight, width, groundHeight);

      ctx.save();
      if (player.direction === "left") {
        ctx.scale(-1, 1);
        drawPlayer(-player.x - player.width, player.y);
      } else {
        drawPlayer(player.x, player.y);
      }
      ctx.restore();
    }

    function drawPlayer(x: number, y: number) {
      let img: HTMLImageElement;
      if (player.state === "walk") {
        img = sprites.runFrames[runFrame];
      } else if (player.state === "jump") {
        img = sprites.jumpFrames[jumpFrame];
      } else if (player.state === "fall") {
        img = sprites.fall;
      } else {
        img = sprites.idle;
      }
      ctx.drawImage(img, x, y, player.width, player.height);
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // 🧹 Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">🏃 Player Run + Jump Animation</h1>
      <canvas ref={canvasRef} className="border border-gray-700 rounded" />
      <p className="text-gray-400 mt-2">← → move | ↑ jump</p>
    </main>
  );
}
