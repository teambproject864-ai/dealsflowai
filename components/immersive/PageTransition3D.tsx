"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useImmersive } from "./ImmersiveProvider";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

export function PageTransition3D({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reducedMotion, enableLite } = useImmersive();

  if (reducedMotion || !enableLite) {
    return <div className="relative z-10 flex flex-col flex-1">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="relative z-10 flex flex-col flex-1 immersive-page-scene"
        style={{ transformStyle: "preserve-3d", perspective: 1600 }}
        initial={{ opacity: 0, scale: 0.72, z: -2000, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, z: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.88, z: -800, rotateX: -4 }}
        transition={SPRING_SOFT}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
