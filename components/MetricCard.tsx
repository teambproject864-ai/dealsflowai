"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  /** Metric label */
  label: string;
  /** Numerical value */
  value: number | string;
  /** Icon component to use */
  icon?: React.ElementType;
  /** Color theme: primary, accent, success, warning, danger */
  theme?: "primary" | "accent" | "success" | "warning" | "danger";
  /** Subtext/description below value */
  subtext?: string;
  /** Optional trend indicator (up/down) */
  trend?: "up" | "down" | null;
  /** Trend percentage */
  trendValue?: number;
  /** Animation delay for staggered entrance */
  delay?: number;
  /** Additional class name */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

const themeStyles = {
  primary: "text-teal-400 bg-teal-500/20",
  accent: "text-cyan-400 bg-cyan-500/20",
  success: "text-emerald-400 bg-emerald-500/20",
  warning: "text-amber-400 bg-amber-500/20",
  danger: "text-rose-400 bg-rose-500/20",
};

const trendIconUp = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const trendIconDown = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 17H7V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function MetricCard({
  label,
  value,
  icon: Icon,
  theme = "primary",
  subtext,
  trend = null,
  trendValue,
  delay = 0,
  className,
  ariaLabel,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn("h-full w-full", className)}
    >
      <GlassPanel
        depth="front"
        glow={theme === "primary" ? "primary" : "none"}
        tilt={false}
        aria-label={ariaLabel}
        className="h-full"
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Icon */}
          <div className="flex justify-between items-start">
            {Icon && (() => {
              const IconComponent = Icon as React.ComponentType<any>;
              return (
                <div
                  className={cn(
                    "flex items-center justify-center rounded-xl p-3",
                    themeStyles[theme]
                  )}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
              );
            })()}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                trend === "up"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              )}>
                {trend === "up" ? trendIconUp : trendIconDown}
                {trendValue ? `${trendValue > 0 ? "+" : ""}${trendValue}%` : ""}
              </div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">
              {label}
            </p>
            <p className="text-4xl font-black text-white">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-slate-500">
                {subtext}
              </p>
            )}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
