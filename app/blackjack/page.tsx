"use client";

import { getCookie } from "@/utils/getCookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BlackjackStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
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

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-8">🃏 Blackjack</h1>

      <button
        onClick={startGame}
        disabled={loading}
        className="px-8 py-4 bg-indigo-600 rounded-xl text-xl disabled:opacity-50"
      >
        {loading ? "Starting..." : "Start Game"}
      </button>
    </div>
  );
}

