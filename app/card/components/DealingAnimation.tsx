"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PLAYER_POSITIONS } from "../utils/positions";

type DealingCard = { id: number; player: "A" | "B" | "C" | "D" };

interface DealingAnimationProps {
  dealingCards: DealingCard[];
  onComplete: (id: number) => void;
}



export default function DealingAnimation({ dealingCards, onComplete }: DealingAnimationProps) {
  return (
        <AnimatePresence>
          {dealingCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: PLAYER_POSITIONS[card.player].x,
                y: PLAYER_POSITIONS[card.player].y,
                // eslint-disable-next-line react-hooks/purity
                rotate: Math.random() * 60 - 30,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onAnimationComplete={() => onComplete(card.id)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <Image
                src="/cards/back.png"
                alt="deal"
                width={80}
                height={120}
                className="rounded-md shadow-lg"
              />
            </motion.div>
          ))}
        </AnimatePresence>
  );
}
