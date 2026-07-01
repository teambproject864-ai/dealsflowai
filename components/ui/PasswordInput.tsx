"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, value, onChange, placeholder = "••••••••", className, hasError, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsVisible((prev) => !prev);
    };

    return (
      <div className="relative w-full">
        <input
          {...props}
          id={id}
          ref={ref}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full bg-black/40 border rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all",
            hasError ? "border-red-500/50" : "border-white/10 focus:border-teal-500",
            className
          )}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          tabIndex={-1}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
