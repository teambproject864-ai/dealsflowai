"use client";

import { useEffect, useRef, useState } from "react";

export function useMouseVelocity() {
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0, speed: 0 });
  const last = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const t = performance.now();
      const dt = Math.max(t - last.current.t, 1);
      const vx = ((e.clientX - last.current.x) / dt) * 16;
      const vy = ((e.clientY - last.current.y) / dt) * 16;
      last.current = { x: e.clientX, y: e.clientY, t: t };
      const speed = Math.min(Math.hypot(vx, vy), 120);
      setVelocity({ vx, vy, speed });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return velocity;
}
