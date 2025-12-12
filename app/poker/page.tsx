"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  createDeck,
  shuffleDeck,
  dealHands,
  compareHands,
  evaluateHand,
  getHandRankName,
  getCardImage,
  Card,
} from "@/lib/pokerLogic";

export default function PokerGame() {
  const STARTING_CHIPS = 1000;
  const ANTE = 100;

  const [player, setPlayer] = useState<Card[]>([]);
  const [computer, setComputer] = useState<Card[]>([]);
  const [result, setResult] = useState("");
  const [shuffling, setShuffling] = useState(false);
  const [showComputerCards, setShowComputerCards] = useState(false);
  const [playerRankName, setPlayerRankName] = useState("");
  const [computerRankName, setComputerRankName] = useState("");

  const [playerChips, setPlayerChips] = useState(STARTING_CHIPS);
  const [computerChips, setComputerChips] = useState(STARTING_CHIPS);
  const [pot, setPot] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playRound = async () => {
    if (playerChips < ANTE || computerChips < ANTE) {
      setGameOver(true);
      return;
    }

    setShuffling(true);
    setShowComputerCards(false);
    setResult("");
    setPlayerRankName("");
    setComputerRankName("");

    // Each contributes to pot
    setPlayerChips((c) => c - ANTE);
    setComputerChips((c) => c - ANTE);
    setPot(ANTE * 2);

    await new Promise((r) => setTimeout(r, 1000)); // fake shuffle animation

    const deck = shuffleDeck(createDeck());
    const { playerHand, computerHand } = dealHands(deck);

    setPlayer(playerHand);
    setComputer(computerHand);
    setShuffling(false);

    // Reveal computer cards one by one
    await new Promise((r) => setTimeout(r, 1200));
    setShowComputerCards(true);

    // Evaluate both hands
    const playerEval = evaluateHand(playerHand);
    const computerEval = evaluateHand(computerHand);
    setPlayerRankName(getHandRankName(playerEval.rank));
    setComputerRankName(getHandRankName(computerEval.rank));

    // Wait before revealing result
    await new Promise((r) => setTimeout(r, 800));

    const outcome = compareHands(playerHand, computerHand);
    setResult(outcome);

    // Adjust chips
    if (outcome.includes("Player")) {
      setPlayerChips((c) => c + pot);
    } else if (outcome.includes("Computer")) {
      setComputerChips((c) => c + pot);
    } else {
      // Tie -> split pot
      setPlayerChips((c) => c + pot / 2);
      setComputerChips((c) => c + pot / 2);
    }

    setPot(0);

    // Check for bankruptcy
    setTimeout(() => {
      if (playerChips <= 0 || computerChips <= 0) setGameOver(true);
    }, 1200);
  };

  const restartGame = () => {
    setPlayer([]);
    setComputer([]);
    setResult("");
    setShowComputerCards(false);
    setPlayerRankName("");
    setComputerRankName("");
    setPlayerChips(STARTING_CHIPS);
    setComputerChips(STARTING_CHIPS);
    setPot(0);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-emerald-900 to-emerald-950 text-white relative overflow-hidden">
      <h1 className="text-5xl font-bold mb-6 text-yellow-400 drop-shadow-lg tracking-wide">
        ♠️ Poker Game
      </h1>

      {/* Chips and pot display */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-6 text-lg font-semibold text-slate-200">
        <div>👤 Player Chips: {playerChips}</div>
        <div>🪙 Pot: {pot}</div>
        <div>🤖 Computer Chips: {computerChips}</div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        {!gameOver && (
          <button
            onClick={playRound}
            disabled={shuffling}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold text-lg shadow-md transition-transform hover:scale-105 disabled:opacity-50"
          >
            🎴 Deal Hands ({ANTE} Bet)
          </button>
        )}
        {player.length > 0 && (
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-800 rounded-lg font-semibold text-lg shadow-md transition-transform hover:scale-105"
          >
            🔄 Restart
          </button>
        )}
      </div>

      {/* Table */}
      <div className="relative w-full max-w-5xl rounded-[3rem] bg-linear-to-b from-green-700 to-green-900 border-8 border-amber-700 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center py-10 overflow-hidden">
        {shuffling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-yellow-300"
          >
            🔄 Shuffling cards...
          </motion.div>
        )}

        {!shuffling && (
          <>
            {/* Computer */}
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-2xl mb-4 text-red-300 font-semibold">
                🤖 Computer
              </h2>
              <div className="flex gap-4">
                {computer.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{
                      rotateY: showComputerCards ? 0 : 180,
                      opacity: 1,
                    }}
                    transition={{
                      delay: i * 0.25,
                      duration: 0.6,
                    }}
                    className="w-24 h-36 rounded-lg overflow-hidden shadow-lg transform-3d"
                  >
                    <Image
                      src={
                        showComputerCards
                          ? getCardImage(card)
                          : "/cards/back.png"
                      }
                      alt={`${card.rank} of ${card.suit}`}
                      width={240}
                      height={360}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              {computerRankName && (
                <p className="text-yellow-200 mt-3 font-medium">
                  {computerRankName}
                </p>
              )}
            </div>

            {/* Player */}
            <div className="flex flex-col items-center mt-16">
              <div className="flex gap-4">
                {player.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-24 h-36 rounded-lg overflow-hidden shadow-lg"
                  >
                    <Image
                      src={getCardImage(card)}
                      alt={`${card.rank} of ${card.suit}`}
                      width={240}
                      height={360}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              {playerRankName && (
                <p className="text-yellow-200 mt-3 font-medium">
                  {playerRankName}
                </p>
              )}
              <h2 className="text-2xl mt-4 text-blue-300 font-semibold">
                👤 Player
              </h2>
            </div>
          </>
        )}
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-10 text-2xl font-bold text-yellow-300 drop-shadow-md text-center"
        >
          {result}
        </motion.div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="mt-10 text-3xl font-bold text-center text-red-400">
          {playerChips <= 0
            ? "💀 You lost all your chips!"
            : "🏆 Computer is out of chips — You win!"}
        </div>
      )}
    </div>
  );
}
