"use client";

import Link from "next/link";



export default function HomePage() {


  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#111] text-white">
      <h1 className="text-4xl font-bold">Welcome to the Game</h1>

      <Link
        href={"/world/game"}
        className="
          mt-8 px-6 py-3 
          bg-green-600 hover:bg-green-700 
          text-white text-lg font-semibold 
          rounded-lg transition-all
        "
      >
        Start Game
      </Link>
    </div>
  );
}
