import Link from "next/link";
import { GlassPanel } from "@/components/immersive";
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Cpu, 
  Database, 
  ShieldAlert, 
  Flame,
  Terminal,
  Layers
} from "lucide-react";

export const metadata = {
  title: "Documentation Directory | DealFlow.AI",
  description: "Explore developer guides, architecture briefs, and system roadmap documentation.",
};

export default function DocsIndexPage() {
  const topics = [
    {
      title: "Hermes Memory OS",
      description: "Understand the core memory zones, priority queues, and state synchronization layer powering multi-agent loops.",
      icon: Cpu,
      href: "#",
      badge: "Architecture"
    },
    {
      title: "MEM Palace Semantic Store",
      description: "Dive into our high-dimensional vector databases, semantic indexing pathways, and context retrieval pipelines.",
      icon: Database,
      href: "#",
      badge: "Database"
    },
    {
      title: "Clawpatrol Security Guardrails",
      description: "Explore the secure firewall architecture: PII redaction rules, prompt injection sanitization, and compliance vaults.",
      icon: Layers,
      href: "#",
      badge: "Security"
    },
    {
      title: "API & Sync Connectors",
      description: "Setup Salesforce, HubSpot, and Slack webhooks to sync pipeline activities and agent-triggered booking events.",
      icon: Terminal,
      href: "#",
      badge: "API Reference"
    },
    {
      title: "System Gap Analysis Roadmap",
      description: "Check remaining improvement items, technical debt, and compliance tasks prioritized by severity-impact score.",
      icon: ShieldAlert,
      href: "/docs/gaps",
      badge: "Internal Roadmap",
      highlight: true
    }
  ];

  return (
    <main className="min-h-screen bg-[#060612] text-slate-100 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <header className="space-y-4 mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Developer Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Documentation Directory
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Access references, architectural guides, and security postures for the DealFlow AI cognitive suite.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {topics.map((topic, i) => (
            <GlassPanel 
              key={topic.title}
              material="glass" 
              depth="mid" 
              className={`p-8 border-white/10 shadow-2xl flex flex-col justify-between transition-all hover:border-teal-500/35 relative overflow-hidden group ${
                topic.highlight ? "md:col-span-2 border-indigo-500/25 bg-gradient-to-r from-indigo-500/5 via-[#0c0c24]/50 to-slate-900/50" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {topic.badge}
                  </span>
                  {topic.highlight && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full animate-pulse">
                      <Flame className="h-3 w-3" />
                      Critical Attention
                    </span>
                  )}
                </div>

                <div className="flex gap-4 items-start">
                  <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 text-teal-400 group-hover:scale-105 transition-transform duration-300 ${
                    topic.highlight ? "text-indigo-400" : ""
                  }`}>
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-350 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end">
                <Link href={topic.href} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 hover:text-teal-350 transition-colors group-hover:translate-x-1 transition-transform">
                  <span>Open Document</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </main>
  );
}
