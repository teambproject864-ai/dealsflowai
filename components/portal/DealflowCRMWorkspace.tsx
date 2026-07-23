"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  Filter,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CRMCompany, CRMCustomer, CRMDeal, DealStage } from "@/lib/crm-types";

interface DealflowCRMWorkspaceProps {
  userRole?: "admin" | "agent" | "customer";
  userId?: string;
}

export function DealflowCRMWorkspace({
  userRole = "agent",
  userId = "user-1"
}: DealflowCRMWorkspaceProps) {
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<"all" | "customers" | "companies" | "deals">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");

  // Data State
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [companies, setCompanies] = useState<CRMCompany[]>([]);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalCompanies: 0,
    totalDeals: 0,
    totalPipelineValue: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<"none" | "customer" | "company" | "deal">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field States for Customer Modal
  const [custForm, setCustForm] = useState({
    id: "",
    customerName: "",
    email: "",
    phone: "",
    title: "",
    companyId: "",
    companyName: ""
  });

  // Form Field States for Company Modal
  const [compForm, setCompForm] = useState({
    id: "",
    companyName: "",
    industry: "",
    websiteUrl: "",
    employeeCount: 50,
    annualRevenue: "$5M",
    contactEmail: "",
    phone: ""
  });

  // Form Field States for Deal Modal
  const [dealForm, setDealForm] = useState({
    id: "",
    dealName: "",
    amount: 50000,
    stage: "qualification" as DealStage,
    probability: 50,
    customerId: "",
    customerName: "",
    companyId: "",
    companyName: "",
    expectedCloseDate: "",
    notes: ""
  });

  // Fetch CRM Data
  const fetchCRMData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (stageFilter !== "all") params.set("stage", stageFilter);

      const res = await fetch(`/api/crm?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers || []);
        setCompanies(data.companies || []);
        setDeals(data.deals || []);
        setMetrics(data.metrics || {
          totalCustomers: 0,
          totalCompanies: 0,
          totalDeals: 0,
          totalPipelineValue: 0
        });
      }
    } catch (err) {
      console.error("[CRM Workspace] Error fetching CRM data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, [searchQuery, stageFilter]);

  // Handle Save Record with Client & Server Validation
  const handleSaveRecord = async (type: "customer" | "company" | "deal", payload: any) => {
    setValidationError(null);
    setSuccessMessage(null);

    // Client-side mandatory integrity check
    if (type === "company" && !payload.companyName?.trim()) {
      setValidationError("Data Integrity Error: Company record must contain a valid company name.");
      return;
    }
    if (type === "customer" && !payload.customerName?.trim() && !payload.companyName?.trim()) {
      setValidationError("Data Integrity Error: Customer record must contain a valid customer name or company name.");
      return;
    }
    if (type === "deal") {
      if (!payload.dealName?.trim()) {
        setValidationError("Data Integrity Error: Deal record must contain a valid deal name.");
        return;
      }
      if (!payload.customerName?.trim() && !payload.companyName?.trim()) {
        setValidationError("Data Integrity Error: Deal record must be linked to a valid customer name or company name.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, record: payload, userId })
      });

      const data = await res.json();

      if (!data.success) {
        setValidationError(data.error || "Failed to save CRM record due to data integrity rules.");
      } else {
        setSuccessMessage(data.message || "CRM record saved successfully.");
        setActiveModal("none");
        await fetchCRMData();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setValidationError(err.message || "Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (type: "customer" | "company" | "deal", id: string) => {
    if (!confirm("Are you sure you want to delete this CRM record?")) return;
    try {
      const res = await fetch(`/api/crm?type=${type}&id=${id}&userId=${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Record deleted successfully.");
        await fetchCRMData();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Helper Stage Badge Color
  const getStageBadge = (stage: DealStage) => {
    switch (stage) {
      case "qualification":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "proposal":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
      case "negotiation":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "closed-won":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "closed-lost":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <GlassPanel tilt={false} className="border-slate-850 p-6 lg:p-8 bg-slate-950/70 space-y-8 relative overflow-hidden">
      
      {/* DECORATIVE BACKGROUND GRADIENT BLOBS */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER BANNER & METRICS MATRIX */}
      <div className="space-y-6 border-b border-slate-850 pb-6 relative z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-300 border border-teal-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3 w-3 text-teal-400" /> Mandatory Metadata Integrity
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Dealflow Core CRM Engine</span>
            </div>
            
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-teal-400" />
              Dealflow CRM Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl font-light leading-relaxed">
              Manage accounts, customer profiles, and deal pipelines with strict relational metadata validation. 100% of stored records are permanently linked to valid customer names or company entities.
            </p>
          </div>

          {/* METRICS DASHBOARD CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 font-mono">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Customers</span>
              <span className="text-lg font-black text-white">{metrics.totalCustomers}</span>
            </div>
            <div className="bg-teal-950/30 border border-teal-850/60 p-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-[9px] text-teal-400 font-bold uppercase block">Companies</span>
              <span className="text-lg font-black text-teal-300">{metrics.totalCompanies}</span>
            </div>
            <div className="bg-violet-950/30 border border-violet-850/60 p-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-[9px] text-violet-400 font-bold uppercase block">Active Deals</span>
              <span className="text-lg font-black text-violet-300">{metrics.totalDeals}</span>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-850/60 p-3 rounded-2xl text-center min-w-[120px]">
              <span className="text-[9px] text-emerald-400 font-bold uppercase block">Pipeline Value</span>
              <span className="text-lg font-black text-emerald-300">${metrics.totalPipelineValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CONTROLS TOOLBAR & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-850">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "all" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "customers" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-teal-300" /> Customers ({metrics.totalCustomers})
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "companies" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-400" /> Companies ({metrics.totalCompanies})
            </button>
            <button
              onClick={() => setActiveTab("deals")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "deals" 
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-400" 
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Deals ({metrics.totalDeals})
            </button>
          </div>

          {/* Search Bar & Add Actions */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer or company..."
                className="bg-slate-950 border-slate-800 text-xs pl-9 py-1.5 h-9 rounded-xl focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setCustForm({ id: "", customerName: "", email: "", phone: "", title: "", companyId: "", companyName: "" });
                  setValidationError(null);
                  setActiveModal("customer");
                }}
                className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Customer
              </button>

              <button
                onClick={() => {
                  setCompForm({ id: "", companyName: "", industry: "", websiteUrl: "", employeeCount: 50, annualRevenue: "$5M", contactEmail: "", phone: "" });
                  setValidationError(null);
                  setActiveModal("company");
                }}
                className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Company
              </button>

              <button
                onClick={() => {
                  setDealForm({ id: "", dealName: "", amount: 50000, stage: "qualification", probability: 50, customerId: "", customerName: "", companyId: "", companyName: "", expectedCloseDate: "", notes: "" });
                  setValidationError(null);
                  setActiveModal("deal");
                }}
                className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-teal-500/20 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Deal
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* VALIDATION ERROR BANNER */}
      {validationError && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-red-300">Mandatory Data Requirement Rejected</h5>
            <p className="text-[11px] text-red-400/90 font-light leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION BANNER */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* MAIN DATA TABLES & CARDS WORKSPACE */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-teal-400" /> Loading CRM records...
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 1. CUSTOMERS SECTION */}
          {(activeTab === "all" || activeTab === "customers") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-400" /> Customer Contact Profiles ({customers.length})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Linked to valid customer/company identity</span>
              </div>

              {customers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-900">
                  No customer contact records found for query &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map(cust => (
                    <div key={cust.id} className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 p-4 rounded-2xl space-y-3 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                            {cust.customerName}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{cust.title || "Key Contact"}</span>
                        </div>
                        <span className="text-[9px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md font-bold">
                          Verified
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-850/80 font-mono">
                        <p className="flex justify-between">
                          <span className="text-slate-500">Company:</span>
                          <span className="text-slate-200 font-bold">{cust.companyName || "N/A"}</span>
                        </p>
                        {cust.email && (
                          <p className="flex justify-between truncate">
                            <span className="text-slate-500">Email:</span>
                            <span className="text-slate-300">{cust.email}</span>
                          </p>
                        )}
                        {cust.phone && (
                          <p className="flex justify-between">
                            <span className="text-slate-500">Phone:</span>
                            <span className="text-slate-300">{cust.phone}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end gap-2 border-t border-slate-850/40">
                        <button
                          onClick={() => {
                            setCustForm({
                              id: cust.id,
                              customerName: cust.customerName,
                              email: cust.email || "",
                              phone: cust.phone || "",
                              title: cust.title || "",
                              companyId: cust.companyId || "",
                              companyName: cust.companyName || ""
                            });
                            setValidationError(null);
                            setActiveModal("customer");
                          }}
                          className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono"
                        >
                          <Edit3 className="h-3 w-3 text-teal-400" /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteRecord("customer", cust.id)}
                          className="text-[10px] bg-slate-950 hover:bg-red-950/40 border border-slate-850 text-red-400 px-2 py-1 rounded-lg font-mono"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. COMPANIES SECTION */}
          {(activeTab === "all" || activeTab === "companies") && (
            <div className="space-y-4 pt-4 border-t border-slate-850/60">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-400" /> Company Accounts ({companies.length})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Corporate Account Records</span>
              </div>

              {companies.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-900">
                  No company records found for query &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map(comp => (
                    <div key={comp.id} className="bg-slate-900/60 border border-slate-850 hover:border-slate-750 p-4 rounded-2xl space-y-3 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {comp.companyName}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{comp.industry || "Technology"}</span>
                        </div>
                        <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">
                          {comp.employeeCount} Employees
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-850/80 font-mono">
                        <p className="flex justify-between">
                          <span className="text-slate-500">Annual Revenue:</span>
                          <span className="text-emerald-400 font-bold">{comp.annualRevenue || "$1M+"}</span>
                        </p>
                        {comp.websiteUrl && (
                          <p className="flex justify-between items-center">
                            <span className="text-slate-500">Website:</span>
                            <a href={comp.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[160px]">
                              {comp.websiteUrl.replace("https://", "")} <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end gap-2 border-t border-slate-850/40">
                        <button
                          onClick={() => {
                            setCompForm({
                              id: comp.id,
                              companyName: comp.companyName,
                              industry: comp.industry || "",
                              websiteUrl: comp.websiteUrl || "",
                              employeeCount: comp.employeeCount || 50,
                              annualRevenue: comp.annualRevenue || "$5M",
                              contactEmail: comp.contactEmail || "",
                              phone: comp.phone || ""
                            });
                            setValidationError(null);
                            setActiveModal("company");
                          }}
                          className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono"
                        >
                          <Edit3 className="h-3 w-3 text-indigo-400" /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteRecord("company", comp.id)}
                          className="text-[10px] bg-slate-950 hover:bg-red-950/40 border border-slate-850 text-red-400 px-2 py-1 rounded-lg font-mono"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. DEALS PIPELINE SECTION */}
          {(activeTab === "all" || activeTab === "deals") && (
            <div className="space-y-4 pt-4 border-t border-slate-850/60">
              <div className="flex justify-between items-center flex-wrap gap-2 px-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" /> Active Deals Pipeline ({deals.length})
                </h4>

                {/* Stage Filter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Stage Filter:</span>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1 rounded-xl text-slate-300 font-mono focus:outline-none"
                  >
                    <option value="all">All Stages</option>
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>
                </div>
              </div>

              {deals.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-900">
                  No deal pipeline records found for query &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950/80 border-b border-slate-850 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5 font-bold">Deal Name</th>
                          <th className="p-3.5 font-bold">Linked Customer / Company</th>
                          <th className="p-3.5 font-bold">Deal Value</th>
                          <th className="p-3.5 font-bold">Stage</th>
                          <th className="p-3.5 font-bold">Probability</th>
                          <th className="p-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 text-slate-200">
                        {deals.map(deal => (
                          <tr key={deal.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3.5 font-bold text-white">{deal.dealName}</td>
                            <td className="p-3.5">
                              <span className="block font-bold text-slate-200">{deal.customerName || "Linked Customer"}</span>
                              <span className="text-[10px] text-slate-500 block">{deal.companyName || "Linked Company"}</span>
                            </td>
                            <td className="p-3.5 font-black text-emerald-400">${deal.amount.toLocaleString()}</td>
                            <td className="p-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getStageBadge(deal.stage)}`}>
                                {deal.stage.replace("-", " ")}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-indigo-300">{deal.probability}%</td>
                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setDealForm({
                                    id: deal.id,
                                    dealName: deal.dealName,
                                    amount: deal.amount,
                                    stage: deal.stage,
                                    probability: deal.probability,
                                    customerId: deal.customerId || "",
                                    customerName: deal.customerName || "",
                                    companyId: deal.companyId || "",
                                    companyName: deal.companyName || "",
                                    expectedCloseDate: deal.expectedCloseDate || "",
                                    notes: deal.notes || ""
                                  });
                                  setValidationError(null);
                                  setActiveModal("deal");
                                }}
                                className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded-lg"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteRecord("deal", deal.id)}
                                className="text-[10px] bg-slate-950 hover:bg-red-950/40 border border-slate-800 text-red-400 px-2 py-1 rounded-lg"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* MODAL DIALOGS FOR ADDING/EDITING */}

      {/* 1. CUSTOMER MODAL */}
      {activeModal === "customer" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-400" /> {custForm.id ? "Edit Customer" : "Add New Customer"}
              </h4>
              <button onClick={() => setActiveModal("none")} className="text-slate-500 hover:text-white font-mono text-xs">✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord("customer", custForm); }} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-200">Customer Name <span className="text-teal-400">* (Mandatory if Company Name omitted)</span></Label>
                <Input
                  value={custForm.customerName}
                  onChange={(e) => setCustForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-200">Company Name <span className="text-teal-400">* (Mandatory if Customer Name omitted)</span></Label>
                <Input
                  value={custForm.companyName}
                  onChange={(e) => setCustForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g. Acme Enterprise SaaS"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Email Address</Label>
                  <Input
                    type="email"
                    value={custForm.email}
                    onChange={(e) => setCustForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Title / Role</Label>
                  <Input
                    value={custForm.title}
                    onChange={(e) => setCustForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="VP RevOps"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal("none")} className="px-4 py-2 text-xs font-mono text-slate-400">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md">
                  {isSubmitting ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. COMPANY MODAL */}
      {activeModal === "company" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" /> {compForm.id ? "Edit Company" : "Add New Company"}
              </h4>
              <button onClick={() => setActiveModal("none")} className="text-slate-500 hover:text-white font-mono text-xs">✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord("company", compForm); }} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-200">Company Name <span className="text-red-400">*</span></Label>
                <Input
                  value={compForm.companyName}
                  onChange={(e) => setCompForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g. Acme SaaS Corp"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Industry</Label>
                  <Input
                    value={compForm.industry}
                    onChange={(e) => setCompForm(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="B2B Software"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Website URL</Label>
                  <Input
                    value={compForm.websiteUrl}
                    onChange={(e) => setCompForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://company.com"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Employee Count</Label>
                  <Input
                    type="number"
                    value={compForm.employeeCount}
                    onChange={(e) => setCompForm(prev => ({ ...prev, employeeCount: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Annual Revenue</Label>
                  <Input
                    value={compForm.annualRevenue}
                    onChange={(e) => setCompForm(prev => ({ ...prev, annualRevenue: e.target.value }))}
                    placeholder="$10M"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal("none")} className="px-4 py-2 text-xs font-mono text-slate-400">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md">
                  {isSubmitting ? "Saving..." : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DEAL MODAL */}
      {activeModal === "deal" && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" /> {dealForm.id ? "Edit Deal" : "Add New Deal Pipeline Record"}
              </h4>
              <button onClick={() => setActiveModal("none")} className="text-slate-500 hover:text-white font-mono text-xs">✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord("deal", dealForm); }} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-200">Deal Name <span className="text-red-400">*</span></Label>
                <Input
                  value={dealForm.dealName}
                  onChange={(e) => setDealForm(prev => ({ ...prev, dealName: e.target.value }))}
                  placeholder="e.g. Enterprise AI Suite"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-200">Customer Name <span className="text-teal-400">*</span></Label>
                  <Input
                    value={dealForm.customerName}
                    onChange={(e) => setDealForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Praneeth Burada"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-200">Company Name <span className="text-teal-400">*</span></Label>
                  <Input
                    value={dealForm.companyName}
                    onChange={(e) => setDealForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme SaaS Corp"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Deal Amount ($)</Label>
                  <Input
                    type="number"
                    value={dealForm.amount}
                    onChange={(e) => setDealForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Deal Stage</Label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm(prev => ({ ...prev, stage: e.target.value as DealStage }))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed-won">Closed Won</option>
                    <option value="closed-lost">Closed Lost</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Notes / Strategy Summary</Label>
                <textarea
                  rows={2}
                  value={dealForm.notes}
                  onChange={(e) => setDealForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Key deal decision makers and timeline details..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal("none")} className="px-4 py-2 text-xs font-mono text-slate-400">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md">
                  {isSubmitting ? "Saving..." : "Save Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </GlassPanel>
  );
}
