'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const emojiSet = ['🐶', '🐱', '🐸', '🐵', '🐼', '🦊', '🐯', '🐰'];

export default function MemoryGame() {
  const { address } = useAccount();

  const generateGrid = () => {
    const pairs = [...emojiSet, ...emojiSet];
    return pairs.sort(() => Math.random() - 0.5);
  };

  const [grid, setGrid] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<boolean[]>(Array(16).fill(false));
  const [turns, setTurns] = useState(0);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid(generateGrid());
  }, []);

  const handleFlip = (index: number) => {
    if (disabled || matched[index] || flipped.includes(index)) return;
    setFlipped((prev) => [...prev, index]);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisabled(true);
      const [first, second] = flipped;
      if (grid[first] === grid[second]) {
        setMatched((prev) => {
          const newMatched = [...prev];
          newMatched[first] = true;
          newMatched[second] = true;
          return newMatched;
        });
      }
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
        setTurns((t) => t + 1);
      }, 900);
    }
  }, [flipped, grid]);

  const resetGame = () => {
    setGrid(generateGrid());
    setMatched(Array(16).fill(false));
    setFlipped([]);
    setTurns(0);
    setDisabled(false);
  };

  const allMatched = matched.every(Boolean);

  // Save score on completion
  useEffect(() => {
    if (allMatched && address) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, turns }),
      });
    }
  }, [allMatched, address, turns]);

  if (grid.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="flex justify-between w-full max-w-md mb-6">
        <h1 className="text-3xl font-bold">🧠 Memory Game</h1>
        <ConnectButton />
      </div>

      <p className="mb-6 text-lg">Turns: {turns}</p>

      <div className="grid grid-cols-4 gap-4">
        {grid.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched[index];
          return (
            <motion.div
              key={index}
              className="w-20 h-20 perspective"
              onClick={() => handleFlip(index)}
            >
              <motion.div
                className="relative w-full h-full cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-xl backface-hidden">
                  ❓
                </div>

                <div
                  className="absolute inset-0 flex items-center justify-center text-3xl bg-green-600 rounded-xl backface-hidden"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  {emoji}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {allMatched && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-2xl mb-4">🎉 You matched all emojis in {turns} turns!</p>
          <button
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold"
          >
            Play Again
          </button>
        </motion.div>
      )}

      {!allMatched && (
        <button
          onClick={resetGame}
          className="mt-8 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium"
        >
          Reset Game
        </button>
      )}

      <a
        href="/leaderboard"
        className="mt-6 underline text-blue-400 hover:text-blue-300"
      >
        View Leaderboard →
      </a>
    </main>
  );
}


