'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

const emojiSet = ['🐶', '🐱', '🐸', '🐵', '🐼', '🦊', '🐯', '🐰'];

export default function MemoryGame() {
  const { address } = useAccount();

  const generateGrid = () => {
    const pairs = [...emojiSet, ...emojiSet];
    return pairs.sort(() => Math.random() - 0.5);
  };

  const [started, setStarted] = useState(false); 
  const [grid, setGrid] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<boolean[]>(Array(16).fill(false));
  const [turns, setTurns] = useState(0);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (started) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrid(generateGrid());
    }
  }, [started]);

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

  const quitGame = () => {
    setStarted(false); //go back to Play screen
    setFlipped([]);
    setMatched(Array(16).fill(false));
    setTurns(0);
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

  // ---------------- Play screen ----------------
  if (!started) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-extrabold mb-6 bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Memory Game
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStarted(true)}
          className="px-8 py-4 text-xl font-semibold bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          ▶ Play
        </motion.button>
      </main>
    );
  }

  // ---------------- Game screen ----------------
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-black via-gray-900 to-black text-white p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-tr from-indigo-900/30 to-purple-900/20 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-700/10 blur-3xl rounded-full -z-10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between w-full max-w-md mb-6"
      >
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">
          Memory Game
        </h1>
      </motion.div>

      {/* Turns Counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 text-lg text-gray-300"
      >
        Turns: <span className="text-indigo-400 font-semibold">{turns}</span>
      </motion.p>

      {/* Game Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-4 gap-4 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-inner"
      >
        {grid.map((emoji: string, index: number) => {
          const isFlipped = flipped.includes(index) || matched[index];
          return (
            <motion.div
              key={index}
              className="w-20 h-20 perspective"
              onClick={() => handleFlip(index)}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="relative w-full h-full cursor-pointer rounded-xl"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back */}
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-xl backface-hidden shadow-lg hover:shadow-indigo-500/30 transition" />

                {/* Card Front */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-3xl rounded-xl backface-hidden"
                  style={{
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                  }}
                >
                  {emoji}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Win or Reset Section */}
      {allMatched ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-3xl font-bold bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4 animate-pulse">
            You matched all emojis in {turns} turns!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-purple-500/30 transition"
          >
            Play Again
          </motion.button>
        </motion.div>
      ) : (
        <div className="mt-10 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-medium border border-white/10 backdrop-blur-md"
          >
            Reset Game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={quitGame}
            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-medium border border-white/10 backdrop-blur-md text-red-400"
          >
            Quit
          </motion.button>
        </div>
      )}
    </main>
  );
}
