"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";
import { Eye, EyeOff } from "lucide-react";

export interface SunkenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SunkenInput = React.forwardRef<HTMLInputElement, SunkenInputProps>(
  ({ className, type, ...props }, ref) => {
    const { reducedMotion } = useImmersive();
    const [isVisible, setIsVisible] = React.useState(false);

    if (type === "password") {
      return (
        <div className="relative w-full">
          <input
            ref={ref}
            {...props}
            type={isVisible ? "text" : "password"}
            className={cn(
              "immersive-input-sunken flex h-11 w-full rounded-xl px-4 py-2 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/60",
              "shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-400/50",
              "focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(20,184,166,0.4),0_0_20px_rgba(20,184,166,0.15)] dark:focus-visible:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(45,212,191,0.4),0_0_20px_rgba(45,212,191,0.15)]",
              !reducedMotion && "transition-shadow duration-300",
              className
            )}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsVisible((prev) => !prev);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
            tabIndex={-1}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "immersive-input-sunken flex h-11 w-full rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/60",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-400/50",
          "focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(20,184,166,0.4),0_0_20px_rgba(20,184,166,0.15)] dark:focus-visible:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(45,212,191,0.4),0_0_20px_rgba(45,212,191,0.15)]",
          !reducedMotion && "transition-shadow duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
SunkenInput.displayName = "SunkenInput";
