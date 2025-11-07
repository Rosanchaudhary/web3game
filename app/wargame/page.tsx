"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Card types
export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

// Utility
const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of suits) for (const rank of ranks) deck.push({ suit, rank });
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getValue = (rank: Rank): number => {
  switch (rank) {
    case "A":
      return 1;
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    default:
      return parseInt(rank);
  }
};

export default function WarGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [computerDeck, setComputerDeck] = useState<Card[]>([]);
  const [animatedCards, setAnimatedCards] = useState<number[]>([]);
  const [shuffling, setShuffling] = useState<boolean>(true);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [computerCard, setComputerCard] = useState<Card | null>(null);
  const [winner, setWinner] = useState<
    "player" | "computer" | "tie" | "final-player" | "final-computer" | "final-tie" | null
  >(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [computerScore, setComputerScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const startGame = (): (() => void) => {
    setGameOver(false);
    setWinner(null);
    setPlayerScore(0);
    setComputerScore(0);
    setCurrentRound(0);
    setPlayerCard(null);
    setComputerCard(null);
    setShuffling(true);

    const fullDeck = shuffleDeck(createDeck());
    setDeck(fullDeck);

    const tempCards = Array.from({ length: 20 }, (_, i) => i);
    setAnimatedCards(tempCards);

    const endTimer = setTimeout(() => {
      const playerHalf = fullDeck.slice(0, 26);
      const compHalf = fullDeck.slice(26);
      setPlayerDeck(playerHalf);
      setComputerDeck(compHalf);
      setShuffling(false);
    }, 3000);

    return () => clearTimeout(endTimer);
  };

  useEffect(() => {
    const cleanup = startGame();
    return cleanup;
  }, []);

  const playRound = (): void => {
    if (playerDeck.length === 0 || computerDeck.length === 0) {
      endGame();
      return;
    }

    const pCard = playerDeck[0];
    const cCard = computerDeck[0];
    setPlayerCard(pCard);
    setComputerCard(cCard);

    const pVal = getValue(pCard.rank);
    const cVal = getValue(cCard.rank);

    let roundWinner: "player" | "computer" | "tie" | null = null;
    if (pVal > cVal) {
      roundWinner = "player";
      setPlayerScore((s) => s + 1);
    } else if (cVal > pVal) {
      roundWinner = "computer";
      setComputerScore((s) => s + 1);
    } else roundWinner = "tie";

    setWinner(roundWinner);

    setPlayerDeck((prev) => prev.slice(1));
    setComputerDeck((prev) => prev.slice(1));
    setCurrentRound((r) => r + 1);

    if (playerDeck.length === 1 || computerDeck.length === 1) {
      setTimeout(endGame, 1000);
    }
  };

  const endGame = (): void => {
    setGameOver(true);
    if (playerScore > computerScore) setWinner("final-player");
    else if (computerScore > playerScore) setWinner("final-computer");
    else setWinner("final-tie");
  };

  const restartGame = (): void => {
    startGame();
  };

  return (
  <div className="min-h-screen bg-linear-to-b from-emerald-900 to-emerald-950 flex flex-col items-center justify-center text-white overflow-hidden relative">
    <h1 className="text-5xl font-bold mb-6 text-yellow-400 drop-shadow-lg tracking-wide">
      ⚔️ War Card Game
    </h1>

    {/* Table Area */}
    <div className="relative w-full max-w-5xl rounded-[3rem] bg-linear-to-b from-green-700 to-green-900 shadow-[0_0_80px_rgba(0,0,0,0.8)] border-8 border-amber-700 overflow-hidden py-10 flex flex-col items-center justify-center">

      {/* Shuffling Animation */}
      {shuffling && (
        <div className="relative w-full h-64 flex items-center justify-center">
          <AnimatePresence>
            {animatedCards.map((i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  className="absolute w-24 h-36 bg-white text-black rounded-xl shadow-xl flex items-center justify-center border border-slate-400"
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={{
                    x: isLeft ? -200 : 200,
                    y: 100 + Math.random() * 30,
                    rotate: isLeft ? -10 : 10,
                    opacity: 1,
                  }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  exit={{ opacity: 0 }}
                >
                  🂠
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Gameplay */}
      {!shuffling && (
        <>
          <div className="relative flex flex-col items-center justify-between h-[500px] w-full max-w-4xl">
            {/* Computer Section */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl mb-3 text-red-300 drop-shadow-md">🤖 Computer</h2>

              <motion.div
                className="w-24 h-36 bg-slate-200 rounded-lg flex items-center justify-center text-black text-2xl shadow-lg mb-4"
                whileHover={{ scale: 1.05 }}
              >
                🂠
              </motion.div>

              <AnimatePresence>
                {computerCard && (
                  <motion.div
                    key={`${computerCard.rank}${computerCard.suit}-${currentRound}`}
                    className={`absolute top-[140px] w-24 h-36 bg-white text-black rounded-lg flex items-center justify-center shadow-lg text-3xl ${
                      winner === "computer" ? "ring-4 ring-red-500" : ""
                    }`}
                    initial={{ y: -100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  >
                    {computerCard.rank}
                    {computerCard.suit}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Player Section */}
            <div className="flex flex-col items-center">
              <AnimatePresence>
                {playerCard && (
                  <motion.div
                    key={`${playerCard.rank}${playerCard.suit}-${currentRound}`}
                    className={`absolute bottom-[140px] w-24 h-36 bg-white text-black rounded-lg flex items-center justify-center shadow-lg text-3xl ${
                      winner === "player" ? "ring-4 ring-blue-500" : ""
                    }`}
                    initial={{ y: 100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  >
                    {playerCard.rank}
                    {playerCard.suit}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-24 h-36 bg-slate-200 rounded-lg flex items-center justify-center text-black text-2xl shadow-lg mt-4"
                whileHover={{ scale: 1.05 }}
              >
                🂠
              </motion.div>

              <h2 className="text-2xl mt-3 text-blue-300 drop-shadow-md">👤 Player</h2>
            </div>
          </div>

          {/* Round Result */}
          <div className="mt-8 text-center min-h-10">
            {winner === "player" && (
              <p className="text-blue-400 text-xl font-semibold">You win this round!</p>
            )}
            {winner === "computer" && (
              <p className="text-red-400 text-xl font-semibold">Computer wins this round!</p>
            )}
            {winner === "tie" && (
              <p className="text-yellow-400 text-xl font-semibold">It&apos;s a tie!</p>
            )}
          </div>

          {/* Scores */}
          <div className="mt-6 flex gap-10 text-lg text-slate-200 font-medium">
            <span>👤 Player: {playerScore}</span>
            <span>🤖 Computer: {computerScore}</span>
            <span>Round: {currentRound}</span>
          </div>

          {/* Deal Button */}
          {!gameOver && (
            <button
              onClick={playRound}
              className="mt-8 px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold text-lg shadow-md transition-transform hover:scale-105"
            >
              🎴 Deal Card
            </button>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className="mt-10 text-2xl font-bold text-center">
              {winner === "final-player" && (
                <p className="text-blue-400">🎉 You win the game!</p>
              )}
              {winner === "final-computer" && (
                <p className="text-red-400">💻 Computer wins the game!</p>
              )}
              {winner === "final-tie" && (
                <p className="text-yellow-400">🤝 It&apos;s an overall tie!</p>
              )}

              <button
                onClick={restartGame}
                className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold text-lg shadow-md transition-transform hover:scale-105"
              >
                🔄 Restart Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

}
