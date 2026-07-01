"use client";

import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./GlassPanel";
import { useImmersive } from "./ImmersiveProvider";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

interface Modal3DProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal3D({ open, onClose, children, title, className }: Modal3DProps) {
  const { reducedMotion } = useImmersive();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-3d-title" : undefined}
          >
            <motion.div
              className={cn("pointer-events-auto w-full max-w-lg perspective-[1200px]", className)}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.6, rotateX: 12, z: -400 }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, rotateX: 0, z: 0 }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, rotateX: -8, z: -200 }
              }
              transition={SPRING_SOFT}
              style={{ transformStyle: "preserve-3d" }}
            >
              <GlassPanel depth="front" tilt={false} className="p-6 relative">
                {/* Close button (X icon) in top-right */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {title && (
                  <h2 id="modal-3d-title" className="text-lg font-bold text-white mb-4 pr-8">
                    {title}
                  </h2>
                )}
                {children}
              </GlassPanel>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
