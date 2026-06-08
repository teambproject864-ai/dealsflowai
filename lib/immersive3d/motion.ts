/** Spring physics presets — no linear/ease-only transitions in immersive mode */
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.8 };
export const SPRING_SOFT = { type: "spring" as const, stiffness: 180, damping: 22, mass: 1 };
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 320, damping: 18, mass: 0.9 };
export const SPRING_PRESS = { type: "spring" as const, stiffness: 600, damping: 28, mass: 0.6 };

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isLowEndDevice(): boolean {
  if (typeof window === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return cores <= 2 || memory <= 2 || coarse;
}

export type ImmersiveMode = "full" | "lite" | "flat";

export function resolveImmersiveMode(): ImmersiveMode {
  if (prefersReducedMotion()) return "flat";
  if (isLowEndDevice()) return "lite";
  return "full";
}
