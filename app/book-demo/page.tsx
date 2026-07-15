"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Star,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Shield,
  XCircle,
  Check,
  MessageSquare,
  Video,
  Mail,
  ArrowLeft,
  Globe,
  Loader2,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// Testimonials for social proof
const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "VP Sales at TechCorp",
    content: "DealFlow AI helped us close 30% more deals in the first quarter.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "CEO at GrowthLab",
    content: "Automated meeting summaries save us 20+ hours a week!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Sales Director at InnovateCo",
    content: "Pipeline insights are game-changing for our team.",
    rating: 5,
  },
];

// Use case options
const USE_CASES = [
  "Pipeline Analysis & Optimization",
  "Automated Meeting Summaries",
  "CRM Hygiene & Data Enrichment",
  "AI-Powered Outreach",
  "Competitive Intelligence",
  "Custom / Other",
];

// Benefits for value proposition
const BENEFITS = [
  {
    icon: <Zap className="h-6 w-6 text-violet-400" />,
    title: "Save 10+ hours a week",
    description: "Automate manual sales tasks with AI",
  },
  {
    icon: <Shield className="h-6 w-6 text-teal-400" />,
    title: "Close 30% more deals",
    description: "Unlock actionable insights from your pipeline",
  },
  {
    icon: <Globe className="h-6 w-6 text-amber-400" />,
    title: "Enterprise ready",
    description: "SOC 2 & GDPR compliant, end-to-end encrypted",
  },
];

// Animated section wrapper
function Section({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Time slots for calendar
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

export default function RedesignedBookDemoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    useCase: "",
  });

  // Calendar state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [timeZone, setTimeZone] = useState("");

  // Initialize time zone
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setSelectedDate(tomorrowStr);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSuccess(true);
    trackEvent("demo_booked", { ...formData, selectedDate, selectedTime });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24">
        {/* Success State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center text-center"
          >
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Demo Scheduled! 🎉
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Thanks for booking! You&apos;ll receive a confirmation email with
              calendar invite and pre-demo resources in a few minutes.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/")}
                className="h-13 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
              >
                Return Home
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr,420px] items-start">
            {/* Left Column: Main Content */}
            <div className="space-y-12">
              {/* Hero */}
              <Section>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
                    <Calendar className="h-4 w-4" />
                    <span>Book Your Demo</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                    See DealFlow AI{" "}
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      in Action
                    </span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl">
                    Schedule a personalized demo with our team. We&apos;ll show
                    you how DealFlow AI transforms your sales process.
                  </p>
                </div>
              </Section>

              {/* Value Props */}
              <Section delay={0.1}>
                <div className="grid gap-6 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <GlassPanel
                      key={idx}
                      material="glass"
                      depth="mid"
                      className="p-6 border-white/10"
                    >
                      <div className="mb-4">{benefit.icon}</div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {benefit.description}
                      </p>
                    </GlassPanel>
                  ))}
                </div>
              </Section>

              {/* Multi-Step Form */}
              <Section delay={0.2}>
                <GlassPanel
                  material="glass"
                  depth="mid"
                  className="p-8 border-white/10"
                >
                  {/* Steps indicator */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                            s < step
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                              : s === step
                              ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                              : "bg-slate-900/50 border border-white/10 text-slate-400"
                          }`}
                        >
                          {s < step ? <Check className="h-4 w-4" /> : s}
                        </div>
                        <span
                          className={`text-sm ${
                            s === step ? "text-white font-semibold" : "text-slate-400"
                          }`}
                        >
                          {s === 1
                            ? "Your Details"
                            : s === 2
                            ? "Select Date & Time"
                            : "Confirm & Book"}
                        </span>
                        {s < 3 && (
                          <div className="h-px w-12 bg-white/10" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Details */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="John Doe"
                            className="h-13 bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            Work Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="john@acme.com"
                            className="h-13 bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="company"
                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            Company *
                          </Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                            placeholder="Acme Corp"
                            className="h-13 bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="teamSize"
                            className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                          >
                            Team Size *
                          </Label>
                          <Select
                            value={formData.teamSize}
                            onValueChange={(val) =>
                              setFormData({ ...formData, teamSize: val })
                            }
                          >
                            <SelectTrigger
                              id="teamSize"
                              className="h-13 bg-slate-950 border-white/10 text-white"
                            >
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/10 text-white">
                              <SelectItem value="1-5">1-5</SelectItem>
                              <SelectItem value="6-20">6-20</SelectItem>
                              <SelectItem value="21-50">21-50</SelectItem>
                              <SelectItem value="51-100">51-100</SelectItem>
                              <SelectItem value="100+">100+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="useCase"
                          className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                        >
                          Primary Use Case *
                        </Label>
                        <Select
                          value={formData.useCase}
                          onValueChange={(val) =>
                            setFormData({ ...formData, useCase: val })
                          }
                        >
                          <SelectTrigger
                            id="useCase"
                            className="h-13 bg-slate-950 border-white/10 text-white"
                          >
                            <SelectValue placeholder="What are you most interested in?" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-white/10 text-white">
                            {USE_CASES.map((uc, idx) => (
                              <SelectItem key={idx} value={uc}>
                                {uc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-white/10">
                        <Button
                          onClick={() => {
                            if (
                              formData.name &&
                              formData.email &&
                              formData.company &&
                              formData.teamSize &&
                              formData.useCase
                            ) {
                              setStep(2);
                            }
                          }}
                          disabled={
                            !formData.name ||
                            !formData.email ||
                            !formData.company ||
                            !formData.teamSize ||
                            !formData.useCase
                          }
                          className="h-13 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                        >
                          Continue
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Calendar */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Label
                          htmlFor="date"
                          className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                        >
                          Select Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="h-13 bg-slate-950/70 border-white/10 text-white focus-visible:ring-teal-500/40"
                        />
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          Time zone: {timeZone}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Select Time *
                        </Label>
                        <div className="grid grid-cols-4 gap-3">
                          {TIME_SLOTS.map((time, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTime(time)}
                              className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                                selectedTime === time
                                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                                  : "bg-slate-950/70 border border-white/10 text-slate-300 hover:border-teal-500/40"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom time request */}
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-slate-400 mb-3">
                          Can&apos;t find a time?
                        </p>
                        <Button
                          variant="outline"
                          className="h-12 border-white/10 hover:bg-white/5 text-white"
                        >
                          Request Custom Time
                        </Button>
                      </div>

                      <div className="flex justify-between pt-6 border-t border-white/10">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          className="h-13 border-white/10 hover:bg-white/5 text-white"
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Back
                        </Button>
                        <Button
                          onClick={() => setStep(3)}
                          disabled={!selectedDate || !selectedTime}
                          className="h-13 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                        >
                          Continue
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirm */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <h2 className="text-xl font-bold text-white">
                        Confirm Your Booking
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        <GlassPanel
                          material="glass"
                          depth="mid"
                          className="p-4 border-white/10"
                        >
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Your Details
                          </div>
                          <div className="space-y-1 text-sm text-slate-300">
                            <div>
                              <strong className="text-white">Name: </strong>
                              {formData.name}
                            </div>
                            <div>
                              <strong className="text-white">Email: </strong>
                              {formData.email}
                            </div>
                            <div>
                              <strong className="text-white">Company: </strong>
                              {formData.company}
                            </div>
                            <div>
                              <strong className="text-white">Team Size: </strong>
                              {formData.teamSize}
                            </div>
                            <div>
                              <strong className="text-white">Use Case: </strong>
                              {formData.useCase}
                            </div>
                          </div>
                        </GlassPanel>

                        <GlassPanel
                          material="glass"
                          depth="mid"
                          className="p-4 border-white/10"
                        >
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Appointment
                          </div>
                          <div className="space-y-1 text-sm text-slate-300">
                            <div>
                              <strong className="text-white">Date: </strong>
                              {new Date(selectedDate).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                            <div>
                              <strong className="text-white">Time: </strong>
                              {selectedTime} ({timeZone})
                            </div>
                          </div>
                        </GlassPanel>
                      </div>

                      <div className="flex justify-between pt-6 border-t border-white/10">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          className="h-13 border-white/10 hover:bg-white/5 text-white"
                        >
                          <ChevronLeft className="mr-2 h-5 w-5" />
                          Back
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="h-13 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            <>
                              Confirm Booking
                              <Check className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </GlassPanel>
              </Section>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-8">
              {/* Demo Video */}
              <Section delay={0.15}>
                <GlassPanel
                  material="glass"
                  depth="mid"
                  className="overflow-hidden border-white/10 p-0"
                >
                  <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-teal-500/20" />
                    <Video className="h-16 w-16 text-white/30" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Watch 30s Demo
                    </h3>
                    <p className="text-sm text-slate-400">
                      See how DealFlow AI works in 30 seconds.
                    </p>
                  </div>
                </GlassPanel>
              </Section>

              {/* Testimonials */}
              <Section delay={0.25}>
                <GlassPanel
                  material="glass"
                  depth="mid"
                  className="p-6 border-white/10 space-y-5"
                >
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                    <span className="text-sm text-slate-400 ml-2">4.9/5</span>
                  </div>

                  <div className="space-y-4">
                    {TESTIMONIALS.map((testimonial, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm text-slate-300 italic">
                          &quot;{testimonial.content}&quot;
                        </p>
                        <div className="text-xs text-slate-500">
                          <div className="font-semibold text-white">
                            {testimonial.name}
                          </div>
                          <div>{testimonial.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </Section>

              {/* Chat Widget */}
              <Section delay={0.35}>
                <GlassPanel
                  material="glass"
                  depth="mid"
                  className="p-6 border-white/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Questions?
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Our team is here to help before you book!
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-white/10 hover:bg-white/5 text-white"
                  >
                    Start Live Chat
                  </Button>
                </GlassPanel>
              </Section>

              {/* Back to Home */}
              <div className="pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to DealFlow AI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
