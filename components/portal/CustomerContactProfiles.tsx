"use client";

import React, { useState, useEffect, useCallback } from "react";

import {
  Search,
  Users,
  Building2,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Eye,
  X,
  FileText
} from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import { Input } from "@/components/ui/input";

export interface CustomerContactProfile {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  companyName: string;
  industry: string;
  annualRevenue: string;
  employeeCount: number;
  websiteUrl: string;
  dealsCount: number;
  totalDealValue: number;
  deals: { id: string; dealName: string; amount: number; stage: string; expectedCloseDate?: string }[];
  createdAt: string;
  updatedAt: string;
}

export function CustomerContactProfiles() {
  const [profiles, setProfiles] = useState<CustomerContactProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, page: 1, limit: 10, totalPages: 1 });
  const [selectedProfile, setSelectedProfile] = useState<CustomerContactProfile | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query,
        stage,
        page: page.toString(),
        limit: "10"
      });
      const res = await fetch(`/api/agent/customer-profiles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    } finally {
      setLoading(false);
    }
  }, [query, stage, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);


  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <GlassPanel tilt={false} className="border-slate-800 p-6 bg-gradient-to-r from-slate-900/80 to-violet-950/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-bold">
              Agent Portal · CRM Workspace
            </span>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
              <Users className="h-6 w-6 text-violet-400" /> Customer Contact Profiles
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Access persisted workflow-generated customer profiles, corporate linkages, and historical deal metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <p className="text-[9px] text-slate-500 font-mono uppercase">Total Profiles</p>
              <p className="text-sm font-black text-white font-mono">{pagination.totalCount}</p>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Filter and Search Toolbar */}
      <GlassPanel tilt={false} className="border-slate-850 p-4 bg-slate-900/30">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by customer name, email, company, industry, or title..."
              className="pl-10 bg-slate-950 border-slate-800 text-xs rounded-xl h-10 text-slate-200"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={stage}
              onChange={(e) => { setStage(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Deal Stages</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed-Won</option>
              <option value="closed-lost">Closed-Lost</option>
            </select>
          </div>
        </div>
      </GlassPanel>

      {/* Customer Contact Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10">
          <Users className="h-10 w-10 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No customer contact profiles match your search criteria.</p>
        </div>
      ) : (
        <GlassPanel tilt={false} className="border-slate-850 p-0 overflow-hidden bg-slate-900/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-850 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Contact</th>
                  <th className="py-3 px-4">Company & Industry</th>
                  <th className="py-3 px-4">Revenue & Size</th>
                  <th className="py-3 px-4">Deals / Pipeline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-100 text-sm">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-500" /> {p.email}
                      </div>
                      <div className="text-[10px] text-violet-400 font-mono mt-0.5">{p.title}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" /> {p.companyName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.industry}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-300 font-bold">{p.annualRevenue}</div>
                      <div className="text-slate-500 text-[10px]">{p.employeeCount} employees</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-emerald-400 font-bold">${p.totalDealValue.toLocaleString()}</div>
                      <div className="text-slate-500 text-[10px]">{p.dealsCount} active deals</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedProfile(p)}
                        className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-850 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} profiles)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-40 rounded-xl text-slate-300 flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 disabled:opacity-40 rounded-xl text-slate-300 flex items-center gap-1 font-semibold"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Customer Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassPanel tilt={false} className="border-slate-800 bg-slate-950 p-6 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-violet-400 font-mono uppercase font-bold">Workflow Contact Record</span>
                <h3 className="text-xl font-extrabold text-white">{selectedProfile.customerName}</h3>
                <p className="text-xs text-slate-400">{selectedProfile.title} · {selectedProfile.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Contact Information</span>
                <p className="text-slate-200">Email: <span className="text-violet-300 font-mono">{selectedProfile.email}</span></p>
                <p className="text-slate-200">Phone: <span className="text-slate-300 font-mono">{selectedProfile.phone}</span></p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Company Details</span>
                <p className="text-slate-200">Industry: <span className="text-slate-300">{selectedProfile.industry}</span></p>
                <p className="text-slate-200">Revenue: <span className="text-emerald-400 font-bold">{selectedProfile.annualRevenue}</span></p>
              </div>
            </div>

            {/* Historical Deal Records */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-emerald-400" /> Historical Deal Records ({selectedProfile.dealsCount})
              </h4>
              {selectedProfile.deals.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No historical deal records found for this profile.</p>
              ) : (
                <div className="space-y-2">
                  {selectedProfile.deals.map((d) => (
                    <div key={d.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-100">{d.dealName}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Stage: {d.stage}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-extrabold text-emerald-400">${d.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
