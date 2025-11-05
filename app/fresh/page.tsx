"use client";

import { Player, Tile } from "@/types/mario";
import { tiles } from "@/utils/mario";
import { useEffect, useRef } from "react";

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
      imageSrc: "/player/Idle (1).png",
      onGround: false,
      lives: 3,
      coins: 0,
      invincible: false,
      invincibleTimer: 0,
      direction: "right" as "left" | "right",
      state: "idle" as "idle" | "walk" | "jump" | "fall",

      frameIndex: 0,
      frameTimer: 0,
      frameSpeed: 6, // lower = faster animation
      runFrames: [],
      jumpFrames: [],
      idleFrames: [],
    };

    if (player.imageSrc) {
      const playerImage = new Image();
      playerImage.src = player.imageSrc;
      player.image = playerImage;
    }

    // Load run frames
    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.src = `/player/Run (${i}).png`;
      player.runFrames.push(img);
    }
    // Load jump frames
    for (let i = 1; i <= 12; i++) {
      const img = new Image();
      img.src = `/player/Jump (${i}).png`;
      player.jumpFrames.push(img);
    }

    // Load idle frames
    for (let i = 1; i <= 10; i++) {
      const img = new Image();
      img.src = `/player/Idle (${i}).png`;
      player.idleFrames.push(img);
    }

    // ⚙️ Physics
    const gravity = 0.25;
    const jumpForce = 6;
    const moveSpeed = 3;

    // 🎯 Camera + game state
    let cameraX = 0;
    let gameState: GameState = "start";

    for (const t of tiles) {
      if (t.imageSrc) {
        const img = new Image();
        img.src = t.imageSrc;
        t.image = img;
      }
    }

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
      if (keys["ArrowLeft"] || keys["a"]) {
        player.vx = -moveSpeed;
        player.direction = "left";
      }
      if (keys["ArrowRight"] || keys["d"]) {
        player.vx = moveSpeed;
        player.direction = "right";
      }

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

      // State update
      if (!player.onGround) {
        player.state = player.vy < 0 ? "jump" : "fall";
      } else if (player.vx !== 0) {
        player.state = "walk";
      } else {
        player.state = "idle";
      }

      // Animation update
      player.frameTimer += delta;
      if (player.frameTimer >= player.frameSpeed) {
        player.frameTimer = 0;

        // Walking / running animation
        if (player.state === "walk") {
          player.frameIndex++;
          if (player.frameIndex >= player.runFrames.length)
            player.frameIndex = 0;
        }

        // Jump animation
        else if (player.state === "jump") {
          player.frameIndex++;
          if (player.frameIndex >= player.jumpFrames.length) {
            player.frameIndex = player.jumpFrames.length - 1; // hold last jump frame
          }
        }
        // Idle animation — loop forever
        else if (player.state === "idle") {
          player.frameIndex++;
          if (player.frameIndex >= player.idleFrames.length)
            player.frameIndex = 0;
        }

        // Reset frame when idle or falling
        else {
          player.frameIndex = 0;
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
      // console.log(player.state)
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#b3e5fc";
      ctx.fillRect(0, 0, width, height);

      // Draw tiles (decorations first, then others)
      for (const t of tiles) {
        if (t.type === "decoration") {
          // 🖼️ If this decoration has a loaded image, draw it
          if (t.image && t.image.complete) {
            ctx.drawImage(t.image, t.x - cameraX, t.y, t.width, t.height);
          }
          continue;
        }

        // ✳️ Normal tiles
        if (t.image && t.image.complete) {
          ctx.drawImage(t.image, t.x - cameraX, t.y, t.width, t.height);
        }
      }

      // 🧍 Player render
      if (gameState !== "start" && gameState !== "gameover") {
        if (
          !player.invincible ||
          Math.floor(performance.now() / 100) % 2 === 0
        ) {
          // ✅ Choose correct sprite
          let sprite = player.image; // default idle frame

          // ✅ If walking, use run animation
          if (player.state === "walk" && player.runFrames[player.frameIndex]) {
            sprite = player.runFrames[player.frameIndex];
          } else if (
            player.state === "jump" &&
            player.jumpFrames[player.frameIndex]
          ) {
            sprite = player.jumpFrames[player.frameIndex];
          } else if (
            player.state === "idle" &&
            player.idleFrames[player.frameIndex]
          ) {
            sprite = player.idleFrames[player.frameIndex];
          }

          if (sprite && sprite.complete) {
            ctx.save();

            if (player.direction === "left") {
              ctx.scale(-1, 1);
              ctx.drawImage(
                sprite,
                -(player.x + player.width - cameraX),
                player.y,
                player.width,
                player.height
              );
            } else {
              ctx.drawImage(
                sprite,
                player.x - cameraX,
                player.y,
                player.width,
                player.height
              );
            }

            ctx.restore();
          }
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
