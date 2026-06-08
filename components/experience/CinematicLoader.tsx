"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

/** CSS-only loader — avoids R3F/drei async issues on first paint */
function CssMorphOrb() {
  return (
    <div className="relative h-full w-full flex items-center justify-center" aria-hidden>
      <div className="absolute h-28 w-28 rounded-full bg-gradient-to-br from-[#6C3BFF]/40 to-[#00D4FF]/30 blur-2xl animate-pulse" />
      <div
        className="h-24 w-24 rounded-full border-2 border-cyan-400/40 animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg, #6C3BFF, #00D4FF, #00FFB2, #FF6B9D, #6C3BFF)",
          WebkitMask: "radial-gradient(circle, transparent 55%, black 56%)",
          mask: "radial-gradient(circle, transparent 55%, black 56%)",
        }}
      />
      <div className="absolute h-10 w-10 rounded-full bg-[#060612] border border-white/10" />
    </div>
  );
}

export function CinematicLoader({ ready }: { ready?: boolean }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8 + Math.random() * 12, ready ? 100 : 92));
    }, 120);
    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    if (ready && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [ready, progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#060612]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          role="alert"
          aria-busy={!ready}
          aria-label="Loading application"
        >
          <div className="h-40 w-40 mb-8">
            <CssMorphOrb />
          </div>
          <div className="w-64 h-1.5 df-glass rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6C3BFF] via-[#00D4FF] to-[#00FFB2] df-shimmer-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={SPRING_SOFT}
            />
          </div>
          <p className="mt-4 text-xs font-mono uppercase tracking-[0.3em] text-[#C8B8FF]">
            Initializing experience
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
