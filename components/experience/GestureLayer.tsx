"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStored, setStored } from "@/lib/experience/storage";
import { useExperience } from "./ExperienceProvider";

export function GestureLayer({
  onSidebarOpen,
  onSidebarClose,
}: {
  onSidebarOpen?: () => void;
  onSidebarClose?: () => void;
}) {
  const { setInputModality } = useExperience();
  const [showHints, setShowHints] = useState(false);
  const touchStart = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    if (!getStored("gesture_hints_seen", false)) {
      setShowHints(true);
      const t = setTimeout(() => {
        setShowHints(false);
        setStored("gesture_hints_seen", true);
      }, 6000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
      setInputModality("touch");
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      if (touchStart.current.x < 24 && dx > 80) {
        onSidebarOpen?.();
        setInputModality("gesture");
      }
      if (dx < -80) onSidebarClose?.();
      if (dy < -100 && e.touches.length >= 2) {
        document.dispatchEvent(new CustomEvent("df-card-expand"));
      }
      setTimeout(() => setInputModality("pointer"), 300);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSidebarOpen, onSidebarClose, setInputModality]);

  return (
    <AnimatePresence>
      {showHints && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center p-8"
          role="dialog"
          aria-label="Gesture hints"
        >
          <div className="df-glass max-w-md p-6 grid gap-3 text-sm text-[#C8B8FF]">
            <p className="text-white font-semibold">Gesture navigation</p>
            <p>Swipe from left edge → open navigation</p>
            <p>Swipe left → close panels</p>
            <p>Two-finger swipe up → expand cards</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
