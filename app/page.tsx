"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Brain } from "lucide-react";

const games = [
  {
    title: "Memory Game",
    description: "Flip cards, match pairs, and win ETH rewards.",
    route: "/memorygame",
    icon: Brain,
  },
  {
    title: "Simon Arcade",
    description: "Repeat the sequence and test your reflexes for on-chain prizes.",
    route: "/simon",
    icon: Gamepad2,
  },
    {
    title: "Snake",
    description: "Arcade Snake",
    route: "/snake",
    icon: Gamepad2,
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-col items-center text-center px-6 py-16 overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-indigo-900/40 via-black/80 to-black -z-10" />
      <div className="absolute -top-40 right-40 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 left-40 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-linear-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text mb-6">
          Bet Games 🎮
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-10">
          Play. Bet. Win. Connect your MetaMask wallet and compete in fun, on-chain games using Ether.
          Earn rewards, prove your skill, and climb the leaderboard in our Web3 arcade.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 transition"
        >
          <Link href="#games">Explore Games ↓</Link>
        </motion.div>
      </motion.section>

      {/* Games Section */}
      <section id="games" className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl">
        {games.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.route}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left text-gray-100 shadow-lg hover:border-indigo-500/50 transition"
            >
              <Icon className="w-10 h-10 mb-3 text-indigo-400" />
              <h2 className="text-2xl font-semibold mb-2">{game.title}</h2>
              <p className="text-gray-300 mb-4">{game.description}</p>
              <Link
                href={game.route}
                className="text-indigo-400 font-medium hover:text-indigo-300 transition"
              >
                Play Now →
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="mt-24 text-gray-500 text-sm">
        Built with ❤️ by <span className="text-indigo-400">Bet Games</span> team
      </footer>
    </div>
  );
}
