"use client";

import { useEffect, useState } from "react";
import PlayerHand from "./components/PlayerHand";
import PlayerBack from "./components/PlayerBack";
import CenterCards from "./components/CenterCards";
import ShuffleAnimation from "./components/ShuffleAnimation";
import { Card, createDeck } from "./utils/cards";
import DealingAnimation from "./components/DealingAnimation";

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

  return (
    <div
      className="min-h-screen flex flex-col text-white p-2 sm:p-4 gap-4 sm:gap-8 overflow-hidden relative
             bg-[url('/table/table.jpg')] bg-cover bg-center bg-no-repeat"
    >
      <h1 className="text-3xl font-bold text-yellow-400 text-center z-10">
        🃏 4 Player Flex Layout
      </h1>

      {/* Shuffle animation */}
      {shuffling && <ShuffleAnimation />}

      {/* Dealing animation */}
      {!dealingDone && (
        <DealingAnimation
          dealingCards={dealingCards}
          onComplete={handleCardAnimationComplete}
        />
      )}

      {/* Top player (C) */}
      <div className="flex justify-center">
        {dealingDone && (
          <PlayerBack
            name="C"
            isTurn={turn === "C"}
            count={hands.C.length}
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
            count={hands.B.length}
            orientation="vertical"
          />
        )}

        {/* Center cards */}
        <CenterCards cards={centerCards} />

        {dealingDone && (
          <PlayerBack
            name="D"
            isTurn={turn === "D"}
            count={hands.D.length}
            orientation="vertical"
          />
        )}
      </div>

      {/* Bottom Player */}
      {dealingDone && (
        <PlayerHand
          cards={hands.A}
          isTurn={turn === "A"}
          onPlay={(i) => playCard("A", i)}
        />
      )}

      <p className="text-center text-lg text-slate-300">
        🔁 Current Turn:{" "}
        <span className="text-yellow-300 font-semibold">{turn}</span>
      </p>
    </div>
  );
}
