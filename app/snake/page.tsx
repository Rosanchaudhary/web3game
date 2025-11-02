'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 15; // 15x15 grid
const SPEED = 150; // movement speed (ms)

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Cell = { x: number; y: number };

export default function SnakeGame() {
  const [started, setStarted] = useState(false);
  const [snake, setSnake] = useState<Cell[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Cell>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Generate random food cell
  const randomCell = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, started, gameOver]);

  // Main game loop
  useEffect(() => {
    if (!started || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check for collisions
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE ||
          prev.some((s) => s.x === head.x && s.y === head.y)
        ) {
          setGameOver(true);
          return prev;
        }

        // Check for food
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1);
          setFood(randomCell());
          return newSnake; // Grow
        } else {
          newSnake.pop(); // Move
          return newSnake;
        }
      });
    }, SPEED);

    return () => clearInterval(interval);
  }, [started, direction, food, randomCell, gameOver]);

  const startGame = () => {
    setStarted(true);
    setSnake([{ x: 7, y: 7 }]);
    setDirection('RIGHT');
    setFood(randomCell());
    setScore(0);
    setGameOver(false);
  };

  const quitGame = () => {
    setStarted(false);
    setGameOver(false);
  };

  // --------- UI -----------
  if (!started) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-extrabold mb-6 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          🐍 Snake Game
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 text-xl font-semibold bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          ▶ Play
        </motion.button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-black via-gray-900 to-black text-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-tr from-indigo-900/30 to-purple-900/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-700/10 blur-3xl rounded-full -z-10" />

      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
          🐍 Snake Game
        </h1>
        <p className="mt-2 text-gray-300">Score: <span className="text-indigo-400 font-semibold">{score}</span></p>
      </div>

      {/* Game Grid */}
      <div
        className="grid bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 24px)`,
          gap: '3px',
          padding: '12px',
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          return (
            <motion.div
              key={i}
              className="w-6 h-6 rounded-sm"
              animate={{
                background: isHead
                  ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                  : isSnake
                  ? 'linear-gradient(135deg, #059669, #10b981)'
                  : isFood
                  ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                  : 'rgba(17, 24, 39, 0.6)',
                scale: isFood ? 1.1 : 1,
              }}
              transition={{ duration: 0.15 }}
            />
          );
        })}
      </div>

      {/* Game Over or Buttons */}
      {gameOver ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-2xl font-semibold text-red-400 mb-4">💀 Game Over!</p>
          <p className="text-lg text-gray-300 mb-4">Your Score: {score}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-purple-500/30 transition"
          >
            Restart
          </motion.button>
          <button
            onClick={quitGame}
            className="ml-4 text-gray-400 text-sm underline hover:text-gray-200 transition"
          >
            Quit
          </button>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={quitGame}
          className="mt-8 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-medium border border-white/10 backdrop-blur-md text-gray-300"
        >
          Quit Game
        </motion.button>
      )}
    </main>
  );
}
