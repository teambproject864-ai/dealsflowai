'use client';

import { useState, useEffect, useMemo } from 'react';
import { GlassPanel } from '@/components/immersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  PieChart,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GTMReportsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, custRes, agentRes] = await Promise.all([
          fetch('/api/portal/tasks'),
          fetch('/api/admin/customers'),
          fetch('/api/admin/agents')
        ]);
        const tData = await taskRes.json();
        const cData = await custRes.json();
        const aData = await agentRes.json();

        if (tData.success) setTasks(tData.tasks || []);
        if (cData.success) setCustomers(cData.customers || []);
        if (aData.success) setAgents(aData.agents || []);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Agent Productivity Metrics
  const agentProductivity = useMemo(() => {
    return agents.map(agent => {
      const agentTasks = tasks.filter(t => t.assignedAgentId === agent.id);
      const total = agentTasks.length;
      const completed = agentTasks.filter(t => t.status === 'completed').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        totalTasks: total,
        completedTasks: completed,
        completionRate: rate,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  }, [agents, tasks]);

  // 2. Customer Data Completeness Metric
  // Evaluates populated optional customer fields
  const dataCompleteness = useMemo(() => {
    if (customers.length === 0) return { overallScore: 0, breakdowns: [] };

    let totalScore = 0;
    const optionalFields = [
      'personalIdentifiers.phoneNumber',
      'personalIdentifiers.secondaryEmail',
      'personalIdentifiers.linkedinProfile',
      'companyInformation.websiteUrl',
      'companyInformation.industry',
      'companyInformation.companySize',
      'companyInformation.headquarters.city',
      'companyInformation.headquarters.country',
      'companyInformation.revenueRange',
      'companyInformation.foundingYear',
      'icpCategory',
      'assignedAgentId'
    ];

    const breakdowns = customers.map(cust => {
      let populatedCount = 0;

      optionalFields.forEach(fieldPath => {
        const parts = fieldPath.split('.');
        let val: any = cust;
        for (let i = 0; i < parts.length; i++) {
          if (val == null) break;
          val = val[parts[i]];
        }
        if (val && val !== '') {
          populatedCount++;
        }
      });

      const score = Math.round((populatedCount / optionalFields.length) * 100);
      totalScore += score;

      return {
        id: cust.id,
        name: cust.personalIdentifiers?.fullName || cust.name || 'Unnamed',
        company: cust.companyInformation?.companyName || cust.companyName || 'Unknown',
        score
      };
    });

    const overallScore = Math.round(totalScore / customers.length);

    return {
      overallScore,
      breakdowns: breakdowns.sort((a, b) => a.score - b.score) // lowest completeness first for admin action
    };
  }, [customers]);

  // 3. Task Timelines & Overdue Metrics
  const timelineMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const active = tasks.filter(t => t.status === 'in-progress' || t.status === 'todo').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    
    // Check if task is past due date and not completed
    const overdue = tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() < Date.now();
    }).length;

    const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      blocked,
      overdue,
      overdueRate,
    };
  }, [tasks]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Automated Insights & GTM Reports
          </h1>
          <p className="text-slate-400 mt-2">
            Automated insights regarding agent workflows, database health, and task timelines.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="border-slate-800 text-slate-300">
            <Download className="h-4 w-4 mr-2" /> Print Summary Report
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900">DealFlow.AI Executive Performance Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Data Health */}
        <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-500">Database Completeness</p>
              <h3 className="text-3xl font-bold text-white mt-1 print:text-slate-900">{dataCompleteness.overallScore}%</h3>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
              <PieChart className="h-6 w-6" />
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 print:bg-slate-200">
            <div
              className="bg-teal-400 h-2 rounded-full"
              style={{ width: `${dataCompleteness.overallScore}%` }}
            ></div>
          </div>
          <p className="text-slate-500 text-xs mt-3 print:text-slate-600">
            Measures populated identifiers, website URLs, assigned agents, and ICP categories.
          </p>
        </GlassPanel>

        {/* Task Overdue Rate */}
        <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-500">Overdue Task Ratio</p>
              <h3 className="text-3xl font-bold text-white mt-1 print:text-slate-900">{timelineMetrics.overdueRate}%</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 print:bg-slate-200">
            <div
              className="bg-red-400 h-2 rounded-full"
              style={{ width: `${timelineMetrics.overdueRate}%` }}
            ></div>
          </div>
          <p className="text-slate-500 text-xs mt-3 print:text-slate-600">
            {timelineMetrics.overdue} outstanding tasks have passed their assigned deadlines.
          </p>
        </GlassPanel>

        {/* Total Efficiency Score */}
        <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-500">Active Workflow Rate</p>
              <h3 className="text-3xl font-bold text-white mt-1 print:text-slate-900">
                {timelineMetrics.total > 0 ? Math.round((timelineMetrics.completed / timelineMetrics.total) * 100) : 0}%
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 print:bg-slate-200">
            <div
              className="bg-indigo-400 h-2 rounded-full"
              style={{ width: `${timelineMetrics.total > 0 ? Math.round((timelineMetrics.completed / timelineMetrics.total) * 100) : 0}%` }}
            ></div>
          </div>
          <p className="text-slate-500 text-xs mt-3 print:text-slate-600">
            {timelineMetrics.completed} tasks completed out of {timelineMetrics.total} total assigned workflow items.
          </p>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Productivity Board */}
        <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 print:text-slate-900">
            <BarChart3 className="h-5 w-5 text-teal-400" />
            Agent Productivity & Completion Rates
          </h2>
          <div className="space-y-5">
            {agentProductivity.map((item, idx) => (
              <div key={item.id || idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white print:text-slate-800">{item.name}</span>
                  <span className="text-slate-400 print:text-slate-600">
                    {item.completedTasks}/{item.totalTasks} Tasks ({item.completionRate}%)
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-3 flex items-center print:bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500"
                    style={{ width: `${item.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {agentProductivity.length === 0 && (
              <p className="text-slate-500 italic text-sm text-center py-8">No agent metrics available.</p>
            )}
          </div>
        </GlassPanel>

        {/* Database Completeness Attention Area */}
        <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 print:text-slate-900">
            <PieChart className="h-5 w-5 text-indigo-400" />
            Attention Required: Lowest Completeness Accounts
          </h2>
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-normal mb-2 print:text-slate-500">
              The following customer profiles have the lowest data completeness scores. Admins and assigned agents should review and update these accounts.
            </p>
            
            <div className="divide-y divide-slate-800/50 print:divide-slate-200">
              {dataCompleteness.breakdowns.slice(0, 5).map((c, i) => (
                <div key={c.id || i} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white print:text-slate-800">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 print:text-slate-600">{c.score}% Complete</span>
                    <Badge variant="outline" className={
                      c.score > 75 
                        ? 'text-emerald-400 border-emerald-500/20' 
                        : c.score > 50 
                        ? 'text-yellow-400 border-yellow-500/20' 
                        : 'text-red-400 border-red-500/20'
                    }>
                      {c.score > 75 ? 'Healthy' : c.score > 50 ? 'Medium' : 'Needs Action'}
                    </Badge>
                  </div>
                </div>
              ))}
              {dataCompleteness.breakdowns.length === 0 && (
                <p className="text-slate-500 italic text-sm text-center py-8">No customer accounts onboarded.</p>
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Task Completion Timelines */}
      <GlassPanel className="border border-slate-800 p-6 print:border-slate-300">
        <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 print:text-slate-900">
          <Clock className="h-5 w-5 text-indigo-400" />
          Task Deadline Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <p className="text-2xl font-bold text-white print:text-slate-800">{timelineMetrics.total}</p>
            <p className="text-xs text-slate-400 mt-1">Total Tasks</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <p className="text-2xl font-bold text-emerald-400">{timelineMetrics.completed}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Completed</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <p className="text-2xl font-bold text-blue-400">{timelineMetrics.active}</p>
            <p className="text-xs text-slate-400 mt-1">In Progress / Todo</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <p className="text-2xl font-bold text-red-400">{timelineMetrics.overdue}</p>
            <p className="text-xs text-slate-400 mt-1">Overdue Tasks</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
