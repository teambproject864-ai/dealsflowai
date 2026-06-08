"use client";

import React from "react";
import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function NewAnalysisPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Premium glowing matrix grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Background radial space gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[130px] pointer-events-none animate-pulse" />

      {/* Standalone Dashboard Cockpit Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" prefetch={false} className="flex items-center gap-2 group cursor-pointer">
          <div className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold transition-colors group-hover:text-slate-200">
            DEALFLOW<span className="text-violet-500">.AI</span>
          </span>
        </Link>
        <Link 
          href="/" 
          prefetch={false}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-violet-500/5 cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>
      </header>

      {/* Main Form Center Section */}
      <section className="container mx-auto px-6 pt-12 pb-16 relative z-10 max-w-4xl flex-grow flex flex-col items-center justify-center">
        <div className="text-center space-y-4 mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] mx-auto">
            <CheckCircle2 className="h-4 w-4 text-violet-400" />
            Pipeline Analysis Config
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-xl">
            Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-teal-300">GTM Analysis</span>
          </h1>
          
          <p className="mx-auto text-sm sm:text-base leading-relaxed text-slate-400 font-medium">
            Complete the RevOps questionnaire to calibrate our autonomous RevOps models for your pipeline.
          </p>
        </div>

        {/* Central Standalone Glassmorphic Form Card */}
        <div className="w-full flex justify-center">
          <IntakeForm />
        </div>
      </section>

      {/* Consistent Professional Copyright Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/20 py-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
          &copy; {new Date().getFullYear()} DEALFLOW.AI. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  );
}
