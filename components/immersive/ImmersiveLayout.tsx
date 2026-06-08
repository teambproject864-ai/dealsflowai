"use client";

import { type ReactNode } from "react";
import { ImmersiveProvider } from "./ImmersiveProvider";
import { PageTransition3D } from "./PageTransition3D";
import { ClientImmersiveBackground } from "./ClientImmersiveBackground";
import { GestureManager } from "./GestureManager";
import { OfflineIndicator } from "./OfflineIndicator";
import { ExperienceChrome } from "@/components/experience/ExperienceChrome";

export function ImmersiveLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  return (
    <ImmersiveProvider>
      <ExperienceChrome>
        <div className="immersive-root relative min-h-screen flex flex-col">
          <ClientImmersiveBackground />
          <GestureManager />
          <OfflineIndicator />
          <div className="immersive-vignette pointer-events-none fixed inset-0 z-[2]" aria-hidden />
          <div
            className="immersive-light-layer pointer-events-none fixed inset-0 z-[1]"
            aria-hidden
            style={{
              background: `radial-gradient(ellipse 900px 600px at var(--light-x) var(--light-y), rgba(108,59,255,0.14) 0%, rgba(0,212,255,0.06) 35%, transparent 60%)`,
            }}
          />
          {header}
          <main className="relative z-10 flex flex-1 flex-col">
            <PageTransition3D>{children}</PageTransition3D>
          </main>
          {footer}
        </div>
      </ExperienceChrome>
    </ImmersiveProvider>
  );
}

