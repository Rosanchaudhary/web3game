//app/twocard/[id]/page.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { Card, encodeCard, getCardImage, parseCard } from "../utils";

type PlayerState = {
  count: number;
  center: Card | null;
  throw: boolean;
  name: string;
  ready: boolean;
};

export default function TwoPlayerOverlappedPlay() {
  const socketRef = useRef<Socket | null>(null);
  const { id: roomId } = useParams<{ id: string }>();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") ?? "" : "";

  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [playerADeck, setPlayerADeck] = useState<Card[]>([]);
  const [turn, setTurn] = useState<string>("");

  const updatePlayer = (userId: string, data: Partial<PlayerState>) => {
    setPlayers((prev) => ({
      ...prev,
      [userId]: {
        // if player doesn't exist yet, initialize them
        count: prev[userId]?.count ?? 0,
        center: prev[userId]?.center ?? null,
        throw: prev[userId]?.throw ?? false,
        name: prev[userId]?.name ?? "",
        ready: prev[userId]?.ready ?? false,
        ...data,
      },
    }));
  };

  const { me, others } = useMemo(() => {
    const me = players[userId];
    const others = Object.entries(players)
      .filter(([id]) => id !== userId)
      .map(([id, p]) => ({ id, ...p }));

    return { me, others };
  }, [players, userId]);

  // ------------- PLAY A CARD -------------
  const playCard = async (
    card: Card,
    roomId: string,
    userId: string,
    index: number
  ) => {
    if (turn !== userId) return;
    setPlayerADeck((prev) => prev.filter((_, i) => i !== index));
    const encodedCard = encodeCard(card);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/twocard/play-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId, userId, card: encodedCard }),
    });
  };

  // ------------- PLAY A CARD -------------
  const readyButton = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/twocard/ready`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomId }),
    });
  };

  useEffect(() => {
    const socket: Socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join-room", { roomId, userId });

    socket.on("player-update", (data) => {
      console.log(data);
      setTurn(data.turn);
      Object.entries(
        data.playerState as Record<string, Partial<PlayerState>>
      ).forEach(([userId, player]) => {
        updatePlayer(userId, player);
      });
    });

    socket.on("your-hand", (cards: string[]) => {
      const parsed = cards.map(parseCard);
      setPlayerADeck(parsed);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId]);

  return (
    <div className="h-screen w-screen flex flex-row-reverse sm:flex-col justify-between items-center overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full w-[150px] sm:h-[200px] sm:w-full">
        <div className=" w-[500%] h-[100px] sm:h-full sm:w-full flex flex-col items-center justify-center rotate-90 sm:rotate-0">
          <h2 className="text-base sm:text-lg tracking-wide opacity-80">
            {others.length > 0 ? others[0].name : "Waiting"}
          </h2>

          {/* CONDITION: Opponent not ready */}
          {others.length > 0 && others[0].ready === false ? (
            <div className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md opacity-70">
              Not ready
            </div>
          ) : (
            <>
              {/* OPPONENT CARDS */}
              <div className="flex justify-center w-full">
                <div className="flex justify-center items-start gap-0">
                  {Array.from({
                    length: others.length > 0 ? others[0].count : 0,
                  }).map((_, idx) => (
                    <div
                      key={idx}
                      className="-mr-2 sm:-mr-16 last:mr-0"
                    >
                      <Image
                        alt="back"
                        width={120}
                        height={180}
                        src="/cards/back.png"
                        className="w-18 sm:w-24 h-14 sm:h-26 opacity-90 drop-shadow-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className=" h-full w-full sm:w-full flex items-center justify-center ">
        <div className=" relative w-full h-[25%] sm:h-full sm:w-full rotate-90 sm:rotate-0 flex items-center justify-center">
          <AnimatePresence>
            {others.length > 0 && others[0].center && (
              <motion.img
                key="A-thrown"
                src={getCardImage(others[0].center)}
                className="absolute w-12 sm:w-24"
                // initial={{ y: 150, x: -50, rotate: -10, opacity: 0 }}
                initial={{ y: -150, x: 50, rotate: 10, opacity: 0 }}
                animate={{
                  y: others[0].throw ? 0 : -150,
                  x: others[0].throw ? 20 : 50,
                  rotate: others[0].throw ? 12 : 10,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {me && me.center && (
              <motion.img
                key="B-thrown"
                src={getCardImage(me.center)}
                className="absolute w-12 sm:w-24"
                initial={{ y: 150, x: -50, rotate: -10, opacity: 0 }}
                // initial={{ y: -150, x: 50, rotate: 10, opacity: 0 }}
                animate={{
                  y: me.throw ? 0 : 150,
                  x: me.throw ? -20 : -50,
                  rotate: me.throw ? 12 : -10,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full w-[150px] sm:h-[200px] sm:w-full">
        <div className=" w-[500%] h-[100px] sm:h-full sm:w-full flex flex-col items-center justify-center rotate-90 sm:rotate-0">
          <h2 className="text-base sm:text-lg tracking-wide opacity-80">
            {me && me.name}
          </h2>

          {/* READY BUTTON CONDITION */}
          {me && me.ready === false ? (
            <button
              onClick={() => readyButton()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Ready
            </button>
          ) : (
            <>
              {/* CARDS */}
              <div className="flex justify-center w-full">
                <div className="flex justify-center items-end gap-0">
                  {me &&
                    playerADeck.map((card, idx) => (
                      <div
                        key={idx}
                        className="-ml-2 sm:-ml-12 first:ml-0 transition-transform duration-150 hover:-translate-y-3 sm:hover:-translate-y-4 hover:scale-105"
                      >
                        <Image
                          alt=""
                          width={120}
                          height={180}
                          src={getCardImage(card)}
                          className="w-18 sm:w-20 h-14 sm:h-26 drop-shadow-xl cursor-pointer"
                          onClick={() => playCard(card, roomId, userId, idx)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
