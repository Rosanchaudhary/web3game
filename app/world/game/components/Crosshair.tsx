export default function Crosshair() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "2px",
          height: "10px",
          background: "white",
          top: "-15px",
          left: "-1px",
          boxShadow: "0 0 2px black",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "2px",
          height: "10px",
          background: "white",
          top: "5px",
          left: "-1px",
          boxShadow: "0 0 2px black",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px",
          height: "2px",
          background: "white",
          top: "-1px",
          left: "-15px",
          boxShadow: "0 0 2px black",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px",
          height: "2px",
          background: "white",
          top: "-1px",
          left: "5px",
          boxShadow: "0 0 2px black",
        }}
      />
    </div>
  );
}
