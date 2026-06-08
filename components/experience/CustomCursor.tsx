"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useImmersive } from "@/components/immersive/ImmersiveProvider";
import { useExperience } from "./ExperienceProvider";

export function CustomCursor() {
  const { enableLite, reducedMotion, light } = useImmersive();
  const { cursorMode } = useExperience();
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trails, setTrails] = useState<{ x: number; y: number; id: number }[]>([]);
  const ringX = useSpring(0, { stiffness: 180, damping: 22 });
  const ringY = useSpring(0, { stiffness: 180, damping: 22 });
  const dotX = useSpring(0, { stiffness: 400, damping: 28 });
  const dotY = useSpring(0, { stiffness: 400, damping: 28 });
  const idRef = useRef(0);

  useEffect(() => {
    if (!enableLite || reducedMotion) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const onMove = (e: MouseEvent) => {
      setVisible(true);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      if (cursorMode === "trail") {
        const id = ++idRef.current;
        setTrails((t) => [...t.slice(-12), { x: e.clientX, y: e.clientY, id }]);
        setTimeout(() => setTrails((t) => t.filter((p) => p.id !== id)), 600);
      }
    };

    const onLeave = () => setVisible(false);

    const onDown = () => {
      setIsClicking(true);
      if (cursorMode === "ripple") {
        document.dispatchEvent(new CustomEvent("df-cursor-ripple"));
      }
    };

    const onUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
    };
  }, [enableLite, reducedMotion, cursorMode, dotX, dotY, ringX, ringY]);

  if (!enableLite || reducedMotion) return null;

  return (
    <div className="df-custom-cursor fixed inset-0 z-[9999] pointer-events-none" aria-hidden>
      {cursorMode === "trail" &&
        trails.map((t) => (
          <span
            key={t.id}
            className="absolute h-3 w-3 rounded-full bg-gradient-to-r from-violet-500/40 to-cyan-400/40 blur-sm"
            style={{ left: t.x, top: t.y, transform: "translate(-50%,-50%)" }}
          />
        ))}
      <motion.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isHovering ? 48 : isClicking ? 32 : 40,
          height: isHovering ? 48 : isClicking ? 32 : 40,
          borderColor: isHovering ? "rgba(108, 59, 255, 0.6)" : "rgba(255, 255, 255, 0.2)",
          boxShadow: isHovering
            ? `0 0 24px rgba(108,59,255,0.6), ${light.nx * 8}px ${light.ny * 8}px 16px rgba(0,212,255,0.2)`
            : `0 0 24px rgba(108,59,255,0.35), ${light.nx * 8}px ${light.ny * 8}px 16px rgba(0,212,255,0.2)`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {cursorMode === "orbit" && (
          <>
            <span className="absolute inset-0 animate-spin-slow border-t border-cyan-400/60 rounded-full" />
            <span className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_8px_#6C3BFF]" />
          </>
        )}
      </motion.div>
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#00D4FF] shadow-[0_0_12px_#00D4FF]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: isClicking ? 4 : 8,
          height: isClicking ? 4 : 8,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
