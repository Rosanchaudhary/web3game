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


// Convert { suit: "♠", rank: "A" } → "A♠" → backend format "AS"
export function encodeCard(card: Card): string {
    const suitMap: Record<Suit, string> = {
        "♠": "S",
        "♥": "H",
        "♦": "D",
        "♣": "C",
    };
    return `${card.rank}${suitMap[card.suit]}`;
}


// ------------- PLAY A CARD -------------
export const playCard = async (card: Card, roomId: string, turn: string | null, userId: string) => {
    if (turn !== userId) return;
    const encodedCard = encodeCard(card);
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/twocard/play-card`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId, userId, card: encodedCard }),
    });
};
