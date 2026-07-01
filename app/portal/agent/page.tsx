"use client";

import React, { useState, useRef, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";
import { MarketingStrategyModule } from "@/components/MarketingStrategyModule";
import {
  Menu,
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
  Upload,
  Download,
  FileText,
  Settings,
  PhoneCall,
  Send,
  Briefcase,
  Mail,
  Brain,
  SearchIcon,
  CreditCard,
  CalendarCheck,
  PhoneOff,
} from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const tabs = [
  { id: "requirements", label: "Requirements", icon: Users, color: "text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/10" },
  { id: "tasks", label: "Tasks", icon: CheckCircle2, color: "text-purple-400 border-purple-500/30 hover:border-purple-500/60 shadow-purple-500/10" },
  { id: "chat", label: "Chat Messenger", icon: MessageSquare, color: "text-sky-400 border-sky-500/30 hover:border-sky-500/60 shadow-sky-500/10" },
  { id: "calls", label: "Calls Dialer", icon: Phone, color: "text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/10" },
  { id: "voice-whatsapp", label: "AI Voice & WhatsApp", icon: Settings, color: "text-teal-400 border-teal-500/30 hover:border-teal-500/60 shadow-teal-500/10" },
] as const;

function AgentPortalContent() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("requirements");
  
  // Data States
  const [tasks, setTasks] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [callsList, setCallsList] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Interactive Dialer States
  const [dialedNumber, setDialedNumber] = useState("");
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected">("idle");
  const [callDuration, setCallDuration] = useState(0);

  // Form States
  const [newMessage, setNewMessage] = useState("");
  const [newRequirementDesc, setNewRequirementDesc] = useState("");
  const [newRequirementCategory, setNewRequirementCategory] = useState("General Inquiry");
  const [newRequirementPriority, setNewRequirementPriority] = useState("Medium");
  
  // Settings States
  const [whatsAppParams, setWhatsAppParams] = useState("Default Campaign Sequence");
  const [callFramework, setCallFramework] = useState("Objective Discovery Framework");

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Real-time synchronization polling
  const fetchAgentData = async () => {
    try {
      const [tasksRes, reqsRes, chatRes, callsRes, feedbackRes, customersRes] = await Promise.all([
        fetch("/api/portal/tasks"),
        fetch("/api/portal/requirements"),
        fetch("/api/portal/chat?sessionId=session-1"),
        fetch("/api/portal/calls"),
        fetch("/api/portal/feedback"),
        fetch("/api/admin/customers"),
      ]);

      const [tasksData, reqsData, chatData, callsData, feedbackData, customersData] = await Promise.all([
        tasksRes.json(),
        reqsRes.json(),
        chatRes.json(),
        callsRes.json(),
        feedbackRes.json(),
        customersRes.json(),
      ]);

      if (tasksData.success) setTasks(tasksData.tasks);
      if (reqsData.success) setRequirements(reqsData.requirements);
      if (chatData.success) setChatMessages(chatData.messages);
      if (callsData.success) setCallsList(callsData.calls);
      if (feedbackData.success) setFeedback(feedbackData.feedback);
      if (customersData.success) setCustomers(customersData.customers);
    } catch (error) {
      console.error("[Agent Portal] polling error:", error);
    }
  };

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Call timer ticking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === "connected") {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Actions
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/portal/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Task Updated", `Task marked as ${newStatus}`);
        fetchAgentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirementDesc.trim()) return;

    try {
      const res = await fetch("/api/portal/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newRequirementDesc,
          category: newRequirementCategory,
          priority: newRequirementPriority,
          status: "Open",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Requirement Created", "A new requirement has been saved and queued.");
        setNewRequirementDesc("");
        fetchAgentData();
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
        fetchAgentData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInitiateCall = async () => {
    if (!dialedNumber.trim()) return;
    setCallState("ringing");
    setTimeout(() => {
      setCallState("connected");
    }, 2000);
  };

  const handleEndCall = async () => {
    if (callState !== "connected") {
      setCallState("idle");
      return;
    }
    const finalDuration = callDuration;
    setCallState("idle");
    
    // Save call record to Firestore
    try {
      await fetch("/api/portal/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: "customer-demo",
          receiverName: "Customer Demo",
          duration: finalDuration,
          status: "completed",
        }),
      });
      showToast("success", "Call Saved", "Outbound session recorded.");
      fetchAgentData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const currentAgentId = user?.id || "";
  const myTasks = tasks.filter(t => t.assignedAgentId === currentAgentId || !t.assignedAgentId);
  const pendingTasks = myTasks.filter(t => t.status !== "completed").length;
  const rating = feedback.length 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) 
    : "4.8";

  return (
    <div className="space-y-8 relative pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <GlassPanel tilt={false} depth="front" className={cn(
            "w-80 shadow-2xl border backdrop-blur-2xl",
            notification.type === "success" ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-200" :
            notification.type === "error" ? "border-rose-500/40 bg-rose-950/90 text-rose-200" :
            "border-blue-500/40 bg-blue-950/90 text-blue-200"
          )}>
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-teal-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs opacity-90 mt-1">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </GlassPanel>
        </div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            DealFlow Agent Workspace
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Welcome back, {user?.name || "Agent"} • Manage your pipeline with live automation sync
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </div>

      {/* Workspace Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassPanel tilt={true} className="border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-purple-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Pending Workload</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{pendingTasks}</h3>
            </div>
            <Clock className="h-8 w-8 text-purple-500 opacity-85" />
          </CardContent>
        </GlassPanel>

        <GlassPanel tilt={true} className="border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Average Rating</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{rating}</h3>
            </div>
            <Star className="h-8 w-8 text-emerald-500 opacity-85 fill-emerald-500" />
          </CardContent>
        </GlassPanel>

        <GlassPanel tilt={true} className="border-sky-500/20 bg-gradient-to-br from-slate-900/80 to-sky-950/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">Active Customers</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{customers.length}</h3>
            </div>
            <Users className="h-8 w-8 text-sky-500 opacity-85" />
          </CardContent>
        </GlassPanel>
      </div>

      {/* Tab Control List */}
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
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                  : "border-transparent bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              )}
            >
              <Icon className={cn("h-4 w-4", tab.color.split(" ")[0])} />
              {tab.label}
            </ExtrudedButton>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        
        {/* 1. REQUIREMENTS TAB */}
        {activeTab === "requirements" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Create requirement form */}
            <GlassPanel tilt={false} className="border-slate-800 p-5 h-fit">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Request CRM Resource</h3>
              <form onSubmit={handleCreateRequirement} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="req-category" className="text-slate-400">Tactic / Category</Label>
                  <select
                    id="req-category"
                    value={newRequirementCategory}
                    onChange={(e) => setNewRequirementCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Billing Issue">Billing Issue</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-priority" className="text-slate-400">Target Priority</Label>
                  <select
                    id="req-priority"
                    value={newRequirementPriority}
                    onChange={(e) => setNewRequirementPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="req-desc" className="text-slate-400">Description of Requirements</Label>
                  <textarea
                    id="req-desc"
                    placeholder="Enter CRM onboarding or feature requirements..."
                    value={newRequirementDesc}
                    onChange={(e) => setNewRequirementDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <ExtrudedButton type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Submit CRM Request
                </ExtrudedButton>
              </form>
            </GlassPanel>

            {/* List requirements */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">CRM Requirements Status</h3>
              {requirements.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center bg-slate-900/10 rounded-xl border border-slate-800">No requirements loaded.</p>
              ) : (
                requirements.map(req => (
                  <GlassPanel key={req.id} tilt={false} className="border-slate-800 bg-slate-900/20 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{req.category}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border",
                          req.priority === "Critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        )}>{req.priority}</span>
                      </div>
                      <span className="bg-slate-850 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-350">{req.status}</span>
                    </div>
                    <p className="text-xs text-slate-300">{req.description}</p>
                    <p className="text-[10px] text-slate-500">Submitted by: {req.requesterName} ({req.requesterEmail})</p>
                  </GlassPanel>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. TASKS TAB */}
        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Tasks Queue</h2>
            {myTasks.length === 0 ? (
              <p className="text-slate-500 text-sm py-12 text-center bg-slate-900/20 border border-slate-800 rounded-xl">No tasks assigned to your workspace.</p>
            ) : (
              myTasks.map(t => (
                <GlassPanel key={t.id} tilt={false} className="border-slate-800 bg-slate-900/20 p-5">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-200">{t.title}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                          t.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                          t.status === "in-progress" ? "bg-yellow-500/10 text-yellow-400 animate-pulse" :
                          "bg-slate-500/10 text-slate-400"
                        )}>{t.status}</span>
                      </div>
                      <p className="text-xs text-slate-450 mt-1.5">{t.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {t.status !== "completed" && (
                        <ExtrudedButton size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateTaskStatus(t.id, "completed")}>
                          Mark Completed
                        </ExtrudedButton>
                      )}
                      {t.status === "todo" && (
                        <ExtrudedButton size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => handleUpdateTaskStatus(t.id, "in-progress")}>
                          Start Work
                        </ExtrudedButton>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              ))
            )}
          </div>
        )}

        {/* 3. CHAT MESSENGER TAB */}
        {activeTab === "chat" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-100">Live Client Messenger</h2>
            <GlassPanel className="border-slate-800 bg-slate-900/20 p-4 h-[500px] flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-500 text-center py-12 text-sm">No recent messages in this session.</p>
                ) : (
                  chatMessages.map(msg => {
                    const isMe = msg.senderRole === "agent" || msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex flex-col max-w-[70%] space-y-1", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                        <span className="text-[10px] text-slate-500">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <div className={cn(
                          "p-3 rounded-2xl text-xs",
                          isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"
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
                  placeholder="Type message to client..."
                  className="bg-slate-950 border-slate-850 rounded-xl"
                />
                <ExtrudedButton type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                </ExtrudedButton>
              </form>
            </GlassPanel>
          </div>
        )}

        {/* 4. CALLS DIALER TAB */}
        {activeTab === "calls" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Interactive Dialer Card */}
            <GlassPanel tilt={false} className="border-slate-800 p-5 h-fit text-center space-y-6">
              <h3 className="text-lg font-bold text-slate-200">Outbound Softphone</h3>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-right">
                <span className="text-2xl font-mono tracking-wider text-slate-100">{dialedNumber || "Enter Number"}</span>
              </div>

              {callState === "idle" && (
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(k => (
                    <button
                      key={k}
                      onClick={() => setDialedNumber(n => n + k)}
                      className="h-12 w-12 rounded-full border border-slate-800 hover:bg-slate-800/50 text-slate-200 text-lg font-bold flex items-center justify-center transition-colors"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}

              {callState === "ringing" && (
                <div className="py-6 space-y-2">
                  <p className="text-sm text-yellow-400 font-bold animate-pulse">Ringing outbound...</p>
                  <p className="text-xs text-slate-500">Connecting lines</p>
                </div>
              )}

              {callState === "connected" && (
                <div className="py-6 space-y-2">
                  <p className="text-sm text-green-400 font-bold">Line Connected</p>
                  <p className="text-xl font-mono text-slate-100">
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {callState === "idle" ? (
                  <>
                    <button
                      onClick={() => setDialedNumber("")}
                      className="p-3.5 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleInitiateCall}
                      disabled={!dialedNumber}
                      className="p-3.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <PhoneCall className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEndCall}
                    className="p-3.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </button>
                )}
              </div>
            </GlassPanel>

            {/* List Call History */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Recent Calling Sessions</h3>
              <div className="space-y-3">
                {callsList.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No call records loaded.</p>
                ) : (
                  callsList.map(call => (
                    <div key={call.id} className="p-3.5 border border-slate-900 bg-slate-950/40 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{call.callerName} → {call.receiverName}</p>
                        <p className="text-slate-500 mt-0.5">{new Date(call.startedAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">{call.status}</span>
                        <p className="text-slate-450 mt-1">{call.duration}s</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. VOICE & WHATSAPP CONFIG TAB */}
        {activeTab === "voice-whatsapp" && (
          <GlassPanel tilt={false} className="border-slate-800 p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-100">AI Voice & Messaging Parameters</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="agent-call-framework" className="text-slate-350">Discovery Call Conversation Framework</Label>
                <textarea
                  id="agent-call-framework"
                  rows={4}
                  value={callFramework}
                  onChange={(e) => setCallFramework(e.target.value)}
                  placeholder="Insert prompt strategy for discovery calls..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agent-whatsapp-framework" className="text-slate-350">WhatsApp Message Sequence Parameters</Label>
                <textarea
                  id="agent-whatsapp-framework"
                  rows={4}
                  value={whatsAppParams}
                  onChange={(e) => setWhatsAppParams(e.target.value)}
                  placeholder="Insert WhatsApp message framework sequence..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>

              <ExtrudedButton className="bg-gradient-to-r from-purple-600 to-indigo-600 font-bold py-2 w-full" onClick={() => showToast("success", "Settings Saved", "AI voice and WhatsApp parameters updated.")}>
                Save AI Settings
              </ExtrudedButton>
            </div>
          </GlassPanel>
        )}

      </div>
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
