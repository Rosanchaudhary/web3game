// lib/pokerLogic.ts

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

export interface HandEvaluation {
  rank: number; // 1 = Royal Flush ... 10 = High Card
  values: number[];
}

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = [
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
  "A",
];

// Value helper
export const getValue = (rank: Rank): number => {
  switch (rank) {
    case "A":
      return 14; // Ace high
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return 11;
    default:
      return parseInt(rank);
  }
};

// Create deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Shuffle deck
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Deal hands
export function dealHands(deck: Card[], cardsPerPlayer = 5) {
  const playerHand = deck.slice(0, cardsPerPlayer);
  const computerHand = deck.slice(cardsPerPlayer, cardsPerPlayer * 2);
  const remainingDeck = deck.slice(cardsPerPlayer * 2);
  return { playerHand, computerHand, remainingDeck };
}

// Evaluate poker hand
export function evaluateHand(hand: Card[]): HandEvaluation {
  const values = hand.map((c) => getValue(c.rank)).sort((a, b) => a - b);
  const suitsSet = new Set(hand.map((c) => c.suit));

  const isFlush = suitsSet.size === 1;
  const isStraight =
    values.every((v, i) => i === 0 || v - values[i - 1] === 1) ||
    JSON.stringify(values) === JSON.stringify([2, 3, 4, 5, 14]); // A-2-3-4-5

  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.values(counts).sort((a, b) => b - a);

  let rank = 10;
  if (isStraight && isFlush && values[4] === 14) rank = 1; // Royal Flush
  else if (isStraight && isFlush) rank = 2; // Straight Flush
  else if (groups[0] === 4) rank = 3;
  else if (groups[0] === 3 && groups[1] === 2) rank = 4;
  else if (isFlush) rank = 5;
  else if (isStraight) rank = 6;
  else if (groups[0] === 3) rank = 7;
  else if (groups[0] === 2 && groups[1] === 2) rank = 8;
  else if (groups[0] === 2) rank = 9;

  return { rank, values: values.reverse() };
}

// Compare two hands
export function compareHands(handA: Card[], handB: Card[]): string {
  const a = evaluateHand(handA);
  const b = evaluateHand(handB);

  if (a.rank < b.rank) return "Player wins";
  if (a.rank > b.rank) return "Computer wins";

  for (let i = 0; i < 5; i++) {
    if (a.values[i] > b.values[i]) return "Player wins";
    if (a.values[i] < b.values[i]) return "Computer wins";
  }
  return "It's a tie!";
}

// Card image helper (your version)
export const getCardImage = (card: Card | null): string => {
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

  const fileName = `${rankNames[card.rank]}_of_${suitNames[card.suit]}.png`;
  return `/cards/${fileName}`;
};



export function getHandRankName(rank: number): string {
  const rankNames: Record<number, string> = {
    1: "Royal Flush",
    2: "Straight Flush",
    3: "Four of a Kind",
    4: "Full House",
    5: "Flush",
    6: "Straight",
    7: "Three of a Kind",
    8: "Two Pair",
    9: "One Pair",
    10: "High Card",
  };
  return rankNames[rank] || "Unknown";
}
