'use client';

import React, { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassPanel, ExtrudedButton } from '@/components/immersive';
import {
  CheckCircle2,
  MessageSquare,
  Star,
  FileText,
  Upload,
  Download,
  Plus,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Ticket as TicketIcon,
  CreditCard,
  BarChart2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { gtmPortalConfig } from '@/lib/config';
import {
  demoChatMessages,
  demoUsers,
  demoCustomerCredits,
  demoGTMReports,
  demoCustomerGTMData,
  demoScheduledReports,
  demoTickets,
  demoNotificationPreferences,
} from '@/lib/portal-demo-data';
import type {
  Ticket,
  ScheduledReport,
  NotificationPreferences,
  GTMReportMetric,
} from '@/lib/portal-types';
import AuthProvider from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'gtm-analysis', label: 'GTM Analysis', icon: FileText },
  { id: 'tickets', label: 'Support Tickets', icon: TicketIcon },
  { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'feedback', label: 'Feedback', icon: Star },
] as const;

export default function CustomerPortal() {
  return (
    <AuthProvider allowedRoles={['customer']}>
      <CustomerPortalContent />
    </AuthProvider>
  );
}

function CustomerPortalContent() {
  const { user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('dashboard');
  const [customerGTMData] = useState(demoCustomerGTMData);
  const [scheduledReports, setScheduledReports] = useState(demoScheduledReports);
  const [tickets, setTickets] = useState(demoTickets);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    demoNotificationPreferences['customer-demo']
  );
  const [gtmReports] = useState(demoGTMReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [gtmRegion, setGtmRegion] = useState('All');
  const [gtmSegment, setGtmSegment] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [documents, setDocuments] = useState<Array<{id: string, name: string, type: string, size: string, date: string}>>([
    { id: '1', name: 'Q4 2024 GTM Strategy.pdf', type: 'pdf', size: '2.4 MB', date: '2024-12-01' },
    { id: '2', name: 'Competitor Analysis.xlsx', type: 'xlsx', size: '1.1 MB', date: '2024-11-28' },
  ]);
  const [chatMessages, setChatMessages] = useState([...demoChatMessages.filter(m => m.sessionId === 'session-1')]);
  const [newMessage, setNewMessage] = useState('');

  const customerId = user?.id || 'customer-demo';
  const customerCredits = demoCustomerCredits.find((c) => c.customerId === customerId) || demoCustomerCredits[0];
  const customerName = user?.name || 'Customer';

  useEffect(() => {
    if (customerId && demoNotificationPreferences[customerId]) {
      setNotificationPrefs(demoNotificationPreferences[customerId]);
    }
  }, [customerId]);

  const handleDownloadReport = (report: GTMReportMetric, format: 'pdf' | 'xlsx' | 'csv') => {
    alert(`Downloading ${report.reportName} in ${format.toUpperCase()} format...`);
  };

  const handleScheduleReport = (frequency: 'daily' | 'weekly') => {
    const newSchedule: ScheduledReport = {
      id: `scheduled-${Date.now()}`,
      customerId,
      reportFrequency: frequency,
      recipients: [customer?.email || ''],
      fileFormats: ['pdf'],
      enabled: true,
      nextSendDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setScheduledReports([...scheduledReports, newSchedule]);
    alert(`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} report scheduled!`);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      customerId,
      requesterName: customerName,
      requesterEmail: customer?.email || '',
      category: formData.get('category') as any,
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as any,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets([newTicket, ...tickets]);
    alert('Ticket submitted successfully!');
    (e.target as HTMLFormElement).reset();
  };

  const handleUpdateNotificationPrefs = (key: keyof NotificationPreferences, value: any) => {
    setNotificationPrefs({ ...notificationPrefs, [key]: value });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sessionId: 'session-1',
      senderId: customerId,
      senderName: customerName,
      senderRole: 'customer' as const,
      content: newMessage,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setChatMessages([...chatMessages, newMsg]);
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-400 border-t-transparent mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                Welcome back, {customerName}!
              </h1>
              <p className="text-slate-400 text-sm">Manage your GTM strategy, support tickets, and account settings</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-teal-400 hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-20 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-slate-200">Notifications</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-200">New GTM report available</p>
              <p className="text-xs text-slate-400">2 minutes ago</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-sm text-slate-200">Your ticket #123 has been updated</p>
              <p className="text-xs text-slate-400">1 hour ago</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassPanel className="border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Credit Balance</div>
                    <div className="text-4xl font-bold text-teal-400">{customerCredits.balance}</div>
                  </CardContent>
                </GlassPanel>
                <GlassPanel className="border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Open Tickets</div>
                    <div className="text-4xl font-bold text-amber-400">
                      {tickets.filter(t => t.customerId === customerId && t.status !== 'closed').length}
                    </div>
                  </CardContent>
                </GlassPanel>
                <GlassPanel className="border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active Reports</div>
                    <div className="text-4xl font-bold text-blue-400">
                      {gtmReports.filter(r => r.customerId === customerId).length}
                    </div>
                  </CardContent>
                </GlassPanel>
                <GlassPanel className="border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Scheduled Reports</div>
                    <div className="text-4xl font-bold text-purple-400">
                      {scheduledReports.filter(r => r.customerId === customerId).length}
                    </div>
                  </CardContent>
                </GlassPanel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassPanel className="border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-100">Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gtmReports
                      .filter(r => r.customerId === customerId)
                      .slice(0, 3)
                      .map(report => (
                        <div key={report.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                          <div>
                            <div className="font-semibold text-slate-200">{report.reportName}</div>
                            <div className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex gap-2">
                    <ExtrudedButton
                      size="sm"
                      onClick={() => handleDownloadReport(report, 'pdf')}
                    >
                      <Download className="h-4 w-4 mr-1" /> PDF
                    </ExtrudedButton>
                  </div>
                        </div>
                      ))}
                  </CardContent>
                </GlassPanel>

                <GlassPanel className="border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-100">Recent Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tickets
                      .filter(t => t.customerId === customerId)
                      .slice(0, 3)
                      .map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                          <div>
                            <div className="font-semibold text-slate-200">{ticket.subject}</div>
                            <div className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleString()}</div>
                          </div>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                              ticket.status === 'resolved'
                                ? 'bg-green-500/15 text-green-400'
                                : ticket.status === 'in-progress'
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-slate-500/15 text-slate-400'
                            )}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </GlassPanel>
              </div>
            </div>
          )}

          {activeTab === 'gtm-analysis' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">GTM Analysis Reports</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Region</Label>
                    <select
                      value={gtmRegion}
                      onChange={(e) => setGtmRegion(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="All">All Regions</option>
                      <option value="North America">North America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Segment</Label>
                    <select
                      value={gtmSegment}
                      onChange={(e) => setGtmSegment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="All">All Segments</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Mid-Market">Mid-Market</option>
                      <option value="SMB">SMB</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <ExtrudedButton
                      onClick={() => handleScheduleReport('daily')}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600"
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Schedule Daily
                    </ExtrudedButton>
                    <ExtrudedButton
                      onClick={() => handleScheduleReport('weekly')}
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Schedule Weekly
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>

              {gtmPortalConfig.showAllCustomerGTMContent && (
                <>
                  <GlassPanel tilt={false} className="border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-100">Your GTM Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customerGTMData
                        .filter(d => d.customerId === customerId)
                        .map(data => (
                          <div key={data.id} className="space-y-3">
                            {Object.entries(data.data).map(([key, value]) => (
                              <div key={key} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                <p className="text-sm text-slate-400 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-slate-200 font-medium">
                                  {Array.isArray(value) ? value.join(', ') : value}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                    </CardContent>
                  </GlassPanel>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {gtmReports
                      .filter(r => r.customerId === customerId)
                      .filter(r => gtmRegion === 'All' || r.region === gtmRegion)
                      .filter(r => gtmSegment === 'All' || r.segment === gtmSegment)
                      .map(report => (
                        <GlassPanel
                          key={report.id}
                          tilt={true}
                          className="cursor-pointer border-slate-700 hover:border-teal-500/50 transition-all duration-200"
                          onClick={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl text-slate-100 font-bold">{report.reportName}</CardTitle>
                              <span
                                className={cn(
                                  'px-3 py-1 rounded-full text-xs font-semibold',
                                  report.reportFrequency === 'daily'
                                    ? 'bg-blue-500/15 text-blue-400'
                                    : 'bg-purple-500/15 text-purple-400'
                                )}
                              >
                                {report.reportFrequency}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Lead Conversion</p>
                                <p className="text-2xl font-bold text-green-400">{report.leadConversionRate}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Market Penetration</p>
                                <p className="text-2xl font-bold text-blue-400">{report.marketPenetration}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Pipeline Value</p>
                                <p className="text-2xl font-bold text-purple-400">${report.pipelineValue.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Campaign ROI</p>
                                <p className="text-2xl font-bold text-amber-400">{report.campaignEffectiveness}%</p>
                              </div>
                            </div>

                            {selectedReportId === report.id && (
                              <div className="border-t border-slate-700 pt-4 space-y-4">
                                {report.actionableSuggestions.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4 text-teal-400" />
                                      Actionable Suggestions
                                    </h4>
                                    <div className="space-y-3">
                                      {report.actionableSuggestions.map(suggestion => (
                                        <div key={suggestion.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                          <div className="flex items-start justify-between mb-2">
                                            <span className="font-semibold text-slate-200">{suggestion.title}</span>
                                            <span
                                              className={cn(
                                                'px-2 py-1 rounded-full text-xs font-semibold',
                                                suggestion.priority === 'high'
                                                  ? 'bg-red-500/15 text-red-400'
                                                  : suggestion.priority === 'medium'
                                                  ? 'bg-yellow-500/15 text-yellow-400'
                                                  : 'bg-green-500/15 text-green-400'
                                              )}
                                            >
                                              {suggestion.priority}
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
                                          <p className="text-xs text-teal-400">Estimated impact: {suggestion.estimatedImpact}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <ExtrudedButton
                                    className="bg-gradient-to-r from-teal-600 to-cyan-600"
                                    onClick={() => handleDownloadReport(report, 'pdf')}
                                  >
                                    <Download className="h-4 w-4 mr-2" /> Download PDF
                                  </ExtrudedButton>
                                  <ExtrudedButton variant="outline" onClick={() => handleDownloadReport(report, 'xlsx')}>
                                    <Download className="h-4 w-4 mr-2" /> Download Excel
                                  </ExtrudedButton>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </GlassPanel>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Submit Support Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Category</Label>
                      <select
                        name="category"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="technical-support">Technical Support</option>
                        <option value="feature-request">Feature Request</option>
                        <option value="billing">Billing Issue</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Subject</Label>
                      <Input
                        type="text"
                        name="subject"
                        placeholder="Brief description of your issue"
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Priority</Label>
                      <select
                        name="priority"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Description</Label>
                      <textarea
                        name="description"
                        placeholder="Please provide detailed information..."
                        rows={4}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <ExtrudedButton type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Ticket
                    </ExtrudedButton>
                  </form>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100">Your Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tickets
                    .filter(t => t.customerId === customerId)
                    .map(ticket => (
                      <div key={ticket.id} className="p-6 bg-slate-800/40 rounded-xl border border-slate-700/50">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-200">{ticket.subject}</h4>
                            <p className="text-sm text-slate-400">Submitted {new Date(ticket.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                                ticket.priority === 'critical'
                                  ? 'bg-red-500/15 text-red-400'
                                  : ticket.priority === 'high'
                                  ? 'bg-orange-500/15 text-orange-400'
                                  : ticket.priority === 'medium'
                                  ? 'bg-yellow-500/15 text-yellow-400'
                                  : 'bg-green-500/15 text-green-400'
                              )}
                            >
                              {ticket.priority}
                            </span>
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                                ticket.status === 'resolved'
                                  ? 'bg-green-500/15 text-green-400'
                                  : ticket.status === 'in-progress'
                                  ? 'bg-yellow-500/15 text-yellow-400'
                                  : 'bg-slate-500/15 text-slate-400'
                              )}
                            >
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-300 mb-4">{ticket.description}</p>
                        {ticket.assignedAgentName && (
                          <p className="text-sm text-slate-400">
                            Assigned to: <span className="text-slate-200 font-semibold">{ticket.assignedAgentName}</span>
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              <GlassPanel tilt={true} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Your Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
                      <p className="text-5xl font-bold text-teal-400">{customerCredits.balance}</p>
                    </div>
                    <div className="text-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Purchased</p>
                      <p className="text-5xl font-bold text-green-400">{customerCredits.totalPurchased}</p>
                    </div>
                    <div className="text-center p-6 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Used</p>
                      <p className="text-5xl font-bold text-red-400">{customerCredits.totalSpent}</p>
                    </div>
                  </div>
                  <ExtrudedButton
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => alert('Redirecting to payment page...')}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Credits
                  </ExtrudedButton>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customerCredits.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{tx.description}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <div
                        className={cn(
                          'text-xl font-bold',
                          tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div>
                      <Label className="text-slate-200 font-medium">Email Notifications</Label>
                      <p className="text-sm text-slate-400">Receive reports and updates via email</p>
                    </div>
                    <button
                      onClick={() => handleUpdateNotificationPrefs('emailNotifications', !notificationPrefs.emailNotifications)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        notificationPrefs.emailNotifications ? 'bg-teal-600' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          notificationPrefs.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div>
                      <Label className="text-slate-200 font-medium">In-App Notifications</Label>
                      <p className="text-sm text-slate-400">Receive notifications within the portal</p>
                    </div>
                    <button
                      onClick={() => handleUpdateNotificationPrefs('inAppNotifications', !notificationPrefs.inAppNotifications)}
                      className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                        notificationPrefs.inAppNotifications ? 'bg-teal-600' : 'bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          notificationPrefs.inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-slate-300">Preferred Report Formats</Label>
                      <select
                        multiple
                        value={notificationPrefs.preferredReportFormats}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value as any);
                          handleUpdateNotificationPrefs('preferredReportFormats', selected);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200"
                        size={3}
                      >
                        <option value="pdf">PDF</option>
                        <option value="xlsx">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Daily Report Time</Label>
                        <Input
                          type="time"
                          value={notificationPrefs.dailyReportTime}
                          onChange={(e) => handleUpdateNotificationPrefs('dailyReportTime', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Weekly Report Day</Label>
                        <select
                          value={notificationPrefs.weeklyReportDay}
                          onChange={(e) => handleUpdateNotificationPrefs('weeklyReportDay', e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200"
                        >
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                          <option value="saturday">Saturday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-100">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-teal-400" />
                      <div>
                        <h4 className="font-semibold text-slate-200">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <ExtrudedButton variant="outline">Enable</ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            </div>
          )}



          {activeTab === 'chat' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Chat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex flex-col max-w-[80%]',
                          message.senderRole === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'px-4 py-3 rounded-2xl',
                            message.senderRole === 'customer'
                              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          )}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-slate-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    />
                    <ExtrudedButton onClick={handleSendMessage} className="bg-gradient-to-r from-teal-600 to-cyan-600">
                      <MessageSquare className="h-4 w-4" />
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-slate-100">Your Documents</CardTitle>
                  <ExtrudedButton className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Upload className="h-4 w-4 mr-2" /> Upload Documents
                  </ExtrudedButton>
                </CardHeader>
                <CardContent className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-700/50 rounded-lg">
                              <FileText className="h-5 w-5 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">{doc.name}</p>
                              <p className="text-xs text-slate-400">{doc.size} • {doc.date}</p>
                            </div>
                          </div>
                          <ExtrudedButton variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </ExtrudedButton>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Share Your Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label className="text-slate-300">How would you rate your experience?</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="p-2">
                          <Star className="h-8 w-8 text-slate-500 hover:text-amber-400 hover:fill-amber-400 cursor-pointer transition-colors" />
                        </button>
                      ))}
                    </div>
                    <Label className="text-slate-300">Additional Comments</Label>
                    <textarea
                      placeholder="Tell us what you think..."
                      rows={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <ExtrudedButton className="bg-gradient-to-r from-teal-600 to-cyan-600">
                      <Check className="h-4 w-4 mr-2" /> Submit Feedback
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
