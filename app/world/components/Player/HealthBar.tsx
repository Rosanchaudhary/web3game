export default function HealthBar({ health }: { health: number }) {
  const max = 100;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "30px",
        width: "200px",
        height: "20px",
        background: "rgba(0,0,0,0.5)",
        border: "2px solid #000",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${(health / max) * 100}%`,
          height: "100%",
          background: "red",
          transition: "width .15s",
        }}
      />
    </div>
  );
}
