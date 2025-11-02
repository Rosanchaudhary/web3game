"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const GRID_SIZE = 8; 
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const getRandomCell = () =>
  Math.floor(Math.random() * TOTAL_CELLS);

export default function Simon8x8() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerMoves, setPlayerMoves] = useState<number[]>([]);
  const [showing, setShowing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("");

  // Add one more tile to sequence
  const addStep = () => {
    setSequence(prev => [...prev, getRandomCell()]);
  };

  // Flash sequence to user
  useEffect(() => {
    if (sequence.length === 0) {
      addStep();
      return;
    }

    setShowing(true);
    let i = 0;

    const interval = setInterval(() => {
      setActiveIndex(sequence[i]);
      i++;

      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setActiveIndex(null), 200);
        setShowing(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sequence]);

  const handleCellClick = (index: number) => {
    if (showing) return;

    const nextMoves = [...playerMoves, index];
    setPlayerMoves(nextMoves);

    // ❌ Wrong cell
    if (sequence[nextMoves.length - 1] !== index) {
      setMessage("❌ Wrong! Restarting...");
      setSequence([]);
      setPlayerMoves([]);
      setLevel(1);
      setTimeout(() => setMessage(""), 800);
      return;
    }

    // ✅ Completed round
    if (nextMoves.length === sequence.length) {
      setMessage("✅ Nice!");
      setPlayerMoves([]);
      setLevel(level + 1);
      setTimeout(() => {
        setMessage("");
        addStep();
      }, 400);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-3xl rounded-full -z-10" />

      {/* Title & Score */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
          🧠 8×8 Simon Game
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          Follow the sequence, test your memory, and climb the leaderboard.
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-xl">
            <span className="text-indigo-400 font-semibold">Score:</span> {level}
          </p>
          <p className="text-lg text-purple-300 h-6">{message}</p>
        </div>
      </div>

      {/* Game Grid */}
      <motion.div
        className="grid gap-2 p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
        }}
      >
        {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
          <motion.div
            key={i}
            onClick={() => handleCellClick(i)}
            animate={{
              opacity: activeIndex === i ? 1 : 0.5,
              scale: activeIndex === i ? 1.2 : 1,
              background:
                activeIndex === i
                  ? "linear-gradient(135deg, #4ade80, #22c55e)"
                  : "linear-gradient(135deg, #111827, #1f2937)",
              boxShadow:
                activeIndex === i
                  ? "0 0 15px 3px rgba(74,222,128,0.7)"
                  : "0 0 5px rgba(0,0,0,0.3)",
            }}
            transition={{ duration: 0.15 }}
            className="w-14 h-14 rounded-lg cursor-pointer border border-gray-700"
          />
        ))}
      </motion.div>

      {/* Footer / Tip */}
      <p className="mt-8 text-gray-500 text-sm italic">
        Connect wallet to save your score on-chain.
      </p>
    </main>
  );
}
