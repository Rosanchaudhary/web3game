import React, { createContext, useContext, useMemo } from "react";
import { AABB, aabbFromPosSize } from "../core/Collision";

type BlockData = {
  id: string;
  pos: [number, number, number];
  size?: [number, number, number];
  color?: string;
};

const WorldContext = createContext<{ blocks: BlockData[]; aabbs: AABB[] } | null>(null);

export function useWorld() { 
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be inside <WorldManager>");
  return ctx;
}

export default function WorldManager({ children }: { children: React.ReactNode }) {
  const blocks = useMemo(() => {
    const arr: BlockData[] = [];

    for (let x = -5; x <= 5; x += 2) {
      for (let z = -5; z <= 5; z += 2) {
        const h = 1 + Math.abs((x + z) % 3);
        arr.push({
          id: `b-${x}-${z}`,
          pos: [x * 1.5, h / 2, z * 1.5],
          size: [1, h, 1],
        });
      }
    }

    arr.push({
      id: "tall-1",
      pos: [6, 2.5, -2],
      size: [1.5, 5, 1.5],
      color: "#8b5cf6",
    });

    return arr;
  }, []);

  const aabbs = useMemo(
    () =>
      blocks.map((b) => ({
        ...aabbFromPosSize(...b.pos, ...(b.size ?? [1, 1, 1])),
        id: b.id,
      })),
    [blocks]
  );

  return <WorldContext.Provider value={{ blocks, aabbs }}>{children}</WorldContext.Provider>;
}
