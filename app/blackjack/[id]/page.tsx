"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getCookie } from "@/utils/getCookie";
import { useRouter } from "next/navigation";

type Card = { suit: string; rank: string };

export default function BlackjackGamePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<"playing" | "finished">("playing");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startNewGame = async () => {
    setLoading(true);
    const token = getCookie("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blackjack/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setLoading(false);

    router.push(`/blackjack/${data.gameId}`);
  };

  const fetchGame = async () => {
    const token = getCookie("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blackjack/${id}/get`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();

    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setPlayerTotal(data.playerTotal);
    setDealerTotal(data.dealerTotal);
    setStatus(data.status);
    setResult(data.result);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGame();
  }, [id]);

  const hit = async () => {
    const token = getCookie("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackjack/${id}/hit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    fetchGame();
  };

  const stand = async () => {
    const token = getCookie("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blackjack/${id}/stand`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    fetchGame();
  };

  const CardView = ({ card }: { card: Card }) => (
    <motion.div
      className="w-24 h-36 bg-white text-black rounded-xl flex flex-col items-center justify-center shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-3xl">{card.rank}</span>
      <span className="text-xl mt-1">{card.suit}</span>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6">🃏 Blackjack</h1>

      {/* Dealer */}
      <h2 className="text-xl mb-2">Dealer</h2>
      <div className="flex gap-4 mb-4">
        {dealerHand.map((card, i) =>
          status === "playing" && i === 0 ? (
            <div
              key={i}
              className="w-24 h-36 bg-gray-700 rounded-xl flex items-center justify-center text-3xl"
            >
              ❓
            </div>
          ) : (
            <CardView key={i} card={card} />
          )
        )}
      </div>

      {dealerTotal !== null && (
        <p className="mb-4">Dealer Total: {dealerTotal}</p>
      )}

      {/* Player */}
      <h2 className="text-xl mb-2">You</h2>
      <div className="flex gap-4 mb-4">
        {playerHand.map((card, i) => (
          <CardView key={i} card={card} />
        ))}
      </div>

      <p className="mb-6">Your Total: {playerTotal}</p>

      {status === "playing" && (
        <div className="flex gap-6 mb-6">
          <button onClick={hit} className="px-6 py-3 bg-green-600 rounded-lg">
            ✋ Hit
          </button>
          <button onClick={stand} className="px-6 py-3 bg-blue-600 rounded-lg">
            🛑 Stand
          </button>
        </div>
      )}

      {status === "finished" && (
        <div className="flex flex-col items-center gap-6 mt-6">
          <p className="text-2xl">
            {result === "player" && "🔥 You Win!"}
            {result === "dealer" && "❌ Dealer Wins"}
            {result === "push" && "🤝 Push"}
          </p>

          <button
            onClick={startNewGame}
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 rounded-xl text-lg hover:bg-indigo-500"
          >
            {loading ? "Starting..." : "New Game"}
          </button>
        </div>
      )}
    </div>
  );
}
