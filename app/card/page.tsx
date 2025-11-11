"use client";

import PlayerHand from "./components/PlayerHand";
import PlayerBack from "./components/PlayerBack";
import CenterCards from "./components/CenterCards";
import ShuffleAnimation from "./components/ShuffleAnimation";
import DealingAnimation from "./components/DealingAnimation";
import { useDeck } from "./hooks/useDeck";
import { useDealing } from "./hooks/useDealing";
import { useTurnManager } from "./hooks/useTurnManager";
import { useCenterCards } from "./hooks/useCenterCards";

export default function FourPlayerFlexUI() {
  const {
    hands,
    setHands,
    dealingCards,
    dealingDone,
    startDealing,
    handleCardAnimationComplete,
  } = useDealing();

  const { centerCards, setCenterCards } = useCenterCards();
  const { deck, shuffling } = useDeck(startDealing);
  const { turn, playCard } = useTurnManager(hands, setHands, setCenterCards);

  return (
    <div
      className="min-h-screen flex flex-col text-white p-2 sm:p-4 gap-4 sm:gap-8 overflow-hidden relative
             bg-[url('/table/table.jpg')] bg-cover bg-center bg-no-repeat"
    >
      <h1 className="text-3xl font-bold text-yellow-400 text-center z-10">
        🃏 4 Player Flex Layout
      </h1>

      {shuffling && <ShuffleAnimation />}

      {!dealingDone && (
        <DealingAnimation
          dealingCards={dealingCards}
          onComplete={handleCardAnimationComplete}
        />
      )}

      {/* Top Player */}
      <div className="flex justify-center">
        {dealingDone && (
          <PlayerBack
            name="C"
            isTurn={turn === "C"}
            count={hands.C.length}
            orientation="horizontal"
          />
        )}
      </div>

      {/* Middle Area */}
      <div className="flex justify-between items-center flex-1 px-16">
        {dealingDone && (
          <PlayerBack
            name="B"
            isTurn={turn === "B"}
            count={hands.B.length}
            orientation="vertical"
          />
        )}

        <CenterCards cards={centerCards} />

        {dealingDone && (
          <PlayerBack
            name="D"
            isTurn={turn === "D"}
            count={hands.D.length}
            orientation="vertical"
          />
        )}
      </div>

      {/* Player A */}
      {dealingDone && (
        <PlayerHand
          cards={hands.A}
          isTurn={turn === "A"}
          onPlay={(i) => playCard("A", i)}
        />
      )}

      <p className="text-center text-lg text-slate-300">
        🔁 Current Turn:{" "}
        <span className="text-yellow-300 font-semibold">{turn}</span>
      </p>
    </div>
  );
}
