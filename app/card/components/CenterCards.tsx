"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Card, getCardImage } from "../utils/cards";

interface Props {
  cards: Record<string, Card | null>;
}

export default function CenterCards({ cards }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-[300px] h-[250px] relative">
      <AnimatePresence>
        {Object.entries(cards).map(([key, card]) =>
          card ? (
            <motion.div
              key={key}
              initial={{
                y: key === "A" ? 30 : key === "C" ? -50 : 0,
                x: key === "B" ? -30 : key === "D" ? 30 : 0,
                opacity: 0,
              }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute ${
                key === "A"
                  ? "bottom-6 left-1/2 -translate-x-1/2"
                  : key === "C"
                  ? "top-6 left-1/2 -translate-x-1/2"
                  : key === "B"
                  ? "left-6 top-1/2 -translate-y-1/2"
                  : "right-6 top-1/2 -translate-y-1/2"
              }`}
            >
              <Image
                src={getCardImage(card)}
                alt={key}
                width={90}
                height={130}
                className="
                  rounded-lg shadow-lg
                  w-16 h-24       
                  sm:w-20 sm:h-28 
                  md:w-24 md:h-32 
                  lg:w-28 lg:h-36
                  object-contain
                "
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
