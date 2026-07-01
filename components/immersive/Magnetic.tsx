"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}

export function Magnetic({
  children,
  className,
  radius = 80,
  strength = 0.35,
}: MagneticProps) {
  const { enableLite, reducedMotion } = useImmersive();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 18 });
  const y = useSpring(0, { stiffness: 200, damping: 18 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableLite || reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        x.set(dx * pull);
        y.set(dy * pull);
      } else {
        x.set(0);
        y.set(0);
      }
    },
    [enableLite, reducedMotion, radius, strength, x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (!enableLite || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex gpu-accelerated", className)}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
