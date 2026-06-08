"use client";

import { useEffect } from "react";
import { useExperience } from "./ExperienceProvider";

const FEATURE_TARGETS: Record<string, string> = {
  "analysis/new": '[href="/analysis/new"]',
  solutions: '[href="/solutions"]',
  rag: '[href="/rag"]',
  "book-meeting": '[href="/book-meeting"]',
};

export function PredictiveHighlight() {
  const { predictedFeature, skillLevel } = useExperience();

  useEffect(() => {
    document.querySelectorAll("[data-predictive-glow]").forEach((el) => {
      el.classList.remove("df-predictive-pulse");
    });
    if (!predictedFeature || skillLevel === "beginner") return;
    const sel = FEATURE_TARGETS[predictedFeature];
    if (!sel) return;
    const el = document.querySelector(sel);
    el?.classList.add("df-predictive-pulse");
    el?.setAttribute("data-predictive-glow", "true");
  }, [predictedFeature, skillLevel]);

  return null;
}
