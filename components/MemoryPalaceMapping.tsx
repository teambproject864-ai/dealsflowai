"use client";

import { motion } from "framer-motion";
import {
  IconBuyerMotion,
  IconCaptureInbound,
  IconCustomerJourney,
  IconDataVault,
  IconExecutePlay,
  IconInterfaceRevenue,
  IconLogicStack,
  IconPersistLearn,
  IconPipelineStages,
} from "@/components/gtm/GtmIcons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAPPING_DATA = [
  {
    category: "Revenue workspace",
    icon: IconInterfaceRevenue,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    items: [
      { name: "Dynamic capture", desc: "Structured intake across firmographics and funnel metrics", outcome: "Cleaner ICP" },
      { name: "KPI visibility", desc: "Surfaces pipeline, velocity, and campaign lift in one layer", outcome: "Faster decisions" },
      { name: "Guided selling", desc: "Contextual prompts aligned to stage and persona", outcome: "Higher win rate" },
      { name: "Engagement telemetry", desc: "Live views of meetings, touches, and responses", outcome: "Full funnel truth" },
      { name: "Win-plan mapping", desc: "Links pains to plays, assets, and proof points", outcome: "Repeatable GTM" },
    ],
  },
  {
    category: "Orchestration & AI",
    icon: IconLogicStack,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    items: [
      { name: "Decision engine", desc: "Reasoning across transcripts, CRM, and knowledge base", outcome: "Autonomous next steps" },
      { name: "Quality guardrails", desc: "Policy, tone, and factual checks on every customer touch", outcome: "Trusted outreach" },
      { name: "Lifecycle automation", desc: "Sequences that adapt to signals and stage movement", outcome: "Always-on pipeline" },
      { name: "Semantic retrieval", desc: "Finds the right story for every account in milliseconds", outcome: "Sharper calls" },
      { name: "Closed-loop reporting", desc: "Rolls outcomes back into models and dashboards", outcome: "Continuous lift" },
    ],
  },
  {
    category: "Customer & deal data",
    icon: IconDataVault,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    items: [
      { name: "Account records", desc: "Golden profiles with enrichment and consent state", outcome: "Audit-ready" },
      { name: "Strategic assessments", desc: "Stores GTM analyses and recommended motions", outcome: "Institutional memory" },
      { name: "Conversation memory", desc: "Captures objections, promises, and follow-ups", outcome: "No dropped balls" },
      { name: "Engagement graph", desc: "Touch history across email, voice, and meetings", outcome: "Attribution clarity" },
      { name: "Signal streams", desc: "Real-time hooks for intent, replies, and no-shows", outcome: "Reactive plays" },
    ],
  },
  {
    category: "GTM workflows",
    icon: IconBuyerMotion,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    items: [
      { name: "Pipeline kickoff", desc: "Starts with intake, enrichment, and scoring", outcome: "Qualified top of funnel" },
      { name: "Play configuration", desc: "Tunes sequences, talk tracks, and guardrails", outcome: "Segment fit" },
      { name: "Live oversight", desc: "Supervisor views for risk, capacity, and SLAs", outcome: "Control tower" },
      { name: "Meeting conversion", desc: "Books and confirms revenue conversations", outcome: "More SQOs" },
      { name: "Knowledge onboarding", desc: "Ingests decks, battlecards, and pricing logic", outcome: "Smarter agents" },
    ],
  },
];

export function MemoryPalaceMapping() {
  return (
    <div className="space-y-12 py-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300">
          <IconCustomerJourney className="h-4 w-4" />
          <span>Customer journey map</span>
        </div>
        <h2 className="font-display text-4xl font-semibold text-white">How revenue teams use the platform</h2>
        <p className="text-muted-foreground">
          A concise map from first touch to closed-won — each block ties product behavior to measurable pipeline outcomes.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {MAPPING_DATA.map((section, idx) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`rounded-xl p-3 ${section.bg} ${section.color}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="group flex flex-col gap-1 rounded-lg border border-transparent p-3 transition-colors hover:border-white/5 hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white transition-colors group-hover:text-teal-300">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] opacity-60">
                          {item.outcome}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-teal-500/25 bg-gradient-to-br from-teal-600/10 to-amber-500/10 p-8">
        <div className="grid items-center gap-8 text-center md:grid-cols-3">
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
              <IconCaptureInbound className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-white">Capture</h4>
            <p className="text-xs text-muted-foreground">Inbound + outbound signals → unified account context</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
              <IconExecutePlay className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-white">Execute</h4>
            <p className="text-xs text-muted-foreground">AI plays that respect stage, persona, and compliance</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              <IconPersistLearn className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-white">Learn</h4>
            <p className="text-xs text-muted-foreground">Every call and click improves forecasts and messaging</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <IconPipelineStages className="h-8 w-8 text-teal-500/50" aria-hidden />
        </div>
      </Card>
    </div>
  );
}
