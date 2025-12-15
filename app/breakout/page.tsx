"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const GAME_WIDTH = 500;
const GAME_HEIGHT = 640;
const PADDLE_WIDTH = 90;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 30;
const BALL_SPEED = 2.5;

interface Brick {
  x: number;
  y: number;
  broken: boolean;
}

export default function BreakoutCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [youWon, setYouWon] = useState(false);

  // Game state refs
  const paddleX = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const ballX = useRef(GAME_WIDTH / 2);
  const ballY = useRef(GAME_HEIGHT - 100);
  const ballDX = useRef(4);
  const ballDY = useRef(-4);
  const bricks = useRef<Brick[]>([]);
  const rafRef = useRef<number | null>(null);

  // Keyboard state refs
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  // Build bricks grid
  const initBricks = () => {
    const arr: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const x = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
        const y = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
        arr.push({ x, y, broken: false });
      }
    }
    bricks.current = arr;
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setYouWon(false);
    paddleX.current = GAME_WIDTH / 2 - PADDLE_WIDTH / 2;
    ballX.current = GAME_WIDTH / 2;
    ballY.current = GAME_HEIGHT - 100;
    ballDX.current = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballDY.current = -BALL_SPEED;
    initBricks();
  };

  const startGame = () => {
    resetGame();
    setStarted(true);
  };



  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft.current = true;
      if (e.key === "ArrowRight") moveRight.current = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft.current = false;
      if (e.key === "ArrowRight") moveRight.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Draw objects
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // bricks
    bricks.current.forEach((b) => {
      if (!b.broken) {
        const brickGrad = ctx.createLinearGradient(
          b.x,
          b.y,
          b.x + BRICK_WIDTH,
          b.y + BRICK_HEIGHT
        );
        brickGrad.addColorStop(0, "#facc15");
        brickGrad.addColorStop(1, "#f97316");
        ctx.fillStyle = brickGrad;
        ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });

    // paddle
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(
      paddleX.current,
      GAME_HEIGHT - 40,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    // ball
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.closePath();

    // HUD
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px monospace";
    ctx.fillText(`Score: ${score}`, 16, 24);
    ctx.fillText(`Lives: ${lives}`, GAME_WIDTH - 90, 24);
  };

  // Game loop
  const update = (ctx: CanvasRenderingContext2D) => {
    if (!started || gameOver || youWon) {
      draw(ctx);
      return;
    }

    // Paddle movement (smooth hold)
    const paddleSpeed = 5;
    if (moveLeft.current)
      paddleX.current = Math.max(paddleX.current - paddleSpeed, 0);
    if (moveRight.current)
      paddleX.current = Math.min(
        paddleX.current + paddleSpeed,
        GAME_WIDTH - PADDLE_WIDTH
      );

    // Ball movement
    ballX.current += ballDX.current;
    ballY.current += ballDY.current;

    // bounce walls
    if (ballX.current + BALL_RADIUS > GAME_WIDTH || ballX.current - BALL_RADIUS < 0)
      ballDX.current = -ballDX.current;
    if (ballY.current - BALL_RADIUS < 0) ballDY.current = -ballDY.current;

    // Paddle collision
    const paddleTop = GAME_HEIGHT - 40;
    const paddleBottom = paddleTop + PADDLE_HEIGHT;
    if (
      ballY.current + BALL_RADIUS > paddleTop &&
      ballY.current - BALL_RADIUS < paddleBottom &&
      ballX.current > paddleX.current &&
      ballX.current < paddleX.current + PADDLE_WIDTH
    ) {
      ballDY.current = -Math.abs(ballDY.current);
      const hit = (ballX.current - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      ballDX.current = hit * 5;
    }

    // Life lost
    if (ballY.current + BALL_RADIUS > GAME_HEIGHT) {
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) setGameOver(true);
        else {
          setStarted(false);
          setTimeout(() => {
            ballX.current = GAME_WIDTH / 2;
            ballY.current = GAME_HEIGHT - 100;
            ballDX.current = 2 * (Math.random() > 0.5 ? 1 : -1);
            ballDY.current = -2;
            setStarted(true);
          }, 800);
        }
        return next;
      });
    }

    // Bricks
    bricks.current.forEach((b) => {
      if (b.broken) return;
      if (
        ballX.current > b.x &&
        ballX.current < b.x + BRICK_WIDTH &&
        ballY.current > b.y &&
        ballY.current < b.y + BRICK_HEIGHT
      ) {
        b.broken = true;
        ballDY.current = -ballDY.current;
        setScore((s) => s + 10);
      }
    });

    // Win
    if (bricks.current.every((b) => b.broken)) setYouWon(true);

    draw(ctx);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    initBricks();

    const loop = () => {
      update(ctx);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, gameOver, youWon]);

  return (
<main className="min-h-screen flex items-center justify-center bg-black text-white px-8">
  <div className="flex w-full max-w-[1100px] gap-10 items-center">

    {/* LEFT — CANVAS */}
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="border border-gray-700 rounded-lg bg-linear-to-b from-gray-900 to-black shadow-lg cursor-pointer"
    />

    {/* RIGHT — GAME UI */}
    <div className="flex flex-col gap-6">

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
      >
        Breakout
      </motion.h1>

      <div className="text-gray-400 text-xl">
        {gameOver
          ? "❌ Game Over!"
          : youWon
          ? "🏆 You Win!"
          : started
          ? "Break all the bricks!"
          : "Click to Start"}
      </div>

      {/* STATS PANEL */}
      <div className="border border-gray-800 bg-linear-to-b from-gray-900 to-black rounded-xl p-5 w-[260px] flex flex-col gap-4 shadow-lg text-sm">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="text-amber-300 font-semibold">
            {gameOver ? "Game Over" : youWon ? "Won" : started ? "Running" : "Idle"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Bricks Left:</span>
          <span className="text-orange-400 font-bold">11</span>
        </div>

        <div className="flex justify-between">
          <span>Lives:</span>
          <span className="text-red-400 font-bold">{lives}</span>
        </div>

        <div className="flex justify-between">
          <span>Score:</span>
          <span className="text-green-400 font-bold">{score}</span>
        </div>
      </div>

      {/* START / QUIT BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (started) {
            setStarted(false);
            setGameOver(false);
            setYouWon(false);
            resetGame();
          } else startGame();
        }}
        className={`px-8 py-3 font-semibold rounded-lg shadow text-lg ${
          started ? "bg-red-500" : "bg-amber-500 text-black"
        }`}
      >
        {started ? "Quit" : "Start Game"}
      </motion.button>
    </div>
  </div>
</main>

  );
}
