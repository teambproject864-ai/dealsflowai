"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useImmersiveMotion } from "@/hooks/useImmersiveMotion";
import { useCursorLight, type CursorLight } from "@/hooks/useCursorLight";
import { useMouseVelocity } from "@/hooks/useMouseVelocity";
import { useScrollVelocity } from "@/hooks/useScrollVelocity";
import { useGyroscope } from "@/hooks/useGyroscope";
import { applyTimeTheme, getTimeTheme } from "@/lib/immersive3d/theme";
import type { ImmersiveMode } from "@/lib/immersive3d/motion";

interface ImmersiveContextValue {
  mode: ImmersiveMode;
  reducedMotion: boolean;
  enable3D: boolean;
  enableLite: boolean;
  light: CursorLight;
  mouseVelocity: { vx: number; vy: number; speed: number };
  scrollVelocity: number;
  gyro: { beta: number; gamma: number; supported: boolean };
}

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null);

export function useImmersive() {
  const ctx = useContext(ImmersiveContext);
  if (!ctx) {
    return {
      mode: "flat" as ImmersiveMode,
      reducedMotion: true,
      enable3D: false,
      enableLite: false,
      light: { x: 0.5, y: 0.5, nx: 0, ny: 0 },
      mouseVelocity: { vx: 0, vy: 0, speed: 0 },
      scrollVelocity: 0,
      gyro: { beta: 0, gamma: 0, supported: false },
    };
  }
  return ctx;
}

export function ImmersiveProvider({ children }: { children: ReactNode }) {
  const { mode, reducedMotion, enable3D, enableLite } = useImmersiveMotion();
  const light = useCursorLight();
  const mouseVelocity = useMouseVelocity();
  const scrollVelocity = useScrollVelocity();
  const gyro = useGyroscope(enableLite && !reducedMotion);

  useEffect(() => {
    applyTimeTheme(document.documentElement, getTimeTheme());
    const interval = setInterval(
      () => applyTimeTheme(document.documentElement, getTimeTheme()),
      60_000
    );
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      reducedMotion,
      enable3D,
      enableLite,
      light,
      mouseVelocity,
      scrollVelocity,
      gyro,
    }),
    [mode, reducedMotion, enable3D, enableLite, light, mouseVelocity, scrollVelocity, gyro]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--light-x", `${light.x * 100}%`);
    root.style.setProperty("--light-y", `${light.y * 100}%`);
  }, [light.x, light.y]);

  return <ImmersiveContext.Provider value={value}>{children}</ImmersiveContext.Provider>;
}
