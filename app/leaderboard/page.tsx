"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface UserRef {
  _id: string;
  walletAddress: string;
}

export interface Score {
  _id: string;
  userId: UserRef; // populated user reference
  turns: number;
  timestamp: string; // ISO timestamp string
}

export default function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        setScores(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>

      <ul className="space-y-3 max-w-md mx-auto">
        {scores.length === 0 && (
          <p className="text-gray-400">No scores yet — be the first to play!</p>
        )}
        {scores.map((s, i) => (
          <li
            key={i}
            className="flex justify-between bg-gray-800 px-4 py-2 rounded-lg"
          >
            <span>
              {i + 1}. {s.userId?.walletAddress?.slice(0, 6)}...
              {s.userId?.walletAddress?.slice(-4)}
            </span>
            <span>{s.turns} turns</span>
          </li>
        ))}
      </ul>

      <Link
        href="/"
        className="block text-center mt-8 underline text-blue-400 hover:text-blue-300"
      >
        ← Back to Game
      </Link>
    </main>
  );
}
