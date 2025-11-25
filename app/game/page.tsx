"use client";

import React, { useEffect, useRef, useState } from "react";

// Next.js + TypeScript single-file page component that renders a canvas
// with a movable square and arrow buttons. Place this file in your
// `app/` (App Router) as `app/canvas/page.tsx` or in `pages/` as
// `pages/canvas.tsx` depending on your project structure.

type Position = { x: number; y: number };

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const SQUARE_SIZE = 60;
const MOVE_STEP = 20;

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pos, setPos] = useState<Position>({
    x: (CANVAS_WIDTH - SQUARE_SIZE) / 2,
    y: (CANVAS_HEIGHT - SQUARE_SIZE) / 2,
  });

  // Draw function: clears canvas then draws frame and square
  const draw = (ctx: CanvasRenderingContext2D, p: Position) => {
    // clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // outer frame (stroke)
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1f2937"; // neutral dark
    ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);
    ctx.restore();

    // square
    ctx.save();
    ctx.fillStyle = "#ef4444"; // red square
    ctx.fillRect(p.x, p.y, SQUARE_SIZE, SQUARE_SIZE);
    ctx.restore();
  };

  // redraw whenever position changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    draw(ctx, pos);
  }, [pos]);

  // move with bounds
  const move = (dx: number, dy: number) => {
    setPos((prev) => {
      const nextX = Math.min(
        Math.max(prev.x + dx, 0),
        CANVAS_WIDTH - SQUARE_SIZE
      );
      const nextY = Math.min(
        Math.max(prev.y + dy, 0),
        CANVAS_HEIGHT - SQUARE_SIZE
      );
      return { x: nextX, y: nextY };
    });
  };

  // keyboard controls: arrow keys + WASD
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move(0, -MOVE_STEP);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move(0, MOVE_STEP);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move(-MOVE_STEP, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move(MOVE_STEP, 0);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // click / touch friendly handlers
  const onUp = () => move(0, -MOVE_STEP);
  const onDown = () => move(0, MOVE_STEP);
  const onLeft = () => move(-MOVE_STEP, 0);
  const onRight = () => move(MOVE_STEP, 0);
  const reset = () =>
    setPos({ x: (CANVAS_WIDTH - SQUARE_SIZE) / 2, y: (CANVAS_HEIGHT - SQUARE_SIZE) / 2 });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="flex flex-row gap-6">
        {/* Canvas container */}
        <div className="rounded-md shadow-md bg-white p-4">
          <div className="mb-2 text-sm text-gray-600">Canvas frame</div>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
            aria-label="Movable square canvas"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-md shadow-md">
          <div className="text-sm text-gray-600">Controls</div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onUp}
              className="w-12 h-12 rounded border border-gray-300 flex items-center justify-center active:scale-95"
              aria-label="Move up"
            >
              ↑
            </button>

            <div className="flex gap-2">
              <button
                onClick={onLeft}
                className="w-12 h-12 rounded border border-gray-300 flex items-center justify-center active:scale-95"
                aria-label="Move left"
              >
                ←
              </button>

              <button
                onClick={onRight}
                className="w-12 h-12 rounded border border-gray-300 flex items-center justify-center active:scale-95"
                aria-label="Move right"
              >
                →
              </button>
            </div>

            <button
              onClick={onDown}
              className="w-12 h-12 rounded border border-gray-300 flex items-center justify-center active:scale-95"
              aria-label="Move down"
            >
              ↓
            </button>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={reset}
              className="py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Reset
            </button>

            <div className="text-xs text-gray-500">
              Tip: you can also use arrow keys or WASD.
            </div>

            <div className="text-xs text-gray-500">
              Position: x: {Math.round(pos.x)}, y: {Math.round(pos.y)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
