"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const SalesPipeline3D = dynamic(
  () => import("@/components/solutions-3d/SalesPipeline3D").then((mod) => mod.SalesPipeline3D),
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

export default function SalesPage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950">
      <nav className="absolute left-0 right-0 top-0 z-10 flex items-center gap-1 border-b border-white/5 bg-slate-950/80 px-6 py-3 backdrop-blur-md">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              href === "/solutions/sales"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto text-[10px] font-mono uppercase tracking-widest text-slate-600">
          Sales Pipeline Dashboard — Real-time Sync
        </div>
      </nav>

      <div className="h-full w-full pt-12">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
            </div>
          }
        >
          <SalesPipeline3D />
        </Suspense>
      </div>
    </main>
  );
}
