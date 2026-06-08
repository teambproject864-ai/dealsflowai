"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ExperienceProvider } from "./ExperienceProvider";
import { CustomCursor } from "./CustomCursor";
import { MultimodalControlDock } from "./MultimodalControlDock";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { OfflineBanner } from "./OfflineBanner";
import { GestureLayer } from "./GestureLayer";
import { MultimodalIndicator } from "./MultimodalIndicator";
import { ScrollProgress } from "./ScrollProgress";
import { ScrollToTop } from "./ScrollToTop";
import { CinematicLoader } from "./CinematicLoader";
import { PredictiveHighlight } from "./PredictiveHighlight";
import { AROverlay } from "./AROverlay";
import { useScrollRetention } from "@/hooks/useScrollRetention";

export function ExperienceChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useScrollRetention(true);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setReady(true), 800);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => clearTimeout(t);
  }, []);

  const isPortal = pathname.startsWith("/portal");
  const showLoader = mounted && !isPortal;

  return (
    <ExperienceProvider>
      {mounted && (
        <>
          {showLoader && <CinematicLoader ready={ready} />}
          {!isPortal && <CustomCursor />}
          <MultimodalControlDock />
          <AccessibilityPanel />
          <OfflineBanner />
          <GestureLayer
            onSidebarOpen={() => setSidebarOpen(true)}
            onSidebarClose={() => setSidebarOpen(false)}
          />
          <MultimodalIndicator />
          <ScrollProgress />
          <ScrollToTop />
          <PredictiveHighlight />
          <AROverlay />
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          )}
        </>
      )}
      {children}
    </ExperienceProvider>
  );
}
