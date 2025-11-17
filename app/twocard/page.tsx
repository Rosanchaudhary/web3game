"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------- CARD UTILS ----------------
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

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [
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

const createDeck = (): Card[] =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));

// IMAGE PATH
const getCardImage = (card: Card | null): string => {
  if (!card) return "/cards/back.png";

  const suits: Record<Suit, string> = {
    "♠": "spades",
    "♥": "hearts",
    "♦": "diamonds",
    "♣": "clubs",
  };

  const ranks: Record<Rank, string> = {
    A: "ace",
    J: "jack",
    Q: "queen",
    K: "king",
    "10": "10",
    "9": "9",
    "8": "8",
    "7": "7",
    "6": "6",
    "5": "5",
    "4": "4",
    "3": "3",
    "2": "2",
  };

  return `/cards/${ranks[card.rank]}_of_${suits[card.suit]}.png`;
};

// --------------------------------------------------

export default function TwoPlayerOverlappedPlay() {
  const [playerADeck, setPlayerADeck] = useState<Card[]>([]);
  const [playerBDeck, setPlayerBDeck] = useState<Card[]>([]);

  const [centerA, setCenterA] = useState<Card | null>(null);
  const [centerB, setCenterB] = useState<Card | null>(null);

  const [throwA, setThrowA] = useState(false);
  const [throwB, setThrowB] = useState(false);

  // ---------- INITIAL DEAL ----------
  useEffect(() => {
    const deck = createDeck();

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const half = Math.floor(deck.length / 2);
    setPlayerADeck(deck.slice(0, half));
    setPlayerBDeck(deck.slice(half));
  }, []);

  // ---------- PLAY CARD ----------
  const playCard = (card: Card, index: number) => {
    if (centerA || centerB) return;

    // Player A plays
    const updatedA = [...playerADeck];
    updatedA.splice(index, 1);
    setPlayerADeck(updatedA);
    setCenterA(card);
    setThrowA(true);

    // Player B random
    // eslint-disable-next-line react-hooks/purity
    const rand = Math.floor(Math.random() * playerBDeck.length);
    const bCard = playerBDeck[rand];

    const updatedB = [...playerBDeck];
    updatedB.splice(rand, 1);
    setPlayerBDeck(updatedB);
    setCenterB(bCard);
    setThrowB(true);

    // Clear
    setTimeout(() => {
      setThrowA(false);
      setThrowB(false);
      setCenterA(null);
      setCenterB(null);
    }, 2000);
  };

  return (
  <div className="h-screen w-screen bg-[#0e0f12] text-white overflow-hidden flex flex-col items-center justify-between py-10 select-none">

    {/* ---------- PLAYER B (Top) ---------- */}
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-lg tracking-wide opacity-80">PLAYER B</h2>
      <div className="relative h-32 w-[80vw] flex justify-center">
        {playerBDeck.map((_, idx) => (
          <Image
            alt="back"
            width={120}
            height={180}
            key={`B-${idx}`}
            src="/cards/back.png"
            className="w-16 absolute opacity-90"
            style={{ left: `${idx * 12}px` }}
          />
        ))}
      </div>
      <div className="text-sm opacity-50">{playerBDeck.length} cards</div>
    </div>

    {/* ---------- CENTER TABLE ---------- */}
    <div className="relative h-60 w-full flex items-center justify-center">
      <AnimatePresence>
        {centerA && (
          <motion.img
            key="A-thrown"
            src={getCardImage(centerA)}
            className="w-24 absolute"
            initial={{ y: 150, x: -50, rotate: -10, opacity: 0 }}
            animate={{
              y: throwA ? 0 : 150,
              x: throwA ? -20 : -50,
              rotate: throwA ? 12 : -10,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {centerB && (
          <motion.img
            key="B-thrown"
            src={getCardImage(centerB)}
            className="w-24 absolute"
            initial={{ y: -150, x: 50, rotate: 10, opacity: 0 }}
            animate={{
              y: throwB ? 0 : -150,
              x: throwB ? 20 : 50,
              rotate: throwB ? -10 : 10,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          />
        )}
      </AnimatePresence>
    </div>

    {/* ---------- PLAYER A (Bottom) ---------- */}
    <div className="flex flex-col items-center gap-3 pb-5">
      <h2 className="text-lg tracking-wide opacity-80">YOU</h2>

      <div className="relative h-32 w-[90vw] flex justify-center">
        {playerADeck.map((card, idx) => (
          <Image
            alt=""
            width={120}
            height={180}
            key={`A-${idx}`}
            src={getCardImage(card)}
            className="
              w-20 absolute cursor-pointer
              transition-transform duration-150
              hover:-translate-y-4 hover:scale-105
              drop-shadow-xl
            "
            style={{ left: `${idx * 20}px` }}
            onClick={() => playCard(card, idx)}
          />
        ))}
      </div>

      <div className="text-sm opacity-50">{playerADeck.length} cards</div>
    </div>
  </div>
  );
}
