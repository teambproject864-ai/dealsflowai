"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useExperience } from "./ExperienceProvider";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const { a11y, updateA11y } = useExperience();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleToggle = () => setOpen((prev) => !prev);

    window.addEventListener("open-accessibility-panel", handleOpen);
    window.addEventListener("close-accessibility-panel", handleClose);
    window.addEventListener("toggle-accessibility-panel", handleToggle);

    return () => {
      window.removeEventListener("open-accessibility-panel", handleOpen);
      window.removeEventListener("close-accessibility-panel", handleClose);
      window.removeEventListener("toggle-accessibility-panel", handleToggle);
    };
  }, []);

  const cycleContrast = () => {
    const order = ["normal", "high", "inverted"] as const;
    const i = order.indexOf(a11y.contrast);
    updateA11y({ contrast: order[(i + 1) % order.length] });
  };

  const handleClosePanel = () => {
    setOpen(false);
    // Also notify dock to update active menu button status if expanded
    window.dispatchEvent(new CustomEvent("close-multimodal-dock"));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 24, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16 }}
          transition={SPRING_SOFT}
          className="df-glass fixed bottom-24 right-6 md:right-24 z-[95] w-72 md:w-80 p-4 space-y-4 shadow-2xl border border-white/10"
          role="dialog"
          aria-label="Accessibility controls"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white">Accessibility</h2>
            <button type="button" onClick={handleClosePanel} aria-label="Close panel">
              <X className="h-4 w-4 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>

          <label className="block text-xs text-[#C8B8FF]">
            Font scale — {Math.round(a11y.fontScale * 100)}%
            <input
              type="range"
              min={80}
              max={160}
              value={a11y.fontScale * 100}
              onChange={(e) => updateA11y({ fontScale: Number(e.target.value) / 100 })}
              className="w-full mt-1 accent-cyan-400 cursor-pointer"
            />
          </label>

          <button type="button" onClick={cycleContrast} className="df-glass w-full py-2 text-xs text-white rounded-lg hover:bg-white/5 transition-colors border border-white/5">
            Contrast: {a11y.contrast}
          </button>

          <label className="flex items-center gap-2 text-xs text-[#C8B8FF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={a11y.reducedMotion}
              onChange={(e) => updateA11y({ reducedMotion: e.target.checked })}
              className="accent-cyan-400"
            />
            Reduce motion
          </label>

          <label className="flex items-center gap-2 text-xs text-[#C8B8FF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={a11y.dyslexiaFont}
              onChange={(e) => updateA11y({ dyslexiaFont: e.target.checked })}
              className="accent-cyan-400"
            />
            Dyslexia-friendly font
          </label>

          <label className="block text-xs text-[#C8B8FF]">
            Color vision
            <select
              value={a11y.colorBlind}
              onChange={(e) =>
                updateA11y({
                  colorBlind: e.target.value as typeof a11y.colorBlind,
                })
              }
              className="df-glass w-full mt-1 rounded-lg px-2 py-1.5 text-white bg-slate-900 border border-white/5 cursor-pointer outline-none"
            >
              <option value="none">Standard</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-[#C8B8FF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={a11y.screenReaderExtended}
              onChange={(e) => updateA11y({ screenReaderExtended: e.target.checked })}
              className="accent-cyan-400"
            />
            Extended screen reader descriptions
          </label>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
