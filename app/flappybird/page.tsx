'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';


const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;
const PIPE_INTERVAL = 2000; // ms
const GAME_SPEED = 4;

interface Pipe {
  x: number;
  height: number;
}

export default function FlappyBirdGame() {

  const [started, setStarted] = useState(false);
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameLoop = useRef<ReturnType<typeof setInterval> | null>(null);
  const pipeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start / Reset game
  const startGame = () => {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setBirdY(250);
    setVelocity(0);
    setPipes([]);
  };

  // Bird jump
  const jump = () => {
    if (!started || gameOver) return;
    setVelocity(JUMP_STRENGTH);
  };

  // Main game loop
  useEffect(() => {
    if (started && !gameOver) {
      gameLoop.current = setInterval(() => {
        setBirdY((prev) => prev + velocity);
        setVelocity((v) => v + GRAVITY);

        setPipes((prev) =>
          prev.map((pipe) => ({ ...pipe, x: pipe.x - GAME_SPEED }))
        );

        // Remove off-screen pipes
        setPipes((prev) => prev.filter((pipe) => pipe.x + PIPE_WIDTH > 0));
      }, 30);

      return () => {
        if (gameLoop.current) clearInterval(gameLoop.current);
      };
    }
  }, [started, gameOver, velocity]);

  // Spawn pipes
  useEffect(() => {
    if (started && !gameOver) {
      pipeTimer.current = setInterval(() => {
        const topHeight = Math.random() * 200 + 50; // 50–250
        setPipes((prev) => [...prev, { x: 400, height: topHeight }]);
      }, PIPE_INTERVAL);

      return () => {
        if (pipeTimer.current) clearInterval(pipeTimer.current);
      };
    }
  }, [started, gameOver]);

  // Collision detection & scoring
  useEffect(() => {
    if (!started || gameOver) return;

    for (const pipe of pipes) {
      const birdTop = birdY;
      const birdBottom = birdY + 24;

      const hitTopPipe =
        pipe.x < 100 + 34 && pipe.x + PIPE_WIDTH > 100 && birdTop < pipe.height;
      const hitBottomPipe =
        pipe.x < 100 + 34 &&
        pipe.x + PIPE_WIDTH > 100 &&
        birdBottom > pipe.height + PIPE_GAP;

      if (hitTopPipe || hitBottomPipe || birdY > 480 || birdY < 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameOver(true);
        return;
      }

      // Scoring
      if (pipe.x + PIPE_WIDTH === 100) {
        setScore((s) => s + 1);
      }
    }
  }, [pipes, birdY, gameOver]);



  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') jump();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, gameOver]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-sky-900 via-sky-950 to-black text-white overflow-hidden">
      {!started ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6 bg-linear-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            Flappy Bird 🐥
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 text-xl font-semibold bg-linear-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg"
          >
            ▶ Start
          </motion.button>
        </div>
      ) : (
        <>
          <p className="mb-2 text-lg">
            Score: <span className="text-yellow-400">{score}</span>
          </p>
          <div
            className="relative bg-sky-700/50 border border-sky-600 rounded-lg overflow-hidden"
            style={{ width: 400, height: 500 }}
            onClick={jump}
          >
            {/* Bird */}
            <motion.div
              animate={{ y: birdY }}
              className="absolute left-[100px] w-[34px] h-6 bg-yellow-400 rounded-full border border-yellow-200"
            />

            {/* Pipes */}
            {pipes.map((pipe, i) => (
              <React.Fragment key={i}>
                <div
                  className="absolute bg-green-600 border border-green-800"
                  style={{
                    left: pipe.x,
                    top: 0,
                    width: PIPE_WIDTH,
                    height: pipe.height,
                  }}
                />
                <div
                  className="absolute bg-green-600 border border-green-800"
                  style={{
                    left: pipe.x,
                    top: pipe.height + PIPE_GAP,
                    width: PIPE_WIDTH,
                    height: 500 - (pipe.height + PIPE_GAP),
                  }}
                />
              </React.Fragment>
            ))}

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-6 bg-amber-700" />
          </div>

          {gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-2xl font-bold text-red-400 mb-3 animate-pulse">
                Game Over!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-linear-to-r from-yellow-400 to-orange-500 px-6 py-2 rounded-full font-semibold"
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </main>
  );
}
