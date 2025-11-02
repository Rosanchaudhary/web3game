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

  // Move paddle with mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    paddleX.current = Math.min(
      Math.max(x - PADDLE_WIDTH / 2, 0),
      GAME_WIDTH - PADDLE_WIDTH
    );
  };

  // Core draw function
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // draw bricks
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

    // draw paddle
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(
      paddleX.current,
      GAME_HEIGHT - 40,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    // draw ball
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

  // Game update logic
  const update = (ctx: CanvasRenderingContext2D) => {
    if (!started || gameOver || youWon) {
      draw(ctx);
      return;
    }

    // move ball
    ballX.current += ballDX.current;
    ballY.current += ballDY.current;

    // wall bounce
    if (
      ballX.current + BALL_RADIUS > GAME_WIDTH ||
      ballX.current - BALL_RADIUS < 0
    ) {
      ballDX.current = -ballDX.current;
    }
    if (ballY.current - BALL_RADIUS < 0) {
      ballDY.current = -ballDY.current;
    }

    // paddle collision
    const paddleTop = GAME_HEIGHT - 40;
    const paddleBottom = paddleTop + PADDLE_HEIGHT;
    if (
      ballY.current + BALL_RADIUS > paddleTop &&
      ballY.current - BALL_RADIUS < paddleBottom &&
      ballX.current > paddleX.current &&
      ballX.current < paddleX.current + PADDLE_WIDTH
    ) {
      ballDY.current = -Math.abs(ballDY.current);
      const hitPoint =
        (ballX.current - (paddleX.current + PADDLE_WIDTH / 2)) /
        (PADDLE_WIDTH / 2);
      ballDX.current = hitPoint * 5; // add angle based on hit
    }

    // bottom (lose life)
    if (ballY.current + BALL_RADIUS > GAME_HEIGHT) {
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setGameOver(true);
        } else {
          // pause before resetting the ball
          setStarted(false);
          setTimeout(() => {
            ballX.current = GAME_WIDTH / 2;
            ballY.current = GAME_HEIGHT - 100;
            ballDX.current = 2 * (Math.random() > 0.5 ? 1 : -1); // slower speed
            ballDY.current = -2;
            setStarted(true);
          }, 800); // short delay before resuming
        }
        return next;
      });
    }

    // brick collisions
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

    // win condition
    const remaining = bricks.current.filter((b) => !b.broken).length;
    if (remaining === 0) {
      setYouWon(true);
    }

    draw(ctx);
  };

  // Main loop
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-4 bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
      >
        Breakout (Canvas)
      </motion.h1>

      <div className="mb-3 text-gray-400">
        {gameOver
          ? "Game Over!"
          : youWon
          ? "You Win!"
          : started
          ? "Break all the bricks!"
          : "Click to Start"}
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onMouseMove={handleMouseMove}
        className="border border-gray-700 rounded-lg bg-linear-to-b from-gray-900 to-black shadow-lg cursor-pointer"
      />

      <div className="mt-4 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (started) {
              // Quit game
              setStarted(false);
              setGameOver(false);
              setYouWon(false);
              resetGame();
            } else {
              // Start new game
              startGame();
            }
          }}
          className={`px-6 py-2 font-semibold rounded-lg shadow ${
            started ? "bg-red-500 text-white" : "bg-amber-500 text-black"
          }`}
        >
          {started ? "Quit" : "Start"}
        </motion.button>
      </div>
    </main>
  );
}
