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
  const [playerACount, setPlayerACount] = useState(0);
  const [playerBCount, setPlayerBCount] = useState(0);
  const [turn, setTurn] = useState<string | null>(null);

  const [centerA, setCenterA] = useState<Card | null>(null);
  const [centerB, setCenterB] = useState<Card | null>(null);

  const [throwA, setThrowA] = useState(false);
  const [throwB, setThrowB] = useState(false);

  // Convert { suit: "♠", rank: "A" } → "A♠" → backend format "AS"
  function encodeCard(card: Card): string {
    const suitMap: Record<Suit, string> = {
      "♠": "S",
      "♥": "H",
      "♦": "D",
      "♣": "C",
    };
    return `${card.rank}${suitMap[card.suit]}`;
  }

  // ------------- PLAY A CARD -------------
  const playCard = (card: Card) => {
    if (turn !== userId) return;
    const encodedCard = encodeCard(card);
    socketRef.current?.emit("play-card", {
      roomId,
      userId,
      card: encodedCard,
    });
  };

  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join-room", { roomId, userId });

    socket.on("game-started", (data) => {
      const opponentId = data.players.find((p: string) => p !== userId);
      if (!opponentId) return;

      setTurn(data.turn);

      // initial opponent card count
      const oppCount = data.counts?.[opponentId] ?? 23;
      setPlayerBCount(oppCount);
    });

    // When any card is played
    socket.on("card-played", ({ userId: who, card }) => {
      const parsed = typeof card === "string" ? parseCard(card) : card;

      if (who === userId) {
        // PLAYER A played a card → remove from hand
        setPlayerADeck((prev) =>
          prev.filter(
            (c) => !(c.rank === parsed.rank && c.suit === parsed.suit)
          )
        );

        setThrowA(true);
        setCenterA(parsed);
      } else {
        // PLAYER B played a card → reduce count
        setPlayerBCount((prev) => Math.max(prev - 1, 0));

        setThrowB(true);
        setCenterB(parsed);
      }
    });

    socket.on("your-hand", (cards: string[]) => {
      const parsed = cards.map(parseCard);
      setPlayerADeck(parsed);
    });
    // Turn swap
    socket.on("turn-updated", ({ turn }) => {
      console.log("Setting player turn", turn);
      setTurn(turn);
    });

    // Turn swap
    socket.on("card-count-updated", ({ userId: who, count }) => {
      if (who === userId) {
        setPlayerACount(count);
      } else {
        // PLAYER B played a card → reduce count
        setPlayerBCount(count);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId]);

  // Cleanup after both players have thrown
  useEffect(() => {
    if (throwA && throwB) {
      const t = setTimeout(() => {
        setThrowA(false);
        setThrowB(false);
        setCenterA(null);
        setCenterB(null);
      }, 2000);

      return () => clearTimeout(t);
    }
  }, [throwA, throwB]);

  return (
    <div className="h-screen w-screen bg-[#0e0f12] text-white overflow-hidden flex flex-col items-center justify-between py-6 sm:py-10 select-none">
      {/* ---------- PLAYER B (Top) ---------- */}
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <h2 className="text-base sm:text-lg tracking-wide opacity-80">
          PLAYER B
        </h2>

        <div className="flex justify-center w-full">
          <div className="flex justify-center items-start gap-0">
            {Array.from({ length: playerBCount }).map((_, idx) => (
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
          {playerBCount} cards
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
                  onClick={() => playCard(card)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs sm:text-sm opacity-50">
          {playerACount} cards
        </div>
      </div>
    </div>
  );
}
