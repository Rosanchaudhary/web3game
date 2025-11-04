"use client";
import { useEffect, useRef, useState } from "react";

const GAME_WIDTH = 500;
const GAME_HEIGHT = 650;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 50;
const PLAYER_SPEED = 5;

const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 8;

const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 40;
const ENEMY_SPEED = 2;

export default function SpaceShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Player and movement
  const playerX = useRef(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  // Bullets, Enemies
  const bullets = useRef<{ x: number; y: number }[]>([]);
  const enemies = useRef<{ x: number; y: number }[]>([]);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Handle key input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft.current = true;
      if (e.key === "ArrowRight") moveRight.current = true;
      // eslint-disable-next-line react-hooks/immutability
      if (e.key === " " && !gameOver) shootBullet();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft.current = false;
      if (e.key === "ArrowRight") moveRight.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  // Shoot bullet
  const shootBullet = () => {
    bullets.current.push({
      x: playerX.current + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
      y: GAME_HEIGHT - PLAYER_HEIGHT - 10,
    });
  };

  // Spawn enemies every 1.5s
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      enemies.current.push({
        x: Math.random() * (GAME_WIDTH - ENEMY_WIDTH),
        y: -ENEMY_HEIGHT,
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate starfield
    const stars = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      speed: Math.random() * 2 + 1,
    }));

    const loop = () => {
      if (gameOver) return;

      // Move player
      if (moveLeft.current) playerX.current = Math.max(0, playerX.current - PLAYER_SPEED);
      if (moveRight.current) playerX.current = Math.min(GAME_WIDTH - PLAYER_WIDTH, playerX.current + PLAYER_SPEED);

      // Move bullets
      bullets.current = bullets.current
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y > -10);

      // Move enemies
      enemies.current = enemies.current
        .map((e) => ({ ...e, y: e.y + ENEMY_SPEED }))
        .filter((e) => e.y < GAME_HEIGHT + ENEMY_HEIGHT);

      // Collision: bullet hits enemy
      bullets.current.forEach((b) => {
        enemies.current = enemies.current.filter((e) => {
          const hit =
            b.x < e.x + ENEMY_WIDTH &&
            b.x + BULLET_WIDTH > e.x &&
            b.y < e.y + ENEMY_HEIGHT &&
            b.y + BULLET_HEIGHT > e.y;

          if (hit) {
            setScore((s) => s + 10);
            return false;
          }
          return true;
        });
      });

      // Check for game over (enemy reaches player)
      const hitPlayer = enemies.current.some(
        (e) =>
          e.y + ENEMY_HEIGHT >= GAME_HEIGHT - PLAYER_HEIGHT - 10 &&
          e.x < playerX.current + PLAYER_WIDTH &&
          e.x + ENEMY_WIDTH > playerX.current
      );

      if (hitPlayer) {
        setGameOver(true);
        return;
      }

      // Draw background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw stars
      ctx.fillStyle = "white";
      stars.forEach((s) => {
        ctx.fillRect(s.x, s.y, 2, 2);
        s.y += s.speed;
        if (s.y > GAME_HEIGHT) s.y = 0;
      });

      // Draw player
      ctx.fillStyle = "#00d9ff";
      ctx.fillRect(playerX.current, GAME_HEIGHT - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT);

      // Draw bullets
      ctx.fillStyle = "yellow";
      bullets.current.forEach((b) => ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT));

      // Draw enemies
      ctx.fillStyle = "red";
      enemies.current.forEach((e) => ctx.fillRect(e.x, e.y, ENEMY_WIDTH, ENEMY_HEIGHT));

      requestAnimationFrame(loop);
    };

    loop();
  }, [gameOver]);

  const resetGame = () => {
    playerX.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    bullets.current = [];
    enemies.current = [];
    setScore(0);
    setGameOver(false);
  };

return (
  <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-gray-900 to-black text-white p-6">
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-6xl w-full">
      
      {/* 🎮 Game Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-2 border-gray-700 rounded-2xl shadow-2xl bg-black"
        />
      </div>

      {/* Game Info Panel */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5">
        <h1 className="text-4xl font-extrabold text-cyan-400 tracking-wide">
          🚀 Space Shooter
        </h1>

        <p className="text-gray-400 text-sm">
          Move: ⬅️➡️ &nbsp; | &nbsp; Shoot: SPACE
        </p>

        <div className="bg-gray-800 px-6 py-3 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-semibold">
            Score: <span className="text-yellow-400">{score}</span>
          </h2>
        </div>

        {!gameOver ? (
          <p className="text-green-400 text-sm font-semibold animate-pulse">
            Enemies Incoming... Stay Sharp!
          </p>
        ) : (
          <div className="flex flex-col space-y-3">
            <h2 className="text-2xl font-bold text-red-400">Game Over!</h2>
            <button
              onClick={resetGame}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold shadow-md transition-all"
            >
              Restart
            </button>
          </div>
        )}


      </div>
    </div>
  </main>
);

}
