"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface CursorLight {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

const THROTTLE_MS = 16;

export function useCursorLight() {
  const [light, setLight] = useState<CursorLight>({ x: 0.5, y: 0.5, nx: 0, ny: 0 });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  const update = useCallback((clientX: number, clientY: number) => {
    const now = performance.now();
    if (now - lastRef.current < THROTTLE_MS) return;
    lastRef.current = now;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (clientX / w) * 2 - 1;
      const ny = (clientY / h) * 2 - 1;
      setLight({
        x: clientX / w,
        y: clientY / h,
        nx,
        ny,
      });
    });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => update(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  return light;
}
