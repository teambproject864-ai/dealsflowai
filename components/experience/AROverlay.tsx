"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import { useExperience } from "./ExperienceProvider";
import { GlassPanel } from "@/components/immersive/GlassPanel";

export function AROverlay() {
  const { arMode, setArMode, setInputModality } = useExperience();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!arMode) return;
    setScanning(true);
    const t = setTimeout(() => setScanning(false), 2000);
    setInputModality("camera");
    let stream: MediaStream | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setArMode(false);
        setInputModality("pointer");
      }
    })();

    return () => {
      clearTimeout(t);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [arMode, setArMode, setInputModality]);

  useEffect(() => {
    if (!arMode) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      const root = document.getElementById("ar-hud");
      if (!root) return;
      const beta = (e.beta ?? 0) * 0.15;
      const gamma = (e.gamma ?? 0) * 0.15;
      root.style.transform = `perspective(800px) rotateX(${-beta}deg) rotateY(${gamma}deg)`;
    };
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [arMode]);

  return (
    <>
      <AnimatePresence>
        {arMode && (
          <motion.div
            className="fixed inset-0 z-[150] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="application"
            aria-label="Augmented reality view"
          >
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
            {scanning && (
              <div className="absolute inset-8 border-2 border-violet-400/50 rounded-2xl pointer-events-none">
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            )}
            <div id="ar-hud" className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <GlassPanel depth="front" tilt={false} className="p-6 max-w-sm pointer-events-auto">
                <p className="text-xs font-mono uppercase tracking-widest text-violet-400">AR Dashboard</p>
                <p className="mt-2 text-2xl font-bold text-white immersive-holo-text">Pipeline +24%</p>
                <p className="text-sm text-[#C8B8FF] mt-1">Metrics anchored in your space</p>
              </GlassPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
