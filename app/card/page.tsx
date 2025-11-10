"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: Suit;
  rank: Rank;
}

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of suits) for (const rank of ranks) deck.push({ suit, rank });
  return deck.sort(() => Math.random() - 0.5);
};

const getCardImage = (card: Card | null): string => {
  if (!card) return "/cards/back.png";
  const suitNames: Record<Suit, string> = {
    "♠": "spades",
    "♥": "hearts",
    "♦": "diamonds",
    "♣": "clubs",
  };
  const rankNames: Record<Rank, string> = {
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
  return `/cards/${rankNames[card.rank]}_of_${suitNames[card.suit]}.png`;
};

export default function FourPlayerFlexUI() {
  const [hands, setHands] = useState<Record<string, Card[]>>({ A: [], B: [], C: [], D: [] });
  const [centerCards, setCenterCards] = useState<Record<string, Card | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });
  const [turn, setTurn] = useState<"A" | "B" | "C" | "D">("A");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const deck = createDeck();
    setHands({
      A: deck.slice(0, 13),
      B: deck.slice(13, 26),
      C: deck.slice(26, 39),
      D: deck.slice(39, 52),
    });
  }, []);

  useEffect(() => {
    if (turn !== "A" && hands[turn].length > 0) {
      // eslint-disable-next-line react-hooks/immutability
      const timer = setTimeout(() => playCard(turn), 1000);
      return () => clearTimeout(timer);
    }
  }, [turn]);

  const nextTurn = (current: "A" | "B" | "C" | "D") => {
    const order: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTurn(next);
  };

  const playCard = (player: "A" | "B" | "C" | "D", index?: number) => {
    if (animating) return;
    const newHands = { ...hands };
    let chosen: Card | undefined;

    if (player === "A" && index !== undefined) {
      chosen = newHands[player].splice(index, 1)[0];
    } else {
      chosen = newHands[player].splice(Math.floor(Math.random() * newHands[player].length), 1)[0];
    }

    if (!chosen) return;
    setHands(newHands);
    setCenterCards((prev) => ({ ...prev, [player]: chosen }));
    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      nextTurn(player);
    }, 800);
  };

  //  clear center after all 4 have played
  useEffect(() => {
    if (Object.values(centerCards).every(Boolean)) {
      const timer = setTimeout(() => {
        setCenterCards({ A: null, B: null, C: null, D: null });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [centerCards]);

  return (
   <div   className="min-h-screen flex flex-col text-white p-2 sm:p-4 gap-4 sm:gap-8 overflow-hidden
             bg-[url('/table/table.jpg')] bg-cover bg-center bg-no-repeat">

      <h1 className="text-3xl font-bold text-yellow-400 text-center">🃏 4 Player Flex Layout</h1>

      {/* Top player (C) */}
      <div className="flex justify-center">
        <PlayerBack name="C" isTurn={turn === "C"} cardCount={hands.C.length} orientation="horizontal" />
      </div>

      {/* Center area */}
      <div className="flex justify-between items-center flex-1 px-16">
        <PlayerBack name="B" isTurn={turn === "B"} cardCount={hands.B.length} orientation="vertical" />

        {/* Center Cards */}
        <div className="flex flex-col items-center justify-center w-[300px] h-[250px] bg-green-800 rounded-xl shadow-inner relative">
          <AnimatePresence>
            {centerCards.C && (
              <motion.div
                key="C"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 left-1/2 -translate-x-1/2" 
              >
                <Image
                  src={getCardImage(centerCards.C)}
                  alt="C"
                  width={90}
                  height={130}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
            )}
            {centerCards.B && (
              <motion.div
                key="B"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-6 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={getCardImage(centerCards.B)}
                  alt="B"
                  width={90}
                  height={130}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
            )}
            {centerCards.A && (
              <motion.div
                key="A"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2"
              >
                <Image
                  src={getCardImage(centerCards.A)}
                  alt="A"
                  width={90}
                  height={130}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
            )}
            {centerCards.D && (
              <motion.div
                key="D"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-6 top-1/2 -translate-y-1/2"
              >
                <Image
                  src={getCardImage(centerCards.D)}
                  alt="D"
                  width={90}
                  height={130}
                  className="rounded-lg shadow-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PlayerBack name="D" isTurn={turn === "D"} cardCount={hands.D.length} orientation="vertical" />
      </div>

      {/* Bottom player (A) */}
      <div
    className={`transition-transform duration-300 ${
      turn === "A" ? "scale-110" : "scale-100"
    }`}
      >
        <div className="flex justify-center">
          {hands.A.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: turn === "A" ? -10 : 0 }}
              onClick={() => playCard("A", i)}
              className="w-16 h-24 cursor-pointer -ml-8 first:ml-0"
            >
              <Image
                src={getCardImage(card)}
                alt={`${card.rank} of ${card.suit}`}
                width={120}
                height={180}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-center text-lg text-slate-300">
        🔁 Current Turn: <span className="text-yellow-300 font-semibold">{turn}</span>
      </p>
    </div>
  );
}

function PlayerBack({
  name,
  isTurn,
  cardCount,
  orientation,
}: {
  name: string;
  isTurn: boolean;
  cardCount: number;
  orientation: "horizontal" | "vertical";
}) {
  const cards = Array.from({ length: cardCount });
  return (
    <div
     className={`transition-transform duration-300 ${
      isTurn ? "scale-110" : "scale-100"
    }`}
    >
      <div
        className={`flex ${
          orientation === "horizontal" ? "flex-row" : "flex-col"
        } items-center justify-center`}
      >
        {cards.map((_, i) => (
          <div
            key={i}
            className={`${
              orientation === "horizontal" ? "w-18 h-16 -ml-12 first:ml-0" : "w-16 h-10 -mt-6 first:mt-0"
            }`}
          >
            <Image
              src="/cards/back.png"
              alt="back"
              width={80}
              height={120}
              className={`object-cover rounded-md shadow-md ${
                orientation === "vertical" ? "rotate-90" : ""
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-slate-200 mt-2 font-semibold">{name}</p>
    </div>
  );
}
