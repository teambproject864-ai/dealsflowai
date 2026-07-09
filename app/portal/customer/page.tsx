"use client";

import React, { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel, ExtrudedButton } from "@/components/immersive";
import {
  CheckCircle2,
  MessageSquare,
  Star,
  FileText,
  Download,
  Plus,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Ticket as TicketIcon,
  CreditCard,
  BarChart2,
  Check,
  Users,
  ShoppingBag,
  Palette,
  Truck,
  Layers,
  ArrowRight,
  Phone,
  Target,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2, color: "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/10" },
  { id: "business-toolset", label: "Model Toolset", icon: Layers, color: "text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60 shadow-indigo-500/10" },
  { id: "icp-entries", label: "ICP Entries", icon: Users, color: "text-purple-400 border-purple-500/30 hover:border-purple-500/60 shadow-purple-500/10" },
  { id: "gtm-analysis", label: "GTM Analysis", icon: FileText, color: "text-blue-400 border-blue-500/30 hover:border-blue-500/60 shadow-blue-500/10" },
  { id: "tickets", label: "Support Tickets", icon: TicketIcon, color: "text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-rose-500/10" },
  { id: "billing", label: "Billing & Credits", icon: CreditCard, color: "text-amber-400 border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/10" },
  { id: "chat", label: "Messenger", icon: MessageSquare, color: "text-sky-400 border-sky-500/30 hover:border-sky-500/60 shadow-sky-500/10" },
  { id: "documents", label: "Documents", icon: FileText, color: "text-orange-400 border-orange-500/30 hover:border-orange-500/60 shadow-orange-500/10" },
  { id: "feedback", label: "Feedback", icon: Star, color: "text-pink-400 border-pink-500/30 hover:border-pink-500/60 shadow-pink-500/10" },
  { id: "ai-communications", label: "AI Interactions", icon: Phone, color: "text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/10" },
] as const;

function CustomerPortalContent() {
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("dashboard");
  const [businessModel, setBusinessModel] = useState<"b2b" | "b2c" | "d2c" | "custom">("b2b");

  // Billing & Credit Purchase States
  const [creditsCount, setCreditsCount] = useState(750);
  const [creditsToBuy, setCreditsToBuy] = useState(100);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [transactions, setTransactions] = useState<Array<{ id: string; date: string; amount: number; type: 'purchase' | 'spend'; details: string }>>([
    { id: "tx-1", date: "2026-07-01", amount: 500, type: "purchase", details: "Self-service Stripe Credit Allocation" },
    { id: "tx-2", date: "2026-07-03", amount: -50, type: "spend", details: "Campaign execution Stark Industries" },
    { id: "tx-3", date: "2026-07-04", amount: -15, type: "spend", details: "15 minutes outbound AI voice dial logs" },
  ]);

  const handleBuyCreditsSimulated = () => {
    setIsPurchasing(true);
    setTimeout(() => {
      setCreditsCount((prev) => prev + Number(creditsToBuy));
      const newTx = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: Number(creditsToBuy),
        type: "purchase" as const,
        details: `Simulated self-service credit allocation`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      setIsPurchasing(false);
      showToast("success", "Credits Purchased", `Successfully allocated ${creditsToBuy} credits to your account balance.`);
    }, 1000);
  };

  // Core Data States
  const [tickets, setTickets] = useState<any[]>([]);
  const [gtmReports, setGtmReports] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [icpEntries, setIcpEntries] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [callsList, setCallsList] = useState<any[]>([]);

  // Form States
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketCategory, setTicketCategory] = useState("General Support");

  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackComment, setFeedbackComment] = useState("");

  const [icpName, setIcpName] = useState("");
  const [icpValueProposition, setIcpValueProposition] = useState("");
  const [icpDescription, setIcpDescription] = useState("");

  const [newMessage, setNewMessage] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Real-time synchronization polling (3s interval)
  const fetchCustomerData = async () => {
    try {
      const [ticketsRes, gtmRes, docsRes, chatRes, icpRes, feedbackRes, callsRes, configRes] = await Promise.all([
        fetch("/api/portal/tickets"),
        fetch("/api/portal/gtm-reports"),
        fetch("/api/portal/documents"),
        fetch("/api/portal/chat?sessionId=session-1"),
        fetch("/api/customer/icp"),
        fetch("/api/portal/feedback"),
        fetch("/api/portal/calls"),
        fetch("/api/customer/config"),
      ]);

      const [ticketsData, gtmData, docsData, chatData, icpData, feedbackData, callsData, configData] = await Promise.all([
        ticketsRes.json(),
        gtmRes.json(),
        docsRes.json(),
        chatRes.json(),
        icpRes.json(),
        feedbackRes.json(),
        callsRes.json(),
        configRes.json(),
      ]);

      if (ticketsData.success) setTickets(ticketsData.tickets);
      if (gtmData.success) setGtmReports(gtmData.reports);
      if (docsData.success) setDocuments(docsData.documents);
      if (chatData.success) setChatMessages(chatData.messages);
      if (icpData.success) setIcpEntries(icpData.icpEntries);
      if (feedbackData.success) setFeedbackList(feedbackData.feedback);
      if (callsData.success) setCallsList(callsData.calls);

      if (configData.success && configData.customer) {
        setBusinessModel(configData.customer.businessModel || "b2b");
      }
    } catch (error) {
      console.error("[Customer Portal] polling error:", error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    const interval = setInterval(fetchCustomerData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleUpdateBusinessModel = async (newModel: string) => {
    try {
      const res = await fetch("/api/customer/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessModel: newModel }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinessModel(newModel as any);
        showToast("success", "Operating Model Updated", `Successfully switched workflow to ${newModel.toUpperCase()}`);
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          description: ticketDescription,
          priority: ticketPriority,
          category: ticketCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Ticket Submitted", "Your support request has been logged.");
        setTicketSubject("");
        setTicketDescription("");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    try {
      const res = await fetch("/api/portal/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(feedbackRating),
          comment: feedbackComment,
          agentId: "agent-vijay", // default PM
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Feedback Submitted", "Thank you for rating your Account Manager.");
        setFeedbackComment("");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitIcp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icpName.trim()) return;

    try {
      const res = await fetch("/api/customer/icp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: icpName,
          valueProposition: icpValueProposition,
          description: icpDescription,
          targetIndustries: ["Technology"],
          targetCompanySizes: ["100-500"],
          targetGeographicRegions: ["North America"],
          painPoints: ["Scaling problems"],
          decisionMakers: ["VP Engineering"],
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "ICP Profile Saved", "Ideal Customer Profile entry updated.");
        setIcpName("");
        setIcpValueProposition("");
        setIcpDescription("");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch("/api/portal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "session-1",
          content: newMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-teal-400 mx-auto" />
          <p className="text-slate-400 text-sm">Initializing your secure workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-450 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            DealFlow Customer Hub
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Manage operating models, GTM campaigns, and sync task execution in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold uppercase">Active Flow:</span>
            <span className={cn(
              "text-xs px-2.5 py-0.5 rounded-md font-extrabold uppercase",
              businessModel === "b2b" ? "bg-indigo-950 text-indigo-400 border border-indigo-800" :
              businessModel === "b2c" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
              "bg-pink-950 text-pink-400 border border-pink-850"
            )}>
              {businessModel}
            </span>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Tabs List */}
      <div className="flex gap-2 flex-wrap bg-slate-900/50 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <ExtrudedButton
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-xl transition-all duration-300 gap-2 font-semibold text-xs py-2 px-3.5",
                activeTab === tab.id
                  ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                  : "border-transparent bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              )}
            >
              <Icon className={cn("h-4 w-4", tab.color.split(" ")[0])} />
              {tab.label}
            </ExtrudedButton>
          );
        })}
      </div>

      {/* Panels */}
      <div className="mt-4">
        {/* 1. DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <GlassPanel className="border-slate-850 p-6 flex justify-between items-center flex-wrap gap-4 bg-gradient-to-r from-slate-900/60 to-emerald-950/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                    Operating Workflow: {businessModel.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your platform workflows, KPIs, and dashboards are dynamically tailored to this operating model.
                  </p>
                </div>
              </div>
              <div>
                <select
                  value={businessModel}
                  onChange={(e) => handleUpdateBusinessModel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-250 font-bold"
                >
                  <option value="b2b">B2B Enterprise</option>
                  <option value="b2c">B2C Retail</option>
                  <option value="d2c">D2C Direct Brand</option>
                  <option value="custom">Custom Creator</option>
                </select>
              </div>
            </GlassPanel>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassPanel tilt={true} className="border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-950/20 p-5">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Active Campaigns</p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{icpEntries.length} Profiles</h3>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-indigo-500/20 bg-gradient-to-br from-slate-900/80 to-indigo-950/20 p-5">
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Pending Tickets</p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2">
                  {tickets.filter(t => t.status !== "resolved").length} Active
                </h3>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-purple-950/20 p-5">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Campaign Revenue</p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2">$24,500</h3>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-amber-500/20 bg-gradient-to-br from-slate-900/80 to-amber-950/20 p-5">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Platform Credits</p>
                <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{creditsCount} Units</h3>
              </GlassPanel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassPanel tilt={false} className="border-slate-800 p-5">
                <h3 className="text-lg font-bold text-slate-200 mb-4">Your Support Tickets</h3>
                <div className="space-y-3">
                  {tickets.slice(0, 3).map(t => (
                    <div key={t.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{t.subject}</p>
                        <p className="text-slate-500 mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-350 font-bold capitalize">{t.status}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-800 p-5">
                <h3 className="text-lg font-bold text-slate-200 mb-4">GTM Reports</h3>
                <div className="space-y-3">
                  {gtmReports.slice(0, 3).map(r => (
                    <div key={r.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{r.reportName}</p>
                        <p className="text-slate-500 mt-0.5">{r.region} • {r.segment}</p>
                      </div>
                      <span className="text-emerald-400 font-bold">{r.conversionRate || r.leadConversionRate}% Conv</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {/* 2. OPERATING MODEL TOOLSET */}
        {activeTab === "business-toolset" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Business Operating Model Configurations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel tilt={false} className="border-slate-800 p-5 space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Submit Operating Order / Leads</h3>
                <p className="text-xs text-slate-400">Process wholesale contracts or retail orders directly mapped to your active model.</p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs">
                  <p className="text-slate-300 font-bold">Volume Contract Rates Enabled:</p>
                  <p className="text-slate-500 mt-1">Tier 1 discount: 15% wholesale allowance on purchases &gt; 50 credits.</p>
                </div>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-800 p-5 space-y-4">
                <h3 className="text-lg font-bold text-slate-200">Parameters Control</h3>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Change Operating Workflow Type</Label>
                  <select
                    value={businessModel}
                    onChange={(e) => handleUpdateBusinessModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  >
                    <option value="b2b">B2B Wholesale contract model</option>
                    <option value="b2c">B2C Retail store checkout</option>
                    <option value="d2c">D2C Custom Branding config</option>
                  </select>
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {/* 3. ICP ENTRIES */}
        {activeTab === "icp-entries" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <GlassPanel tilt={false} className="border-slate-800 p-5 h-fit">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Define Campaign ICP Profile</h3>
              <form onSubmit={handleSubmitIcp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="icp-name" className="text-slate-400">Campaign Profile Name</Label>
                  <Input
                    id="icp-name"
                    placeholder="e.g. Enterprise SaaS"
                    value={icpName}
                    onChange={(e) => setIcpName(e.target.value)}
                    className="bg-slate-950 border-slate-850 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="icp-val-prop" className="text-slate-400">Value Proposition</Label>
                  <Input
                    id="icp-val-prop"
                    placeholder="e.g. Automate sales reporting"
                    value={icpValueProposition}
                    onChange={(e) => setIcpValueProposition(e.target.value)}
                    className="bg-slate-950 border-slate-850 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="icp-desc" className="text-slate-400">Target Segment Description</Label>
                  <textarea
                    id="icp-desc"
                    placeholder="Describe target demographics & pain points..."
                    value={icpDescription}
                    onChange={(e) => setIcpDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <ExtrudedButton type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
                  Save ICP Parameters
                </ExtrudedButton>
              </form>
            </GlassPanel>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Saved Campaign Target Profiles</h3>
              {icpEntries.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center bg-slate-900/10 rounded-xl border border-slate-800">No ICP entries saved.</p>
              ) : (
                icpEntries.map(icp => (
                  <GlassPanel key={icp.id} tilt={false} className="border-slate-800 bg-slate-900/20 p-5 space-y-2">
                    <h4 className="text-base font-bold text-slate-250">{icp.name}</h4>
                    <p className="text-xs text-slate-355">{icp.description}</p>
                    {icp.valueProposition && <p className="text-xs text-emerald-400"><strong>Val Prop:</strong> {icp.valueProposition}</p>}
                  </GlassPanel>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. GTM ANALYSIS */}
        {activeTab === "gtm-analysis" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">GTM Marketing Strategy Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gtmReports.map(report => (
                <GlassPanel key={report.id} tilt={false} className="border-slate-800 bg-slate-900/20 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <h4 className="font-bold text-sm text-slate-200">{report.reportName}</h4>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{report.reportType || report.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Conversion Rate</p>
                      <p className="text-xl font-extrabold text-green-400">{report.leadConversionRate || report.conversionRate}%</p>
                    </div>
                    <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Pipeline Value</p>
                      <p className="text-xl font-extrabold text-blue-400">${(report.pipelineValue || report.revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {/* 5. SUPPORT TICKETS */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <GlassPanel tilt={false} className="border-slate-800 p-5 h-fit">
              <h3 className="text-lg font-bold text-slate-200 mb-4">File Support Request</h3>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-subj" className="text-slate-400">Subject</Label>
                  <Input
                    id="ticket-subj"
                    placeholder="e.g. API billing issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="bg-slate-950 border-slate-850 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-cat" className="text-slate-400">Category</Label>
                  <select
                    id="ticket-cat"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Technical Bug">Technical Bug</option>
                    <option value="Billing Dispute">Billing Dispute</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-priority" className="text-slate-400">Priority</Label>
                  <select
                    id="ticket-priority"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-desc" className="text-slate-400">Details of Request</Label>
                  <textarea
                    id="ticket-desc"
                    placeholder="Provide details..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <ExtrudedButton type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
                  Submit Support Ticket
                </ExtrudedButton>
              </form>
            </GlassPanel>            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Ticket History Stream</h3>
              {tickets.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center bg-slate-900/10 rounded-xl border border-slate-800">
                  No active support tickets found.
                </p>
              ) : (
                tickets.map((t) => (
                  <GlassPanel key={t.id} tilt={false} className="border border-slate-800 bg-slate-900/20 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-sm">{t.subject}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[10px] font-bold border capitalize",
                        t.status === "open" ? "bg-yellow-500/10 text-yellow-450 border-yellow-500/25" : "bg-emerald-500/10 text-emerald-450 border-emerald-500/25"
                      )}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-350">{t.description}</p>
                    
                    {/* Event Timeline History Stream */}
                    <div className="border-t border-slate-850 pt-3 space-y-2 text-[10px]">
                      <span className="block text-slate-500 font-bold uppercase tracking-wider mb-1">Status Timeline</span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                        <span>Ticket created by client ({new Date(t.createdAt).toLocaleDateString()})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                        <span>SDR Campaign manager (Vijay) assigned to review request details</span>
                      </div>
                      {t.status === "resolved" && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Resolved: administrative changes applied successfully</span>
                        </div>
                      )}
                    </div>
                  </GlassPanel>
                ))
              )}
            </div>
          </div>
        )}

        {/* 6. BILLING & CREDITS */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Purchase Form */}
            <GlassPanel tilt={false} className="border border-slate-800 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-100">Self-Service Credit Purchaser</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Credits power your outbound dial sessions and campaign sequencing. Buy credits dynamically to load GTM budgets.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Balance</span>
                  <span className="text-3xl font-extrabold text-amber-400 block mt-1">{creditsCount} Credits</span>
                </div>
                <CreditCard className="h-8 w-8 text-slate-700" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="credit-slider" className="text-xs text-slate-350">Quantity to allocate</Label>
                <div className="flex gap-2">
                  <input
                    id="credit-slider"
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={creditsToBuy}
                    onChange={(e) => setCreditsToBuy(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white font-bold w-12 text-right">{creditsToBuy}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Unit Price: $1.00</span>
                  {creditsToBuy >= 250 && <span className="text-emerald-400 font-bold">15% Bulk Discount Applied!</span>}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-850 pt-4">
                <span className="text-xs text-slate-400">Total Purchase Cost:</span>
                <span className="text-lg font-extrabold text-white">
                  ${creditsToBuy >= 250 ? (creditsToBuy * 0.85).toFixed(2) : (creditsToBuy * 1.0).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleBuyCreditsSimulated}
                disabled={isPurchasing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Purchase Credits
                  </>
                )}
              </button>
            </GlassPanel>

            {/* Credit Transaction History */}
            <GlassPanel tilt={false} className="border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Transaction History</h3>
                <p className="text-xs text-slate-500 mt-1">Recent credit deposits and usage logs</p>
              </div>

              <div className="space-y-3 my-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-black/45 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-bold text-slate-200">{tx.details}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.date}</span>
                    </div>
                    <span className={cn(
                      "font-bold font-mono",
                      tx.type === "purchase" ? "text-emerald-400" : "text-slate-400"
                    )}>
                      {tx.type === "purchase" ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-slate-600 block text-right">
                SECURE STRIPE SANDBOX ACTIVE
              </span>
            </GlassPanel>
          </div>
        )}

        {/* 7. CHAT MESSENGER */}
        {activeTab === "chat" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Workspace Chat Messenger</h2>
            <GlassPanel className="border-slate-800 bg-slate-900/20 p-4 h-[500px] flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-500 text-center py-12 text-sm">No recent messages in this session.</p>
                ) : (
                  chatMessages.map(msg => {
                    const isMe = msg.senderRole === "customer" || msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex flex-col max-w-[70%] space-y-1", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                        <span className="text-[10px] text-slate-500">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <div className={cn(
                          "p-3 rounded-2xl text-xs",
                          isMe ? "bg-emerald-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-800/80 mt-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message to account manager..."
                  className="bg-slate-950 border-slate-850 rounded-xl"
                />
                <ExtrudedButton type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                </ExtrudedButton>
              </form>
            </GlassPanel>
          </div>
        )}

        {/* 8. DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Document Vault</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8 col-span-2">No documents stored in vault.</p>
              ) : (
                documents.map(doc => (
                  <GlassPanel key={doc.id} tilt={false} className="border-slate-800 bg-slate-900/20 p-5 space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                      <h4 className="font-bold text-sm text-slate-200">{doc.title}</h4>
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{doc.documentType || doc.type}</span>
                    </div>
                    <p className="text-xs text-slate-400">{doc.description || doc.updateNotes}</p>
                    <p className="text-[10px] text-slate-500">Size: {doc.size || "N/A"} • Version: {doc.version || "1.0"}</p>
                  </GlassPanel>
                ))
              )}
            </div>
          </div>
        )}

        {/* 9. FEEDBACK */}
        {activeTab === "feedback" && (
          <GlassPanel tilt={false} className="border-slate-800 p-6 max-w-lg mx-auto space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-100">Rate Your Account Manager</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fb-rating" className="text-slate-350">Rating (1 to 5 Stars)</Label>
                <select
                  id="fb-rating"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                  <option value="3">⭐⭐⭐ (3 - Average)</option>
                  <option value="2">⭐⭐ (2 - Poor)</option>
                  <option value="1">⭐ (1 - Unacceptable)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-comment" className="text-slate-350">Written Comment</Label>
                <textarea
                  id="fb-comment"
                  placeholder="Share details on communication or support..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <ExtrudedButton type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
                Submit AM Feedback
              </ExtrudedButton>
            </form>
          </GlassPanel>
        )}

        {/* 10. AI COMMUNICATIONS */}
        {activeTab === "ai-communications" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Outbound Call & Messaging History</h2>
            <div className="space-y-4">
              {callsList.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No call events tracked in history logs.</p>
              ) : (
                callsList.map(call => (
                  <div key={call.id} className="p-3.5 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{call.callerName} → {call.receiverName}</p>
                      <p className="text-slate-500 mt-0.5">Started: {new Date(call.startedAt).toLocaleString()}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{call.status} ({call.duration}s)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerPortal() {
  return (
    <AuthProvider allowedRoles={["customer"]}>
      <CustomerPortalContent />
    </AuthProvider>
  );
}
