"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExtrudedButtonProps } from "./immersive/ExtrudedButton";

export interface SmartLinkButtonProps
  extends Omit<ButtonProps, "variant" | "size">, Omit<ExtrudedButtonProps, "variant" | "size"> {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Target page to navigate to */
  href: string;
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
 * A smart link button with comprehensive features:
 * - Loading states with spinner
 * - Accessibility attributes (ARIA labels, keyboard navigation)
 * - Validation before navigation
 * - Error handling and fallback
 * - Smooth page transitions
 */
export const SmartLinkButton: React.FC<SmartLinkButtonProps> = ({
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
    async (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      // Prevent default
      e.preventDefault();

      // Call external onClick first
      if (onClick) {
        // @ts-ignore
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
        setInternalLoading(true);
        router.push(href);
        onNavigateSuccess?.();
        setTimeout(() => setInternalLoading(false), 500);
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
    (e: React.KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
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
      asChild
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
      <Link href={href} scroll={false}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            children
          )}
        </Link>
      </Button>
      {error && (
        <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-400 text-center pt-1">
          {error}
        </div>
      )}
    </div>
  );
};
