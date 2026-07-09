"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const MarketingCampaignViewer3D = dynamic(
  () => import("@/components/solutions-3d/MarketingCampaignViewer3D").then((mod) => mod.MarketingCampaignViewer3D),
  { ssr: false }
);
import { Loader2 } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/solutions",           label: "DEALFLOW.OS" },
  { href: "/solutions/gtm",       label: "GTM Roadmap" },
  { href: "/solutions/sales",     label: "Sales Pipeline" },
  { href: "/solutions/marketing", label: "Marketing" },
];

export default function MarketingPage() {
  return (
    <main className="relative min-h-screen bg-slate-950">
      <nav className="sticky left-0 right-0 top-0 z-10 flex items-center gap-1 border-b border-white/5 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              href === "/solutions/marketing"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto text-[10px] font-mono uppercase tracking-widest text-slate-600">
          Marketing Campaign Viewer - Real-time Sync
        </div>
      </nav>

      <div className="min-h-[80vh] w-full pt-4">
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
            </div>
          }
        >
          <MarketingCampaignViewer3D />
        </Suspense>
      </div>
    </main>
  );
}
