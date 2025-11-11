import { useEffect, useState } from "react";
import { Card, createDeck } from "../utils/cards";

export function useDeck(startDealing: (deck: Card[]) => void) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [shuffling, setShuffling] = useState(true);

  useEffect(() => {
    const d = createDeck();
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return { deck, shuffling };
}
