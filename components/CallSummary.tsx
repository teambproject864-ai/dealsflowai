"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  IconCalendarQuarter,
  IconCheckCircle,
  IconConversionBars,
  IconDealBrief,
  IconEmailSequence,
  IconExternalWindow,
  IconPhoneDialer,
  IconUserStakeholder,
} from "@/components/gtm/GtmIcons";

function CallSummaryContent() {
  const params = useParams();
  const callId = params.callId;

  const [call, setCall] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const callData = await res.json();
        setCall(callData);

        const leadRes = await fetch(`/api/leads/${callData.leadId}`);
        const leadData = await leadRes.json();
        setLead(leadData);

        const analysisRes = await fetch(`/api/analysis/${callData.analysisId}`);
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);

        const summaryRes = await fetch(`/api/meeting/summary?callId=${callId}`);
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } catch (e) {
        console.error("Error fetching summary data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [callId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12 bg-dealflow-ink px-4 py-16 text-white">
      <header className="flex flex-col justify-between gap-6 border-b border-white/5 pb-12 md:flex-row md:items-center">
        <div className="space-y-4">
          <Badge className="border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Call summary ready
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
            Meeting with {lead?.companyName}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <IconCalendarQuarter className="h-4 w-4 text-teal-400" />
              {new Date(call?.scheduledAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2">
              <IconUserStakeholder className="h-4 w-4 text-teal-400" />
              {lead?.contactName}
            </div>
            <div className="flex items-center gap-2">
              <IconConversionBars className="h-4 w-4 text-teal-400" />
              {call?.dealProbability}% forecasted close
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-white/10 px-6 hover:bg-white/5">
            <IconEmailSequence className="mr-2 h-4 w-4" />
            Resend recap
          </Button>
          <Button className="h-12 bg-teal-600 px-8 shadow-lg shadow-teal-600/20 hover:bg-teal-500">
            Download PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr,320px]">
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-600/20">
                <IconDealBrief className="h-4 w-4 text-teal-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Executive summary</h2>
            </div>
            <div className="prose prose-invert prose-sm max-w-none rounded-2xl border border-white/10 bg-white/5 p-8 leading-relaxed text-gray-300">
              {summary?.content || "No detailed summary generated yet."}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-600/20">
                <IconCheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">GTM insight recap</h2>
            </div>
            <div className="grid gap-4">
              {analysis?.marketDifferentiationTriggers?.map((trigger: string, i: number) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400/70 mb-2">
                    Market Differentiation Trigger
                  </p>
                  <p className="text-sm text-slate-200">{trigger}</p>
                </div>
              ))}
              {analysis?.customerJourneyPipeline?.map((stage: { title: string; content: string }, i: number) => (
                <div key={`stage-${i}`} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-2">
                    {stage.title}
                  </p>
                  <p className="text-sm text-slate-300">{stage.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-teal-300">Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full border border-white/10 bg-white/5 p-2">
                  <IconUserStakeholder className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Contact name</p>
                  <p className="text-sm font-semibold text-white">{lead?.contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full border border-white/10 bg-white/5 p-2">
                  <IconEmailSequence className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="break-all text-sm font-semibold text-white">{lead?.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full border border-white/10 bg-white/5 p-2">
                  <IconPhoneDialer className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold text-white">{lead?.contactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-teal-300">Deal intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Forecasted probability</p>
                  <p className="text-xs font-bold text-emerald-400">{call?.dealProbability}%</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${call?.dealProbability}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Deal status</p>
                <Badge className="border-none bg-teal-500/10 px-3 py-1 text-xs font-bold capitalize text-teal-300">
                  {call?.dealStatus || "In progress"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="h-12 w-full border-white/10 text-gray-400 hover:bg-white/5">
            <Link href={`/meeting-agent/live?callId=${callId}`}>
              View full transcript
              <IconExternalWindow className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <main className="min-h-screen bg-dealflow-ink">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
          </div>
        }
      >
        <CallSummaryContent />
      </Suspense>
    </main>
  );
}
