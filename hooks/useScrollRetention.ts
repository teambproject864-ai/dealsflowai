"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const KEY = "dfx_scroll_positions";

function loadPositions(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function useScrollRetention(enabled = true) {
  const pathname = usePathname();
  const saved = useRef(loadPositions());

  useEffect(() => {
    if (!enabled) return;
    const y = saved.current[pathname];
    if (y != null) {
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
    }
    return () => {
      saved.current[pathname] = window.scrollY;
      sessionStorage.setItem(KEY, JSON.stringify(saved.current));
    };
  }, [pathname, enabled]);
}
