"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadPersonalization,
  trackFeatureUse,
  predictNextFeature,
  type PersonalizationState,
  type SkillLevel,
} from "@/lib/experience/personalization";
import { getStored, setStored } from "@/lib/experience/storage";

export type CursorMode = "orbit" | "trail" | "magnetic" | "ripple";
export type InputModality = "pointer" | "touch" | "voice" | "gesture" | "keyboard" | "camera";

export interface A11ySettings {
  contrast: "normal" | "high" | "inverted";
  fontScale: number;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  colorBlind: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  screenReaderExtended: boolean;
}

const DEFAULT_A11Y: A11ySettings = {
  contrast: "normal",
  fontScale: 1,
  reducedMotion: false,
  dyslexiaFont: false,
  colorBlind: "none",
  screenReaderExtended: false,
};

interface ExperienceContextValue {
  personalization: PersonalizationState;
  trackFeature: (id: string) => void;
  predictedFeature: string | null;
  skillLevel: SkillLevel;
  cursorMode: CursorMode;
  setCursorMode: (m: CursorMode) => void;
  inputModality: InputModality;
  setInputModality: (m: InputModality) => void;
  a11y: A11ySettings;
  updateA11y: (patch: Partial<A11ySettings>) => void;
  arMode: boolean;
  setArMode: (v: boolean) => void;
  helpMode: boolean;
  setHelpMode: (v: boolean) => void;
  voiceListening: boolean;
  setVoiceListening: (v: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (t: string) => void;
  voiceConfidence: number;
  setVoiceConfidence: (c: number) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    return {
      personalization: loadPersonalization(),
      trackFeature: () => undefined,
      predictedFeature: null,
      skillLevel: "beginner" as SkillLevel,
      cursorMode: "magnetic" as CursorMode,
      setCursorMode: () => undefined,
      inputModality: "pointer" as InputModality,
      setInputModality: () => undefined,
      a11y: DEFAULT_A11Y,
      updateA11y: () => undefined,
      arMode: false,
      setArMode: () => undefined,
      helpMode: false,
      setHelpMode: () => undefined,
      voiceListening: false,
      setVoiceListening: () => undefined,
      voiceTranscript: "",
      setVoiceTranscript: () => undefined,
      voiceConfidence: 0,
      setVoiceConfidence: () => undefined,
    };
  }
  return ctx;
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [personalization, setPersonalization] = useState<PersonalizationState>({
    skillLevel: "beginner",
    featureScores: {},
    hiddenFeatures: [],
    pinnedFeatures: [],
  });
  const [cursorMode, setCursorMode] = useState<CursorMode>("magnetic");
  const [inputModality, setInputModality] = useState<InputModality>("pointer");
  const [a11y, setA11y] = useState<A11ySettings>(DEFAULT_A11Y);
  const [arMode, setArMode] = useState(false);
  const [helpMode, setHelpMode] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setPersonalization(loadPersonalization());
    setA11y(getStored("a11y", DEFAULT_A11Y));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const root = document.documentElement;
    root.dataset.contrast = a11y.contrast;
    root.dataset.colorblind = a11y.colorBlind;
    root.style.setProperty("--df-font-scale", String(a11y.fontScale));
    if (a11y.reducedMotion) root.classList.add("reduce-motion-force");
    else root.classList.remove("reduce-motion-force");
    if (a11y.dyslexiaFont) root.classList.add("font-dyslexic");
    else root.classList.remove("font-dyslexic");
    setStored("a11y", a11y);
  }, [a11y, isMounted]);

  const trackFeature = useCallback((id: string) => {
    setPersonalization(trackFeatureUse(id));
  }, []);

  const updateA11y = useCallback((patch: Partial<A11ySettings>) => {
    setA11y((prev) => ({ ...prev, ...patch }));
  }, []);

  const predictedFeature = predictNextFeature(personalization.featureScores);

  const value = useMemo(
    () => ({
      personalization,
      trackFeature,
      predictedFeature,
      skillLevel: personalization.skillLevel,
      cursorMode,
      setCursorMode,
      inputModality,
      setInputModality,
      a11y,
      updateA11y,
      arMode,
      setArMode,
      helpMode,
      setHelpMode,
      voiceListening,
      setVoiceListening,
      voiceTranscript,
      setVoiceTranscript,
      voiceConfidence,
      setVoiceConfidence,
    }),
    [
      personalization,
      trackFeature,
      predictedFeature,
      cursorMode,
      inputModality,
      a11y,
      updateA11y,
      arMode,
      helpMode,
      voiceListening,
      voiceTranscript,
      voiceConfidence,
    ]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}
