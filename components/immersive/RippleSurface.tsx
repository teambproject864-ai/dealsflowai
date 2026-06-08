"use client";

import { useState, useCallback, type ReactNode, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleSurfaceProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

export function RippleSurface({
  children,
  className,
  onClick,
  disabled,
}: RippleSurfaceProps) {
  const { enableLite, reducedMotion } = useImmersive();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!disabled && enableLite && !reducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((r) => [...r.slice(-4), { id, x, y }]);
        setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 700);
      }
      onClick?.(e);
    },
    [disabled, enableLite, reducedMotion, onClick]
  );

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="immersive-ripple pointer-events-none absolute rounded-full border border-teal-400/40 bg-teal-400/10"
            style={{ left: r.x, top: r.y, transform: "translate(-50%, -50%)" }}
            initial={{ width: 0, height: 0, opacity: 0.8, scaleZ: 0 }}
            animate={{ width: 280, height: 280, opacity: 0, scaleZ: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
        ))}
      </AnimatePresence>
      {children}
    </div>
  );
}
