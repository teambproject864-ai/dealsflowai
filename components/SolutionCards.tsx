"use client";

import { motion } from "framer-motion";
import type { SolutionMapping } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconAlertObjection, IconArrowRight, IconCheckCircle } from "@/components/gtm/GtmIcons";
import { Badge } from "@/components/ui/badge";

export function SolutionCards({ solutions }: { solutions: SolutionMapping[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {solutions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="h-full overflow-hidden border-white/10 bg-white/5">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Badge variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-400">
                  Pain point
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconArrowRight className="h-4 w-4 text-teal-500/80" />
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    Dealflow.ai motion
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <h3 className="text-sm font-semibold leading-tight text-white sm:text-base">{s.painPoint}</h3>
                <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold leading-tight text-emerald-400 sm:text-base">{s.solution}</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-teal-300/70">
                    Expected outcome
                  </p>
                  <p className="text-sm font-medium text-white">{s.expectedOutcome}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">ROI estimate</p>
                  <p className="text-sm font-medium text-emerald-400">{s.roiEstimate}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <IconAlertObjection className="h-3.5 w-3.5 text-red-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/70">Before</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.beforeAfter.before}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <IconCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">After</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.beforeAfter.after}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function HowDealflowWorks({ companyName }: { companyName: string }) {
  const steps = [
    {
      title: "AI analysis & strategy",
      body: `Our models analyzed ${companyName}'s data to map specific pain points to proven Dealflow.ai solutions.`,
    },
    {
      title: "Stack integration",
      body: `Connect your CRM and sales data to get a unified view of ${companyName}'s entire growth engine.`,
    },
    {
      title: "Automated orchestration",
      body: "Deploy AI agents that handle lead scoring, personalized follow-ups, and meeting scheduling automatically.",
    },
    {
      title: "Continuous optimization",
      body: "Real-time performance tracking and iterative AI learning to maximize your ROI every single day.",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-white">How Dealflow.ai works</h2>
        <p className="mt-2 text-muted-foreground">Four steps to transforming your sales and marketing</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="relative space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-lg font-bold text-white shadow-lg shadow-teal-600/25">
              {i + 1}
            </div>
            <h3 className="font-semibold text-white">{s.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
