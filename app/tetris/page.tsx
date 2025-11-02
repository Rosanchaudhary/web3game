'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

// Define grid dimensions
const ROWS = 20;
const COLS = 10;

// ---------- TYPES ----------
type ShapeMatrix = number[][]; // One rotation
type ShapeRotations = ShapeMatrix[]; // All rotations

type ShapeKey = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

interface CurrentPiece {
  shape: ShapeRotations;
  color: string;
}

interface Position {
  x: number;
  y: number;
  rotation: number;
}

// ---------- SHAPES ----------
const SHAPES: Record<ShapeKey, ShapeRotations> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [[[1, 1], [1, 1]]],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  L: [
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]],
    [[0, 0, 1], [1, 1, 1]],
  ],
  J: [
    [[0, 1], [0, 1], [1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]],
  ],
};

// ---------- COLORS ----------
const COLORS: Record<ShapeKey, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  L: 'bg-orange-400',
  J: 'bg-blue-400',
  S: 'bg-green-400',
  Z: 'bg-red-400',
};

export default function TetrisGame() {
  const { address } = useAccount();

  const [started, setStarted] = useState(false);
  const [grid, setGrid] = useState<(number | string)[][]>([]);
  const [current, setCurrent] = useState<CurrentPiece | null>(null);
  const [position, setPosition] = useState<Position>({ x: 3, y: 0, rotation: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const dropRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize empty grid
  const emptyGrid = (): (number | string)[][] =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  const randomShape = (): CurrentPiece => {
    const keys = Object.keys(SHAPES) as ShapeKey[];
    const key = keys[Math.floor(Math.random() * keys.length)];
    return { shape: SHAPES[key], color: COLORS[key] };
  };

  // Start game
  const startGame = () => {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setGrid(emptyGrid());
    setCurrent(randomShape());
    setPosition({ x: 3, y: 0, rotation: 0 });
  };

  const rotate = (dir: number) => {
    if (!current) return;
    setPosition((prev) => ({
      ...prev,
      rotation: (prev.rotation + dir + current.shape.length) % current.shape.length,
    }));
  };

  const move = (dx: number, dy: number) => {
    if (!current) return;
    if (!checkCollision(position.x + dx, position.y + dy, position.rotation)) {
      setPosition((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
    }
  };

  const checkCollision = (x: number, y: number, rotation: number): boolean => {
    if (!current) return false;
    const matrix = current.shape[rotation];
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const newY = y + r;
          const newX = x + c;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY]?.[newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergeToGrid = (): (number | string)[][] => {
    if (!current) return grid;
    const newGrid = grid.map((r) => [...r]);
    const matrix = current.shape[position.rotation];
    matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val && position.y + r >= 0) {
          newGrid[position.y + r][position.x + c] = current.color;
        }
      });
    });
    return newGrid;
  };

  const clearLines = (grid: (number | string)[][]): (number | string)[][] => {
    let cleared = 0;
    const newGrid = grid.filter((row) => !row.every((cell) => cell !== 0));
    cleared = ROWS - newGrid.length;
    while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
    if (cleared > 0) setScore((s) => s + cleared * 100);
    return newGrid;
  };

  const drop = () => {
    if (!current) return;
    if (!checkCollision(position.x, position.y + 1, position.rotation)) {
      setPosition((p) => ({ ...p, y: p.y + 1 }));
    } else {
      const newGrid = mergeToGrid();
      const cleared = clearLines(newGrid);
      setGrid(cleared);
      const newPiece = randomShape();
      const newPos = { x: 3, y: 0, rotation: 0 };
      if (checkCollision(newPos.x, newPos.y, newPos.rotation)) {
        setGameOver(true);
        if (dropRef.current) clearInterval(dropRef.current);
      } else {
        setCurrent(newPiece);
        setPosition(newPos);
      }
    }
  };

useEffect(() => {
  if (started && !gameOver) {
    dropRef.current = setInterval(() => drop(), 700);

    // ✅ Always return a proper cleanup function
    return () => {
      if (dropRef.current) {
        clearInterval(dropRef.current);
        dropRef.current = null; // optional, to prevent leaks
      }
    };
  }
}, [started, position, current, grid, gameOver]);


  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!started || gameOver) return;
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') rotate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [position, current, grid, started, gameOver]);

  const quitGame = () => {
    setStarted(false);
    setGameOver(false);
    setScore(0);
  };

  // Save score on game over
  useEffect(() => {
    if (gameOver && address) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, score }),
      });
    }
  }, [gameOver, address, score]);

  const renderGrid = (): (number | string)[][] => {
    const tempGrid = grid.map((r) => [...r]);
    if (current) {
      const matrix = current.shape[position.rotation];
      matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val && position.y + r >= 0) {
            tempGrid[position.y + r][position.x + c] = current.color;
          }
        });
      });
    }
    return tempGrid;
  };

  // ---------------- PLAY SCREEN ----------------
  if (!started) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-extrabold mb-6 bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Tetris Game
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="px-8 py-4 text-xl font-semibold bg-linear-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          ▶ Play
        </motion.button>
      </main>
    );
  }

  // ---------------- GAME SCREEN ----------------
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-black via-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-cyan-900/20 to-blue-900/10 blur-3xl -z-10" />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-4 bg-linear-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text"
      >
        Tetris Game
      </motion.h1>

      <p className="mb-4 text-lg text-gray-300">
        Score: <span className="text-cyan-400 font-semibold">{score}</span>
      </p>

      {/* Grid */}
      <div
        className="grid gap-0.5 bg-gray-800 p-2 rounded-lg border border-gray-700"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {renderGrid().map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-sm ${
                cell ? cell : 'bg-gray-900'
              } transition-all`}
            />
          ))
        )}
      </div>

      {gameOver ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-2xl font-bold text-red-400 mb-4 animate-pulse">Game Over!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-linear-to-r from-cyan-600 to-blue-600 px-6 py-2 rounded-full font-semibold"
          >
            Play Again
          </motion.button>
        </motion.div>
      ) : (
        <div className="mt-6 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/10"
          >
            Restart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={quitGame}
            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/10 text-red-400"
          >
            Quit
          </motion.button>
        </div>
      )}
    </main>
  );
}
