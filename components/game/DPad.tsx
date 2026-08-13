"use client";

import { useState, type PointerEvent } from "react";

type Dir = { x: number; y: number };

type Props = {
  onChange: (dir: Dir) => void;
  mode?: "full" | "horizontal";
};

function Arrow({ rot }: { rot: number }) {
  return (
    <svg viewBox="0 0 32 32" className="pad-arrow" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M16 4 L26 18 H20 V28 H12 V18 H6 Z" fill="currentColor" />
    </svg>
  );
}

export function DPad({ onChange, mode = "full" }: Props) {
  const [held, setHeld] = useState<string | null>(null);

  const press = (id: string, x: number, y: number) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    setHeld(id);
    onChange({ x, y });
  };
  const release = () => {
    setHeld(null);
    onChange({ x: 0, y: 0 });
  };

  const btn = (id: string, label: string, x: number, y: number, rot: number, extra = "") => (
    <button
      type="button"
      aria-label={label}
      className={`pad-btn ${extra} ${held === id ? "is-on" : ""}`}
      onPointerDown={press(id, x, y)}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <Arrow rot={rot} />
    </button>
  );

  if (mode === "horizontal") {
    return (
      <div className="pad-wrap pad-hz" onContextMenu={(e) => e.preventDefault()}>
        <div className="pad-holds">
          {btn("l", "Gauche", -1, 0, -90, "pad-hold")}
          <div className="pad-rope" />
          {btn("r", "Droite", 1, 0, 90, "pad-hold")}
        </div>
      </div>
    );
  }

  return (
    <div className="pad-wrap" onContextMenu={(e) => e.preventDefault()}>
      <div className="pad-plate">
        <div className="pad-grid">
          <div />
          {btn("u", "Haut", 0, -1, 0)}
          <div />
          {btn("l", "Gauche", -1, 0, -90)}
          <div className="pad-gem" aria-hidden />
          {btn("r", "Droite", 1, 0, 90)}
          <div />
          {btn("d", "Bas", 0, 1, 180)}
          <div />
        </div>
      </div>
    </div>
  );
}
