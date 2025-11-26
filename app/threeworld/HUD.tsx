import React from "react";

export default function HUD() {
  return (
    <div style={{ background: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 6 }}>
      <div style={{ fontWeight: 600 }}>3D World — Classic FPS Controls</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        W A S D — Move • Space — Jump • Click — Lock Pointer • Shift — Sprint
      </div>
    </div>
  );
}
