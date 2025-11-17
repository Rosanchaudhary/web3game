//app/card/components/PlayerBack.ts

"use client";

import Image from "next/image";

interface Props {
  name: string;
  isTurn: boolean;
  count: number;
  orientation: "horizontal" | "vertical";
}

export default function PlayerBack({ name, isTurn, count, orientation }: Props) {
  return (
    <div className={`transition-transform duration-300 ${isTurn ? "scale-110" : "scale-100"}`}>
      <div className={`flex ${orientation === "horizontal" ? "flex-row" : "flex-col"} items-center justify-center`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${
              orientation === "horizontal"
                ? "w-18 h-16 -ml-12 first:ml-0"
                : "w-16 h-10 -mt-6 first:mt-0"
            }`}
          >
            <Image
              src="/cards/back.png"
              alt="back"
              width={80}
              height={120}
              className={`object-cover rounded-md shadow-md ${orientation === "vertical" ? "rotate-90" : ""}`}
            />
          </div>
        ))}
      </div>
      <p className="text-slate-200 mt-2 font-semibold text-center">{name}</p>
    </div>
  );
}
