import Enemy from "./Enemy";

export default function Enemies({ count = 5 }) {
  const enemies = [...Array(count)].map(() => [
    (Math.random() - 0.5) * 10, // x  between -5 to 5
    0.5,
    -Math.random() * 10 - 3,    // z  between -3 to -13
  ]);

  return (
    <>
      {enemies.map((pos, i) => (
        <Enemy key={i} position={pos} />
      ))}
    </>
  );
}
