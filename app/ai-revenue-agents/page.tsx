'use client';

import { useEffect, useState } from 'react';
import { loadLeadContext } from '@/lib/lead-context';
import { useRouter } from 'next/navigation';
import { type RevenueAgentProfile, type AgentSession, AGENT_FULL_NAMES } from '@/lib/types';

// Helper initials
const AGENT_INITIALS: Record<string, string> = {
  vijay: 'V',
  ashok: 'A',
  kiran: 'K',
  harsh: 'H',
  praneeth_burada: 'P',
};

export default function AIRevenueAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<RevenueAgentProfile[]>([]);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [context, setContext] = useState<ReturnType<typeof loadLeadContext>>(null);
  
  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/agents/sessions');
        const data = await res.json();
        
        if (data.success) {
          setAgents(data.agents);
          setSessions(data.sessions);
        }
        
        const leadContext = loadLeadContext();
        setContext(leadContext);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Function to start a session with an agent
  const handleConnect = async (agentKey: string) => {
    if (!context?.form) {
      setMessage({ type: 'error', text: 'Please fill out the company intake form first.' });
      return;
    }
    
    try {
      // Step 1: Create a new session
      const sessionRes = await fetch('/api/agents/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentKey,
          leadId: context.form.companyName.replace(/\s+/g, '-').toLowerCase(),
          companyName: context.form.companyName,
        }),
      });
      
      const sessionData = await sessionRes.json();
      if (!sessionData.success) throw new Error(sessionData.error || 'Failed to start session');
      
      // Step 2: Generate SQL queries content for the email
      const sqlContent = `-- =============================================
-- GTM Analysis SQL Queries for ${context.form.companyName}
-- Generated on: ${new Date().toISOString()}
-- =============================================

-- Health Score Calculation
SELECT 
  '${context.form.companyName}' as company_name,
  CASE WHEN '${context.form.websiteUrl || ""}' != '' THEN 20 ELSE 0 END as website_score,
  CASE WHEN '${(context.form as any).caseStudies || ""}' != '' THEN 20 ELSE 0 END as case_studies_score,
  CASE WHEN '${(context.form as any).icp || ""}' != '' THEN 20 ELSE 0 END as icp_score,
  CASE WHEN '${(context.form as any).offerPromise || ""}' != '' THEN 20 ELSE 0 END as offer_score,
  CASE WHEN ${(context.form as any).socialPlatforms?.length || 0} > 0 THEN 20 ELSE 0 END as social_presence_score;
`;
      
      // Step 3: Send notification email
      await fetch('/api/agents/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.session.id,
          agentKey,
          leadId: context.form.companyName.replace(/\s+/g, '-').toLowerCase(),
          companyName: context.form.companyName,
          customerName: context.form.contactName,
          customerEmail: context.form.contactEmail,
          icpDocumentContent: (context.form as any).icp || "",
          sqlQueriesContent: sqlContent,
        }),
      });
      
      // Step 4: Refresh the agent and session list
      const res = await fetch('/api/agents/sessions');
      const data = await res.json();
      
      if (data.success) {
        setAgents(data.agents);
        setSessions(data.sessions);
      }
      
      setSelectedAgent(agentKey);
      setMessage({ type: 'success', text: `Successfully connected with ${AGENT_FULL_NAMES[agentKey]}! Redirecting to portal...` });
      
      // Redirect to portal after a delay
      setTimeout(() => {
        router.push('/ai-revenue-agents/portal');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to connect with agent.' });
    }
  };
  
  // Function to end an active session
  const handleEndSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/agents/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'ended',
        }),
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to end session');
      
      // Refresh data
      const fetchRes = await fetch('/api/agents/sessions');
      const fetchData = await fetchRes.json();
      
      if (fetchData.success) {
        setAgents(fetchData.agents);
        setSessions(fetchData.sessions);
      }
      
      setMessage({ type: 'success', text: 'Session ended successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to end session.' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-xl">Loading AI Revenue Agents...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            AI Revenue Agent System
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Connect with specialized revenue agents to accelerate your GTM strategy.
          </p>
          <div className="mt-4">
            <button
              onClick={() => router.push('/ai-revenue-agents/portal')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
            >
              Go to Agent Portal
            </button>
          </div>
        </div>
        
        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
            {message.text}
          </div>
        )}
        
        {/* Agent List */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
            Available Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.key}
                className={`p-6 rounded-xl border transition-all duration-300 ${selectedAgent === agent.key ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {agent.fullName.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs text-green-400 font-medium">{agent.available ? 'Available' : 'Busy'}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-1">{agent.fullName}</h3>
                <p className="text-slate-400 text-sm mb-4">{agent.role}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Active Sessions</span>
                  <span className="text-lg font-bold text-white">{agent.activeSessions}</span>
                </div>
                
                <button
                  onClick={() => handleConnect(agent.key)}
                  disabled={!agent.available}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${agent.available ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                >
                  {agent.available ? 'Connect Now' : 'Agent Busy'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></span>
              Active Sessions
            </h2>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                      {AGENT_INITIALS[session.agentKey] || '?'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{session.companyName}</p>
                      <p className="text-slate-400 text-sm">
                        Agent: {AGENT_FULL_NAMES[session.agentKey] || session.agentKey} • {session.startedAt ? new Date(session.startedAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${session.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                      {session.status}
                    </span>
                    {session.status === 'active' && session.id && (
                      <button
                        onClick={() => handleEndSession(session.id!)}
                        className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-semibold transition-colors"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Info Box */}
        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h3 className="text-xl font-semibold text-blue-300 mb-3">How It Works</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-1">•</span>
              Select an agent from the list above.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-1">•</span>
              The agent will automatically receive your intake form data, ICP, and SQL queries.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold mt-1">•</span>
              Notifications are sent to the team with session details.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
