import type { Metadata } from "next";
import { GapAnalysisDashboard } from "@/components/GapAnalysisDashboard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gap Analysis & Improvement Inventory | DealFlow.AI",
  description:
    "Comprehensive audit of all remaining gaps, unmet requirements, and enhancement opportunities across Technical, GTM/Sales/Marketing, UX, and Compliance domains — prioritised by severity-impact score.",
};

export default function GapsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-white transition-colors font-mono"
            >
              ← Home
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-mono text-slate-400">docs/gaps</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-600">
            DealFlow.AI — Internal Roadmap
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs text-red-400 mb-4">
            🔍 Comprehensive Audit
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-3">
            Gap Analysis &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
              Improvement Inventory
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            A prioritised catalogue of all remaining gaps, unmet requirements, and enhancement
            opportunities across four functional domains. Items are sorted by{" "}
            <strong className="text-white">priority score</strong> (severity weight × business
            impact 1–10). Click any item to expand the full recommendation.
          </p>

          {/* Domain legend */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: "⚙️", label: "Technical",                 color: "text-indigo-400" },
              { icon: "📈", label: "GTM / Sales / Marketing",   color: "text-teal-400" },
              { icon: "🎯", label: "User Experience",            color: "text-violet-400" },
              { icon: "🔒", label: "Compliance & Security",      color: "text-red-400" },
            ].map(({ icon, label, color }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 text-xs ${color} rounded-full border border-white/10 bg-white/[0.03] px-3 py-1`}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <GapAnalysisDashboard />

        {/* Footer note */}
        <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-6 text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Methodology:</strong> Each gap is rated on two
          axes — <em>Severity</em> (Critical / High / Medium / Low based on security and
          regulatory exposure) and <em>Business Impact</em> (1–10 based on revenue, retention, and
          compliance risk). The combined priority score determines implementation order.
          Legal items (GDPR/CCPA) require independent legal counsel for full regulatory
          compliance confirmation.
        </div>
      </div>
    </main>
  );
}
