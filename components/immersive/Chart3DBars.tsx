"use client";

import { useEffect, useState } from "react";
import { useImmersive } from "./ImmersiveProvider";
import { cn } from "@/lib/utils";
import { Chart3DBarsInner } from "./Chart3DBarsInner";

export interface Chart3DDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface Chart3DBarsProps {
  data: Chart3DDataPoint[];
  className?: string;
  "aria-label"?: string;
}

export function Chart3DBars({ data, className, "aria-label": ariaLabel }: Chart3DBarsProps) {
  const { enable3D, reducedMotion } = useImmersive();
  const [mounted, setMounted] = useState(false);
  const max = Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!enable3D || reducedMotion || !mounted) {
    return (
      <div
        className={cn("flex items-end gap-2 h-32", className)}
        role="img"
        aria-label={ariaLabel ?? "Bar chart"}
      >
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#6C3BFF] to-[#00D4FF]"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="text-[9px] text-[#8B9BB8] font-mono uppercase">{d.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("h-48 w-full", className)} role="img" aria-label={ariaLabel ?? "3D bar chart"}>
      <Chart3DBarsInner data={data} max={max} />
    </div>
  );
}
