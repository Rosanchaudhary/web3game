import { useEffect, useState } from "react";
import { Card } from "../utils/cards";

type Player = "A" | "B" | "C" | "D";

export function useCenterCards() {
  const [centerCards, setCenterCards] = useState<Record<Player, Card | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });

  useEffect(() => {
    if (Object.values(centerCards).every(Boolean)) {
      const timer = setTimeout(() => {
        setCenterCards({ A: null, B: null, C: null, D: null });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [centerCards]);

  return { centerCards, setCenterCards };
}
