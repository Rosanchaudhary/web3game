"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, getCardImage } from "../utils/cards";

interface Props {
  cards: Card[];
  isTurn: boolean;
  onPlay: (i: number) => void;
}

export default function PlayerHand({ cards, isTurn, onPlay }: Props) {
  return (
    <div className="w-full  justify-center px-2">
      <div
        className={`flex justify-center relative transition-transform duration-300 ${
          isTurn ? "scale-110" : "scale-100"
        }`}
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            style={{ rotate: (i - cards.length / 2) * 5, zIndex: i }}
            whileHover={{ y: isTurn ? -12 : 0 }}
            onClick={() => onPlay(i)}
            className="
              w-12 h-20 
              sm:w-16 sm:h-24 
              md:w-20 md:h-28 
              lg:w-24 lg:h-32 
              cursor-pointer 
              -ml-6 sm:-ml-8 md:-ml-10 
              first:ml-0 
              origin-bottom
            "
          >
            <Image
              src={getCardImage(card)}
              alt={`${card.rank} of ${card.suit}`}
              width={120}
              height={180}
              className="w-full h-full object-contain rounded-lg shadow-md"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
