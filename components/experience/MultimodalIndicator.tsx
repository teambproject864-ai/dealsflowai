"use client";

import { motion } from "framer-motion";
import { Hand, Keyboard, Mic, MousePointer2, Camera } from "lucide-react";
import { useExperience, type InputModality } from "./ExperienceProvider";

const ICONS: Record<InputModality, typeof MousePointer2> = {
  pointer: MousePointer2,
  touch: Hand,
  voice: Mic,
  gesture: Hand,
  keyboard: Keyboard,
  camera: Camera,
};

export function MultimodalIndicator() {
  const { inputModality, arMode } = useExperience();

  if (inputModality === "pointer") {
    return null;
  }

  const Icon = ICONS[inputModality];

  return (
    <motion.div
      key={inputModality}
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-24 right-6 z-[85] df-glass px-4 py-2 flex items-center gap-3 text-sm text-[#C8B8FF] uppercase tracking-wider min-h-[48px] min-w-[48px]"
      aria-live="polite"
      aria-label={`Input mode: ${inputModality}${arMode ? ", AR active" : ""}`}
    >
      <Icon className="h-5 w-5 text-cyan-400" aria-hidden />
      <span>{inputModality}</span>
      {arMode && (
        <>
          <div className="w-px h-4 bg-white/20" />
          <Camera className="h-5 w-5 text-violet-400" aria-hidden />
          <span>AR</span>
        </>
      )}
    </motion.div>
  );
}
