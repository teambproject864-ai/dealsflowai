"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ExperienceProvider } from "./ExperienceProvider";
import { CustomCursor } from "./CustomCursor";
import { MultimodalControlDock } from "./MultimodalControlDock";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { OfflineBanner } from "./OfflineBanner";
import { MultimodalIndicator } from "./MultimodalIndicator";
import { ScrollProgress } from "./ScrollProgress";
import { ScrollToTop } from "./ScrollToTop";
import { CinematicLoader } from "./CinematicLoader";

export function ExperienceChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

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
          <MultimodalIndicator />
          <ScrollProgress />
          <ScrollToTop />
        </>
      )}
      {children}
    </ExperienceProvider>
  );
}
