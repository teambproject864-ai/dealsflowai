import { getStored, setStored } from "./storage";

export type SkillLevel = "beginner" | "advanced";

export interface InteractionEvent {
  featureId: string;
  timestamp: number;
}

export interface PersonalizationState {
  skillLevel: SkillLevel;
  featureScores: Record<string, number>;
  hiddenFeatures: string[];
  pinnedFeatures: string[];
}

const DEFAULT: PersonalizationState = {
  skillLevel: "beginner",
  featureScores: {},
  hiddenFeatures: [],
  pinnedFeatures: [],
};

export function loadPersonalization(): PersonalizationState {
  return getStored("personalization", DEFAULT);
}

export function trackFeatureUse(featureId: string) {
  const state = loadPersonalization();
  state.featureScores[featureId] = (state.featureScores[featureId] ?? 0) + 1;
  const total = Object.values(state.featureScores).reduce((a, b) => a + b, 0);
  if (total > 20) state.skillLevel = "advanced";
  const sorted = Object.entries(state.featureScores).sort((a, b) => b[1] - a[1]);
  state.pinnedFeatures = sorted.slice(0, 4).map(([id]) => id);
  const rare = sorted.filter(([, n]) => n <= 1).map(([id]) => id);
  state.hiddenFeatures = state.skillLevel === "beginner" ? rare.slice(0, 6) : [];
  setStored("personalization", state);
  return state;
}

export function predictNextFeature(scores: Record<string, number>): string | null {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}
