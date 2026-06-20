"use client";

import React, { useState } from "react";
import type { GTMInput, GTMOutput } from "@/lib/gtm-llm/types";
import { GTMInputSchema } from "@/lib/gtm-llm/types";

interface LLMReport {
  id: string;
  name: string;
  model: string;
  metrics: {
    latency: number; // ms
    accuracy: number; // 0-100
    costPer1000Tokens: number;
    stability: number; // 0-100
  };
  analysis: GTMOutput;
  timestamp: Date;
}

const testInput: GTMInput = {
  product: "DealFlow AI Platform",
  industry: "SaaS",
  budget: 250000,
  timelineMonths: 6,
  marketResearch: {
    marketSize: 5000000000,
    marketGrowthRate: 25,
    targetAudience: ["Mid-Market B2B", "Enterprise Tech"],
    marketTrends: ["AI-driven sales tools", "Data privacy compliance"],
    marketChallenges: ["High customer acquisition costs", "Market saturation"],
  },
  customerSegments: {
    segments: [
      {
        id: "1",
        size: 15000,
        needs: ["Pipeline automation", "Real-time analytics"],
        painPoints: ["Manual deal tracking"],
        valuePropositionFit: 90,
      },
    ],
  },
  competitiveLandscape: {
    competitors: [
      { name: "Competitor X", marketShare: 35, strengths: ["Strong brand"], weaknesses: ["Expensive pricing"] },
    ],
  },
  salesChannelMetrics: {
    channels: [
      { name: "LinkedIn", traffic: 50000, conversionRate: 4, cac: 450, ltv: 6500 },
    ],
  },
};

export default function LLMComparisonPage() {
  const [reports, setReports] = useState<LLMReport[]>([
    {
      id: "1",
      name: "Original Paid LLM (GPT-4o)",
      model: "openai/gpt-4o",
      metrics: { latency: 1200, accuracy: 88, costPer1000Tokens: 0.03, stability: 95 },
      analysis: {
        strategyRecommendations: { targetSegments: ["Enterprise"], priorityChannels: ["LinkedIn"], messaging: "Innovative", launchPhases: ["Awareness", "Launch"], keyMilestones: [] },
        penetrationForecast: { month1: 3, month3: 7, month6: 15, month12: 30, assumptions: [] },
        cacOptimization: { opportunities: [] },
        timelineRisks: { risks: [] },
        overallConfidence: 90,
      },
      timestamp: new Date(),
    },
    {
      id: "2",
      name: "Self-Hosted Open-Source LLM (Mistral 7B)",
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      metrics: { latency: 1800, accuracy: 85, costPer1000Tokens: 0.000, stability: 90 },
      analysis: {
        strategyRecommendations: { targetSegments: ["Enterprise", "SMB"], priorityChannels: ["LinkedIn"], messaging: "AI-powered", launchPhases: ["Awareness", "Consideration"], keyMilestones: [] },
        penetrationForecast: { month1: 2, month3: 6, month6: 14, month12: 28, assumptions: [] },
        cacOptimization: { opportunities: [] },
        timelineRisks: { risks: [] },
        overallConfidence: 85,
      },
      timestamp: new Date(),
    },
  ]);
  const [selectedLLM, setSelectedLLM] = useState<string | null>(null);

  const handleSelectLLM = (reportId: string) => {
    setSelectedLLM(reportId);
  };

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">LLM Performance Comparison Dashboard</h1>
        <p className="text-center text-slate-400 mb-12">Side-by-side comparison of original paid LLM and self-hosted open-source LLM</p>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {reports.map((report, index) => (
            <div
              key={report.id}
              className={`bg-[#070718] border-2 rounded-3xl p-8 transition-all duration-300 ${
                selectedLLM === report.id ? "border-teal-500 shadow-[0_0_30px_rgba(45,212,191,0.25)]" : "border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{report.name}</h2>
                  <p className="text-slate-400">{report.model}</p>
                </div>
                {selectedLLM === report.id && (
                  <span className="px-4 py-1 bg-gradient-to-r from-teal-600 to-cyan-500 rounded-full text-sm font-semibold">SELECTED</span>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-teal-300">Key Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-slate-400">Latency</div>
                    <div className="text-2xl font-bold">{report.metrics.latency}ms</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-slate-400">Accuracy</div>
                    <div className="text-2xl font-bold">{report.metrics.accuracy}%</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-slate-400">Cost per 1000 tokens</div>
                    <div className="text-2xl font-bold">{report.metrics.costPer1000Tokens === 0 ? "$0.00" : `$${report.metrics.costPer1000Tokens.toFixed(3)}`}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-sm text-slate-400">Stability</div>
                    <div className="text-2xl font-bold">{report.metrics.stability}%</div>
                  </div>
                </div>
              </div>

              {/* Analysis Confidence */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-slate-300">Overall Confidence</h3>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                    style={{ width: `${report.analysis.overallConfidence}%` }}
                  ></div>
                </div>
                <div className="text-right text-xl font-bold mt-1">{report.analysis.overallConfidence}%</div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectLLM(report.id)}
                disabled={selectedLLM === report.id}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  selectedLLM === report.id
                    ? "bg-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-600 to-cyan-500 hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]"
                }`}
              >
                {selectedLLM === report.id ? "Selected for Migration" : "Select this LLM"}
              </button>
            </div>
          ))}
        </div>

        {/* Cross-Model Comparison Summary */}
        <div className="bg-[#070718] border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6">Cross-Model Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">Metric</th>
                  {reports.map((report) => (
                    <th key={report.id} className="text-center py-4 px-4 text-slate-400 font-semibold">{report.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4">Latency</td>
                  {reports.map((report) => (
                    <td key={report.id} className="text-center py-4 px-4">{report.metrics.latency}ms</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4">Accuracy</td>
                  {reports.map((report) => (
                    <td key={report.id} className="text-center py-4 px-4">{report.metrics.accuracy}%</td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4">Cost per 1000 tokens</td>
                  {reports.map((report) => (
                    <td key={report.id} className="text-center py-4 px-4">{report.metrics.costPer1000Tokens === 0 ? "$0.00" : `$${report.metrics.costPer1000Tokens.toFixed(3)}`}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4">Stability</td>
                  {reports.map((report) => (
                    <td key={report.id} className="text-center py-4 px-4">{report.metrics.stability}%</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
