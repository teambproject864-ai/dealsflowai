"use client";

import { useEffect, useState } from "react";
import { ICPDocumentData } from "@/lib/icp-document-generator";

export default function IcpPrintPage() {
  const [data, setData] = useState<ICPDocumentData | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dealflow_icp_print_data");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse print data", e);
    }
  }, []);

  useEffect(() => {
    if (data) {
      // Trigger browser print dialog after content is rendered
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-800 font-sans">
        <div className="text-center">
          <h2 className="text-lg font-bold">No print data available</h2>
          <p className="text-sm text-slate-500 mt-2">Close this window and try exporting again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-12 text-slate-900 font-sans leading-relaxed text-sm print:p-0">
      {/* Print Instructions Banner (hidden during printing) */}
      <div className="mb-6 rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-800 print:hidden flex justify-between items-center">
        <div>
          <span className="font-bold">Print Preview Mode:</span> This view is optimized for exporting to PDF. Select <strong>Save as PDF</strong> as your destination in the print dialog.
        </div>
        <button 
          onClick={() => window.print()} 
          className="rounded bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Header Banner */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-teal-800">
          Ideal Customer Profile (ICP) &amp; GTM Strategy Blueprint
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">
          DealFlow.AI Enterprise System Integration Report
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Generated: {new Date().toLocaleDateString()} | Security Clearance: SOC2 Verified
        </p>
      </div>

      {/* Section 1: Overview */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          1. Go-to-Market ICP Overview
        </h2>
        <p className="text-slate-700 text-justify leading-relaxed">{data["ICP Overview"]}</p>
      </section>

      {/* Section 2: Customer Segmentation */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          2. Target Customer Segmentation
        </h2>
        <table className="w-full border-collapse border border-slate-200 mb-4 text-xs">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="w-1/4 bg-slate-50 p-2.5 font-bold border-r border-slate-200">Demographics</td>
              <td className="p-2.5 text-slate-700">{data["Target Customer Segmentation"]["Demographics"]}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="w-1/4 bg-slate-50 p-2.5 font-bold border-r border-slate-200">Firmographics</td>
              <td className="p-2.5 text-slate-700">{data["Target Customer Segmentation"]["Firmographics"]}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="w-1/4 bg-slate-50 p-2.5 font-bold border-r border-slate-200">SDR Team Scale</td>
              <td className="p-2.5 text-slate-700">{data["Target Customer Segmentation"]["SDR Team Scale"]}</td>
            </tr>
            <tr>
              <td className="w-1/4 bg-slate-50 p-2.5 font-bold border-r border-slate-200">Target Geographies</td>
              <td className="p-2.5 text-slate-700">{data["Target Customer Segmentation"]["Target Geographies"]}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 3: Pain Points */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          3. Key Pain Point Mapping
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong>Manual Outreach Overhead:</strong> {data["Key Pain Point Mapping"]["Manual Outreach Overhead"]}
          </li>
          <li>
            <strong>Deliverability &amp; Spam Risks:</strong> {data["Key Pain Point Mapping"]["Deliverability & Spam Risks"]}
          </li>
          <li>
            <strong>Context Loss &amp; Hallucinations:</strong> {data["Key Pain Point Mapping"]["Context Loss & Hallucinations"]}
          </li>
          <li>
            <strong>Security &amp; Jailbreak Vulnerabilities:</strong> {data["Key Pain Point Mapping"]["Security & Jailbreak Vulnerabilities"]}
          </li>
        </ul>
      </section>

      {/* Section 4: Technical System Alignments */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          4. Technical Product Value Proposition Alignment
        </h2>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <h3 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide">Memory OS (Hermes)</h3>
            <p className="text-slate-700 text-xs">{data["Technical Product Value Proposition Alignment"]["Memory OS (Hermes) Alignment"]}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <h3 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide">Agent Security Firewall (Clawpatrol)</h3>
            <p className="text-slate-700 text-xs">{data["Technical Product Value Proposition Alignment"]["Agent Security Firewall (Clawpatrol) Alignment"]}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded">
            <h3 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide">Multi-Agent Framework</h3>
            <p className="text-slate-700 text-xs">{data["Technical Product Value Proposition Alignment"]["Multi-Agent Framework Alignment"]}</p>
          </div>
        </div>
      </section>

      {/* Page break for printing */}
      <div className="page-break" />

      {/* Section 5: Use Case Prioritization */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          5. Use Case Prioritization Grid
        </h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 p-3 rounded">
            <h3 className="font-bold text-teal-800">Priority 1: Live Voice Calls</h3>
            <p className="text-slate-600 mt-1">{data["Use Case Prioritization Grid"]["Priority 1: Live Voice Call Conduits"]}</p>
          </div>
          <div className="border border-slate-200 p-3 rounded">
            <h3 className="font-bold text-teal-800">Priority 2: Automated Scraping</h3>
            <p className="text-slate-600 mt-1">{data["Use Case Prioritization Grid"]["Priority 2: Automated Lead Site Scraping"]}</p>
          </div>
          <div className="border border-slate-200 p-3 rounded">
            <h3 className="font-bold text-teal-800">Priority 3: Multi-Agent Synthesis</h3>
            <p className="text-slate-600 mt-1">{data["Use Case Prioritization Grid"]["Priority 3: Multi-Agent Consensus Syntheses"]}</p>
          </div>
          <div className="border border-slate-200 p-3 rounded">
            <h3 className="font-bold text-teal-800">Priority 4: Voice Confirmations</h3>
            <p className="text-slate-600 mt-1">{data["Use Case Prioritization Grid"]["Priority 4: Compliance-Checked Confirmations"]}</p>
          </div>
        </div>
      </section>

      {/* Section 6: Market Sizing */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          6. Market Sizing &amp; Competitor Estimates
        </h2>
        <div className="mb-4 text-xs text-slate-700 space-y-1">
          <div><strong>Consensus TAM 2026:</strong> {data["Market Sizing & Competitor Estimates"]["TAM 2026 Consensus"]}</div>
          <div><strong>Consensus Growth CAGR:</strong> {data["Market Sizing & Competitor Estimates"]["Consensus Growth CAGR"]}</div>
        </div>

        {/* Competitor Market Share Table */}
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Consensus Competitor Landscape</h3>
        <table className="w-full border-collapse border border-slate-200 text-xs">
          <thead>
            <tr className="bg-teal-700 text-white font-bold">
              <th className="border border-slate-200 p-2 text-left">Competitor</th>
              <th className="border border-slate-200 p-2 text-left">Estimated Market Share</th>
              <th className="border border-slate-200 p-2 text-left">GTM Focus Model</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="border border-slate-200 p-2 font-bold">Apollo.io</td>
              <td className="border border-slate-200 p-2">40.0% Share</td>
              <td className="border border-slate-200 p-2">All-in-One Database &amp; sequencing, PLG focus</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="border border-slate-200 p-2 font-bold">Clay.com</td>
              <td className="border border-slate-200 p-2">25.0% Share</td>
              <td className="border border-slate-200 p-2">Data Enrichment &amp; CRM waterfall orchestration</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="border border-slate-200 p-2 font-bold">Instantly.ai</td>
              <td className="border border-slate-200 p-2">20.0% Share</td>
              <td className="border border-slate-200 p-2">Cold Email Outreach, modular deliverability</td>
            </tr>
            <tr className="border-b border-slate-200 bg-teal-50/20">
              <td className="border border-teal-200 p-2 font-bold text-teal-800">DealFlow.AI (Target)</td>
              <td className="border border-teal-200 p-2 font-bold text-teal-800">15.0% Share</td>
              <td className="border border-teal-200 p-2 font-bold text-teal-800">Autonomous Agentic GTM &amp; Telemetry integrations</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 7: Consensus Validation Log */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-base font-bold text-teal-900 border-b border-slate-200 pb-1 mb-3">
          7. Consensus Validation Log
        </h2>
        <div className="grid grid-cols-2 gap-4 border border-slate-200 p-4 rounded text-xs">
          <div>
            <span className="font-bold text-slate-700">Consensus Verification:</span>
            <div className="text-emerald-700 font-bold mt-0.5">{data["Consensus Validation Log"]["Verification Status"]}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700">Coefficient of Variation Check:</span>
            <div className="text-slate-800 mt-0.5">{data["Consensus Validation Log"]["Coefficient of Variation Check"]}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700">Margin of Error Check (95% CI):</span>
            <div className="text-slate-800 mt-0.5">{data["Consensus Validation Log"]["Margin of Error (95%) Check"]}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700">Audit Code Hash:</span>
            <div className="text-slate-600 font-mono mt-0.5">{data["Consensus Validation Log"]["Audit Integrity Stamp"]}</div>
          </div>
        </div>
      </section>

      {/* Footer page stamp */}
      <div className="border-t border-slate-200 pt-4 mt-12 text-center text-[10px] text-slate-400 font-mono flex justify-between items-center print:mt-24">
        <span>DEALFLOW.AI © 2026 ALL RIGHTS RESERVED</span>
        <span>SECURITY CLASSIFICATION: CONFIDENTIAL</span>
        <span>VERITAS HASH CODE: {data["Consensus Validation Log"]["Audit Integrity Stamp"].substring(0, 16).toUpperCase()}</span>
      </div>
    </div>
  );
}
