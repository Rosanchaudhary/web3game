"use client"

import Scene from "./Scene";
import HUD from "./HUD";


export default function Page() {
  return (
    <div className="w-screen h-screen bg-gray-900 text-white">
      <Scene />

      <div style={{ position: "absolute", top: 16, left: 16 }}>
        <HUD />
      </div>
    </div>
  );
}


