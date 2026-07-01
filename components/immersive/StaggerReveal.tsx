"use client";

import { type ReactNode, useRef, useEffect, Children } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImmersive } from "./ImmersiveProvider";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.08,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const { reducedMotion } = useImmersive();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className}>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger } },
        }}
      >
        {Children.count(children) > 1
          ? Children.map(children, (child, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40, rotateX: 8, z: -80 },
                  visible: { opacity: 1, y: 0, rotateX: 0, z: 0 },
                }}
                transition={SPRING_SOFT}
                style={{ transformStyle: "preserve-3d" }}
              >
                {child}
              </motion.div>
            ))
          : Children.count(children) === 0 ? null : (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 32, z: -60 },
                  visible: { opacity: 1, y: 0, z: 0 },
                }}
                transition={SPRING_SOFT}
              >
                {children}
              </motion.div>
            )}
      </motion.div>
    </motion.div>
  );
}

/** GSAP ScrollTrigger hook for scroll-driven 3D transforms */
export function useScrollTrigger3D(
  selector: string,
  enabled = true
) {
  const { reducedMotion, enableLite } = useImmersive();

  useEffect(() => {
    if (!enabled || reducedMotion || !enableLite || typeof window === "undefined") return;

    let ctx: { revert: () => void } | undefined;

    const init = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const els = document.querySelectorAll(selector);
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { rotateX: 6, y: 48, opacity: 0.3, transformPerspective: 1200 },
          {
            rotateX: 0,
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 45%",
              scrub: 0.6,
            },
          }
        );
      });

      ctx = { revert: () => ScrollTrigger.getAll().forEach((t) => t.kill()) };
    };

    init();
    return () => ctx?.revert();
  }, [selector, enabled, reducedMotion, enableLite]);
}
