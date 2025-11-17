//app/card/hooks/useDealing.ts
import {  useState } from "react";
import { Card } from "../utils/cards";

type Player = "A" | "B" | "C" | "D";

export function useDealing() {
  const [hands, setHands] = useState<Record<Player, Card[]>>({
    A: [],
    B: [],
    C: [],
    D: [],
  });
  const [dealingCards, setDealingCards] = useState<
    { id: number; player: Player }[]
  >([]);
  const [completedCards, setCompletedCards] = useState<number[]>([]);
  const [dealingDone, setDealingDone] = useState(false);

  const startDealing = (deck: Card[]) => {
    const players: Player[] = ["A", "B", "C", "D"];
    const handsProgress = { A: [], B: [], C: [], D: [] } as Record<
      Player,
      Card[]
    >;
    let index = 0;

    const interval = setInterval(() => {
      const player = players[index % 4];
      const card = deck[index];
      if (!card) return;

      setDealingCards((prev) => [...prev, { id: index, player }]);

      setTimeout(() => {
        handsProgress[player].push(card);
        setHands({ ...handsProgress });
        setDealingCards((prev) => prev.filter((c) => c.id !== index));
      }, 600);

      index++;
      if (index >= deck.length) clearInterval(interval);
    }, 120);
  };

  const handleCardAnimationComplete = (id: number) => {
    setCompletedCards((prev) => {
      const updated = [...prev, id];
      if (updated.length === dealingCards.length) {
        setDealingDone(true);
      }
      return updated;
    });
  };

  return {
    hands,
    setHands,
    dealingCards,
    dealingDone,
    startDealing,
    handleCardAnimationComplete,
  };
}
