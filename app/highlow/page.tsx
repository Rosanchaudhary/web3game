"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6"
  | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
}

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const getValue = (rank: Rank): number => {
  switch (rank) {
    case "A": return 1;
    case "J": return 11;
    case "Q": return 12;
    case "K": return 13;
    default: return parseInt(rank);
  }
};

const randomCard = (): Card => ({
  suit: suits[Math.floor(Math.random() * suits.length)],
  rank: ranks[Math.floor(Math.random() * ranks.length)],
});

export default function Home() {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Generate the first card only on the client
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentCard(randomCard());
  }, []);

  const drawNextCard = (guess: "higher" | "lower") => {
    if (gameOver || !currentCard) return;

    const card = randomCard();
    setNextCard(card);
    setShowNext(true);

    setTimeout(() => {
      const currentVal = getValue(currentCard.rank);
      const nextVal = getValue(card.rank);
      const correct =
        (guess === "higher" && nextVal > currentVal) ||
        (guess === "lower" && nextVal < currentVal);

      if (correct) {
        setScore((s) => s + 1);
        setMessage("✅ Correct!");
      } else if (nextVal === currentVal) {
        setMessage("🤝 It's a tie! No points.");
      } else {
        setMessage("❌ Wrong guess!");
        setGameOver(true);
      }

      setTimeout(() => {
        if (!gameOver && correct) {
          setCurrentCard(card);
        }
        setShowNext(false);
        setNextCard(null);
      }, 1000);
    }, 400);
  };

  const restart = () => {
    setScore(0);
    setMessage("");
    setGameOver(false);
    setCurrentCard(randomCard());
    setNextCard(null);
  };

  if (!currentCard) {
    // Prevent SSR mismatch — render placeholder until first card is ready
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-8">🔮 Higher or Lower</h1>

      <div className="flex gap-10 items-center">
        {/* Current card */}
        <motion.div
          key={`${currentCard.rank}-${currentCard.suit}`}
          className="w-44 h-64 bg-white text-black rounded-2xl flex flex-col items-center justify-center shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-5xl">{currentCard.rank}</span>
          <span className="text-3xl mt-2">{currentCard.suit}</span>
        </motion.div>

        <AnimatePresence>
          {showNext && nextCard && (
            <motion.div
              key={`${nextCard.rank}-${nextCard.suit}`}
              className="w-44 h-64 bg-white text-black rounded-2xl flex flex-col items-center justify-center shadow-lg"
              initial={{ x: 150, rotateY: 180, opacity: 0 }}
              animate={{ x: 0, rotateY: 0, opacity: 1 }}
              exit={{ x: -150, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-5xl">{nextCard.rank}</span>
              <span className="text-3xl mt-2">{nextCard.suit}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-10">
        <button
          onClick={() => drawNextCard("higher")}
          disabled={showNext || gameOver}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-lg font-semibold transition disabled:opacity-40"
        >
          🔺 Higher
        </button>
        <button
          onClick={() => drawNextCard("lower")}
          disabled={showNext || gameOver}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-lg font-semibold transition disabled:opacity-40"
        >
          🔻 Lower
        </button>
      </div>

      {/* Score and feedback */}
      <div className="mt-8 text-xl">
        <p>Score: <span className="font-bold">{score}</span></p>
        <p className="mt-2">{message}</p>
      </div>

      {gameOver && (
        <button
          onClick={restart}
          className="mt-8 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg"
        >
          🔁 Restart
        </button>
      )}
    </div>
  );
}
