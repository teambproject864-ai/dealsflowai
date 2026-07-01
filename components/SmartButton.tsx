"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExtrudedButtonProps } from "./immersive/ExtrudedButton";

export interface SmartButtonProps
  extends Omit<ButtonProps, "variant" | "size">, Omit<ExtrudedButtonProps, "variant" | "size"> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Target page to navigate to on click */
  href?: string;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Validation function before navigation */
  onBeforeNavigate?: () => Promise<boolean> | boolean;
  /** Error state message */
  errorMessage?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Disable button entirely */
  secure?: boolean;
  /** Success callback after navigation */
  onNavigateSuccess?: () => void;
  /** Error callback if navigation fails */
  onNavigateError?: (error: Error) => void;
}

/**
 * A smart button component with comprehensive features:
 * - Loading states with spinner
 * - Accessibility attributes (ARIA labels, keyboard navigation)
 * - Validation before navigation
 * - Error handling and fallback
 * - Smooth page transitions
 */
export const SmartButton: React.FC<SmartButtonProps> = ({
  href,
  isLoading: externalLoading,
  onBeforeNavigate,
  errorMessage,
  ariaLabel,
  secure = false,
  onNavigateSuccess,
  onNavigateError,
  onClick,
  disabled,
  children,
  className,
  ...props
}) => {
  const router = useRouter();
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      // Prevent default for button click behavior
      if (href) {
        e.preventDefault();
      }

      // Call external onClick first
      if (onClick) {
        onClick(e);
      }

      try {
        // Run validation if provided
        if (onBeforeNavigate) {
          const canNavigate = await Promise.resolve(onBeforeNavigate());
          if (!canNavigate) {
            setError(errorMessage || "Validation failed. Please try again.");
            return;
          }
        }

        setError(null);

        if (href) {
          setInternalLoading(true);
          router.push(href);
          onNavigateSuccess?.();
          setTimeout(() => setInternalLoading(false), 500);
        }
      } catch (err) {
        console.error("Navigation error:", err);
        setError(errorMessage || "An unexpected error occurred");
        onNavigateError?.(err as Error);
        setInternalLoading(false);
      }
    },
    [
      disabled,
      isLoading,
      href,
      onClick,
      onBeforeNavigate,
      errorMessage,
      router,
      onNavigateSuccess,
      onNavigateError,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // @ts-ignore
        handleClick(e);
      }
    },
    [handleClick]
  );

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        role="button"
        tabIndex={0}
        className={cn(
          "transition-all duration-300",
          isLoading && "opacity-70 cursor-wait",
          error && "ring-2 ring-red-500/50",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-400 text-center pt-1">
          {error}
        </div>
      )}
    </div>
  );
};
