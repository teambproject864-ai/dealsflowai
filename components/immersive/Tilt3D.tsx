"use client";

import { useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
  "aria-label"?: string;
}

export function Tilt3D({
  children,
  className,
  intensity = 12,
  style,
  "aria-label": ariaLabel,
}: Tilt3DProps) {
  const { enableLite, reducedMotion, gyro } = useImmersive();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, { stiffness: 300, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 24 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enableLite || reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * intensity);
      rotateX.set(-y * intensity);
    },
    [enableLite, reducedMotion, intensity, rotateX, rotateY]
  );

  const onLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const gyroX = reducedMotion ? 0 : (gyro.beta / 90) * (intensity * 0.4);
  const gyroY = reducedMotion ? 0 : (gyro.gamma / 90) * (intensity * 0.4);

  if (!enableLite || reducedMotion) {
    return (
      <div className={className} style={style} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("immersive-tilt gpu-accelerated", className)}
      style={{ ...style, perspective: 1000 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label={ariaLabel}
    >
      <motion.div
        style={{
          rotateX: gyro.supported ? gyroX : rotateX,
          rotateY: gyro.supported ? gyroY : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="h-full w-full immersive-shadow-dynamic"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
