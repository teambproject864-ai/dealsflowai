"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Loader3DProps {
  className?: string;
  label?: string;
}

/** Spinner only — R3F torus removed to avoid drei Clock / async client issues */
export function Loader3D({ className, label = "Loading" }: Loader3DProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-label={label}
    >
      <Loader2 className="h-8 w-8 animate-spin text-[#00D4FF]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
