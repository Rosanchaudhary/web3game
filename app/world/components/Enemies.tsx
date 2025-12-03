import Enemy from "./Enemy";

export default function Enemies({ count = 5 }) {
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
        <Enemy key={i} position={pos} />
      ))}
    </>
  );
}
