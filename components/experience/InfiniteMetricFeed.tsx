"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { SPRING_SOFT } from "@/lib/immersive3d/motion";

interface FeedItem {
  id: string;
  label: string;
  value: string;
}

export function InfiniteMetricFeed({
  metrics,
}: {
  metrics: {
    totalAnalyzed: number;
    activeAgents: number;
    teamMembers: number;
    integrations: number;
  };
}) {
  const items: FeedItem[] = [
    { id: "1", label: "Pipeline synced", value: `${metrics.totalAnalyzed} leads` },
    { id: "2", label: "Active agents", value: `${metrics.activeAgents}` },
    { id: "3", label: "Team online", value: `${metrics.teamMembers}` },
    { id: "4", label: "Integrations active", value: `${metrics.integrations}` },
  ];

  return (
    <div className="mt-12 space-y-3">
      <h2 className="text-sm font-mono uppercase tracking-widest text-[#8B9BB8]">Activity stream</h2>
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 24, z: -40 }}
          animate={{ opacity: 1, y: 0, z: 0 }}
          transition={{ ...SPRING_SOFT, delay: i * 0.08 }}
        >
          <GlassPanel depth="mid" tilt={false} className="p-4 flex justify-between items-center">
            <span className="text-[#C8B8FF]">{item.label}</span>
            <span className="text-white font-bold tabular-nums">{item.value}</span>
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  );
}
