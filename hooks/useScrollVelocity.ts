"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const lastY = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const t = performance.now();
      const y = window.scrollY;
      const dt = Math.max(t - lastT.current, 1);
      const v = Math.abs((y - lastY.current) / dt) * 100;
      lastY.current = y;
      lastT.current = t;
      setVelocity(Math.min(v, 80));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return velocity;
}
