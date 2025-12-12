"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ---------- Types ----------
export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6"
  | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

// ---------- Logic ----------
const getCardValue = (rank: Rank): number => {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
};

const drawCard = (): Card => ({
  suit: suits[Math.floor(Math.random() * suits.length)],
  rank: ranks[Math.floor(Math.random() * ranks.length)],
});

const calculateHandValue = (hand: Card[]): number => {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    const v = getCardValue(card.rank);
    total += v;
    if (card.rank === "A") aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
};

// ---------- Component ----------
const Blackjack: React.FC = () => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState<number>(0);
  const [dealerTotal, setDealerTotal] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [revealDealer, setRevealDealer] = useState<boolean>(false);

  const startGame = (): void => {
    const playerStart = [drawCard(), drawCard()];
    const dealerStart = [drawCard(), drawCard()];

    setPlayerHand(playerStart);
    setPlayerTotal(calculateHandValue(playerStart));

    setDealerHand(dealerStart);
    setDealerTotal(calculateHandValue(dealerStart));

    setRevealDealer(false);
    setGameOver(false);
    setMessage("");
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startGame();
  }, []);

  const hit = (): void => {
    if (gameOver) return;

    const newCard = drawCard();
    const updated = [...playerHand, newCard];
    const total = calculateHandValue(updated);

    setPlayerHand(updated);
    setPlayerTotal(total);

    if (total > 21) {
      setMessage("💥 Bust! Dealer wins.");
      setGameOver(true);
      setRevealDealer(true);
    }
  };

  const stand = (): void => {
    if (gameOver) return;

    setRevealDealer(true);

    const dealer = [...dealerHand];
    let total = calculateHandValue(dealer);

    while (total < 17) {
      dealer.push(drawCard());
      total = calculateHandValue(dealer);
    }

    setDealerHand(dealer);
    setDealerTotal(total);

    if (total > 21) {
      setMessage("🎉 Dealer busts! You win.");
    } else if (total > playerTotal) {
      setMessage("❌ Dealer wins.");
    } else if (total < playerTotal) {
      setMessage("🔥 You win!");
    } else {
      setMessage("🤝 It's a tie.");
    }

    setGameOver(true);
  };

  const cardComponent = (card: Card, index: number) => (
    <motion.div
      key={index}
      className="w-24 h-36 bg-white text-black rounded-xl flex flex-col items-center justify-center shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-3xl">{card.rank}</span>
      <span className="text-xl mt-1">{card.suit}</span>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-12">
      <h1 className="text-4xl font-bold mb-8">🃏 Blackjack</h1>

      {/* Dealer */}
      <h2 className="text-2xl mb-2">Dealer</h2>
      <div className="flex gap-4 mb-6">
        {dealerHand.map((card, idx) =>
          !revealDealer && idx === 0 ? (
            <div
              key={idx}
              className="w-24 h-36 bg-gray-700 rounded-xl flex items-center justify-center shadow-lg text-3xl"
            >
              ❓
            </div>
          ) : (
            cardComponent(card, idx)
          )
        )}
      </div>

      {revealDealer && <p className="text-xl mb-8">Dealer Total: {dealerTotal}</p>}

      {/* Player */}
      <h2 className="text-2xl mb-2">You</h2>
      <div className="flex gap-4 mb-6">{playerHand.map(cardComponent)}</div>

      <p className="text-xl mb-6">Your Total: {playerTotal}</p>

      {/* Buttons */}
      <div className="flex gap-6 mb-6">
        <button
          onClick={hit}
          disabled={gameOver}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-lg font-semibold disabled:opacity-40"
        >
          ✋ Hit
        </button>
        <button
          onClick={stand}
          disabled={gameOver}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-semibold disabled:opacity-40"
        >
          🛑 Stand
        </button>
      </div>

      {gameOver && (
        <>
          <p className="text-2xl mb-6">{message}</p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-lg font-semibold"
          >
            🔁 Play Again
          </button>
        </>
      )}
    </div>
  );
};

export default Blackjack;
