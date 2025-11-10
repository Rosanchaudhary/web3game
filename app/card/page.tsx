"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
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

interface Card {
  suit: Suit;
  rank: Rank;
}

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
  const [hands, setHands] = useState<Record<string, Card[]>>({
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const [centerCards, setCenterCards] = useState<Record<string, Card | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });
  const [turn, setTurn] = useState<"A" | "B" | "C" | "D">("A");
  const [animating, setAnimating] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [shuffling, setShuffling] = useState(true);
  const [dealingCards, setDealingCards] = useState<
    { id: number; player: "A" | "B" | "C" | "D" }[]
  >([]);

  const [completedCards, setCompletedCards] = useState<number[]>([]);
  const [dealingDone, setDealingDone] = useState(false);

  const handleCardAnimationComplete = (id: number) => {
    setCompletedCards((prev) => {
      const updated = [...prev, id];
      if (updated.length === dealingCards.length) {
        setDealingDone(true); // only now all cards finished
      }
      return updated;
    });
  };

  // Start shuffle then deal
  useEffect(() => {
    const d = createDeck();
    setDeck(d);
    setShuffling(true);

    const timer = setTimeout(() => {
      const shuffled = [...d].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setShuffling(false);
      startDealing(shuffled);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Animate dealing sequence
  const startDealing = (deck: Card[]) => {
    const playerOrder: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    let index = 0;
    const handsProgress = { A: [], B: [], C: [], D: [] } as Record<
      "A" | "B" | "C" | "D",
      Card[]
    >;

    const interval = setInterval(() => {
      const player = playerOrder[index % 4];
      const card = deck[index];
      if (!card) return;

      // Animate card flying
      setDealingCards((prev) => [
        ...prev,
        { id: index, player: player as "A" | "B" | "C" | "D" },
      ]);

      // Actually add to hand after short delay
      setTimeout(() => {
        handsProgress[player].push(card);
        setHands({ ...handsProgress });
        setDealingCards((prev) => prev.filter((c) => c.id !== index));
      }, 600);

      index++;
      if (index >= deck.length) clearInterval(interval);
    }, 120);
  };

  // Normal turn sequence
  useEffect(() => {
    if (turn !== "A" && hands[turn].length > 0) {
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
      chosen = newHands[player].splice(
        Math.floor(Math.random() * newHands[player].length),
        1
      )[0];
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

  // Clear center after all 4 have played
  useEffect(() => {
    if (Object.values(centerCards).every(Boolean)) {
      const timer = setTimeout(() => {
        setCenterCards({ A: null, B: null, C: null, D: null });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [centerCards]);

  // Helper: coordinates for each player
  const playerPositions = {
    A: { x: 0, y: 250 },
    B: { x: -350, y: 0 },
    C: { x: 0, y: -250 },
    D: { x: 350, y: 0 },
  };

  return (
    <div
      className="min-h-screen flex flex-col text-white p-2 sm:p-4 gap-4 sm:gap-8 overflow-hidden relative
             bg-[url('/table/table.jpg')] bg-cover bg-center bg-no-repeat"
    >
      <h1 className="text-3xl font-bold text-yellow-400 text-center z-10">
        🃏 4 Player Flex Layout
      </h1>

      {/* Shuffle animation */}
      <AnimatePresence>
        {shuffling && (
          <motion.div
            key="shuffle"
            className="absolute inset-0 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  rotate: Math.random() * 360,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100,
                  scale: 0.7,
                }}
                animate={{
                  rotate: [0, 360],
                  x: [0, Math.random() * 80 - 40, 0],
                  y: [0, Math.random() * 80 - 40, 0],
                  transition: {
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 1.1,
                    delay: i * 0.04,
                  },
                }}
              >
                <Image
                  src="/cards/back.png"
                  alt="shuffle"
                  width={80}
                  height={120}
                  className="rounded-md shadow-lg"
                />
              </motion.div>
            ))}
            <motion.p
              className="text-yellow-300 text-xl font-bold mt-72"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Shuffling cards...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dealing animation */}
      {!dealingDone && (
        <AnimatePresence>
          {dealingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: playerPositions[card.player].x,
                y: playerPositions[card.player].y,
                rotate: Math.random() * 60 - 30,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onAnimationComplete={() => handleCardAnimationComplete(card.id)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <Image
                src="/cards/back.png"
                alt="deal"
                width={80}
                height={120}
                className="rounded-md shadow-lg"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Top player (C) */}
      <div className="flex justify-center">
        {dealingDone && (
          <PlayerBack
            name="C"
            isTurn={turn === "C"}
            cardCount={hands.C.length}
            orientation="horizontal"
          />
        )}
      </div>

      {/* Center area */}
      <div className="flex justify-between items-center flex-1 px-16">
        {dealingDone && (
          <PlayerBack
            name="B"
            isTurn={turn === "B"}
            cardCount={hands.B.length}
            orientation="vertical"
          />
        )}

        {/* Center cards */}
        <div className="flex flex-col items-center justify-center w-[300px] h-[250px]  relative">
          <AnimatePresence>
            {Object.entries(centerCards).map(([key, card]) =>
              card ? (
                <motion.div
                  key={key}
                  initial={{
                    y: key === "A" ? 30 : key === "C" ? -50 : 0,
                    x: key === "B" ? -30 : key === "D" ? 30 : 0,
                    opacity: 0,
                  }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute ${
                    key === "A"
                      ? "bottom-6 left-1/2 -translate-x-1/2"
                      : key === "C"
                      ? "top-6 left-1/2 -translate-x-1/2"
                      : key === "B"
                      ? "left-6 top-1/2 -translate-y-1/2"
                      : "right-6 top-1/2 -translate-y-1/2"
                  }`}
                >
                  <Image
                    src={getCardImage(card)}
                    alt={key}
                    width={90}
                    height={130}
                    className="rounded-lg shadow-lg"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {dealingDone && (
          <PlayerBack
            name="D"
            isTurn={turn === "D"}
            cardCount={hands.D.length}
            orientation="vertical"
          />
        )}
      </div>

      {/* Bottom player (A) */}
      <div
        className={`transition-transform duration-300 ${
          turn === "A" ? "scale-110" : "scale-100"
        }`}
      >
        {dealingDone && (
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
        )}
      </div>

      <p className="text-center text-lg text-slate-300">
        🔁 Current Turn:{" "}
        <span className="text-yellow-300 font-semibold">{turn}</span>
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
              orientation === "horizontal"
                ? "w-18 h-16 -ml-12 first:ml-0"
                : "w-16 h-10 -mt-6 first:mt-0"
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
