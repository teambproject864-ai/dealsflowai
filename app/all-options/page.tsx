"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Bot, BarChart3, TrendingUp, Shield, Users, Calendar, User, CheckCircle2, XCircle } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  href: string;
  description: string;
  category: string;
}

interface OptionStatus {
  id: string;
  status: "working" | "not-working";
  notes: string;
  lastVerified: string;
}

const ALL_OPTIONS: OptionItem[] = [
  { id: "browser-agent", name: "Browser Agent", href: "/browser-agent", description: "Autonomous browser agent", category: "AI & Automation" },
  { id: "gtm-analysis", name: "GTM Analysis", href: "/llm-comparison", description: "LLM performance comparison", category: "AI & Automation" },
  { id: "gtm-playbooks", name: "GTM Playbooks", href: "/solutions/gtm", description: "Go-to-market playbooks", category: "Solutions" },
  { id: "sales-acceleration", name: "Sales Acceleration", href: "/solutions/sales", description: "AI sales workflows", category: "Solutions" },
  { id: "marketing-optimization", name: "Marketing Optimization", href: "/solutions/marketing", description: "Marketing automation", category: "Solutions" },
  { id: "admin-portal", name: "Admin Portal", href: "/portal/admin/login", description: "System admin center", category: "Portals" },
  { id: "agent-portal", name: "Agent Portal", href: "/portal/agent/login", description: "AI agent workspace", category: "Portals" },
  { id: "customer-portal", name: "Customer Portal", href: "/portal/customer/login", description: "Client dashboard", category: "Portals" },
  { id: "book-demo", name: "Book a Demo", href: "/book-demo", description: "Schedule demo", category: "Other Options" },
  { id: "features", name: "Features", href: "/features", description: "All features", category: "Other Options" },
  { id: "support", name: "Support", href: "/support", description: "Help center", category: "Other Options" },
];

export default function AllOptionsPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, OptionStatus>>({});
  const [filter, setFilter] = useState<"all" | "working" | "not-working">("all");
  const [isReady, setIsReady] = useState(false);

  // Initialize statuses on client
  useEffect(() => {
    const loadStatuses = () => {
      let savedStatuses: Record<string, OptionStatus> = {};
      try {
        const saved = localStorage.getItem("optionStatuses");
        if (saved) savedStatuses = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved statuses", e);
      }

      const initialStatuses: Record<string, OptionStatus> = {};
      ALL_OPTIONS.forEach(item => {
        initialStatuses[item.id] = savedStatuses[item.id] || {
          id: item.id,
          status: "working",
          notes: "",
          lastVerified: new Date().toISOString(),
        };
      });

      setStatuses(initialStatuses);
      setIsReady(true);
    };

    loadStatuses();
  }, []);

  // Save to localStorage whenever statuses change
  useEffect(() => {
    if (isReady) {
      localStorage.setItem("optionStatuses", JSON.stringify(statuses));
    }
  }, [statuses, isReady]);

  const handleToggleStatus = (itemId: string) => {
    setStatuses(prev => {
      const current = prev[itemId];
      const newStatus = current.status === "working" ? "not-working" : "working";
      return {
        ...prev,
        [itemId]: {
          ...current,
          status: newStatus,
          lastVerified: new Date().toISOString(),
        },
      };
    });
  };

  const filteredOptions = ALL_OPTIONS.filter(item => {
    if (filter === "all") return true;
    return statuses[item.id]?.status === filter;
  });

  const groupedOptions: Record<string, OptionItem[]> = {};
  filteredOptions.forEach(item => {
    if (!groupedOptions[item.category]) {
      groupedOptions[item.category] = [];
    }
    groupedOptions[item.category].push(item);
  });

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#060612] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>

        <h1 className="text-4xl font-bold mb-2">All Options</h1>
        <p className="text-slate-400 text-lg mb-8">Status tracking for all features</p>

        {/* Filters */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              filter === "all" ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white" : "bg-white/6 border border-white/15 text-slate-300 hover:text-white"
            }`}
          >
            All Options
          </button>
          <button
            onClick={() => setFilter("working")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              filter === "working" ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white" : "bg-white/6 border border-white/15 text-slate-300 hover:text-white"
            }`}
          >
            Working Only
          </button>
          <button
            onClick={() => setFilter("not-working")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              filter === "not-working" ? "bg-gradient-to-r from-red-600 to-rose-500 text-white" : "bg-white/6 border border-white/15 text-slate-300 hover:text-white"
            }`}
          >
            Not Working
          </button>
        </div>

        {/* Groups */}
        {Object.keys(groupedOptions).map(category => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">{category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedOptions[category].map(item => {
                const status = statuses[item.id].status;
                return (
                  <div key={item.id} className="bg-[#070718] border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Link href={item.href} className="text-lg font-semibold hover:text-teal-300 transition-colors duration-300">
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
                          status === "working"
                            ? "bg-green-500/15 text-green-300 border-green-500/20"
                            : "bg-red-500/15 text-red-300 border-red-500/20"
                        }`}
                      >
                        {status === "working" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {status === "working" ? "Working" : "Not Working"}
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{item.description}</p>
                    <p className="text-xs text-slate-500">Last verified: {new Date(statuses[item.id].lastVerified).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
