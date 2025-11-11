export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = [
  "A","2","3","4","5","6","7","8","9","10","J","Q","K",
];

export const createDeck = (): Card[] =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));

export const getCardImage = (card: Card | null): string => {
  if (!card) return "/cards/back.png";

  const suits: Record<Suit, string> = {
    "♠": "spades",
    "♥": "hearts",
    "♦": "diamonds",
    "♣": "clubs",
  };

  const ranks: Record<Rank, string> = {
    A: "ace", J: "jack", Q: "queen", K: "king",
    "10": "10","9": "9","8": "8","7": "7","6": "6","5": "5","4": "4","3": "3","2": "2",
  };

  return `/cards/${ranks[card.rank]}_of_${suits[card.suit]}.png`;
};
