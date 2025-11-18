//app/twocard/[id]/page.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";

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

export function parseCard(code: string): Card {
  const suitKey = code.slice(-1); // S, H, D, C
  const rank = code.slice(0, -1) as Rank;

  const suitMap: Record<string, Suit> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return {
    rank,
    suit: suitMap[suitKey],
  };
}

export function getCardImage(card: Card | string | null): string {
  if (!card) return "/cards/back.png";

  // If backend string format ("AS")
  if (typeof card === "string") {
    card = parseCard(card);
  }

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
}

// --------------------------------------------------

export default function TwoPlayerOverlappedPlay() {
  const socketRef = useRef<Socket | null>(null);
  const { id: roomId } = useParams<{ id: string }>();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") ?? "" : "";

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
    //setPlayerADeck(deck.slice(0, half));
    setPlayerBDeck(deck.slice(half));
  }, []);

  async function playGame(card: Card) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.warn("No token found");
      return;
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/twocard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId: "1234", card }),
    });
  }

  // ---------- PLAY CARD ----------
  const playCard = (card: Card, index: number) => {
    if (centerA || centerB) return;

    // Player A plays
    const updatedA = [...playerADeck];
    updatedA.splice(index, 1);
    setPlayerADeck(updatedA);
    setCenterA(card);
    setThrowA(true);
    playGame(card);
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

  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join-room", { roomId, userId });

    socket.on("game-started", (data) => {
      console.log("Game started:", data);
    });
    socket.on("your-hand", (cards: string[]) => {
      // Convert "AH" to your Card format if needed
    //   const mapped = cards.map((c) => ({
    //     rank: c.slice(0, -1),
    //     suit: c.slice(-1),
    //   }));
    //   console.log(mapped);

    //   setPlayerADeck(mapped);

      const parsed = cards.map(parseCard);
      setPlayerADeck(parsed);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0e0f12] text-white overflow-hidden flex flex-col items-center justify-between py-6 sm:py-10 select-none">
      {/* ---------- PLAYER B (Top) ---------- */}
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <h2 className="text-base sm:text-lg tracking-wide opacity-80">
          PLAYER B
        </h2>

        <div className="flex justify-center w-full">
          <div className="flex justify-center items-start gap-0">
            {playerBDeck.map((_, idx) => (
              <div
                key={idx}
                className="
            -mr-6 sm:-mr-10 
            last:mr-0
          "
              >
                <Image
                  alt="back"
                  width={120}
                  height={180}
                  src="/cards/back.png"
                  className="w-12 sm:w-16 opacity-90 drop-shadow-xl"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs sm:text-sm opacity-50">
          {playerBDeck.length} cards
        </div>
      </div>

      {/* ---------- CENTER TABLE ---------- */}
      <div className="relative h-40 sm:h-60 w-full flex items-center justify-center">
        <AnimatePresence>
          {centerA && (
            <motion.img
              key="A-thrown"
              src={getCardImage(centerA)}
              className="absolute w-20 sm:w-24"
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
              className="absolute w-20 sm:w-24"
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
      <div className="flex flex-col items-center gap-2 sm:gap-3 pb-4">
        <h2 className="text-base sm:text-lg tracking-wide opacity-80">YOU</h2>

        <div className="flex justify-center w-full">
          <div className="flex justify-center items-end gap-0">
            {playerADeck.map((card, idx) => (
              <div
                key={idx}
                className="
            -ml-8 sm:-ml-12 
            first:ml-0
            transition-transform duration-150
            hover:-translate-y-3 sm:hover:-translate-y-4
            hover:scale-105
          "
              >
                <Image
                  alt=""
                  width={120}
                  height={180}
                  src={getCardImage(card)}
                  className="w-16 sm:w-20 drop-shadow-xl cursor-pointer"
                  onClick={() => playCard(card, idx)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs sm:text-sm opacity-50">
          {playerADeck.length} cards
        </div>
      </div>
    </div>
  );
}
