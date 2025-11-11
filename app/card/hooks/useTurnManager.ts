import { useEffect, useState } from "react";
import { Card } from "../utils/cards";

type Player = "A" | "B" | "C" | "D";

export function useTurnManager(
  hands: Record<Player, Card[]>,
  setHands: React.Dispatch<React.SetStateAction<Record<Player, Card[]>>>,
  setCenterCards: React.Dispatch<
    React.SetStateAction<Record<Player, Card | null>>
  >
) {
  const [turn, setTurn] = useState<Player>("A");
  const [animating, setAnimating] = useState(false);

  const nextTurn = (current: Player) => {
    const order: Player[] = ["A", "B", "C", "D"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTurn(next);
  };

  const playCard = (player: Player, index?: number) => {
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

  // Auto-play for non-human turns
  useEffect(() => {
    if (turn !== "A" && hands[turn].length > 0) {
      const timer = setTimeout(() => playCard(turn), 1000);
      return () => clearTimeout(timer);
    }
  }, [turn]);

  return { turn, playCard };
}
