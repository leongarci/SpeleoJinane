"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Controls } from "@/lib/types";

export function useHeldControls() {
  const controls = useRef<Controls>({ x: 0, y: 0 });
  const keys = useRef({ l: false, r: false, u: false, d: false });
  const dpad = useRef<Controls>({ x: 0, y: 0 });

  const sync = () => {
    const kx = (keys.current.r ? 1 : 0) - (keys.current.l ? 1 : 0);
    const ky = (keys.current.d ? 1 : 0) - (keys.current.u ? 1 : 0);
    controls.current.x = kx !== 0 ? kx : dpad.current.x;
    controls.current.y = ky !== 0 ? ky : dpad.current.y;
  };

  const setDpad = useCallback((dir: Controls) => {
    dpad.current = dir;
    sync();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "q") keys.current.l = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.r = true;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "z") keys.current.u = true;
      if (e.key === "ArrowDown" || e.key === "s") keys.current.d = true;
      sync();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "q") keys.current.l = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.r = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "z") keys.current.u = false;
      if (e.key === "ArrowDown" || e.key === "s") keys.current.d = false;
      sync();
    };
    const blur = () => {
      keys.current = { l: false, r: false, u: false, d: false };
      sync();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return { controls, setDpad };
}
