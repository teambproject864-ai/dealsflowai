"use client";

import { type ReactNode } from "react";
import { ImmersiveProvider } from "./ImmersiveProvider";
import { PageTransition3D } from "./PageTransition3D";

export function ImmersiveShell({ children }: { children: ReactNode }) {
  return (
    <ImmersiveProvider>
      <div className="immersive-root relative min-h-screen flex flex-col">
        {/* CSS base space mesh */}
        <div className="fixed inset-0 z-0 cosmic-bg pointer-events-none" aria-hidden="true">
          <div className="aurora-mesh absolute inset-0 opacity-55" aria-hidden="true" />
          <div className="grid-pattern absolute inset-0 opacity-20" aria-hidden="true" />
        </div>
        <div className="immersive-scene relative z-10 flex flex-col flex-1">
          <PageTransition3D>{children}</PageTransition3D>
        </div>
      </div>
    </ImmersiveProvider>
  );
}
