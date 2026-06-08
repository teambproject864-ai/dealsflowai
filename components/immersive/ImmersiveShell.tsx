"use client";

import { type ReactNode } from "react";
import { ImmersiveProvider } from "./ImmersiveProvider";
import { PageTransition3D } from "./PageTransition3D";
import { ClientImmersiveBackground } from "./ClientImmersiveBackground";

export function ImmersiveShell({ children }: { children: ReactNode }) {
  return (
    <ImmersiveProvider>
      <div className="immersive-root relative min-h-screen flex flex-col">
        <ClientImmersiveBackground />
        <div className="immersive-scene relative z-10 flex flex-col flex-1">
          <PageTransition3D>{children}</PageTransition3D>
        </div>
      </div>
    </ImmersiveProvider>
  );
}
