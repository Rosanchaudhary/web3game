//app/card/components/ShuffleAnimation.ts"use client";


"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ShuffleAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    mounted && (
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                // eslint-disable-next-line react-hooks/purity
                rotate: Math.random() * 360,
                // eslint-disable-next-line react-hooks/purity
                x: Math.random() * 200 - 100,
                // eslint-disable-next-line react-hooks/purity
                y: Math.random() * 200 - 100,
                scale: 0.7,
              }}
              animate={{
                rotate: [0, 360],
                // eslint-disable-next-line react-hooks/purity
                x: [0, Math.random() * 80 - 40, 0],
                // eslint-disable-next-line react-hooks/purity
                y: [0, Math.random() * 80 - 40, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 1.1,
                delay: i * 0.04,
              }}
            >
              <Image
                src="/cards/back.png"
                alt="shuffle"
                width={80}
                height={120}
                className="rounded-md shadow-lg"
              />
            </motion.div>
          ))}

          <motion.p
            className="text-yellow-300 text-xl font-bold mt-72"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Shuffling cards...
          </motion.p>
        </motion.div>
      </AnimatePresence>
    )
  );
}
