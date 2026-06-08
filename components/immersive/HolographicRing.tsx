"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";

interface HolographicRingProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
  color?: string;
}

export function HolographicRing({
  value,
  max = 100,
  label,
  className,
  color = "#2dd4bf",
}: HolographicRingProps) {
  const { light, reducedMotion } = useImmersive();
  const pct = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 42;

  return (
    <div
      className={cn("relative flex flex-col items-center", className)}
      role="img"
      aria-label={`${label}: ${Math.round(pct)} percent`}
    >
      <motion.svg
        width={120}
        height={120}
        viewBox="0 0 100 100"
        className="immersive-holo-ring"
        style={{
          filter: `hue-rotate(${light.x * 40}deg)`,
        }}
        animate={reducedMotion ? {} : { rotateZ: [0, 360] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={50}
          cy={50}
          r={42}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white tabular-nums">{Math.round(pct)}%</span>
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
