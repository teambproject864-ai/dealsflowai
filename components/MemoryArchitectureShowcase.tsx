"use client";

import { motion } from "framer-motion";
import { Cpu, Database, Brain, ArrowRight, ShieldCheck, Zap, Layers, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TECH_STACK = [
  {
    id: "hermes",
    name: "Memory OS (Hermes)",
    tag: "Foundational Memory Substrate",
    definition: "The core operating system of DealFlow.AI's cognitive framework. Memory OS (Hermes) provides unified, high-performance memory management across all automated systems. It manages data access, encrypts sensitive data on the fly, and maintains a lightning-fast memory cache.",
    icon: Cpu,
    color: "text-teal-400",
    bgClass: "from-teal-500/10 via-emerald-500/5 to-transparent",
    borderClass: "border-teal-500/20",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    capabilities: [
      {
        title: "Four-Tier Lifecycle Layout",
        desc: "Organizes system state across active working (session data), short-term (1-7 day cache), long-term (consolidated client metrics), and archival (immutable cold storage) tiers."
      },
      {
        title: "Transparent Cryptography",
        desc: "Leverages automatic AES-256 encryption for contact fields, sales metrics, and credentials at rest, decrypting it dynamically only during active agent reasoning."
      },
      {
        title: "Micro-Latency LRU Cache",
        desc: "Employs an in-memory Least Recently Used cache layer, reducing database lookup latency by over 60% and enabling sub-second response times."
      },
      {
        title: "Granular Permission Guard",
        desc: "Enforces fine-grained agent-level read/write/delete access control policies on a per-memory entry basis, preventing data leakage."
      }
    ],
    synergy: "Serves as the low-level data engine for MEM Palace to partition and index files, while registering real-time interaction states that fuel ALMA's cognitive cycles.",
    benefits: [
      "Sub-second agent context loading and retrieval.",
      "Strict enterprise-level security and data isolation compliance.",
      "Automated cleanup policies that prevent storage bloat."
    ],
    targetLink: "#palace"
  },
  {
    id: "palace",
    name: "MEM Palace",
    tag: "Centralized Storage Organizer",
    definition: "The organized, semantic storage layer of DealFlow.AI. MEM Palace sits directly on top of Memory OS (Hermes), structuring unstructured agent logs, transcripts, and telemetry inputs into highly organized, auditable database categories.",
    icon: Database,
    color: "text-sky-400",
    bgClass: "from-sky-500/10 via-indigo-500/5 to-transparent",
    borderClass: "border-sky-500/20",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    capabilities: [
      {
        title: "Semantic Information Partitioning",
        desc: "Categorizes records into clear functional partitions, such as objections raised, buyer intent telemetry, and historic sequences."
      },
      {
        title: "Structured Context Packaging",
        desc: "Compiles disparate contact notes, phone logs, and email replies into a singular, clean client memory package."
      },
      {
        title: "Immutable Access Audit Logging",
        desc: "Records every instance of memory access by agents or managers, ensuring a complete and tamper-proof security trail."
      },
      {
        title: "Cross-System Relational Links",
        desc: "Maps raw text notes to corresponding Salesforce, HubSpot, or custom database entities automatically."
      }
    ],
    synergy: "Structures and formats raw input logs supplied by Hermes, presenting them as clean semantic indexes for ALMA to query, evaluate, and learn from.",
    benefits: [
      "Complete preservation of customer context across multiple months.",
      "Instant lookup of relevant stakeholder profiles and objections.",
      "Easy human supervisor review of what agents 'know' about a lead."
    ],
    targetLink: "#alma"
  },
  {
    id: "alma",
    name: "ALMA (Agent Learning & Memory)",
    tag: "Adaptive Intelligence Layer",
    definition: "The cognitive processor of DealFlow.AI's memory system. ALMA (Agent Learning and Memory Architecture) interfaces directly with Hermes and MEM Palace to create a feedback loop that promotes important insights, discards stale data, and generates semantic vector indices.",
    icon: Brain,
    color: "text-violet-400",
    bgClass: "from-violet-500/10 via-fuchsia-500/5 to-transparent",
    borderClass: "border-violet-500/20",
    badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    capabilities: [
      {
        title: "Semantic Vector Indexing",
        desc: "Generates high-dimensional vector embeddings of text logs using specialized models, enabling deep semantic searches."
      },
      {
        title: "Insight Promotion Engine",
        desc: "Identifies recurring short-term memory patterns and automatically promotes them to permanent long-term database values."
      },
      {
        title: "Adaptive Forgetting Mechanism",
        desc: "Monitors and scores data importance, automatically offloading or deleting low-value interactions after 30 days to limit prompt pollution."
      },
      {
        title: "Context-Aware Agent Injection",
        desc: "Dynamically selects relevant memories based on user queries and injects them directly into active reasoning streams."
      }
    ],
    synergy: "Consolidates working entries tracked by Hermes into permanent records inside MEM Palace, while relying on MEM Palace indexes to optimize its vector embeddings.",
    benefits: [
      "Autonomous agents that learn and adapt based on previous calls.",
      "Highly efficient prompts that minimize LLM token usage.",
      "Robust guardrails against prompt injection and memory drift."
    ],
    targetLink: "#hermes"
  }
];

export function MemoryArchitectureShowcase() {
  return (
    <div className="space-y-16 py-16">
      {/* Intro Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <Badge variant="outline" className="bg-teal-500/10 text-teal-300 border-teal-500/20 px-4 py-1">
          Memory Infrastructure
        </Badge>
        <h2 className="font-display text-4xl font-semibold text-white tracking-tight sm:text-5xl">
          The Cognitive Engine Behind <span className="bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">Autonomous Sales</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
          DealFlow.AI operates on a next-generation memory architecture that combines real-time state management, secure persistence, and adaptive learning to simulate a highly skilled sales representative.
        </p>
      </div>

      {/* Main Grid mapping the three core systems */}
      <div className="grid gap-8 lg:grid-cols-3">
        {TECH_STACK.map((tech) => {
          const Icon = tech.icon;
          return (
            <motion.div
              key={tech.id}
              id={tech.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="scroll-mt-24"
            >
              <Card className={`h-full border bg-gradient-to-b ${tech.bgClass} ${tech.borderClass} hover:border-white/20 transition-all flex flex-col group overflow-hidden`}>
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${tech.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={tech.badgeColor}>
                      {tech.tag}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-white font-display group-hover:text-teal-300 transition-colors">
                      {tech.name}
                    </CardTitle>
                    <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                      {tech.definition}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                  {/* Capabilities */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-teal-500" /> Key Capabilities
                    </h4>
                    <div className="space-y-3">
                      {tech.capabilities.map((cap, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-xs font-semibold text-white">
                            {cap.title}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-normal">
                            {cap.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synergy */}
                  <div className="space-y-2 bg-white/5 border border-white/5 p-3 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <RefreshCcw className="h-3.5 w-3.5 text-teal-400" /> System Synergy
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {tech.synergy}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400" /> User Benefits
                    </h4>
                    <ul className="space-y-1.5">
                      {tech.benefits.map((benefit, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workflow Integration Link */}
                  <div className="pt-4 border-t border-white/5">
                    <a
                      href={tech.targetLink}
                      className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold group/link"
                    >
                      View workflow compatibility <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
