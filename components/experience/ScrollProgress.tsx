"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setProgress(doc.scrollTop / (doc.scrollHeight - doc.clientHeight || 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-1 z-[60] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
    >
      <motion.div
        className="w-full bg-gradient-to-b from-[#6C3BFF] via-[#00D4FF] to-[#00FFB2] shadow-[0_0_12px_#00D4FF]"
        animate={{ height: `${progress * 100}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      />
    </div>
  );
}
