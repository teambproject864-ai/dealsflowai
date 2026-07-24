"use client";

import { type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Tilt3D } from "./Tilt3D";
import { useImmersive } from "./ImmersiveProvider";

type Material = "glass" | "matte" | "metallic" | "neon" | "carbon";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  material?: Material;
  depth?: "back" | "mid" | "front";
  tilt?: boolean;
  glow?: "primary" | "accent" | "none";
  style?: CSSProperties;
  "aria-label"?: string;
  parallax?: boolean;
  overflowVisible?: boolean;
}

const depthClass = {
  back: "immersive-depth-back",
  mid: "immersive-depth-mid",
  front: "immersive-depth-front",
};

export function GlassPanel({
  children,
  className,
  material = "glass",
  depth = "mid",
  tilt = true,
  glow = "none",
  style,
  "aria-label": ariaLabel,
  parallax = false,
  overflowVisible = false,
  ...props
}: GlassPanelProps) {
  const { light, reducedMotion } = useImmersive();

  const panel = (
    <div
      className={cn(
        "df-glass rounded-2xl relative",
        overflowVisible || className?.includes("overflow-visible") ? "overflow-visible" : "overflow-hidden",
        depthClass[depth],
        material === "neon" && "immersive-glow-primary",
        material === "metallic" && "bg-gradient-to-br from-slate-800/80 to-slate-950/90",
        glow === "primary" && "immersive-glow-primary",
        glow === "accent" && "immersive-glow-accent",
        !reducedMotion && "immersive-breathe-idle",
        className
      )}

      style={{
        ...style,
        ["--light-x" as string]: `${light.x * 100}%`,
        ["--light-y" as string]: `${light.y * 100}%`,
        ["--shimmer-angle" as string]: `${45 + light.nx * 30}deg`,
      }}
      aria-label={ariaLabel}
      data-parallax={parallax ? "true" : undefined}
      {...props}
    >
      <div className="df-specular" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (tilt && !reducedMotion) {
    return (
      <Tilt3D className="h-full w-full" intensity={18} aria-label={ariaLabel}>
        {panel}
      </Tilt3D>
    );
  }

  return panel;
}
