//component/Enemies.txt
import { RefObject } from "react";
import Enemy from "./Enemy";
import { PlayerAPI } from "../type";
interface EnemiesProps {
  count?: number;
  playerRef: RefObject<PlayerAPI | null>;
}

export default function Enemies({ count = 5, playerRef }: EnemiesProps) {
  const enemies: [number, number, number][] = [...Array(count)].map(() => [
    // eslint-disable-next-line react-hooks/purity
    (Math.random() - 0.5) * 10,
    0.5,
    // eslint-disable-next-line react-hooks/purity
    -Math.random() * 10 - 3,
  ]);
  return (
    <>
      {enemies.map((pos, i) => (
        <Enemy key={i} position={pos} playerRef={playerRef} />
      ))}
    </>
  );
}
