/** Time-of-day palette: warm (dawn/dusk) ↔ cool (midday/night) */
export type TimeTheme = "warm" | "cool" | "neutral";

export function getTimeTheme(hour = new Date().getHours()): TimeTheme {
  if (hour >= 6 && hour < 10) return "warm";
  if (hour >= 17 && hour < 21) return "warm";
  if (hour >= 10 && hour < 17) return "cool";
  return "neutral";
}

export const THEME_VARS: Record<TimeTheme, Record<string, string>> = {
  warm: {
    "--immersive-hue-primary": "32",
    "--immersive-hue-accent": "168",
    "--immersive-glow": "rgba(251, 191, 36, 0.35)",
    "--immersive-gradient-a": "#f59e0b",
    "--immersive-gradient-b": "#14b8a6",
  },
  cool: {
    "--immersive-hue-primary": "192",
    "--immersive-hue-accent": "262",
    "--immersive-glow": "rgba(45, 212, 191, 0.35)",
    "--immersive-gradient-a": "#2dd4bf",
    "--immersive-gradient-b": "#8b5cf6",
  },
  neutral: {
    "--immersive-hue-primary": "220",
    "--immersive-hue-accent": "168",
    "--immersive-glow": "rgba(139, 92, 246, 0.3)",
    "--immersive-gradient-a": "#8b5cf6",
    "--immersive-gradient-b": "#14b8a6",
  },
};

export function applyTimeTheme(el: HTMLElement, theme: TimeTheme) {
  const vars = THEME_VARS[theme];
  Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
}
