"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCw, ZoomIn, Click, MousePointer, Keyboard, X } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: any;
}

const STEPS: Step[] = [
  {
    title: "Rotate Visualization",
    description: "Click and drag anywhere on the canvas to rotate the 3D camera and view the pipeline nodes from different angles.",
    icon: RotateCw,
  },
  {
    title: "Zoom & Inspect",
    description: "Use your mouse wheel or pinch-to-zoom to zoom in/out of specific milestones and check data density.",
    icon: ZoomIn,
  },
  {
    title: "Click to Drill Down",
    description: "Click directly on any 3D node to open a live sync details telemetry panel showing metrics, owners, and dates.",
    icon: MousePointer,
  },
  {
    title: "Accessibility Hotkeys",
    description: "Press Tab or Arrow keys to cycle through nodes using your keyboard. Press Escape to clear your selection.",
    icon: Keyboard,
  },
];

export function OnboardingTour({ sceneKey }: { sceneKey: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarded for this scene (or any 3D scene if preferred)
    const onboarded = localStorage.getItem(`dealflow_3d_onboarded_${sceneKey}`);
    if (!onboarded) {
      setIsVisible(true);
    }
  }, [sceneKey]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(`dealflow_3d_onboarded_${sceneKey}`, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const ActiveIcon = STEPS[currentStep].icon;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-sm w-full bg-slate-900/90 border border-teal-500/20 p-6 rounded-3xl shadow-[0_20px_50px_rgba(20,184,166,0.15)] text-white df-glass"
        >
          {/* Close Button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Skip onboarding tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Step Count Badge */}
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-4 w-4 text-teal-400 animate-pulse" />
            <span>Interactive Guide ({currentStep + 1}/{STEPS.length})</span>
          </div>

          {/* Interactive Slide Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <h4 className="font-display font-bold text-base text-white">{STEPS[currentStep].title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed min-h-[60px]">
                {STEPS[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-5 bg-teal-500" : "w-1.5 bg-white/10"
                  }`} 
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/10"
              >
                <span>{currentStep === STEPS.length - 1 ? "Get Started" : "Next"}</span>
                {currentStep < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
