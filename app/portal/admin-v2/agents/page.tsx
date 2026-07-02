'use client';

import { useState, useEffect, useMemo } from 'react';
import { GlassPanel } from '@/components/immersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Phone,
  Mail,
  UserX,
  UserCheck,
  Briefcase,
  Loader2,
  X,
  Activity,
  Globe
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../UIComponents';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  countryCode?: string;
  callConversationFramework?: string;
  whatsAppMessageParameters?: string;
  createdAt: string;
  isActive: boolean;
}

interface AuditLog {
  id: string;
  actionType: string;
  actionDetails: string;
  performedBy: string;
  performedByEmail: string;
  performedByName: string;
  performedByRole: string;
  targetId: string;
  targetType: string;
  createdAt: string;
}

export default function AgentsManagementPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Modals state
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Form Fields
  const [agentForm, setAgentForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    countryCode: 'US',
    callConversationFramework: '',
    whatsAppMessageParameters: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Agents, Tasks, Audit Logs
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [agentRes, taskRes, logRes] = await Promise.all([
        fetch('/api/admin/agents'),
        fetch('/api/portal/tasks'),
        fetch('/api/admin/audit-logs')
      ]);

      const aData = await agentRes.json();
      const tData = await taskRes.json();
      const lData = await logRes.json();

      if (aData.success) setAgents(aData.agents || []);
      if (tData.success) setTasks(tData.tasks || []);
      if (lData.success) setAuditLogs(lData.logs || []);
    } catch (err) {
      console.error('[Agents Page] Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);

  // Compute Metrics per Agent
  const agentMetrics = useMemo(() => {
    return agents.map((agent) => {
      const agentTasks = tasks.filter((t) => t.assignedAgentId === agent.id);
      const total = agentTasks.length;
      const completed = agentTasks.filter((t) => t.status === 'completed').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        agentId: agent.id,
        totalTasks: total,
        completedTasks: completed,
        completionRate: rate,
      };
    });
  }, [agents, tasks]);

  // Overall Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const totalAgents = agents.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Count active sessions based on audit logs (login activities in last 24h)
    const activeOnlineCount = agents.filter(a => a.isActive).length;

    return {
      totalAgents,
      totalTasks,
      overallCompletionRate,
      activeOnlineCount,
    };
  }, [agents, tasks]);

  // Handle Add Agent
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.name || !agentForm.email || !agentForm.password) {
      alert('Name, Email, and Password are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        setIsAddOpen(false);
        setAgentForm({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          countryCode: 'US',
          callConversationFramework: '',
          whatsAppMessageParameters: '',
        });
      } else {
        alert(data.error || 'Failed to create agent');
      }
    } catch (err) {
      console.error('Error creating agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !newPassword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully changed password for ${selectedAgent.name}.`);
        setIsPasswordOpen(false);
        setNewPassword('');
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Agent
  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This will clear all customer assignments for this agent.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/agents?agentId=${agentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      } else {
        alert(data.error || 'Failed to delete agent');
      }
    } catch (err) {
      console.error('Error deleting agent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter audit logs for agents
  const agentAuditLogs = useMemo(() => {
    return auditLogs.filter(
      (log) => log.performedByRole === 'agent' || log.actionType.startsWith('agent_')
    );
  }, [auditLogs]);

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Agent Performance & Monitoring
          </h1>
          <p className="text-slate-400 mt-2">
            Monitor real-time agent workloads, track document/ICP access trails, and manage accounts.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Onboard New Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassPanel className="border border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Agents Registered</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.totalAgents}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="border border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Assigned Tasks</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.totalTasks}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="border border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Workflow Completion Rate</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.overallCompletionRate}%</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="border border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Online / Active</p>
              <p className="text-3xl font-bold text-white">{dashboardStats.activeOnlineCount} active</p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <GlassPanel className="border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-slate-100">Active Agents Directory</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search agents by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredAgents.map((agent) => {
                const metric = agentMetrics.find((m) => m.agentId === agent.id) || { totalTasks: 0, completedTasks: 0, completionRate: 0 };
                return (
                  <div key={agent.id} className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold flex items-center gap-2">
                          {agent.name}
                          <Badge variant="outline" className="text-slate-400 text-[10px] border-slate-800">
                            Agent
                          </Badge>
                        </h4>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" /> {agent.email}
                        </p>
                        {agent.phoneNumber && (
                          <p className="text-slate-500 text-[10px] flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {agent.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 sm:justify-end gap-2">
                          <span>Tasks: <strong className="text-white">{metric.completedTasks}/{metric.totalTasks}</strong></span>
                          <span>|</span>
                          <span>Rate: <strong className="text-teal-400">{metric.completionRate}%</strong></span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-800 text-slate-300 hover:text-white"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-800 text-yellow-500 hover:text-yellow-400"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsPasswordOpen(true);
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-800 text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAgents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <UserCheck className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                  <p>No agents onboarded matching the filter.</p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Audit Trail Log Stream */}
        <div className="lg:col-span-1 space-y-4">
          <GlassPanel className="border border-slate-800 p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-purple-400" />
              Agent Access Trail
            </h2>
            <div className="space-y-4 overflow-y-auto max-h-[50vh] flex-1 pr-2 scrollbar-thin">
              {agentAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-purple-400 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                      {log.performedByName}
                    </span>
                    <span className="text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-200 leading-normal">{log.actionDetails}</p>
                  <div className="flex justify-between text-[10px] text-slate-600 border-t border-slate-900/60 pt-1">
                    <span>Action: {log.actionType}</span>
                    <span>Target: {log.targetType || '-'}</span>
                  </div>
                </div>
              ))}

              {agentAuditLogs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <ShieldCheck className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs">No agent compliance records found.</p>
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Onboard Agent Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Onboard New Agent
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aName">Full Name *</Label>
              <Input
                id="aName"
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                placeholder="e.g. Ashok Agent"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aEmail">Email Address *</Label>
              <Input
                id="aEmail"
                type="email"
                value={agentForm.email}
                onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                placeholder="e.g. ashok@dealflow.ai"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aPass">Password *</Label>
              <Input
                id="aPass"
                type="password"
                value={agentForm.password}
                onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                placeholder="Must be at least 6 characters"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aPhone">Phone Number</Label>
              <Input
                id="aPhone"
                value={agentForm.phoneNumber}
                onChange={(e) => setAgentForm({ ...agentForm, phoneNumber: e.target.value })}
                placeholder="e.g. +1 555-010-0001"
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aFrame">Call Conversation Framework</Label>
              <Input
                id="aFrame"
                value={agentForm.callConversationFramework}
                onChange={(e) => setAgentForm({ ...agentForm, callConversationFramework: e.target.value })}
                placeholder="Key call goals and guidelines"
                className="bg-slate-900 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aParams">WhatsApp Message Template Parameters</Label>
              <Input
                id="aParams"
                value={agentForm.whatsAppMessageParameters}
                onChange={(e) => setAgentForm({ ...agentForm, whatsAppMessageParameters: e.target.value })}
                placeholder="e.g. Tone: consult, Template: hi..."
                className="bg-slate-900 border-slate-800 text-xs"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/80 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {isSubmitting ? 'Onboarding...' : 'Onboard Agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Reset Agent Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-slate-400">
              Resetting password for agent <strong>{selectedAgent?.name}</strong> ({selectedAgent?.email}).
            </p>
            <div className="space-y-2">
              <Label htmlFor="newPass">New Password *</Label>
              <Input
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Must be at least 6 characters"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800/80 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                {isSubmitting ? 'Resetting...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Agent Detail Dialog */}
      {selectedAgent && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="bg-slate-955 border border-slate-800 text-white max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Agent Details: {selectedAgent.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-400 text-xs block">Email Address</span>
                  <span className="text-white font-medium text-xs break-all">{selectedAgent.email}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-400 text-xs block">Phone Number</span>
                  <span className="text-white font-medium text-xs">{selectedAgent.phoneNumber || '-'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-400 text-xs block">Country Code</span>
                  <span className="text-white font-medium text-xs">{selectedAgent.countryCode || 'US'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <span className="text-slate-400 text-xs block">Created On</span>
                  <span className="text-white font-medium text-xs">{new Date(selectedAgent.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-400 text-xs block">Call Conversation Framework</span>
                <p className="text-white text-xs leading-normal whitespace-pre-line bg-slate-950/40 p-2.5 rounded border border-slate-900">
                  {selectedAgent.callConversationFramework || 'No conversation guidelines set.'}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-1">
                <span className="text-slate-400 text-xs block">WhatsApp Message Parameters</span>
                <p className="text-white text-xs leading-normal whitespace-pre-line bg-slate-950/40 p-2.5 rounded border border-slate-900">
                  {selectedAgent.whatsAppMessageParameters || 'No WhatsApp template parameters set.'}
                </p>
              </div>
            </div>
            <DialogFooter className="pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
