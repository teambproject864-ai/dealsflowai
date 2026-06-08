"use client";

import { useEffect, useState, useCallback } from "react";
import {
  resolveImmersiveMode,
  prefersReducedMotion,
  type ImmersiveMode,
} from "@/lib/immersive3d/motion";

export function useImmersiveMotion() {
  const [mode, setMode] = useState<ImmersiveMode>("full");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMode(resolveImmersiveMode());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => {
      setReducedMotion(mq.matches);
      setMode(resolveImmersiveMode());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const shouldAnimate = useCallback(
    () => !reducedMotion && mode !== "flat",
    [reducedMotion, mode]
  );

  const enable3D = mode === "full";
  const enableLite = mode === "lite" || mode === "full";

  return { mode, reducedMotion, shouldAnimate, enable3D, enableLite };
}

export { prefersReducedMotion };
