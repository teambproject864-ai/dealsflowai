"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./GlassPanel";
import { useImmersive } from "./ImmersiveProvider";

interface ParallaxCardProps {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  imageUrl?: string;
  className?: string;
  "aria-label"?: string;
}

export function ParallaxCard({
  title,
  description,
  footer,
  imageUrl,
  className,
  "aria-label": ariaLabel,
}: ParallaxCardProps) {
  const { enableLite, reducedMotion } = useImmersive();

  return (
    <GlassPanel
      className={cn("overflow-hidden p-0", className)}
      depth="mid"
      glow="primary"
      aria-label={ariaLabel}
    >
      {imageUrl && (
        <motion.div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          whileHover={
            enableLite && !reducedMotion
              ? { scale: 1.08, translateZ: -20 }
              : undefined
          }
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          aria-hidden
        />
      )}
      <div className="relative z-10 p-6" style={{ transform: "translateZ(24px)" }}>
        <motion.div
          whileHover={
            enableLite && !reducedMotion ? { translateZ: 32 } : undefined
          }
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          )}
          {footer && <div className="mt-4">{footer}</div>}
        </motion.div>
      </div>
    </GlassPanel>
  );
}
