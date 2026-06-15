"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Mic, MicOff, Camera } from "lucide-react";
import { useExperience } from "./ExperienceProvider";
import { useRouter } from "next/navigation";
import { SPRING_SNAPPY, SPRING_SOFT } from "@/lib/immersive3d/motion";

type VoiceState = "idle" | "listening" | "error";

const COMMANDS: { pattern: RegExp; action: (router: ReturnType<typeof useRouter>) => void }[] = [
  { pattern: /go home|homepage/i, action: (r) => r.push("/") },
  { pattern: /solutions/i, action: (r) => r.push("/solutions") },
  { pattern: /new analysis|start analysis/i, action: (r) => r.push("/analysis/new") },
  { pattern: /book meeting/i, action: (r) => r.push("/book-meeting") },
  { pattern: /high contrast/i, action: () => document.documentElement.dataset.contrast = "high" },
  { pattern: /portal/i, action: (r) => r.push("/portal") },
];

export function MultimodalControlDock() {
  const router = useRouter();
  const {
    inputModality,
    setInputModality,
    arMode,
    setArMode,
    voiceListening,
    setVoiceListening,
    voiceTranscript,
    setVoiceTranscript,
    voiceConfidence,
    setVoiceConfidence,
  } = useExperience();

  const [expanded, setExpanded] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [a11yOpen, setA11yOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Close accessibility panel when dock collapses
  useEffect(() => {
    if (!expanded) {
      setA11yOpen(false);
      window.dispatchEvent(new CustomEvent("close-accessibility-panel"));
    }
  }, [expanded]);

  // Command Parser for speech
  const runCommand = useCallback(
    (text: string) => {
      for (const cmd of COMMANDS) {
        if (cmd.pattern.test(text)) {
          cmd.action(router);
          return true;
        }
      }
      return false;
    },
    [router]
  );

  // Toggle Voice Recognition
  const toggleVoice = useCallback(() => {
    const SR = typeof window !== "undefined"
      ? (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
      : null;

    if (!SR) {
      setVoiceTranscript("Voice not supported in this browser.");
      setVoiceState("error");
      setTimeout(() => {
        setVoiceState("idle");
        setVoiceTranscript("");
      }, 3000);
      return;
    }

    if (voiceListening || voiceState === "listening") {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      setVoiceState("idle");
      setInputModality("pointer");
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    recognitionRef.current = rec;

    rec.onstart = () => {
      setVoiceListening(true);
      setVoiceState("listening");
      setInputModality("voice");
      setVoiceTranscript("");
      setVoiceConfidence(0.2);
    };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const display = final || interim;
      setVoiceTranscript(display);
      setVoiceConfidence(Math.min(0.95, 0.4 + display.length * 0.02));
      if (final) runCommand(final.trim());
    };

    rec.onend = () => {
      setVoiceListening(false);
      setVoiceState("idle");
      setInputModality("pointer");
    };

    rec.onerror = () => {
      setVoiceListening(false);
      setVoiceState("error");
      setVoiceTranscript("Could not capture audio.");
      setTimeout(() => {
        setVoiceState("idle");
        setVoiceTranscript("");
      }, 3000);
    };

    rec.start();
  }, [
    voiceListening,
    voiceState,
    setVoiceListening,
    setVoiceTranscript,
    setVoiceConfidence,
    setInputModality,
    runCommand,
  ]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const getVoiceStateColor = () => {
    switch (voiceState) {
      case "listening":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      default:
        return "text-cyan-300";
    }
  };

  const getVoiceStateGradient = () => {
    switch (voiceState) {
      case "listening":
        return { stop1: "#10B981", stop2: "#34D399" };
      case "error":
        return { stop1: "#EF4444", stop2: "#F87171" };
      default:
        return { stop1: "#6C3BFF", stop2: "#00D4FF" };
    }
  };

  const gradient = getVoiceStateGradient();

  // Pointer Select: Resets all active sensory modes
  const handleSelectPointer = () => {
    setInputModality("pointer");
    if (arMode) {
      setArMode(false);
    }
    if (voiceListening) {
      recognitionRef.current?.stop();
    }
  };

  // AR Camera Select
  const handleSelectCamera = () => {
    const nextAr = !arMode;
    setArMode(nextAr);
    if (nextAr) {
      setInputModality("camera");
      // Stop voice if listening
      if (voiceListening) recognitionRef.current?.stop();
    } else {
      setInputModality("pointer");
    }
  };

  // Toggle Accessibility Panel
  const handleSelectA11y = () => {
    const nextOpen = !a11yOpen;
    setA11yOpen(nextOpen);
    if (nextOpen) {
      window.dispatchEvent(new CustomEvent("open-accessibility-panel"));
    } else {
      window.dispatchEvent(new CustomEvent("close-accessibility-panel"));
    }
  };

  // Custom Event Listener to close dock when needed
  useEffect(() => {
    const handleCloseDock = () => setExpanded(false);
    window.addEventListener("close-multimodal-dock", handleCloseDock);
    return () => window.removeEventListener("close-multimodal-dock", handleCloseDock);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-auto">
      {/* Speech HUD Panel (Slides out horizontally to the left of the dock) */}
      <AnimatePresence>
        {(voiceState === "listening" || voiceState === "error") && voiceTranscript && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ ...SPRING_SNAPPY, duration: 0.3 }}
            className="df-glass max-w-xs p-4 text-sm text-[#C8B8FF] absolute bottom-16 right-16 mr-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-teal-500/25"
            role="status"
            aria-live="polite"
          >
            {voiceTranscript}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Action Menu Stack (Slides vertically upward) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={SPRING_SNAPPY}
            className="flex flex-col items-end gap-2.5 mb-1"
          >


            {/* 2. AR Camera Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectCamera}
              className={`df-glass flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                arMode
                  ? "border border-violet-500 bg-violet-600/30 text-violet-300 shadow-[0_0_15px_rgba(108,59,255,0.4)]"
                  : "text-slate-400 hover:text-white border-white/5 hover:bg-white/5"
              }`}
              aria-label="Toggle AR Camera Mode"
              aria-pressed={arMode}
            >
              <Camera className="h-5 w-5" />
            </motion.button>

            {/* 3. Voice (Microphone) Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoice}
              className={`df-glass flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-md relative ${
                voiceListening
                  ? "border border-emerald-500 bg-emerald-600/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "text-slate-400 hover:text-white border-white/5 hover:bg-white/5"
              }`}
              aria-label={voiceListening ? "Stop voice listening" : "Start voice listening"}
              aria-pressed={voiceListening}
            >
              {/* Circular Voice Signal Rings if active */}
              {voiceListening && (
                <svg className="absolute inset-0 -rotate-90 scale-[1.12]" viewBox="0 0 48 48" aria-hidden>
                  <circle
                    cx={24}
                    cy={24}
                    r={22}
                    fill="none"
                    stroke={`url(#voiceGradDock)`}
                    strokeWidth={2}
                    strokeDasharray={138}
                    strokeDashoffset={138 - voiceConfidence * 138}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="voiceGradDock" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor={gradient.stop1} />
                      <stop offset="1" stopColor={gradient.stop2} />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              {voiceListening ? (
                <Mic className="h-5 w-5 animate-pulse text-emerald-400" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </motion.button>

            {/* 4. Pointer Select Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectPointer}
              className={`df-glass flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                inputModality === "pointer" && !arMode && !voiceListening
                  ? "border border-cyan-500 bg-cyan-600/30 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                  : "text-slate-400 hover:text-white border-white/5 hover:bg-white/5"
              }`}
              aria-label="Set Pointer Mode (Default)"
            >
              <MousePointer2 className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composite Menu Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_25px_rgba(108,59,255,0.3)] transition-all overflow-hidden"
        aria-label="Toggle multimodal console menu"
        aria-expanded={expanded}
      >
        {/* Render our newly designed vector master integrated icon SVG */}
        <img
          src="/icons/integrated-voice-camera-icon.svg"
          alt="Multimodal Console Icon"
          className={`h-full w-full object-cover transition-transform duration-500 ${
            expanded ? "rotate-90 scale-95" : ""
          }`}
        />
        
        {/* Soft neon indicator bar showing expanded status */}
        {expanded && (
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
        )}
      </motion.button>
    </div>
  );
}
