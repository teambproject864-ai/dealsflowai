"use client";

import React, { useState, useRef, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";
import {
  Users,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Star,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  X,
  Zap,
  ChevronRight,
  Filter,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Upload,
  XCircle,
  Download,
  FileText,
  Settings,
  PhoneCall,
  Send,
  ChevronDown,
} from "lucide-react";
import { COUNTRIES, formatPhoneNumber, isPhoneValid } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  demoUsers,
  demoTasks,
  demoChatMessages,
  demoAgentMetrics,
  demoAgentCredits,
  demoCustomers,
} from "@/lib/portal-demo-data";
import type { AgentCredits, FileAttachment } from "@/lib/types";
import type { TaskStatus } from "@/lib/portal-types";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { Unibox } from "@/components/Unibox";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { generateICPDocument } from "@/lib/icp-document-generator";

const tabs = [
  { id: "requirements", label: "Requirements", icon: Users },
  { id: "icp-entries", label: "ICP Entries", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "playbook", label: "ICP Playbook", icon: FileText },
  { id: "metrics", label: "My Metrics", icon: Star },
  { id: "credits", label: "Credits", icon: Zap },
  { id: "voice-whatsapp", label: "Voice & WhatsApp", icon: Settings },
] as const;

function AgentPortalContent() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("requirements");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatMessages, setChatMessages] = useState([...demoChatMessages]);
  const [tasks, setTasks] = useState([...demoTasks]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [playbookContent, setPlaybookContent] = useState<string>("");
  const [icpEntries, setIcpEntries] = useState<any[]>([]);

  // Voice & WhatsApp Settings State
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === "US") || COUNTRIES[0]);
  const [phoneInput, setPhoneInput] = useState("");
  const [callFramework, setCallFramework] = useState("");
  const [whatsAppParams, setWhatsAppParams] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Voice call state
  const [callToPhone, setCallToPhone] = useState("");
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<{sessionId: string; callSid: string; status: string} | null>(null);
  
  // Poll call status when active call exists
  useEffect(() => {
    if (!activeCallSession) return;
    
    // If it's a mock call (callSid starts with "MOCK_CALL_"), simulate status transitions
    if (activeCallSession.callSid.startsWith("MOCK_CALL_")) {
      const timeouts: NodeJS.Timeout[] = [];
      
      // Simulate ringing → in-progress after 2s
      timeouts.push(
        setTimeout(() => {
          setActiveCallSession(prev => prev ? { ...prev, status: "in-progress" } : null);
        }, 2000)
      );
      
      // Simulate in-progress → completed after 8s
      timeouts.push(
        setTimeout(() => {
          setActiveCallSession(prev => prev ? { ...prev, status: "completed" } : null);
        }, 10000)
      );
      
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
    
    // Real call polling
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/custom-voice/call?sessionId=${encodeURIComponent(activeCallSession.sessionId)}`);
        const data = await res.json();
        if (data.session) {
          setActiveCallSession(prev => prev ? { ...prev, status: data.session.status } : null);
        }
      } catch (e) {
        console.error("Failed to poll call status:", e);
      }
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [activeCallSession?.sessionId]);
  // WhatsApp state
  const [waToPhone, setWaToPhone] = useState("");
  const [waCustomerName, setWaCustomerName] = useState("");
  const [waCustomContent, setWaCustomContent] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [waSentMessages, setWaSentMessages] = useState<any[]>([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
          if (data.leads.length > 0) {
            setSelectedLeadId(data.leads[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load leads:", err);
      }
    }
    async function loadPlaybook() {
      try {
        const res = await fetch("/api/playbook");
        const data = await res.json();
        if (data.success) {
          setPlaybookContent(data.content);
        }
      } catch (err) {
        console.error("Failed to load playbook:", err);
      }
    }
    async function loadIcpEntries() {
      try {
        const res = await fetch("/api/customer/icp");
        const data = await res.json();
        if (data.success) {
          setIcpEntries(data.icpEntries);
        }
      } catch (err) {
        console.error("Failed to load ICP entries:", err);
      }
    }
    loadLeads();
    loadPlaybook();
    loadIcpEntries();
  }, []);

  // Load agent Voice & WhatsApp settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/agent/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setPhoneInput(s.phoneNumber || "");
          setCallFramework(s.callConversationFramework || "");
          setWhatsAppParams(s.whatsAppMessageParameters || "");
          const country = COUNTRIES.find(c => c.code === s.countryCode) || COUNTRIES[0];
          setSelectedCountry(country);
          setSettingsLoaded(true);
        }
      } catch (err) {
        // Settings load failed silently — use defaults
        setSettingsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/agent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: `${selectedCountry.prefix} ${phoneInput}`.trim(),
          countryCode: selectedCountry.code,
          callConversationFramework: callFramework,
          whatsAppMessageParameters: whatsAppParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Settings Saved", "Your Voice & WhatsApp settings have been saved.");
      } else {
        showToast("error", "Save Failed", data.error || "Could not save settings.");
      }
    } catch (err) {
      showToast("error", "Save Failed", "Network error while saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!callToPhone.trim()) {
      showToast("error", "Missing Phone", "Please enter a phone number to call.");
      return;
    }
    setIsInitiatingCall(true);
    try {
      const res = await fetch("/api/custom-voice/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: callToPhone.trim(),
          callFramework,
          agentName: currentAgentName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCallSession({ sessionId: data.sessionId, callSid: data.callSid, status: "ringing" });
        showToast("success", "Call Initiated", `Ringing ${callToPhone}... Session: ${data.sessionId}`);
        setCallToPhone("");
      } else {
        showToast("error", "Call Failed", data.error || "Failed to initiate call.");
      }
    } catch (err) {
      showToast("error", "Call Failed", "Network error while initiating call.");
    } finally {
      setIsInitiatingCall(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!waToPhone.trim()) {
      showToast("error", "Missing Phone", "Please enter a recipient phone number.");
      return;
    }
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch("/api/custom-whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: waToPhone.trim(),
          customerName: waCustomerName || "Valued Customer",
          whatsAppParameters: whatsAppParams,
          customContent: waCustomContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaSentMessages(prev => [{ ...data, sentAt: new Date().toISOString() }, ...prev]);
        showToast("success", "Message Sent", "WhatsApp message sent successfully.");
        setWaToPhone("");
        setWaCustomerName("");
        setWaCustomContent("");
      } else {
        showToast("error", "Send Failed", data.error || "Failed to send WhatsApp message.");
      }
    } catch (err) {
      showToast("error", "Send Failed", "Network error while sending WhatsApp.");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.prefix.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Determine current agent ID based on authenticated user
  const currentAgentId = user?.id || "agent-vijay";

  const agentTasks = tasks.filter((t) => t.assignedAgentId === currentAgentId).filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const agentMetrics = demoAgentMetrics.find((m) => m.agentId === currentAgentId);
  const agentCredits = demoAgentCredits.find((c) => c.agentId === currentAgentId);

  const currentAgent = demoUsers.find((u) => u.id === currentAgentId);
  const currentAgentName = currentAgent?.name || "Agent";
  
  // Find the customer associated with the tasks/chats (default to first customer in demo data)
  const customer = demoUsers.find((u) => u.role === "customer") || demoUsers.find((u) => u.id === "customer-demo");
  const customerName = customer?.name || "Customer";

  // Show/hide notification
  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setShowNotification({ type, title, message });
    setTimeout(() => setShowNotification(null), 3000);
  };



  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Convert File to FileAttachment (simulate upload for demo)
  const fileToAttachment = (file: File): FileAttachment => ({
    id: `file-${Date.now()}-${Math.random().toString(36)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    uploadedBy: currentAgentId,
  });

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedTaskId) {
      showToast("error", "Error", "Please enter a note first");
      return;
    }

    setIsAddingNote(true);
    setTimeout(() => {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTaskId
            ? { ...t, progressNotes: [...t.progressNotes, newNote], updatedAt: new Date().toISOString() }
            : t
        )
      );
      setNewNote("");
      setIsAddingNote(false);
      showToast("success", "Note Added", "Your progress note has been saved");
    }, 600);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) {
      showToast("error", "Error", "Please type a message or attach files first");
      return;
    }
    setIsSendingMessage(true);
    setTimeout(() => {
      const attachments = selectedFiles.map(fileToAttachment);
      const newMsg = {
        id: `msg-${Date.now()}`,
        sessionId: "session-1",
        senderId: currentAgentId,
        senderName: currentAgentName,
        senderRole: "agent" as const,
        content: newMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage("");
      setSelectedFiles([]);
      setIsSendingMessage(false);
      showToast("success", "Message Sent", "Your message has been delivered");
    }, 500);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
    showToast("success", "Task Updated", `Task status changed to "${newStatus}"`);
  };

  const toggleMilestone = (taskId: string, milestoneId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              milestones: t.milestones.map((m) =>
                m.id === milestoneId
                  ? {
                      ...m,
                      completed: !m.completed,
                      completedAt: !m.completed ? new Date().toISOString() : undefined,
                    }
                  : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    showToast("success", "Milestone Updated", "Milestone status has been changed");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
          <p className="text-slate-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl border max-w-sm",
              showNotification.type === "success"
                ? "bg-green-900/90 border-green-600"
                : showNotification.type === "error"
                ? "bg-red-900/90 border-red-600"
                : "bg-blue-900/90 border-blue-600"
            )}
          >
            <div className="mt-0.5">
              {showNotification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : showNotification.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{showNotification.title}</p>
              <p className="text-slate-300 text-xs mt-0.5">{showNotification.message}</p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Agent Portal Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 flex items-center justify-center border border-teal-500/20">
                  <Users className="h-5 w-5 text-teal-400" />
                </div>
                Agent Workspace
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Welcome back, <span className="text-teal-400 font-semibold">{currentAgentName}</span>!
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="bg-slate-800/50 border border-slate-700/50 px-5 py-3 rounded-2xl flex items-center gap-5 shadow-xl">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Tasks</p>
                  <p className="text-xl font-bold text-teal-400">{agentTasks.length}</p>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Rating</p>
                  <p className="text-xl font-bold text-amber-400">
                    {agentMetrics?.averageRating.toFixed(1) || "0"}
                  </p>
                </div>
                {agentCredits && (
                  <>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Credits</p>
                      <p className="text-xl font-bold text-violet-400">{agentCredits.balance}</p>
                    </div>
                  </>
                )}
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">

        {/* Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "requirements" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Requirements List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xl font-semibold text-slate-100">Assigned Requirements</h3>
                <div className="space-y-3">
                  {leads.length === 0 ? (
                    <GlassPanel tilt={false} className="border-slate-700/50">
                      <CardContent className="py-10 text-center">
                        <Users className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No requirements assigned</p>
                      </CardContent>
                    </GlassPanel>
                  ) : (
                    leads.map((lead) => (
                      <GlassPanel
                        key={lead.id}
                        tilt={true}
                        className={cn(
                          "cursor-pointer border-slate-700/50 hover:border-teal-500/50 transition-all duration-200 hover:shadow-md",
                          selectedLeadId === lead.id ? "border-teal-500 shadow-lg shadow-teal-500/20" : ""
                        )}
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-slate-100 font-bold">{lead.companyName}</CardTitle>
                          <p className="text-xs text-teal-400 mt-1">{lead.websiteUrl || lead.website}</p>
                          <p className="text-xs text-slate-500 mt-1">Submitted by: {lead.name}</p>
                        </CardHeader>
                      </GlassPanel>
                    ))
                  )}
                </div>
              </div>

              {/* Requirement Details & Matched ICP */}
              <div className="lg:col-span-2">
                {selectedLeadId ? (
                  (() => {
                    const lead = leads.find((l) => l.id === selectedLeadId);
                    if (!lead) return null;
                    
                    const matchedCustomer = demoCustomers.find(
                      (c) => c.id === lead.customerId || c.companyName.toLowerCase() === lead.companyName.toLowerCase()
                    );
                    const businessModel = matchedCustomer?.businessModel || "b2b";
                    
                    return (
                      <GlassPanel tilt={false} className="border-slate-700/50 space-y-6">
                        <CardHeader className="border-b border-slate-800 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-2xl text-slate-100 font-bold">{lead.companyName}</CardTitle>
                              <span className={cn(
                                "text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase border",
                                businessModel === "b2b" ? "bg-indigo-950 border-indigo-800 text-indigo-400" :
                                businessModel === "b2c" ? "bg-emerald-950 border-emerald-800 text-emerald-400" :
                                businessModel === "d2c" ? "bg-pink-950 border-pink-800 text-pink-400" :
                                "bg-amber-950 border-amber-800 text-amber-400"
                              )}>
                                {businessModel}
                              </span>
                            </div>
                            {(lead.websiteUrl || lead.website) && (
                              <a
                                href={lead.websiteUrl || lead.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-teal-400 hover:underline flex items-center gap-1"
                              >
                                Visit Website <ChevronRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">Contact: {lead.name} ({lead.emailPersonal})</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                          {/* Business Model specifics */}
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                            <h4 className="text-sm font-semibold text-teal-400">Business Model Parameters ({businessModel.toUpperCase()})</h4>
                            {businessModel === "b2b" && (
                              <div className="text-xs text-slate-300 space-y-1">
                                <p><strong>Operational Model:</strong> Enterprise Wholesale Deals & Custom Pilot Contracts</p>
                                <p><strong>Metrics:</strong> Total Contract Value, Wholesale Order Volume, Tiered Discount Rates</p>
                              </div>
                            )}
                            {businessModel === "b2c" && (
                              <div className="text-xs text-slate-300 space-y-1">
                                <p><strong>Operational Model:</strong> Direct Retail Storefront & Consumer Transactions</p>
                                <p><strong>Metrics:</strong> Conversion Rate, Shopping Cart Abandonment, Simulated Checkout Payments</p>
                              </div>
                            )}
                            {businessModel === "d2c" && (
                              <div className="text-xs text-slate-300 space-y-1">
                                <p><strong>Operational Model:</strong> Direct-to-Customer Branding & White-Label Customization</p>
                                <p><strong>Metrics:</strong> Brand Sentiment, Instagram ROI, Custom Stylesheets</p>
                              </div>
                            )}
                            {businessModel === "custom" && (
                              <div className="text-xs text-slate-300 space-y-1">
                                <p><strong>Operational Model:</strong> Custom Creator-Brand & Subscription Referrals</p>
                                <p><strong>Metrics:</strong> System Credit Reserves, Flat Commission Payout Rules</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-md font-semibold text-teal-400 mb-2">Offer Promise & Pain Point</h4>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                                <p className="text-sm text-slate-200"><strong>Promise:</strong> {lead.offerPromise || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Pain Point:</strong> {lead.painPoint || "Not specified"}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-md font-semibold text-teal-400 mb-2">Ideal Customer Profile (ICP)</h4>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-2">
                                <p className="text-sm text-slate-200"><strong>Description:</strong> {lead.icpDescription || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Target Industries:</strong> {Array.isArray(lead.targetIndustries) ? lead.targetIndustries.join(", ") : lead.targetIndustries || "Not specified"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-md font-semibold text-teal-400">Targeting Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Company Sizes</p>
                                <p className="text-sm text-slate-200 font-semibold mt-1">
                                  {Array.isArray(lead.targetCompanySizes) ? lead.targetCompanySizes.join(", ") : lead.targetCompanySizes || "Not specified"}
                                </p>
                              </div>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Decision Makers</p>
                                <p className="text-sm text-slate-200 font-semibold mt-1">
                                  {Array.isArray(lead.decisionMakers) ? lead.decisionMakers.join(", ") : lead.decisionMakers || "Not specified"}
                                </p>
                              </div>
                              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Geographics</p>
                                <p className="text-sm text-slate-200 font-semibold mt-1">
                                  {lead.targetGeographicRegionsText || (Array.isArray(lead.targetGeographics) ? lead.targetGeographics.join(", ") : "Not specified")}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-800 pt-4 space-y-3">
                            <h4 className="text-md font-semibold text-teal-400">Credibility & Case Studies</h4>
                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                              {lead.caseStudies || lead.successStories || "No case studies provided."}
                            </p>
                          </div>

                          {/* Assigned Requirements Section */}
                          {(() => {
                            try {
                              const blueprint = generateICPDocument(lead as any);
                              return (
                                <div className="border-t border-slate-800 pt-6 space-y-6">
                                  <h4 className="text-md font-semibold text-teal-400 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-teal-400" />
                                    Assigned Requirements
                                  </h4>

                                  {/* Customer Profile Summary */}
                                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
                                    <h5 className="text-sm font-semibold text-slate-200">Customer Profile Summary</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-slate-500">Company Name</p>
                                        <p className="text-sm text-slate-200 font-medium">{blueprint["Assigned Requirements"]["Customer Profile Summary"].companyName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Website</p>
                                        <a href={blueprint["Assigned Requirements"]["Customer Profile Summary"].websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-teal-400 hover:underline">
                                          {blueprint["Assigned Requirements"]["Customer Profile Summary"].websiteUrl}
                                        </a>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Contact</p>
                                        <p className="text-sm text-slate-200">{blueprint["Assigned Requirements"]["Customer Profile Summary"].contactName} ({blueprint["Assigned Requirements"]["Customer Profile Summary"].contactEmail})</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Primary Challenge</p>
                                        <p className="text-sm text-slate-200">{blueprint["Assigned Requirements"]["Customer Profile Summary"].primaryChallenge}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Target Industries</p>
                                        <p className="text-sm text-slate-200">{blueprint["Assigned Requirements"]["Customer Profile Summary"].targetIndustries.join(", ")}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Current Tools</p>
                                        <p className="text-sm text-slate-200">{blueprint["Assigned Requirements"]["Customer Profile Summary"].currentTools.join(", ")}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Technical Execution Playbook */}
                                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                                    <h5 className="text-sm font-semibold text-slate-200">Technical Execution Playbook</h5>
                                    {Object.entries(blueprint["Assigned Requirements"]["Technical Execution Playbook"]).map(([phase, steps]) => (
                                      <div key={phase} className="space-y-2">
                                        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">{phase}</p>
                                        <div className="grid grid-cols-1 gap-2">
                                          {steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                              <div className="mt-1 h-4 w-4 rounded-full border border-teal-500/50 flex items-center justify-center">
                                                <div className="h-2 w-2 rounded-full bg-teal-500" />
                                              </div>
                                              <p>{step}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Dynamic GTM Blueprint (Technical Integration) */}
                                  <div className="space-y-4">
                                    <h5 className="text-md font-semibold text-teal-400 flex items-center gap-2">
                                      <Zap className="h-5 w-5 text-teal-400 animate-pulse" />
                                      Dynamic GTM Blueprint (Technical Integration)
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Memory OS (Hermes) Alignment</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                          {blueprint["Technical Product Value Proposition Alignment"]?.["Memory OS (Hermes) Alignment"] || "Aligning memory parameters..."}
                                        </p>
                                      </div>
                                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Agent Security (Clawpatrol) Alignment</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                          {blueprint["Technical Product Value Proposition Alignment"]?.["Agent Security Firewall (Clawpatrol) Alignment"] || "Applying compliance firewalls..."}
                                        </p>
                                      </div>
                                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Multi-Agent Framework Alignment</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                          {blueprint["Technical Product Value Proposition Alignment"]?.["Multi-Agent Framework Alignment"] || "Orchestrating agent collaboration..."}
                                        </p>
                                      </div>
                                      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">TAM & Competitor Estimates</p>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                          <strong>TAM 2026:</strong> {blueprint["Market Sizing & Competitor Estimates"]?.["TAM 2026 Consensus"]}<br/>
                                          <strong>CAGR:</strong> {blueprint["Market Sizing & Competitor Estimates"]?.["Consensus Growth CAGR"]}<br/>
                                          <strong>Competitors:</strong> {blueprint["Market Sizing & Competitor Estimates"]?.["Competitor Market Shares"]}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consensus Validation Log</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <span className="text-slate-500 block text-[10px] uppercase">Status:</span>
                                          <span className="text-green-400 font-semibold">{blueprint["Consensus Validation Log"]?.["Verification Status"]}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[10px] uppercase">CoV Check:</span>
                                          <span className="text-slate-300">{blueprint["Consensus Validation Log"]?.["Coefficient of Variation Check"]}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[10px] uppercase">MoE Check:</span>
                                          <span className="text-slate-300">{blueprint["Consensus Validation Log"]?.["Margin of Error (95%) Check"]}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[10px] uppercase">Audit Stamp:</span>
                                          <span className="text-slate-300 font-mono text-[10px]">{blueprint["Consensus Validation Log"]?.["Audit Integrity Stamp"]}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } catch (e) {
                              console.error("Failed to render assigned requirements:", e);
                              return null;
                            }
                          })()}
                        </CardContent>
                      </GlassPanel>
                    );
                  })()
                ) : (
                  <GlassPanel tilt={false} className="border-slate-700/50">
                    <CardContent className="py-16 text-center">
                      <Users className="h-20 w-20 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-1">Select a requirement</h3>
                      <p className="text-slate-500">Choose a requirement from the list to view its matched ICP details</p>
                    </CardContent>
                  </GlassPanel>
                )}
              </div>
            </div>
          )}

          {activeTab === "icp-entries" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-100">Assigned ICP Entries</h2>
              {icpEntries.length === 0 ? (
                <GlassPanel tilt={false} className="border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <FileText className="h-20 w-20 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-1">No ICP entries yet</h3>
                    <p className="text-slate-500">ICP entries submitted by customers will appear here</p>
                  </CardContent>
                </GlassPanel>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {icpEntries.map((entry) => (
                    <GlassPanel key={entry.id} tilt={true} className="border-slate-700/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-slate-100 font-bold">{entry.name}</CardTitle>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            entry.status === "active" ? "bg-green-500/15 text-green-400"
                              : entry.status === "draft" ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-slate-500/15 text-slate-400"
                          )}>{entry.status}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Customer: {entry.customerName}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-300">{entry.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {entry.targetIndustries?.length > 0 && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target Industries</p>
                              <p className="text-slate-200">{entry.targetIndustries.join(", ")}</p>
                            </div>
                          )}
                          {entry.targetCompanySizes?.length > 0 && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Company Sizes</p>
                              <p className="text-slate-200">{entry.targetCompanySizes.join(", ")}</p>
                            </div>
                          )}
                          {entry.targetGeographicRegions?.length > 0 && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Geographic Regions</p>
                              <p className="text-slate-200">{entry.targetGeographicRegions.join(", ")}</p>
                            </div>
                          )}
                          {entry.decisionMakers?.length > 0 && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Decision Makers</p>
                              <p className="text-slate-200">{entry.decisionMakers.join(", ")}</p>
                            </div>
                          )}
                          {entry.painPoints?.length > 0 && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pain Points</p>
                              <p className="text-slate-200">{entry.painPoints.join(", ")}</p>
                            </div>
                          )}
                          {entry.valueProposition && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value Proposition</p>
                              <p className="text-slate-200">{entry.valueProposition}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </GlassPanel>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "playbook" && (
            <GlassPanel tilt={false} className="border-slate-700/50">
              <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl text-slate-100 font-bold flex items-center gap-3">
                    {selectedLead ? `${selectedLead.companyName} ICP Playbook` : "ICP Playbook"}
                    {selectedLead && (
                      <span className="text-xs font-semibold text-teal-400 border border-teal-500/30 bg-teal-500/15 px-2.5 py-1 rounded-full">
                        Custom
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedLead 
                      ? `Dynamic ICP Playbook for ${selectedLead.companyName}` 
                      : "Read the official DealFlow ICP Playbook guidelines"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedLead && (
                    <ExtrudedButton
                      className="bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold"
                      onClick={() => {
                        try {
                          const content = generateICPDocument(selectedLead as any);
                          const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${selectedLead.companyName.replace(/\s+/g, '-')}-icp-playbook.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (e) {
                          console.error('Failed to download:', e);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Playbook
                    </ExtrudedButton>
                  )}
                  <a
                    href="/docs/DealFlow-ICP-Playbook-FINAL.pdf"
                    download
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-teal-600/20"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedLead ? (
                  <div className="space-y-6">
                    {/* Dynamic GTM Blueprint */}
                    {(() => {
                      try {
                        const content = generateICPDocument(selectedLead as any);
                        return (
                          <div className="space-y-4">
                            <div className="bg-gradient-to-br from-slate-900/70 to-slate-950/80 border border-slate-700/60 rounded-2xl p-6 space-y-5">
                              <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-teal-400 animate-pulse" />
                                <h3 className="text-lg font-bold text-slate-100">Dynamic ICP & GTM Blueprint</h3>
                              </div>
                              
                              {/* Technical Alignment */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Memory OS (Hermes)</h4>
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                    {content["Technical Product Value Proposition Alignment"]?.["Memory OS (Hermes) Alignment"] || "Aligning memory parameters..."}
                                  </p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Agent Security</h4>
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                    {content["Technical Product Value Proposition Alignment"]?.["Agent Security Firewall (Clawpatrol) Alignment"] || "Applying compliance firewalls..."}
                                  </p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Multi-Agent Framework</h4>
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                    {content["Technical Product Value Proposition Alignment"]?.["Multi-Agent Framework Alignment"] || "Orchestrating agent collaboration..."}
                                  </p>
                                </div>
                              </div>

                              {/* Market Analysis */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">TAM Estimates</h4>
                                  <p className="text-sm text-slate-300">
                                    <strong>TAM 2026:</strong> {content["Market Sizing & Competitor Estimates"]?.["TAM 2026 Consensus"] || "Calculating..."}<br/>
                                    <strong>CAGR:</strong> {content["Market Sizing & Competitor Estimates"]?.["Consensus Growth CAGR"] || "Analyzing..."}<br/>
                                    <strong>Competitors:</strong> {content["Market Sizing & Competitor Estimates"]?.["Competitor Market Shares"] || "Identifying..."}
                                  </p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Consensus Validation</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                                      <span className="text-green-400 font-semibold">{content["Consensus Validation Log"]?.["Verification Status"] || "Pending"}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[10px] uppercase">CoV Check</span>
                                      <span className="text-slate-300">{content["Consensus Validation Log"]?.["Coefficient of Variation Check"] || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[10px] uppercase">MoE Check</span>
                                      <span className="text-slate-300">{content["Consensus Validation Log"]?.["Margin of Error (95%) Check"] || "N/A"}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block text-[10px] uppercase">Audit Stamp</span>
                                      <span className="text-slate-300 font-mono text-[10px]">{content["Consensus Validation Log"]?.["Audit Integrity Stamp"] || "Pending"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Company Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                                <h4 className="text-md font-semibold text-teal-400">Company Overview</h4>
                                <p className="text-sm text-slate-200"><strong>Offer:</strong> {selectedLead.offerPromise || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Pain Point:</strong> {selectedLead.painPoint || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Website:</strong> {selectedLead.websiteUrl || selectedLead.website || "Not provided"}</p>
                              </div>
                              <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                                <h4 className="text-md font-semibold text-teal-400">Target Profile</h4>
                                <p className="text-sm text-slate-200"><strong>Industries:</strong> {Array.isArray(selectedLead.targetIndustries) ? selectedLead.targetIndustries.join(", ") : selectedLead.targetIndustries || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Company Sizes:</strong> {Array.isArray(selectedLead.targetCompanySizes) ? selectedLead.targetCompanySizes.join(", ") : selectedLead.targetCompanySizes || "Not specified"}</p>
                                <p className="text-sm text-slate-200"><strong>Decision Makers:</strong> {Array.isArray(selectedLead.decisionMakers) ? selectedLead.decisionMakers.join(", ") : selectedLead.decisionMakers || "Not specified"}</p>
                              </div>
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error(e);
                        return <div className="text-slate-400">Failed to generate dynamic playbook</div>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none bg-slate-950/50 border border-slate-800/80 p-6 md:p-8 rounded-2xl max-h-[600px] overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                    {playbookContent || "Select a company from the Requirements tab to view their custom ICP Playbook, or view the general guidelines below."}
                  </div>
                )}
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "tasks" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold text-slate-100">Your Tasks</h3>
                    <ExtrudedButton
                      className="bg-teal-600 hover:bg-teal-700 gap-2 transition-transform active:scale-95"
                      onClick={() => showToast("info", "Coming Soon", "Task creation feature is under development")}
                    >
                      <Plus className="h-4 w-4" />
                      New Task
                    </ExtrudedButton>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="bg-slate-900 border-slate-800 pl-9 text-sm rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {agentTasks.length === 0 ? (
                    <GlassPanel tilt={false} className="border-slate-700/50">
                      <CardContent className="py-10 text-center">
                        <CheckCircle2 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No tasks found</p>
                        <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
                      </CardContent>
                    </GlassPanel>
                  ) : (
                    agentTasks.map((task) => (
                      <GlassPanel
                        key={task.id}
                        tilt={true}
                        className={cn(
                          "cursor-pointer border-slate-700/50 hover:border-teal-500/50 transition-all duration-200 hover:shadow-md",
                          selectedTaskId === task.id ? "border-teal-500 shadow-lg shadow-teal-500/20" : ""
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-lg text-slate-100 font-bold">{task.title}</CardTitle>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap",
                                task.status === "completed"
                                  ? "bg-green-500/15 text-green-400"
                                  : task.status === "in-progress"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : task.status === "blocked"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-slate-500/15 text-slate-400"
                              )}
                            >
                              {task.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Updated {new Date(task.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </CardHeader>
                      </GlassPanel>
                    ))
                  )}
                </div>
              </div>

              {/* Task Details */}
              <div className="lg:col-span-2">
                {selectedTaskId ? (
                  (() => {
                    const task = agentTasks.find((t) => t.id === selectedTaskId);
                    if (!task) return null;
                    return (
                      <GlassPanel tilt={false} className="border-slate-700/50">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <CardTitle className="text-2xl text-slate-100 font-bold">{task.title}</CardTitle>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{task.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Status Actions */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "todo")}
                              className="border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              To Do
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "in-progress")}
                              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              In Progress
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "completed")}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              className="border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 gap-2"
                              onClick={() => showToast("info", "Coming Soon", "Call customer feature is under development")}
                            >
                              <Phone className="h-4 w-4" />
                              Call Customer
                            </ExtrudedButton>
                          </div>

                          {/* Milestones */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-100">Milestones</h4>
                            <div className="space-y-2">
                              {task.milestones.map((milestone) => (
                                <div
                                  key={milestone.id}
                                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-700/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => toggleMilestone(task.id, milestone.id)}
                                      className={cn(
                                        "flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all duration-200 hover:scale-110",
                                        milestone.completed
                                          ? "bg-green-500 border-green-500"
                                          : "border-slate-500 hover:border-teal-500"
                                      )}
                                    >
                                      {milestone.completed && <Check className="h-4 w-4 text-white" />}
                                    </button>
                                    <span
                                      className={cn(
                                        "font-medium transition-all duration-200",
                                        milestone.completed ? "text-slate-400 line-through" : "text-slate-100"
                                      )}
                                    >
                                      {milestone.title}
                                    </span>
                                  </div>
                                  {milestone.completedAt && (
                                    <span className="text-xs text-slate-500">
                                      {new Date(milestone.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-100">Progress Notes</h4>
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                              {task.progressNotes.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No progress notes yet</p>
                              ) : (
                                task.progressNotes.map((note, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-slate-700/30 rounded-xl text-sm text-slate-200 border border-slate-700/30"
                                  >
                                    {note}
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a progress note..."
                                className="bg-slate-700/50 border-slate-600 focus:border-teal-500 resize-none rounded-xl"
                                rows={2}
                              />
                              <ExtrudedButton
                                onClick={handleAddNote}
                                disabled={isAddingNote || !newNote.trim()}
                                className="bg-teal-600 hover:bg-teal-700 gap-2 min-w-[100px] transition-all disabled:opacity-50"
                              >
                                {isAddingNote ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Add Note"
                                )}
                              </ExtrudedButton>
                            </div>
                          </div>
                        </CardContent>
                      </GlassPanel>
                    );
                  })()
                ) : (
                  <GlassPanel tilt={false} className="border-slate-700/50">
                    <CardContent className="py-16 text-center">
                      <CheckCircle2 className="h-20 w-20 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-1">Select a task to view details</h3>
                      <p className="text-slate-500">Choose a task from the list on the left to get started</p>
                    </CardContent>
                  </GlassPanel>
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <GlassPanel tilt={false} className="border-slate-700/50 h-[650px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Chat with {customerName}
                  </CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Online</p>
                </div>
                <ExtrudedButton variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Info
                </ExtrudedButton>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderId === currentAgentId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl shadow-sm",
                          msg.senderId === currentAgentId
                            ? "bg-teal-600 text-white rounded-tr-md"
                            : "bg-slate-700 text-slate-100 rounded-tl-md"
                        )}
                      >
                        <p className="font-semibold text-xs mb-1 opacity-90">{msg.senderName}</p>
                        {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-xl border",
                                  msg.senderId === currentAgentId
                                    ? "bg-teal-700 border-teal-500 hover:bg-teal-800"
                                    : "bg-slate-800 border-slate-600 hover:bg-slate-900"
                                )}
                              >
                                <FileText className="h-6 w-6" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
                                </div>
                                <Download className="h-5 w-5" />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-xs mt-2 opacity-70 text-right">
                          {new Date(msg.timestamp || "").toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full text-sm">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-white"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Chat Input */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <ExtrudedButton
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Attach
                    </ExtrudedButton>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="bg-slate-700 border-slate-600 focus:border-teal-500 flex-1 rounded-xl"
                    />
                    <ExtrudedButton
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!newMessage.trim() && selectedFiles.length === 0)}
                      className="bg-teal-600 hover:bg-teal-700 gap-2 min-w-[100px] disabled:opacity-50"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </ExtrudedButton>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "calls" && (
            <GlassPanel tilt={false} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100 font-bold">Start a New Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-56 h-56 rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-700/50 shadow-2xl">
                      <Users className="h-28 w-28 text-slate-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-100 mb-2">{customerName}</h4>
                    <p className="text-slate-400 mb-6 max-w-xs mx-auto">Click to start a call with {customerName}</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <ExtrudedButton
                        className="bg-green-600 hover:bg-green-700 px-8 h-12 gap-2 transition-transform active:scale-95 shadow-lg shadow-green-600/10"
                        onClick={() => showToast("info", "Coming Soon", "Call feature is under development")}
                      >
                        <Phone className="h-5 w-5" />
                        Start Call
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="px-8 h-12 gap-2"
                        onClick={() => setActiveTab("chat")}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Message
                      </ExtrudedButton>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-100">Call Controls</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Mute feature is under development")}
                      >
                        <Phone className="h-5 w-5" />
                        Mute/Unmute
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Video toggle is under development")}
                      >
                        <Users className="h-5 w-5" />
                        Toggle Video
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Add participant is under development")}
                      >
                        <Users className="h-5 w-5" />
                        Add Participant
                      </ExtrudedButton>
                      <ExtrudedButton
                        className="bg-red-600 hover:bg-red-700 h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "End call feature is under development")}
                      >
                        <Check className="h-5 w-5" />
                        End Call
                      </ExtrudedButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "metrics" && agentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    Tasks Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-teal-400">{agentMetrics.tasksCompleted}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    out of {agentMetrics.totalTasks} total tasks
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Avg Resolution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-blue-400">
                    {Math.round(agentMetrics.averageResolutionTime / 60)}h
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    per task on average
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <Star className="h-5 w-5 text-amber-500" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <p className="text-5xl font-extrabold text-amber-400">
                    {agentMetrics.averageRating.toFixed(1)}
                  </p>
                  <Star className="h-10 w-10 text-amber-400 fill-amber-400" />
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Total Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-purple-400">
                    {agentMetrics.totalInteractions}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    calls & messages combined
                  </p>
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === "credits" && agentCredits && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credits Overview */}
              <div className="lg:col-span-1 space-y-6">
                <GlassPanel tilt={true} className="border-violet-700/30">
                  <CardContent className="pt-8 pb-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-violet-600/20 border border-violet-500/30">
                        <Zap className="h-10 w-10 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-violet-300 text-sm uppercase tracking-wider font-semibold">Available Credits</p>
                        <p className="text-6xl font-black text-white mt-1">{agentCredits.balance}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-700">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Earned</p>
                        <p className="text-xl font-bold text-green-400">{agentCredits.totalEarned}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Spent</p>
                        <p className="text-xl font-bold text-red-400">{agentCredits.totalSpent}</p>
                      </div>
                    </div>
                    <ExtrudedButton className="w-full mt-6 bg-violet-600 hover:bg-violet-500 h-12 gap-2">
                      Add Credits
                    </ExtrudedButton>
                  </CardContent>
                </GlassPanel>
              </div>

              {/* Transactions */}
              <div className="lg:col-span-2">
                <GlassPanel tilt={false} className="border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-100 font-bold">Transaction History</CardTitle>
                    <ExtrudedButton variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </ExtrudedButton>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-700">
                    {agentCredits.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            tx.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"
                          )}>
                            <Zap className={cn(
                              "h-5 w-5",
                              tx.amount > 0 ? "text-green-400" : "text-red-400"
                            )} />
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium">{tx.description}</p>
                            <p className="text-slate-500 text-xs">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-lg font-bold",
                          tx.amount > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </GlassPanel>
              </div>
            </div>
          )}

          {activeTab === "voice-whatsapp" && (
            <div className="space-y-8">
              {/* ─── Agent Settings Section ─── */}
              <GlassPanel tilt={false} className="border-teal-700/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-100 font-bold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-teal-400" />
                    Voice & WhatsApp Configuration
                  </CardTitle>
                  <ExtrudedButton
                    className="bg-teal-600 hover:bg-teal-700 gap-2"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Settings
                  </ExtrudedButton>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone Number with Country Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Your Agent Phone Number</label>
                    <div className="flex gap-2 relative">
                      {/* Country Dropdown Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          className="h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-teal-500 text-slate-100 text-sm flex items-center gap-2 min-w-[140px] transition-colors"
                          onClick={() => setShowCountryDropdown(p => !p)}
                        >
                          <span className="font-mono text-teal-300">{selectedCountry.prefix}</span>
                          <span className="text-slate-400 text-xs">{selectedCountry.code}</span>
                          <ChevronDown className="h-3 w-3 ml-auto text-slate-500" />
                        </button>
                        {showCountryDropdown && (
                          <div className="absolute top-12 left-0 z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                            <div className="p-2 border-b border-slate-700">
                              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                  type="text"
                                  className="bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCountries.map(c => (
                                <button
                                  key={c.code}
                                  type="button"
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-800 transition-colors",
                                    selectedCountry.code === c.code && "bg-teal-600/20 text-teal-300"
                                  )}
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setShowCountryDropdown(false);
                                    setCountrySearch("");
                                    setPhoneInput(""); // Reset masking on country change
                                  }}
                                >
                                  <span className="font-mono text-teal-400 w-14 shrink-0">{c.prefix}</span>
                                  <span className="text-slate-300">{c.name}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <p className="text-slate-500 text-sm text-center py-4">No countries found</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Masked Phone Input */}
                      <Input
                        placeholder={selectedCountry.placeholder}
                        value={phoneInput}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value, selectedCountry.mask);
                          setPhoneInput(formatted);
                        }}
                        className={cn(
                          "flex-1 bg-slate-800 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl font-mono",
                          phoneInput && !isPhoneValid(phoneInput, selectedCountry.mask) && "border-amber-500/50"
                        )}
                      />
                    </div>
                    {phoneInput && !isPhoneValid(phoneInput, selectedCountry.mask) && (
                      <p className="text-amber-400 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Format: {selectedCountry.mask.replace(/9/g, "0")}
                      </p>
                    )}
                    {phoneInput && isPhoneValid(phoneInput, selectedCountry.mask) && (
                      <p className="text-teal-400 text-xs flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Valid number — Full: {selectedCountry.prefix} {phoneInput}
                      </p>
                    )}
                  </div>

                  {/* Call Conversation Framework */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-green-400" />
                      Call Conversation Framework
                    </label>
                    <p className="text-xs text-slate-500">Define talking points, objectives, pain points, and mandatory disclosures for AI voice calls.</p>
                    <Textarea
                      rows={6}
                      placeholder={`Core Objectives:\n- Introduce DealFlow AI\n- Identify revenue challenges\n\nMandatory Disclosures:\n- Call is recorded for quality assurance`}
                      value={callFramework}
                      onChange={(e) => setCallFramework(e.target.value)}
                      className="bg-slate-800 border-slate-700 focus:border-teal-500 text-white placeholder-slate-600 rounded-xl resize-none"
                    />
                    <p className="text-slate-600 text-xs text-right">{callFramework.length} characters</p>
                  </div>

                  {/* WhatsApp Message Parameters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-400" />
                      WhatsApp Message Parameters
                    </label>
                    <p className="text-xs text-slate-500">Specify tone, call-to-action, personalization rules, and brand guidelines for AI-generated WhatsApp messages.</p>
                    <Textarea
                      rows={5}
                      placeholder={`Tone: Professional, friendly\nCTA: Schedule a 15-minute discovery call\nPersonalization: Address by first name\nBrand: DealFlow AI — data-driven, consultative`}
                      value={whatsAppParams}
                      onChange={(e) => setWhatsAppParams(e.target.value)}
                      className="bg-slate-800 border-slate-700 focus:border-teal-500 text-white placeholder-slate-600 rounded-xl resize-none"
                    />
                    <p className="text-slate-600 text-xs text-right">{whatsAppParams.length} characters</p>
                  </div>
                </CardContent>
              </GlassPanel>

              {/* ─── Initiate AI Voice Call ─── */}
              <GlassPanel tilt={false} className="border-green-700/30">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-green-400" />
                    AI Voice Call — Initiate Outbound Call
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCallSession && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                      <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                      <div>
                        <p className="text-green-300 font-medium text-sm">Call Active — {activeCallSession.status}</p>
                        <p className="text-slate-500 text-xs font-mono">Session: {activeCallSession.sessionId}</p>
                      </div>
                      <ExtrudedButton size="sm" variant="outline" className="ml-auto text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => setActiveCallSession(null)}>
                        <X className="h-4 w-4 mr-1" /> End
                      </ExtrudedButton>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Recipient phone (e.g. +1 555 000 0000)"
                      value={callToPhone}
                      onChange={(e) => setCallToPhone(e.target.value)}
                      className="flex-1 bg-slate-800 border-slate-700 focus:border-green-500 text-white placeholder-slate-500 rounded-xl font-mono"
                    />
                    <ExtrudedButton
                      className="bg-green-600 hover:bg-green-700 gap-2 px-6"
                      onClick={handleInitiateCall}
                      disabled={isInitiatingCall}
                    >
                      {isInitiatingCall ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
                      {isInitiatingCall ? "Connecting..." : "Start AI Call"}
                    </ExtrudedButton>
                  </div>
                  <p className="text-slate-600 text-xs">The AI agent will call this number and conduct a conversation using your Call Conversation Framework above.</p>
                </CardContent>
              </GlassPanel>

              {/* ─── Send AI WhatsApp Message ─── */}
              <GlassPanel tilt={false} className="border-emerald-700/30">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-400" />
                    AI WhatsApp Message — Compose & Send
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Recipient Phone Number</label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={waToPhone}
                        onChange={(e) => setWaToPhone(e.target.value)}
                        className="bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Customer Name (for personalization)</label>
                      <Input
                        placeholder="e.g. Anil Kumar"
                        value={waCustomerName}
                        onChange={(e) => setWaCustomerName(e.target.value)}
                        className="bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-500 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Custom Message (optional — leave blank for AI-generated)</label>
                    <Textarea
                      rows={4}
                      placeholder="Leave blank to let the AI generate a message based on your WhatsApp parameters above..."
                      value={waCustomContent}
                      onChange={(e) => setWaCustomContent(e.target.value)}
                      className="bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder-slate-600 rounded-xl resize-none"
                    />
                  </div>
                  <ExtrudedButton
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={handleSendWhatsApp}
                    disabled={isSendingWhatsApp}
                  >
                    {isSendingWhatsApp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSendingWhatsApp ? "Sending..." : "Send WhatsApp Message"}
                  </ExtrudedButton>

                  {/* Recent sent messages */}
                  {waSentMessages.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-700/50">
                      <p className="text-sm font-medium text-slate-300">Recently Sent</p>
                      {waSentMessages.slice(0, 3).map((msg, i) => (
                        <div key={i} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400 font-mono">{msg.messageId}</span>
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full">{msg.status}</span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
      <Unibox />
    </div>
  );
}

export default function AgentPortal() {
  return (
    <AuthProvider allowedRoles={["agent"]}>
      <AgentPortalContent />
    </AuthProvider>
  );
}
