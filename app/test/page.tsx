"use client";
import { useEffect, useRef } from "react";

export default function CanvasPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // 🌍 Environment
    const groundHeight = 100;
    const groundColor = "#5c4033";
    const skyColor = "#87CEEB";

    // ⚙️ Global animation speed (ms per frame)
    const ANIM_SPEED = 10;

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

    // 🎥 Camera setup
    let cameraX = 0;

    // 🧩 Tiles (platforms)
    const tiles = [
      { x: 300, y: height - groundHeight - 50, width: 100, height: 50 },
      { x: 600, y: height - groundHeight - 120, width: 120, height: 20 },
      { x: 900, y: height - groundHeight - 180, width: 150, height: 20 },
      { x: 1250, y: height - groundHeight - 220, width: 100, height: 20 },
      { x: 1600, y: height - groundHeight - 150, width: 200, height: 30 },
    ];

    // 🖼️ Sprite images
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
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w")
        keys.up = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // ⚙️ Physics
    const gravity = 0.6;
    const groundY = height - groundHeight - player.height;

    // 🧮 Helper collision function
    function checkCollision(a: any, b: any) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // 🎞️ Animation control
    let runFrame = 0;
    let jumpFrame = 0;
    let jumping = false;
    let lastFrameTime = 0;

    function update(delta: number) {
      // Movement
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

      // Jump trigger
      if (keys.up && player.onGround) {
        player.vy = -player.jumpForce;
        player.onGround = false;
        jumping = true;
        jumpFrame = 0;
      }

      // Gravity
      player.vy += gravity;
      player.y += player.vy;

      // Ground collision
      player.onGround = false;
      if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        player.onGround = true;
        jumping = false;
      }

      // Tile collision
      for (const tile of tiles) {
        if (checkCollision(player, tile)) {
          const prevBottom = player.y - player.vy + player.height;
          const prevTop = player.y - player.vy;
          const prevRight = player.x - player.vx + player.width;
          const prevLeft = player.x - player.vx;

          // Landing on top
          if (prevBottom <= tile.y && player.vy > 0) {
            player.y = tile.y - player.height;
            player.vy = 0;
            player.onGround = true;
            jumping = false;
          }
          // Hitting head below
          else if (prevTop >= tile.y + tile.height && player.vy < 0) {
            player.y = tile.y + tile.height;
            player.vy = 0;
          }
          // From left or right
          else if (prevRight <= tile.x && player.vx > 0) {
            player.x = tile.x - player.width;
          } else if (prevLeft >= tile.x + tile.width && player.vx < 0) {
            player.x = tile.x + tile.width;
          }
        }
      }

      // State update
      if (!player.onGround) {
        player.state = player.vy < 0 ? "jump" : "fall";
      } else if (player.vx !== 0) {
        player.state = "walk";
      } else {
        player.state = "idle";
      }

      // Animation frames
      if (performance.now() - lastFrameTime > ANIM_SPEED) {
        lastFrameTime = performance.now();

        if (player.state === "walk") {
          runFrame = (runFrame + 1) % sprites.runFrames.length;
        } else if (player.state === "jump" && jumping) {
          if (jumpFrame < sprites.jumpFrames.length - 1) {
            jumpFrame++;
          }
        } else {
          runFrame = 0;
        }
      }

      // 🎥 Camera follow (AFTER collision resolution)
      const centerX = width / 2 - player.width / 2;
      const targetCamera = player.x - centerX;
      // Smooth follow and prevent overshoot
      cameraX += (targetCamera - cameraX) * 0.2;
      if (cameraX < 0) cameraX = 0;
    }

    function draw() {
      // Background
      ctx.fillStyle = skyColor;
      ctx.fillRect(0, 0, width, height);

      // Ground
      ctx.fillStyle = groundColor;
      ctx.fillRect(-cameraX, height - groundHeight, 5000, groundHeight);

      // Tiles
      ctx.fillStyle = "#8B4513";
      for (const tile of tiles) {
        ctx.fillRect(tile.x - cameraX, tile.y, tile.width, tile.height);
      }

      // Player sprite
      ctx.save();
      if (player.direction === "left") {
        ctx.scale(-1, 1);
        drawPlayer(-player.x - player.width + cameraX * 2, player.y);
      } else {
        drawPlayer(player.x - cameraX, player.y);
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

    let lastTime = 0;
    function loop(timestamp: number) {
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      update(delta);
      draw();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">
        🏃 Platformer — Run, Jump, Collide & Scroll
      </h1>
      <canvas ref={canvasRef} className="border border-gray-700 rounded" />
      <p className="text-gray-400 mt-2">← → move | ↑ jump</p>
    </main>
  );
}
