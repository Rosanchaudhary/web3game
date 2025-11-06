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

// Utility functions
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
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
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
      return parseInt(rank, 10);
  }
};

// 🎮 Main Component
export default function WarGame(){
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

  // Cleanup for the timeout
  return () => clearTimeout(endTimer);
};

//Shuffle and deal cards initially
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
    } else {
      roundWinner = "tie";
    }

    setWinner(roundWinner);

    // Remove top cards from both decks
    const newPDeck = playerDeck.slice(1);
    const newCDeck = computerDeck.slice(1);
    setPlayerDeck(newPDeck);
    setComputerDeck(newCDeck);

    setCurrentRound((r) => r + 1);

    if (newPDeck.length === 0 || newCDeck.length === 0) {
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
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white overflow-hidden relative">
      <h1 className="text-4xl font-bold mb-8">⚔️ War</h1>

      {/* Shuffling Animation */}
      {shuffling && (
        <div className="relative w-full h-64 flex items-center justify-center">
          <AnimatePresence>
            {animatedCards.map((i: number) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  className="absolute w-24 h-36 bg-white text-black rounded-lg shadow-xl flex items-center justify-center border border-slate-400"
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                  animate={{
                    x: isLeft ? -250 : 250,
                    // eslint-disable-next-line react-hooks/purity
                    y: 100 + Math.random() * 30,
                    rotate: isLeft ? -15 : 15,
                    opacity: 1,
                  }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.8,
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
          <div className="flex justify-between items-center w-full max-w-4xl px-12 mt-12">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl mb-3">🤖 Computer</h2>
              <motion.div
                key={computerCard ? `${computerCard.rank}${computerCard.suit}` : "hidden"}
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className={`w-24 h-36 bg-white text-black rounded-lg flex items-center justify-center shadow-lg text-3xl ${
                  winner === "computer" ? "ring-4 ring-green-500" : ""
                }`}
              >
                {computerCard ? `${computerCard.rank}${computerCard.suit}` : "🂠"}
              </motion.div>
              <p className="mt-2 text-slate-400">Cards: {computerDeck.length}</p>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-2xl mb-3">👤 Player</h2>
              <motion.div
                key={playerCard ? `${playerCard.rank}${playerCard.suit}` : "hidden"}
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className={`w-24 h-36 bg-white text-black rounded-lg flex items-center justify-center shadow-lg text-3xl ${
                  winner === "player" ? "ring-4 ring-blue-500" : ""
                }`}
              >
                {playerCard ? `${playerCard.rank}${playerCard.suit}` : "🂠"}
              </motion.div>
              <p className="mt-2 text-slate-400">Cards: {playerDeck.length}</p>
            </div>
          </div>

          {/* Round Result */}
          <div className="mt-12 text-center min-h-10">
            {winner === "player" && (
              <p className="text-blue-400 text-xl">You win this round!</p>
            )}
            {winner === "computer" && (
              <p className="text-green-400 text-xl">Computer wins this round!</p>
            )}
            {winner === "tie" && (
              <p className="text-yellow-400 text-xl">It&apos;s a tie!</p>
            )}
          </div>

          {/* Scores */}
          <div className="mt-8 flex gap-10 text-lg text-slate-300">
            <span>👤 Player: {playerScore}</span>
            <span>🤖 Computer: {computerScore}</span>
            <span>Round: {currentRound}</span>
          </div>

          {/* Deal Button */}
          {!gameOver && (
            <button
              onClick={playRound}
              className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg"
            >
              🎴 Deal Card
            </button>
          )}

          {/* Game Over Message */}
          {gameOver && (
            <div className="mt-10 text-2xl font-bold text-center">
              {winner === "final-player" && (
                <p className="text-blue-400">🎉 You win the game!</p>
              )}
              {winner === "final-computer" && (
                <p className="text-green-400">💻 Computer wins the game!</p>
              )}
              {winner === "final-tie" && (
                <p className="text-yellow-400">🤝 It&apos;s an overall tie!</p>
              )}

              <button
                onClick={restartGame}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg"
              >
                🔄 Restart Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
