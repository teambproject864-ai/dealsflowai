"use client";

import { motion } from "framer-motion";
import { SPRING_SNAPPY } from "@/lib/immersive3d/motion";
import { useImmersive } from "@/components/immersive/ImmersiveProvider";

export function KineticHero({ text }: { text: string }) {
  const { reducedMotion } = useImmersive();
  const chars = text.split("");

  if (reducedMotion) {
    return (
      <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-white immersive-text-shimmer">
        <span className="immersive-holo-text">{text}</span>
      </h1>
    );
  }

  return (
    <h1
      className="font-display text-4xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-[-0.04em] leading-[1.05] immersive-text-shimmer"
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block immersive-holo-text"
          initial={{ opacity: 0, y: 48, rotateX: 40, z: -80 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
          transition={{ ...SPRING_SNAPPY, delay: i * 0.04 }}
          style={{ transformStyle: "preserve-3d" }}
          aria-hidden={char === " "}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </h1>
  );
}
