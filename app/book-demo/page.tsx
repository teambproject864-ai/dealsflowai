"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Zap, Clock, Users, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalysisResult } from "@/lib/types";
import { GlassPanel } from "@/components/immersive";

type ImmediateAvailability = {
  available: boolean;
  message: string;
  activeImmediateCount: number;
  maxImmediateCalls: number;
  estimatedWaitMinutes: number;
};

const BENEFITS = [
  { title: "Interactive Sandbox Tour", desc: "Explore the unified pipeline workspace loaded with live Firestore data." },
  { title: "Custom Agent Demo", desc: "See Memory OS (Hermes) and MEM Palace coordinate in real-time." },
  { title: "Frictionless Integrations", desc: "View live synchronization pathways with Salesforce & HubSpot." },
  { title: "ROI Projection", desc: "Get a tailored savings estimation for your specific sales team." },
  { title: "Security Verification", desc: "Review Clawpatrol compliance vaults and PII redaction rules." }
];

function BookDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");
  const skipMode = !analysisId;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skipAiAgent, setSkipAiAgent] = useState(true);
  const [meetingType, setMeetingType] = useState<"calendly" | "cal" | "other">("cal");
  const [customMeetingUrl, setCustomMeetingUrl] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [availability, setAvailability] = useState<ImmediateAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [directCompanyName, setDirectCompanyName] = useState("");
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");

  useEffect(() => {
    if (!analysisId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch analysis");
        setAnalysis(data);
        
        const leadRes = await fetch(`/api/leads/${data.leadId}`);
        const leadData = await leadRes.json();
        if (!leadRes.ok) throw new Error(leadData.error || "Failed to fetch lead");
        setLead(leadData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [analysisId, router]);

  useEffect(() => {
    let mounted = true;

    async function fetchAvailability() {
      try {
        if (mounted) setCheckingAvailability(true);
        const res = await fetch("/api/calls/availability", { cache: "no-store" });
        const data = await res.json();
        if (mounted && res.ok && data.success) {
          setAvailability({
            available: !!data.available,
            message: data.message || "",
            activeImmediateCount: Number(data.activeImmediateCount || 0),
            maxImmediateCalls: Number(data.maxImmediateCalls || 0),
            estimatedWaitMinutes: Number(data.estimatedWaitMinutes || 0),
          });
        }
      } catch (e) {
        console.error("Availability check failed:", e);
      } finally {
        if (mounted) setCheckingAvailability(false);
      }
    }

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCustomMeetingSubmit = async () => {
    if (!customMeetingUrl) return alert("Please enter a meeting URL");
    setIsSubmittingCustom(true);
    try {
      const createLeadIfNeeded = async () => {
        if (analysis?.leadId) return analysis.leadId;
        const leadRes = await fetch("/api/leads/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: directCompanyName.trim() || "Prospect",
            contactName: directName.trim() || "Guest",
            contactEmail: directEmail.trim(),
            contactPhone: "",
            source: "skip_intake_manual_link",
          }),
        });
        const leadData = await leadRes.json().catch(() => ({}));
        if (!leadRes.ok || !leadData?.leadId) {
          throw new Error(leadData?.error || "lead_create_failed");
        }
        return String(leadData.leadId);
      };

      const leadId = await createLeadIfNeeded();
      const res = await fetch("/api/calls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          analysisId: analysisId || "",
          meetingUrl: customMeetingUrl,
          scheduledAt: new Date().toISOString(),
          guests: ["praneethburada@gmail.com", "praneeth@growstack.ai", "teambproject864@gmail.com"],
        }),
      });
      const data = await res.json();
      if (data.callId) {
        if (skipAiAgent) {
          router.push(`/`);
        } else {
          router.push(`/meeting-agent/live?callId=${data.callId}`);
        }
      }
    } catch (err) {
      console.error("Error creating custom call:", err);
      alert("Failed to create call session.");
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
        <p className="mt-4 text-slate-400 animate-pulse font-medium">Setting up your demo booking session...</p>
      </div>
    );
  }

  if (skipMode) {
    return (
      <div className="space-y-10">
        {/* Header Hero card */}
        <header className="space-y-4 rounded-3xl border border-white/8 bg-white/3 p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            <span>Direct Scheduling</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
            Schedule Your DealFlow AI Demo
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
            Pick a time that works best for your team. You can provide technical and GTM stack details later — a confirmation calendar invite will be sent instantly.
          </p>
        </header>

        {/* Prefill Lead Details Container */}
        <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-teal-300">Attendee Context (Optional)</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="directCompany" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</Label>
              <Input
                id="directCompany"
                value={directCompanyName}
                onChange={(e) => setDirectCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="bg-slate-950/60 border-white/8 text-white placeholder:text-slate-600 focus-visible:ring-teal-500/30 h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directName" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</Label>
              <Input
                id="directName"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="John Doe"
                className="bg-slate-950/60 border-white/8 text-white placeholder:text-slate-600 focus-visible:ring-teal-500/30 h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directEmail" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</Label>
              <Input
                id="directEmail"
                type="email"
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                placeholder="john@acme.com"
                className="bg-slate-950/60 border-white/8 text-white placeholder:text-slate-600 focus-visible:ring-teal-500/30 h-11 rounded-lg"
              />
            </div>
          </div>
        </GlassPanel>

        {/* Main interactive split columns */}
        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          
          {/* Left Main interactive column */}
          <div className="space-y-6">
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preferred Scheduling Tool</h3>
                <p className="text-xs text-slate-400">
                  Select Cal.com or Calendly to view instant calendar slots.
                </p>
              </div>
              <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
                <SelectTrigger className="w-full md:w-[220px] bg-slate-950 border-white/8 text-white h-11 px-4 rounded-lg">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f24] border-white/8 text-white rounded-lg">
                  <SelectItem value="cal" className="cursor-pointer hover:bg-white/5">
                    Cal.com (Default)
                  </SelectItem>
                  <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5">
                    Calendly
                  </SelectItem>
                  <SelectItem value="other" className="cursor-pointer hover:bg-white/5">
                    Other / Manual Link
                  </SelectItem>
                </SelectContent>
              </Select>
            </GlassPanel>

            {meetingType === "other" ? (
              <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl flex flex-col items-center justify-center space-y-6 min-h-[380px]">
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-lg font-bold text-white">Paste your custom meeting link</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Paste a Zoom, Google Meet, Microsoft Teams, Cal, or Calendly slot link below to trigger automated agent workflows.
                  </p>
                </div>
                <div className="w-full max-w-lg space-y-4">
                  <Input
                    value={customMeetingUrl}
                    onChange={(e) => setCustomMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/abc-def-ghi"
                    className="bg-slate-950/60 border-white/8 text-white h-12 rounded-lg"
                  />
                  <Button
                    onClick={handleCustomMeetingSubmit}
                    disabled={isSubmittingCustom}
                    className="w-full h-12 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-all shadow-lg shadow-teal-500/20"
                  >
                    {isSubmittingCustom ? "Scheduling..." : "Confirm custom booking"}
                  </Button>
                </div>
              </GlassPanel>
            ) : (
              <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden shadow-2xl p-2 min-h-[600px]">
                <BookingWidget
                  name={directName}
                  email={directEmail}
                  companyName={directCompanyName}
                  skipAiAgent={skipAiAgent}
                  forcedMeetingType={meetingType === "calendly" ? "calendly" : "cal"}
                />
              </div>
            )}
          </div>

          {/* Right sidebar details/preferences */}
          <aside className="space-y-6">
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-teal-300 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 shrink-0" />
                Session Settings
              </h3>
              
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="skipAiAgent"
                    checked={skipAiAgent}
                    onCheckedChange={(v) => setSkipAiAgent(!!v)}
                    className="border-teal-500/50 data-[state=checked]:bg-teal-600 mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="skipAiAgent" className="text-sm text-white font-semibold cursor-pointer">
                      Skip pre-call AI agent consult
                    </Label>
                    <p className="text-xs text-slate-500 leading-normal">
                      If enabled, you will bypass the interactive meeting agent simulator and return to the main dashboard after booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link href="/">
                  <Button variant="outline" className="w-full border-white/8 bg-white/3 hover:bg-white/5 text-white h-11 rounded-lg text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Intake
                  </Button>
                </Link>
              </div>
            </GlassPanel>

            {/* Why Book A Demo Sidebar Card */}
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                What to expect
              </h3>
              <ul className="space-y-4 text-xs text-slate-400">
                {BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-teal-400" />
                    <div className="space-y-0.5">
                      <strong className="text-white block">{benefit.title}</strong>
                      <span className="leading-relaxed">{benefit.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </aside>
        </div>
      </div>
    );
  }

  if (error || !analysis || !lead) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-6">
        <XCircle className="h-16 w-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-slate-400 text-sm">{error || "The requested analysis details could not be found."}</p>
        <Link href="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
            Back to intake
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header section with GTM summary */}
      <header className="space-y-4 rounded-3xl border border-white/8 bg-gradient-to-r from-teal-500/10 via-[#060612] to-[#060612] p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
          <span>Frictionless Booking Active</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-sans">
          Book Your Custom Demo
        </h1>
        <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
          Configure a tailored demo walkthrough for <strong className="text-white">{lead.companyName}</strong>. Our system has automatically mapped your GTM vulnerabilities.
        </p>
      </header>

      {/* Main split grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
        
        {/* Booking flow main block */}
        <div className="space-y-6">
          <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preferred Scheduling Tool</h3>
              <p className="text-xs text-slate-400">
                Select Cal.com or Calendly to view instant calendar slots.
              </p>
            </div>
            <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
              <SelectTrigger className="w-full md:w-[220px] bg-slate-950 border-white/8 text-white h-11 px-4 rounded-lg">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f24] border-white/8 text-white rounded-lg">
                <SelectItem value="cal" className="cursor-pointer hover:bg-white/5">
                  Cal.com (Default)
                </SelectItem>
                <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5">
                  Calendly
                </SelectItem>
                <SelectItem value="other" className="cursor-pointer hover:bg-white/5">
                  Other / Manual Link
                </SelectItem>
              </SelectContent>
            </Select>
          </GlassPanel>

          {meetingType === "other" ? (
            <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl flex flex-col items-center justify-center space-y-6 min-h-[400px]">
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-white">Using another calendar platform?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Book a time directly using your tool, then paste the meeting link below to synchronize our conversational AI agents.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualUrl" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Meeting URL (Zoom, Meet, Teams, etc.)
                  </Label>
                  <Input
                    id="manualUrl"
                    placeholder="https://meet.google.com/abc-def-ghi"
                    value={customMeetingUrl}
                    onChange={(e) => setCustomMeetingUrl(e.target.value)}
                    className="bg-slate-950/60 border-white/8 text-white h-12 rounded-lg"
                  />
                </div>
                <Button
                  onClick={handleCustomMeetingSubmit}
                  className="w-full bg-teal-500 hover:bg-teal-400 h-12 text-sm font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-teal-500/20"
                  disabled={isSubmittingCustom}
                >
                  {isSubmittingCustom ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect AI Agent & Start"
                  )}
                </Button>
              </div>
            </GlassPanel>
          ) : (
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden shadow-2xl p-2 min-h-[600px]">
              <BookingWidget
                name={lead.contactName}
                email={lead.contactEmail}
                leadId={analysis.leadId || lead.leadId}
                analysisId={analysisId!}
                skipAiAgent={skipAiAgent}
                forcedMeetingType={meetingType}
              />
            </div>
          )}
        </div>

        {/* Sidebar widgets */}
        <aside className="space-y-6">
          {/* Call agenda items */}
          <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-teal-300 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 shrink-0" />
              Call Agenda Details
            </h3>
            
            <div className="space-y-3 border-t border-white/5 pt-4">
              {(analysis.marketDifferentiationTriggers || []).slice(0, 3).map((trigger, i) => (
                <div key={i} className="flex gap-2.5 text-xs text-slate-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <p className="leading-relaxed">{trigger}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-start space-x-2.5">
                <Checkbox
                  id="skipAi"
                  checked={skipAiAgent}
                  onCheckedChange={(checked) => setSkipAiAgent(checked === true)}
                  className="border-teal-500/50 data-[state=checked]:bg-teal-600 mt-0.5"
                />
                <Label htmlFor="skipAi" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Skip pre-call AI consultation
                </Label>
              </div>
              {!skipAiAgent && (
                <p className="text-[11px] text-slate-500 italic leading-normal">
                  After scheduling, you will immediately be redirected to our interactive conversational simulator for briefing.
                </p>
              )}
            </div>
          </GlassPanel>

          {/* GTM Diagnostics Card */}
          <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              GTM Diagnostics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your demo workspace is initialized with website scan telemetry.
            </p>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Health Index</span>
              <span className="text-emerald-400 font-extrabold text-sm">{analysis.healthScore} / 100</span>
            </div>
            
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>Active connections in queue: {availability?.activeImmediateCount ?? 0} / {availability?.maxImmediateCalls ?? 0}</div>
              {availability && !availability.available && (
                <div className="text-amber-400 font-medium">Estimated wait limit: ~{availability.estimatedWaitMinutes} minutes.</div>
              )}
            </div>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-dealflow-ink pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
          </div>
        }>
          <BookDemoContent />
        </Suspense>
      </div>
    </main>
  );
}
