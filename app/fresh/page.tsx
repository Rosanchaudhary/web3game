"use client";

import { useEffect, useRef } from "react";

interface Tile {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: "normal" | "hazard" | "coin" | "goal" | "decoration" | "movingHazard";
  // movement properties for moving hazards
  startY?: number;
  endY?: number;
  speedY?: number;
  direction?: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
  lives: number;
  coins: number;
  invincible: boolean;
  invincibleTimer: number;
}

type GameState = "start" | "playing" | "paused" | "won" | "gameover";

export default function Platformer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const width = (canvas.width = 800);
    const height = (canvas.height = 500);

    // 🎮 Player setup
    const player: Player = {
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      onGround: false,
      lives: 3,
      coins: 0,
      invincible: false,
      invincibleTimer: 0,
    };

    // ⚙️ Physics
    const gravity = 0.25;
    const jumpForce = 6;
    const moveSpeed = 3;

    // 🎯 Camera + game state
    let cameraX = 0;
    let gameState: GameState = "start";

    // 🧱 Level layout (reuse your older tiles + add new types)
    const tiles: Tile[] = [

      { x: 0, y: 460, width: 400, height: 40, color: "green", type: "normal" },
      {
        x: 500,
        y: 460,
        width: 300,
        height: 40,
        color: "green",
        type: "normal",
      },
      {
        x: 900,
        y: 460,
        width: 300,
        height: 40,
        color: "green",
        type: "normal",
      },
      {
        x: 1300,
        y: 460,
        width: 400,
        height: 40,
        color: "green",
        type: "normal",
      },
      {
        x: 1800,
        y: 460,
        width: 400,
        height: 40,
        color: "green",
        type: "normal",
      },
      {
        x: 2300,
        y: 460,
        width: 400,
        height: 40,
        color: "green",
        type: "normal",
      },

      // 🔥 Hazards (lava pits between gaps)
      { x: 400, y: 460, width: 100, height: 40, color: "red", type: "hazard" },
      { x: 800, y: 460, width: 100, height: 40, color: "red", type: "hazard" },
      { x: 1200, y: 460, width: 100, height: 40, color: "red", type: "hazard" },
      { x: 2200, y: 460, width: 100, height: 40, color: "red", type: "hazard" },

      // 🪜 Platforms (ascending path)
      {
        x: 300,
        y: 400,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 500,
        y: 350,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 700,
        y: 300,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 950,
        y: 250,
        width: 120,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 1150,
        y: 200,
        width: 120,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 1350,
        y: 250,
        width: 120,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 1550,
        y: 300,
        width: 120,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 1750,
        y: 350,
        width: 120,
        height: 20,
        color: "green",
        type: "normal",
      },

      // ⚠️ Upper hazards (danger platforms)
      { x: 1050, y: 230, width: 60, height: 20, color: "red", type: "hazard" },
      { x: 1500, y: 320, width: 60, height: 20, color: "red", type: "hazard" },

      // 💰 Coin trails on platforms
      { x: 320, y: 360, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 520, y: 310, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 720, y: 260, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 970, y: 210, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1170, y: 160, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1370, y: 210, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1570, y: 260, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1770, y: 310, width: 20, height: 20, color: "yellow", type: "coin" },

      // 💰 Ground coins for exploration
      { x: 200, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 600, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1000, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1400, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 1900, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 2400, y: 420, width: 20, height: 20, color: "yellow", type: "coin" },

      // 🧗 Secret high path (reward area)
      {
        x: 1850,
        y: 200,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 2050,
        y: 150,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      {
        x: 2250,
        y: 100,
        width: 100,
        height: 20,
        color: "green",
        type: "normal",
      },
      { x: 2270, y: 60, width: 20, height: 20, color: "yellow", type: "coin" },
      { x: 2290, y: 60, width: 20, height: 20, color: "yellow", type: "coin" },

      // 🏁 Goal tile (reachable end)
      { x: 2600, y: 420, width: 60, height: 40, color: "purple", type: "goal" },

      // ☁️ Decorative tiles (no collision)
      {
        x: 200,
        y: 150,
        width: 100,
        height: 40,
        color: "white",
        type: "decoration",
      },
      {
        x: 600,
        y: 120,
        width: 150,
        height: 50,
        color: "white",
        type: "decoration",
      },
      {
        x: 1000,
        y: 180,
        width: 120,
        height: 40,
        color: "white",
        type: "decoration",
      },
      {
        x: 1600,
        y: 130,
        width: 180,
        height: 60,
        color: "white",
        type: "decoration",
      },

      // 🌳 Tree decorations
      {
        x: 400,
        y: 360,
        width: 30,
        height: 100,
        color: "#8B5A2B",
        type: "decoration",
      },
      {
        x: 385,
        y: 310,
        width: 60,
        height: 60,
        color: "green",
        type: "decoration",
      },

      // ⚙️ Moving hazard tiles
      {
        x: 900,
        y: 420,
        width: 30,
        height: 30,
        color: "red",
        type: "movingHazard",
        startY: 420,
        endY: 300,
        speedY: 1.5,
        direction: -1,
      },
      {
        x: 1300,
        y: 440,
        width: 30,
        height: 30,
        color: "red",
        type: "movingHazard",
        startY: 440,
        endY: 280,
        speedY: 2,
        direction: -1,
      },
    ];

    // 🎮 Input
    const keys: Record<string, boolean> = {};
    window.addEventListener("keydown", (e) => {
      keys[e.key] = true;

      if (gameState === "start") gameState = "playing";
      if (
        (gameState === "won" || gameState === "gameover") &&
        e.key.toLowerCase() === "r"
      )
        resetGame();

      // Pause toggle
      if (e.key.toLowerCase() === "p" && gameState === "playing")
        gameState = "paused";
      else if (e.key.toLowerCase() === "p" && gameState === "paused")
        gameState = "playing";
    });
    window.addEventListener("keyup", (e) => (keys[e.key] = false));

    // 🔍 Collision
    function checkCollision(a: Player | Tile, b: Tile) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // 💀 Respawn
    function respawnNear(x: number) {
      if (player.invincible) return;
      player.lives -= 1;

      if (player.lives <= 0) {
        gameState = "gameover";
        return;
      }

      player.x = Math.max(50, x - 100);
      player.y = 150;
      player.vy = 0;

      player.invincible = true;
      player.invincibleTimer = 60; // ~1s
    }

    // 🔁 Reset
    function resetGame() {
      player.x = 100;
      player.y = 100;
      player.vx = 0;
      player.vy = 0;
      player.coins = 0;
      player.lives = 3;
      player.invincible = false;
      player.invincibleTimer = 0;
      cameraX = 0;
      gameState = "playing";
    }

    let jumpBuffer = 0;
    let lastTime = performance.now();

    function loop() {
      const now = performance.now();
      const delta = (now - lastTime) / 16.67;
      lastTime = now;

      if (gameState === "playing") update(delta);
      draw();
      requestAnimationFrame(loop);
    }

    function update(delta: number) {
      // Movement
      player.vx = 0;
      if (keys["ArrowLeft"] || keys["a"]) player.vx = -moveSpeed;
      if (keys["ArrowRight"] || keys["d"]) player.vx = moveSpeed;

      // Jump buffer
      if (keys[" "] || keys["ArrowUp"] || keys["w"]) jumpBuffer = 10;
      if (jumpBuffer > 0) jumpBuffer -= 1;

      // Horizontal move
      player.x += player.vx * delta;
      for (const t of tiles) {
        if (t.type !== "normal") continue;
        if (checkCollision(player, t)) {
          if (player.vx > 0) player.x = t.x - player.width;
          else if (player.vx < 0) player.x = t.x + t.width;
          player.vx = 0;
        }
      }

      // Gravity + vertical move
      player.vy += gravity * delta;
      player.y += player.vy * delta;
      player.onGround = false;

      for (const t of tiles) {
        if (t.type !== "normal") continue;
        if (checkCollision(player, t)) {
          if (player.vy > 0) {
            player.y = t.y - player.height;
            player.onGround = true;
          } else if (player.vy < 0) {
            player.y = t.y + t.height;
          }
          player.vy = 0;
        }
      }

      // Jump execution
      if (player.onGround && jumpBuffer > 0) {
        player.vy = -jumpForce;
        player.onGround = false;
        jumpBuffer = 0;
      }

      // Invincibility
      if (player.invincible) {
        player.invincibleTimer -= delta;
        if (player.invincibleTimer <= 0) player.invincible = false;
      }

      // Update moving hazards
      for (const t of tiles) {
        if (t.type === "movingHazard") {
          if (t.direction === undefined) t.direction = -1;
          if (t.startY === undefined || t.endY === undefined) continue;

          t.y += (t.speedY ?? 1) * t.direction * delta;
          if (t.y < t.endY) {
            t.y = t.endY;
            t.direction = 1;
          } else if (t.y > t.startY) {
            t.y = t.startY;
            t.direction = -1;
          }
        }
      }

      // Collisions with hazards, coins, goal
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        if (!checkCollision(player, t)) continue;

        if (t.type === "hazard" || t.type === "movingHazard") {
          if (!player.invincible) respawnNear(t.x);
        } else if (t.type === "coin") {
          player.coins += 1;
          tiles.splice(i, 1);
          i--;
        } else if (t.type === "goal") {
          gameState = "won";
        }
      }

      // Fall off
      if (player.y > height + 200 && !player.invincible) respawnNear(player.x);

      // Camera follow
      const centerX = width / 2 - player.width / 2;
      cameraX += (player.x - centerX - cameraX) * 0.1;
      if (cameraX < 0) cameraX = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#b3e5fc";
      ctx.fillRect(0, 0, width, height);

      // Draw tiles (decorations first, then others)
      for (const t of tiles) {
        if (t.type === "decoration") {
          ctx.fillStyle = t.color;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(t.x - cameraX, t.y, t.width, t.height);
          ctx.globalAlpha = 1;
          continue;
        }

        ctx.fillStyle = t.color;
        ctx.fillRect(t.x - cameraX, t.y, t.width, t.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(t.x - cameraX, t.y, t.width, t.height);
      }

      // Player
      if (gameState !== "start" && gameState !== "gameover") {
        if (
          !player.invincible ||
          Math.floor(performance.now() / 100) % 2 === 0
        ) {
          ctx.fillStyle = "blue";
          ctx.fillRect(
            player.x - cameraX,
            player.y,
            player.width,
            player.height
          );
          ctx.strokeStyle = "black";
          ctx.strokeRect(
            player.x - cameraX,
            player.y,
            player.width,
            player.height
          );
        }
      }

      // HUD
      if (gameState === "playing" || gameState === "paused") {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(`❤️ Lives: ${player.lives}`, 20, 30);
        ctx.fillText(`💰 Coins: ${player.coins}`, 20, 60);
      }

      // UI overlays
      ctx.textAlign = "center";
      ctx.fillStyle = "black";

      if (gameState === "start") {
        ctx.font = "48px Arial";
        ctx.fillText("🌟 Platformer Game", width / 2, height / 2 - 50);
        ctx.font = "24px Arial";
        ctx.fillText("Press any key to start", width / 2, height / 2 + 10);
        ctx.fillText(
          "Use ← → / A D to move, Space to jump",
          width / 2,
          height / 2 + 50
        );
        ctx.fillText("Press P to pause", width / 2, height / 2 + 90);
      }

      if (gameState === "paused") {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("⏸️ Paused", width / 2, height / 2 - 20);
        ctx.font = "24px Arial";
        ctx.fillText("Press P to resume", width / 2, height / 2 + 30);
      }

      if (gameState === "won") {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("🏁 You Won! 🎉", width / 2, height / 2 - 20);
        ctx.font = "24px Arial";
        ctx.fillText(
          `💰 Coins Collected: ${player.coins}`,
          width / 2,
          height / 2 + 30
        );
        ctx.fillText("Press R to restart", width / 2, height / 2 + 70);
      }

      if (gameState === "gameover") {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("💀 Game Over", width / 2, height / 2 - 20);
        ctx.font = "24px Arial";
        ctx.fillText("Press R to restart", width / 2, height / 2 + 30);
      }

      ctx.textAlign = "left";
    }

    loop();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="border w-full h-full bg-sky-200"
      style={{ maxWidth: "800px", maxHeight: "500px" }}
    />
  );
}
