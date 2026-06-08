"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStored, setStored } from "@/lib/experience/storage";
import { useExperience } from "./ExperienceProvider";
import { SPRING_SNAPPY } from "@/lib/immersive3d/motion";

interface Step {
  id: string;
  title: string;
  body: string;
  targetSelector?: string;
}

export function OnboardingSpotlight({
  featureId,
  steps,
  children,
}: {
  featureId: string;
  steps: Step[];
  children: ReactNode;
}) {
  const { helpMode } = useExperience();
  const key = `onboard_${featureId}`;
  const done = getStored(key, false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if ((helpMode || !done) && steps.length) setActive(true);
  }, [helpMode, done, steps.length]);

  const dismiss = () => {
    setStored(key, true);
    setActive(false);
  };

  const current = steps[step];

  return (
    <>
      {children}
      <AnimatePresence>
        {active && current && (
          <>
            <motion.div
              className="fixed inset-0 z-[110] bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-labelledby="onboard-title"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING_SNAPPY}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[111] df-glass max-w-md p-6 w-[calc(100%-2rem)]"
            >
              <div className="flex justify-between text-[10px] font-mono text-[#8B9BB8] mb-2">
                <span>
                  Step {step + 1} / {steps.length}
                </span>
                <button type="button" onClick={dismiss} className="hover:text-white">
                  Skip
                </button>
              </div>
              <div className="h-1 df-glass rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#6C3BFF] to-[#00D4FF]"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
              <h3 id="onboard-title" className="text-lg font-bold text-white">
                {current.title}
              </h3>
              <p className="mt-2 text-sm text-[#C8B8FF]">{current.body}</p>
              <div className="mt-4 flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="df-glass px-4 py-2 rounded-lg text-sm text-white"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (step < steps.length - 1) setStep((s) => s + 1);
                    else dismiss();
                  }}
                  className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#6C3BFF] to-[#00D4FF]"
                >
                  {step < steps.length - 1 ? "Next" : "Done"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
