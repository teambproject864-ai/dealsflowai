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
  Users,
  ShoppingBag,
  Palette,
  Truck,
  Layers,
  ArrowRight,
  Phone,
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
  demoCustomers,
  demoB2BBulkOrders,
  demoB2CTransactions,
  demoD2CBrandingConfigs,
} from '@/lib/portal-demo-data';
import type {
  Ticket,
  ScheduledReport,
  NotificationPreferences,
  GTMReportMetric,
  ICPEntry,
  B2BBulkOrder,
  B2CTransaction,
  D2CBrandingConfig,
  Customer,
} from '@/lib/portal-types';
import AuthProvider from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'business-toolset', label: 'Operating Model Toolset', icon: Layers },
  { id: 'icp-entries', label: 'ICP Entries', icon: Users },
  { id: 'gtm-analysis', label: 'GTM Analysis', icon: FileText },
  { id: 'tickets', label: 'Support Tickets', icon: TicketIcon },
  { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'feedback', label: 'Feedback', icon: Star },
  { id: 'ai-communications', label: 'AI Interactions', icon: Phone },
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
  const [icpEntries, setIcpEntries] = useState<ICPEntry[]>([]);
  const [isSubmittingIcp, setIsSubmittingIcp] = useState(false);
  const [icpFormData, setIcpFormData] = useState({
    name: '',
    description: '',
    targetIndustries: [''],
    targetCompanySizes: [''],
    targetGeographicRegions: [''],
    decisionMakers: [''],
    painPoints: [''],
    valueProposition: '',
  });
  const [currentAgentAssignment, setCurrentAgentAssignment] = useState<any>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  // Business Model states
  const [businessModel, setBusinessModel] = useState<"b2b" | "b2c" | "d2c" | "custom">("b2b");
  const [b2bOrders, setB2bOrders] = useState<B2BBulkOrder[]>(demoB2BBulkOrders);
  const [b2cTransactions, setB2cTransactions] = useState<B2CTransaction[]>(demoB2CTransactions);
  const [d2cBranding, setD2cBranding] = useState<D2CBrandingConfig>({
    brandName: "My Storefront",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60",
    primaryColor: "#0f766e",
    secondaryColor: "#0369a1",
    customCss: "",
    instagramHandle: "@mystore",
  });
  const [customerRecord, setCustomerRecord] = useState<Customer | null>(null);

  // B2C Checkout cart states
  const [b2cCart, setB2cCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [b2cCoupon, setB2cCoupon] = useState("");
  const [b2cDiscountAmount, setB2cDiscountAmount] = useState(0);
  const [b2cShippingName, setB2cShippingName] = useState("");
  const [b2cShippingAddress, setB2cShippingAddress] = useState("");
  const [b2cSelectedDevice, setB2cSelectedDevice] = useState<"desktop" | "mobile" | "tablet">("desktop");


  // Fetch ICP entries and agent assignment on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ICP entries
        const icpRes = await fetch('/api/customer/icp');
        const icpData = await icpRes.json();
        if (icpData.success) {
          setIcpEntries(icpData.icpEntries);
        }
        
        // Fetch agent assignments
        const assignRes = await fetch('/api/agent-assignments');
        const assignData = await assignRes.json();
        if (assignData.success && assignData.assignments.length > 0) {
          // Get the most recent assignment
          const sorted = [...assignData.assignments].sort(
            (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
          );
          setCurrentAgentAssignment(sorted[0]);
        }

        // Fetch Customer Config
        const configRes = await fetch('/api/customer/config');
        const configData = await configRes.json();
        if (configData.success && configData.customer) {
          setCustomerRecord(configData.customer);
          setBusinessModel(configData.customer.businessModel || "b2b");
          const cid = configData.customer.id;
          if (demoD2CBrandingConfigs[cid]) {
            setD2cBranding(demoD2CBrandingConfigs[cid]);
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    };
    fetchData();
  }, []);
  
  const handleReassignAgent = async () => {
    if (!currentAgentAssignment) return;
    setIsReassigning(true);
    try {
      const res = await fetch('/api/agent-assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: currentAgentAssignment.leadId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentAgentAssignment(data.assignment);
        alert('Agent reassigned successfully!');
      } else {
        alert(data.error || 'Failed to reassign agent');
      }
    } catch (e) {
      console.error('Error reassigning agent:', e);
      alert('Error reassigning agent');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleSubmitIcp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIcp(true);
    try {
      const res = await fetch('/api/customer/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...icpFormData,
          targetIndustries: icpFormData.targetIndustries.filter(s => s.trim()),
          targetCompanySizes: icpFormData.targetCompanySizes.filter(s => s.trim()),
          targetGeographicRegions: icpFormData.targetGeographicRegions.filter(s => s.trim()),
          decisionMakers: icpFormData.decisionMakers.filter(s => s.trim()),
          painPoints: icpFormData.painPoints.filter(s => s.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Add new entry to state
        setIcpEntries([data.icpEntry, ...icpEntries]);
        // Reset form
        setIcpFormData({
          name: '',
          description: '',
          targetIndustries: [''],
          targetCompanySizes: [''],
          targetGeographicRegions: [''],
          decisionMakers: [''],
          painPoints: [''],
          valueProposition: '',
        });
        alert('ICP entry submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit ICP entry');
      }
    } catch (e) {
      console.error('Error submitting ICP entry:', e);
      alert('Error submitting ICP entry');
    } finally {
      setIsSubmittingIcp(false);
    }
  };

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
      recipients: [user?.email || ''],
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
      requesterEmail: user?.email || '',
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
              {/* Business Model Banner */}
              <GlassPanel className="border-slate-700/50 bg-slate-900/50 p-6 rounded-2xl flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border",
                    businessModel === "b2b" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" :
                    businessModel === "b2c" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    businessModel === "d2c" ? "bg-pink-500/10 border-pink-500/30 text-pink-400" :
                    "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  )}>
                    {businessModel === "b2b" ? <Layers className="h-6 w-6" /> :
                     businessModel === "b2c" ? <ShoppingBag className="h-6 w-6" /> :
                     businessModel === "d2c" ? <Palette className="h-6 w-6" /> :
                     <Truck className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {businessModel === "b2b" ? "B2B Enterprise Mode" :
                       businessModel === "b2c" ? "B2C Consumer Retail Mode" :
                       businessModel === "d2c" ? "D2C Direct Brand Mode" :
                       "Custom / Emerging Operating Model"}
                      <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
                        Active Workflow
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400">
                      {businessModel === "b2b" ? "Core deal pipelines adapted for wholesale contracts, bulk orders, and custom terms." :
                       businessModel === "b2c" ? "Retail engine tracking shopping cart metrics, consumer payments, and checkout flows." :
                       businessModel === "d2c" ? "Branded experience managing direct customer interactions, themes, and social channels." :
                       "Flexible deal structure tailored to creators, influencers, and modern business model parameters."}
                    </p>
                  </div>
                </div>
                <ExtrudedButton 
                  onClick={() => setActiveTab('business-toolset')}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-xs py-2 px-4"
                >
                  Configure Model Toolset
                  <ArrowRight className="h-3 w-3 ml-2" />
                </ExtrudedButton>
              </GlassPanel>

              {/* Dynamic KPI Cards based on Business Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessModel === "b2b" && (
                  <>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Total Contract Value</div>
                        <div className="text-4xl font-bold text-indigo-400">
                          ${b2bOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Sum of wholesale bulk orders</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active Pilot Deals</div>
                        <div className="text-4xl font-bold text-teal-400">
                          {b2bOrders.filter(o => o.status === "pending").length}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Orders awaiting approval</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Bulk Discount Savings</div>
                        <div className="text-4xl font-bold text-emerald-400">
                          $2,160
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Saved via tiered quantities</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Avg. Wholesale Size</div>
                        <div className="text-4xl font-bold text-violet-400">
                          ${(b2bOrders.reduce((sum, o) => sum + o.totalAmount, 0) / (b2bOrders.length || 1)).toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Average bulk transaction</div>
                      </CardContent>
                    </GlassPanel>
                  </>
                )}

                {businessModel === "b2c" && (
                  <>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Checkout Sales</div>
                        <div className="text-4xl font-bold text-emerald-400">
                          ${b2cTransactions.filter(t => t.paymentStatus === "paid").reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Simulated consumer revenue</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Conversion Rate</div>
                        <div className="text-4xl font-bold text-teal-400">
                          {((b2cTransactions.filter(t => t.paymentStatus === "paid").length / (b2cTransactions.length || 1)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Paid vs total checkouts</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Cart Abandonment</div>
                        <div className="text-4xl font-bold text-rose-400">
                          {((b2cTransactions.filter(t => t.paymentStatus === "failed").length / (b2cTransactions.length || 1)) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Failed checkout runs</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Simulated Volume</div>
                        <div className="text-4xl font-bold text-cyan-400">
                          {b2cTransactions.length} items
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Total transaction run count</div>
                      </CardContent>
                    </GlassPanel>
                  </>
                )}

                {businessModel === "d2c" && (
                  <>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Avg. Order Value</div>
                        <div className="text-4xl font-bold text-pink-400">
                          $87.20
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Direct storefront size</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Brand NPS</div>
                        <div className="text-4xl font-bold text-teal-400">
                          78 <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Direct loyalty consensus</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Social ROI</div>
                        <div className="text-4xl font-bold text-purple-400">
                          3.4x
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Ad campaign yield multiplier</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active Brand Channels</div>
                        <div className="text-4xl font-bold text-orange-400">
                          {d2cBranding.instagramHandle ? "2 Active" : "1 Active"}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">{d2cBranding.instagramHandle || "Direct web only"}</div>
                      </CardContent>
                    </GlassPanel>
                  </>
                )}

                {businessModel === "custom" && (
                  <>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Platform Credits</div>
                        <div className="text-4xl font-bold text-amber-400">
                          {customerCredits.balance}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Available processing balance</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Open Tickets</div>
                        <div className="text-4xl font-bold text-indigo-400">
                          {tickets.filter(t => t.customerId === customerId && t.status !== 'closed').length}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Active support request tickets</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Active GTM Reports</div>
                        <div className="text-4xl font-bold text-cyan-400">
                          {gtmReports.filter(r => r.customerId === customerId).length}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Market consensus reports</div>
                      </CardContent>
                    </GlassPanel>
                    <GlassPanel className="border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">Scheduled reports</div>
                        <div className="text-4xl font-bold text-violet-400">
                          {scheduledReports.filter(r => r.customerId === customerId).length}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Automated deliveries</div>
                      </CardContent>
                    </GlassPanel>
                  </>
                )}
              </div>
              
              {currentAgentAssignment && (
                <GlassPanel className="border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-100">Your Assigned Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-teal-400">{currentAgentAssignment.agentName}</p>
                        <p className="text-sm text-slate-400">Active since {new Date(currentAgentAssignment.assignedAt).toLocaleDateString()}</p>
                      </div>
                      <ExtrudedButton
                        onClick={handleReassignAgent}
                        disabled={isReassigning}
                        variant="outline"
                      >
                        {isReassigning ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent mr-2" />
                            Reassigning...
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Reassign Agent
                          </>
                        )}
                      </ExtrudedButton>
                    </div>
                  </CardContent>
                </GlassPanel>
              )}

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

          {activeTab === 'business-toolset' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                    Operating Model Toolset
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Access modular applications configured for your business type
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Active Model:</span>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-md font-extrabold uppercase",
                    businessModel === "b2b" ? "bg-indigo-950 border border-indigo-700 text-indigo-400" :
                    businessModel === "b2c" ? "bg-emerald-950 border border-emerald-700 text-emerald-400" :
                    businessModel === "d2c" ? "bg-pink-950 border border-pink-700 text-pink-400" :
                    "bg-amber-950 border border-amber-700 text-amber-400"
                  )}>
                    {businessModel.toUpperCase()}
                  </span>
                </div>
              </div>

              {businessModel === "b2b" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Bulk Order Form */}
                  <GlassPanel className="lg:col-span-1 border-slate-700" tilt={false}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-100">Process Bulk Wholesale Order</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">Submit bulk quantity requirements</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const qty = Number(formData.get("quantity"));
                        const price = Number(formData.get("unitPrice"));
                        let total = qty * price;
                        // Tiered discounts: >100 get 10% off, >500 get 20% off
                        if (qty >= 500) {
                          total = total * 0.8;
                        } else if (qty >= 100) {
                          total = total * 0.9;
                        }
                        const newOrd: B2BBulkOrder = {
                          id: `b2b-ord-${Date.now()}`,
                          productName: formData.get("productName") as string,
                          quantity: qty,
                          unitPrice: price,
                          totalAmount: total,
                          status: "pending",
                          orderDate: new Date().toISOString(),
                          notes: formData.get("notes") as string,
                        };
                        setB2bOrders([newOrd, ...b2bOrders]);
                        alert("Bulk order submitted successfully! Awaiting agent approval.");
                        (e.target as HTMLFormElement).reset();
                      }} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Product Line</Label>
                          <select name="productName" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                            <option value="Enterprise Seat Licenses (Tier 1)">Enterprise Seat Licenses (Tier 1) - $45/ea</option>
                            <option value="API Infrastructure Pack">API Infrastructure Pack - $200/ea</option>
                            <option value="Advanced Security Module">Advanced Security Module - $15/ea</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Quantity</Label>
                            <Input type="number" name="quantity" min="1" defaultValue="150" className="bg-slate-800 border-slate-700 text-slate-200" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Unit Price ($)</Label>
                            <Input type="number" name="unitPrice" min="1" defaultValue="45" className="bg-slate-800 border-slate-700 text-slate-200" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Contract Notes</Label>
                          <textarea name="notes" placeholder="e.g. Q3 extension request..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" rows={3}></textarea>
                        </div>
                        <div className="bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-xl space-y-2 text-xs">
                          <p className="font-semibold text-indigo-300">Volume Discounts Rules:</p>
                          <ul className="list-disc pl-4 text-slate-400 space-y-1">
                            <li>100+ units: 10% wholesale discount</li>
                            <li>500+ units: 20% enterprise discount</li>
                          </ul>
                        </div>
                        <ExtrudedButton type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                          Submit Wholesale Order
                        </ExtrudedButton>
                      </form>
                    </CardContent>
                  </GlassPanel>

                  {/* Bulk Orders List */}
                  <GlassPanel className="lg:col-span-2 border-slate-700" tilt={false}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-bold text-slate-100">B2B Bulk Orders Log</CardTitle>
                      <button 
                        type="button"
                        onClick={() => {
                          const csvContent = "data:text/csv;charset=utf-8,ID,Product,Quantity,Unit Price,Total,Status,Date\n" 
                            + b2bOrders.map(o => `${o.id},${o.productName},${o.quantity},${o.unitPrice},${o.totalAmount},${o.status},${o.orderDate}`).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", "b2b_wholesale_orders.csv");
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Export CSV
                      </button>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="pb-3 pr-2">ID</th>
                            <th className="pb-3">Product</th>
                            <th className="pb-3 text-center">Qty</th>
                            <th className="pb-3 text-right">Total</th>
                            <th className="pb-3 text-center">Status</th>
                            <th className="pb-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {b2bOrders.map(o => (
                            <tr key={o.id} className="text-slate-300">
                              <td className="py-3 font-mono text-xs pr-2">{o.id.substring(0, 12)}</td>
                              <td className="py-3 font-medium">{o.productName}</td>
                              <td className="py-3 text-center font-bold text-slate-200">{o.quantity}</td>
                              <td className="py-3 text-right text-teal-400 font-semibold">${o.totalAmount.toLocaleString()}</td>
                              <td className="py-3 text-center">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                                  o.status === "approved" ? "bg-emerald-950 border-emerald-800 text-emerald-400" :
                                  o.status === "shipped" ? "bg-blue-950 border-blue-800 text-blue-400" :
                                  "bg-amber-950 border-amber-800 text-amber-400"
                                )}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <button 
                                  type="button"
                                  onClick={() => alert(`Invoice generated for ${o.id}.\nSubtotal: $${o.quantity * o.unitPrice}\nDiscount applied: -$${(o.quantity * o.unitPrice) - o.totalAmount}\nTotal due: $${o.totalAmount}`)}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                                >
                                  Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </GlassPanel>
                </div>
              )}

              {businessModel === "b2c" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Checkout Simulator Widget */}
                  <GlassPanel className="lg:col-span-1 border-slate-700" tilt={false}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-slate-100">B2C Retail Checkout Simulator</CardTitle>
                        <select 
                          value={b2cSelectedDevice} 
                          onChange={(e) => setB2cSelectedDevice(e.target.value as any)}
                          className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="desktop">Desktop view</option>
                          <option value="mobile">Mobile view</option>
                          <option value="tablet">Tablet view</option>
                        </select>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Stress-test simulated payment gateway flows</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Product catalog selection */}
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400">Add Item to Cart:</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              const existing = b2cCart.find(i => i.id === "p1");
                              if (existing) {
                                setB2cCart(b2cCart.map(i => i.id === "p1" ? { ...i, quantity: i.quantity + 1 } : i));
                              } else {
                                setB2cCart([...b2cCart, { id: "p1", name: "Premium Mug", price: 19.95, quantity: 1 }]);
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-[10px] p-2 rounded text-slate-200 border border-slate-700 flex flex-col items-center"
                          >
                            <span>Mug</span>
                            <span className="text-teal-400 font-bold">$19.95</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const existing = b2cCart.find(i => i.id === "p2");
                              if (existing) {
                                setB2cCart(b2cCart.map(i => i.id === "p2" ? { ...i, quantity: i.quantity + 1 } : i));
                              } else {
                                setB2cCart([...b2cCart, { id: "p2", name: "Organic Hoodie", price: 59.90, quantity: 1 }]);
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-[10px] p-2 rounded text-slate-200 border border-slate-700 flex flex-col items-center"
                          >
                            <span>Hoodie</span>
                            <span className="text-teal-400 font-bold">$59.90</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const existing = b2cCart.find(i => i.id === "p3");
                              if (existing) {
                                setB2cCart(b2cCart.map(i => i.id === "p3" ? { ...i, quantity: i.quantity + 1 } : i));
                              } else {
                                setB2cCart([...b2cCart, { id: "p3", name: "Travel Tumbler", price: 34.50, quantity: 1 }]);
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-[10px] p-2 rounded text-slate-200 border border-slate-700 flex flex-col items-center"
                          >
                            <span>Tumbler</span>
                            <span className="text-teal-400 font-bold">$34.50</span>
                          </button>
                        </div>
                      </div>

                      {/* Shopping Cart Summary */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                          <span>Simulated Shopping Cart</span>
                          {b2cCart.length > 0 && (
                            <button type="button" onClick={() => setB2cCart([])} className="text-[10px] text-rose-400 hover:underline">Clear</button>
                          )}
                        </div>
                        {b2cCart.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">Cart is empty</div>
                        ) : (
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {b2cCart.map(item => (
                              <div key={item.id} className="flex justify-between text-xs text-slate-300">
                                <span>{item.name} <span className="text-slate-500">x{item.quantity}</span></span>
                                <span className="font-semibold text-slate-200">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {b2cCart.length > 0 && (
                          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Input 
                                type="text" 
                                placeholder="Coupon (e.g. SAVE20)" 
                                value={b2cCoupon}
                                onChange={(e) => setB2cCoupon(e.target.value.toUpperCase())}
                                className="h-8 bg-slate-800 border-slate-700 text-xs py-1"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  if (b2cCoupon === "SAVE20") {
                                    const subtotal = b2cCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
                                    setB2cDiscountAmount(subtotal * 0.2);
                                    alert("Coupon SAVE20 applied successfully! (20% off)");
                                  } else {
                                    alert("Invalid coupon code.");
                                  }
                                }}
                                className="bg-slate-800 border border-slate-700 px-3 py-1 rounded hover:bg-slate-700"
                              >
                                Apply
                              </button>
                            </div>
                            {b2cDiscountAmount > 0 && (
                              <div className="flex justify-between text-emerald-400 font-semibold">
                                <span>Discount</span>
                                <span>-${b2cDiscountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800/50 pt-2">
                              <span>Estimated Total</span>
                              <span>
                                ${(
                                  b2cCart.reduce((sum, i) => sum + i.price * i.quantity, 0) - b2cDiscountAmount
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Customer Checkout Form */}
                      {b2cCart.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Shipping Name</Label>
                            <Input 
                              type="text" 
                              placeholder="e.g. John Smith" 
                              value={b2cShippingName}
                              onChange={(e) => setB2cShippingName(e.target.value)}
                              className="h-8 bg-slate-800 border-slate-700 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-slate-400 text-xs">Address</Label>
                            <Input 
                              type="text" 
                              placeholder="123 Main St, New York" 
                              value={b2cShippingAddress}
                              onChange={(e) => setB2cShippingAddress(e.target.value)}
                              className="h-8 bg-slate-800 border-slate-700 text-xs"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const total = b2cCart.reduce((sum, i) => sum + i.price * i.quantity, 0) - b2cDiscountAmount;
                                const newTx: B2CTransaction = {
                                  id: `b2c-tx-${Date.now()}`,
                                  consumerName: b2cShippingName || "Guest Checkout",
                                  itemCount: b2cCart.reduce((sum, i) => sum + i.quantity, 0),
                                  amount: total,
                                  paymentStatus: "paid",
                                  deviceType: b2cSelectedDevice,
                                  checkoutTimestamp: new Date().toISOString(),
                                };
                                setB2cTransactions([newTx, ...b2cTransactions]);
                                setB2cCart([]);
                                setB2cCoupon("");
                                setB2cDiscountAmount(0);
                                setB2cShippingName("");
                                setB2cShippingAddress("");
                                alert("Simulated checkout transaction completed successfully!");
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs"
                            >
                              Simulate Successful Checkout
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const total = b2cCart.reduce((sum, i) => sum + i.price * i.quantity, 0) - b2cDiscountAmount;
                                const newTx: B2CTransaction = {
                                  id: `b2c-tx-${Date.now()}`,
                                  consumerName: b2cShippingName || "Guest Checkout",
                                  itemCount: b2cCart.reduce((sum, i) => sum + i.quantity, 0),
                                  amount: total,
                                  paymentStatus: "failed",
                                  deviceType: b2cSelectedDevice,
                                  checkoutTimestamp: new Date().toISOString(),
                                };
                                setB2cTransactions([newTx, ...b2cTransactions]);
                                alert("Checkout simulated as failed/abandoned.");
                              }}
                              className="bg-slate-800 border border-slate-700 text-slate-400 font-bold px-3 py-2 rounded-xl text-xs"
                            >
                              Fail/Abandon
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </GlassPanel>

                  {/* Transactions Feed */}
                  <GlassPanel className="lg:col-span-2 border-slate-700" tilt={false}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-100">Simulated Retail Sales Feed</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">Real-time consumer event transaction streams</p>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-3">Transaction ID</th>
                            <th className="pb-3">Buyer Name</th>
                            <th className="pb-3 text-center">Items</th>
                            <th className="pb-3 text-right">Amount</th>
                            <th className="pb-3 text-center">Device</th>
                            <th className="pb-3 text-center">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {b2cTransactions.map(tx => (
                            <tr key={tx.id} className="text-slate-300">
                              <td className="py-3 font-mono text-xs">{tx.id.substring(0, 15)}</td>
                              <td className="py-3 font-medium">{tx.consumerName}</td>
                              <td className="py-3 text-center font-semibold text-slate-200">{tx.itemCount}</td>
                              <td className="py-3 text-right font-semibold text-teal-400">${tx.amount.toFixed(2)}</td>
                              <td className="py-3 text-center text-xs uppercase text-slate-400 font-mono">{tx.deviceType}</td>
                              <td className="py-3 text-center">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                                  tx.paymentStatus === "paid" 
                                    ? "bg-emerald-950 border-emerald-800 text-emerald-400" 
                                    : "bg-rose-950 border-rose-800 text-rose-400"
                                )}>
                                  {tx.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </GlassPanel>
                </div>
              )}

              {businessModel === "d2c" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Branding customizer */}
                  <GlassPanel className="lg:col-span-1 border-slate-700" tilt={false}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-100">Brand Customization Studio</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">Configure white-label client overrides</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const updatedConfig: D2CBrandingConfig = {
                          brandName: formData.get("brandName") as string,
                          logoUrl: formData.get("logoUrl") as string,
                          primaryColor: formData.get("primaryColor") as string,
                          secondaryColor: formData.get("secondaryColor") as string,
                          customCss: formData.get("customCss") as string,
                          instagramHandle: formData.get("instagramHandle") as string,
                        };
                        setD2cBranding(updatedConfig);
                        
                        // Persist to server config
                        try {
                          await fetch('/api/customer/config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              companyName: updatedConfig.brandName,
                              serviceConfigurations: {
                                ...customerRecord?.serviceConfigurations,
                                branding: updatedConfig
                              }
                            })
                          });
                        } catch (err) {
                          console.error("Failed to sync branding with server:", err);
                        }

                        alert("Branding configuration updated successfully!");
                      }} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Brand Name</Label>
                          <Input type="text" name="brandName" defaultValue={d2cBranding.brandName} className="bg-slate-800 border-slate-700 text-slate-200" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Brand Logo URL</Label>
                          <Input type="text" name="logoUrl" defaultValue={d2cBranding.logoUrl} className="bg-slate-800 border-slate-700 text-slate-200 text-xs" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Primary Color</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="color" name="primaryColor" defaultValue={d2cBranding.primaryColor} className="w-10 h-10 p-0 border-0 bg-transparent rounded cursor-pointer" />
                              <span className="font-mono text-xs uppercase text-slate-300">{d2cBranding.primaryColor}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Secondary Color</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="color" name="secondaryColor" defaultValue={d2cBranding.secondaryColor} className="w-10 h-10 p-0 border-0 bg-transparent rounded cursor-pointer" />
                              <span className="font-mono text-xs uppercase text-slate-300">{d2cBranding.secondaryColor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Instagram Handle</Label>
                          <Input type="text" name="instagramHandle" defaultValue={d2cBranding.instagramHandle} className="bg-slate-800 border-slate-700 text-slate-200" placeholder="@my_brand" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Custom CSS Snippets</Label>
                          <textarea name="customCss" defaultValue={d2cBranding.customCss} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono" rows={3}></textarea>
                        </div>
                        <ExtrudedButton type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                          Save Brand Themes
                        </ExtrudedButton>
                      </form>
                    </CardContent>
                  </GlassPanel>

                  {/* Brand Live Preview Card */}
                  <GlassPanel className="lg:col-span-2 border-slate-700" tilt={false}>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-slate-100">Live Custom Brand Preview</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">Real-time storefront checkout and email preview</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Simulated branded checkout card */}
                      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 p-6 space-y-6 relative shadow-2xl">
                        {/* Branded header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            {d2cBranding.logoUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={d2cBranding.logoUrl} alt="Logo" className="h-10 w-10 rounded-full border object-cover border-slate-700" />
                            )}
                            <span className="font-bold text-lg text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {d2cBranding.brandName}
                            </span>
                          </div>
                          {d2cBranding.instagramHandle && (
                            <span className="text-xs text-slate-400 font-semibold">{d2cBranding.instagramHandle}</span>
                          )}
                        </div>

                        {/* Branded hero graphic */}
                        <div 
                          className="rounded-xl py-8 px-6 text-center space-y-2 border border-slate-800"
                          style={{
                            background: `linear-gradient(135deg, ${d2cBranding.primaryColor}20, ${d2cBranding.secondaryColor}10)`
                          }}
                        >
                          <h4 className="text-xl font-extrabold text-white" style={{ color: d2cBranding.primaryColor }}>
                            Checkout Complete!
                          </h4>
                          <p className="text-xs text-slate-300">Thank you for purchasing from our premium store.</p>
                        </div>

                        {/* Branded Action Buttons */}
                        <div className="flex gap-4">
                          <button 
                            type="button"
                            className="flex-1 text-white font-bold py-2.5 rounded-xl text-xs transition-opacity hover:opacity-90"
                            style={{ backgroundColor: d2cBranding.primaryColor }}
                          >
                            Track Shipment
                          </button>
                          <button 
                            type="button"
                            className="flex-1 text-white font-bold py-2.5 rounded-xl text-xs border transition-opacity hover:opacity-90"
                            style={{ 
                              borderColor: d2cBranding.secondaryColor,
                              backgroundColor: `${d2cBranding.secondaryColor}15`
                            }}
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>

                      {/* CSS application indicator */}
                      {d2cBranding.customCss && (
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Applied stylesheet configurations:</p>
                          <pre className="text-[10px] text-slate-300 font-mono">{d2cBranding.customCss}</pre>
                        </div>
                      )}
                    </CardContent>
                  </GlassPanel>
                </div>
              )}

              {businessModel === "custom" && (
                <GlassPanel className="border-slate-700" tilt={false}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-100">Emerging Business Model Config</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Custom and emerging operating models allow you to configure ad-hoc data properties. 
                      You can define customizable JSON parameters below to align with your unique logistics:
                    </p>
                    <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                        <span>JSON Configuration Parameters</span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Flex Mode</span>
                      </div>
                      <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
{`{
  "businessType": "creator-brand",
  "hasLiveSubscription": true,
  "supportedPayouts": ["stripe", "paypal"],
  "commissionStructure": "15% flat per referral"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </GlassPanel>
              )}
            </div>
          )}

          {activeTab === 'icp-entries' && (
            <div className="space-y-8">
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-100">Submit New ICP Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitIcp} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">ICP Name</Label>
                      <Input
                        type="text"
                        value={icpFormData.name}
                        onChange={(e) => setIcpFormData({ ...icpFormData, name: e.target.value })}
                        placeholder="e.g., Enterprise SaaS Buyers"
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Description</Label>
                      <textarea
                        value={icpFormData.description}
                        onChange={(e) => setIcpFormData({ ...icpFormData, description: e.target.value })}
                        placeholder="Describe your ideal customer profile..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Target Industries (comma separated)</Label>
                        <Input
                          type="text"
                          value={icpFormData.targetIndustries.join(',')}
                          onChange={(e) => setIcpFormData({ ...icpFormData, targetIndustries: e.target.value.split(',') })}
                          placeholder="SaaS,FinTech,Healthcare"
                          className="bg-slate-800 border-slate-700 text-slate-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Company Sizes (comma separated)</Label>
                        <Input
                          type="text"
                          value={icpFormData.targetCompanySizes.join(',')}
                          onChange={(e) => setIcpFormData({ ...icpFormData, targetCompanySizes: e.target.value.split(',') })}
                          placeholder="1-10,11-50,51-200"
                          className="bg-slate-800 border-slate-700 text-slate-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Geographic Regions (comma separated)</Label>
                      <Input
                        type="text"
                        value={icpFormData.targetGeographicRegions.join(',')}
                        onChange={(e) => setIcpFormData({ ...icpFormData, targetGeographicRegions: e.target.value.split(',') })}
                        placeholder="North America,Europe"
                        className="bg-slate-800 border-slate-700 text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Decision Makers (comma separated)</Label>
                      <Input
                        type="text"
                        value={icpFormData.decisionMakers.join(',')}
                        onChange={(e) => setIcpFormData({ ...icpFormData, decisionMakers: e.target.value.split(',') })}
                        placeholder="CEO,CTO,VP Sales"
                        className="bg-slate-800 border-slate-700 text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Pain Points (comma separated)</Label>
                      <Input
                        type="text"
                        value={icpFormData.painPoints.join(',')}
                        onChange={(e) => setIcpFormData({ ...icpFormData, painPoints: e.target.value.split(',') })}
                        placeholder="High cost,Slow onboarding,Limited features"
                        className="bg-slate-800 border-slate-700 text-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Value Proposition</Label>
                      <textarea
                        value={icpFormData.valueProposition}
                        onChange={(e) => setIcpFormData({ ...icpFormData, valueProposition: e.target.value })}
                        placeholder="What value do you provide to this ICP?"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows={3}
                      />
                    </div>

                    <ExtrudedButton
                      type="submit"
                      disabled={isSubmittingIcp}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600"
                    >
                      {isSubmittingIcp ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Submit ICP Entry
                        </>
                      )}
                    </ExtrudedButton>
                  </form>
                </CardContent>
              </GlassPanel>

              {/* Existing ICP Entries List */}
              {icpEntries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-100">Your ICP Entries</h3>
                  {icpEntries.map((entry) => (
                    <GlassPanel key={entry.id} tilt={false} className="border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-slate-100">{entry.name}</CardTitle>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                              entry.status === 'active' ? 'bg-green-500/15 text-green-400'
                                : entry.status === 'draft' ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-slate-500/15 text-slate-400'
                            )}
                          >
                            {entry.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-300">{entry.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {entry.targetIndustries.length > 0 && (
                            <div>
                              <p className="text-slate-400 uppercase tracking-wider text-xs">Industries</p>
                              <p className="text-slate-200">{entry.targetIndustries.join(', ')}</p>
                            </div>
                          )}
                          {entry.targetCompanySizes.length > 0 && (
                            <div>
                              <p className="text-slate-400 uppercase tracking-wider text-xs">Company Sizes</p>
                              <p className="text-slate-200">{entry.targetCompanySizes.join(', ')}</p>
                            </div>
                          )}
                        </div>
                        {entry.assignedAgentName && (
                          <div className="pt-2 border-t border-slate-700">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">
                              Assigned Agent: <span className="text-teal-400 font-semibold">{entry.assignedAgentName}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </GlassPanel>
                  ))}
                </div>
              )}
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

          {activeTab === 'ai-communications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">AI Interactions</h2>
                  <p className="text-slate-400 text-sm mt-1">Voice calls and WhatsApp messages handled by your dedicated AI agent</p>
                </div>
              </div>

              {/* AI Voice Call History */}
              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-400" />
                    AI Voice Call History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Demo call records */}
                    {[
                      { id: 'cvc-001', agentName: 'Ashok', date: '2026-06-25T10:30:00Z', duration: '4m 32s', status: 'completed', summary: 'Discussed pipeline optimization and scheduled a follow-up demo.' },
                      { id: 'cvc-002', agentName: 'Vijay', date: '2026-06-24T14:00:00Z', duration: '2m 15s', status: 'completed', summary: 'Introduced DealFlow AI capabilities and shared GTM analysis report.' },
                    ].map(call => (
                      <div key={call.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-100 text-sm">{call.agentName} — AI Voice Call</p>
                            <p className="text-slate-400 text-xs mt-0.5">{new Date(call.date).toLocaleString()} · {call.duration}</p>
                            <p className="text-slate-300 text-sm mt-2">{call.summary}</p>
                          </div>
                          <span className={`ml-4 shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                            call.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                          }`}>{call.status}</span>
                        </div>
                      </div>
                    ))}
                    <p className="text-center text-slate-600 text-xs pt-2">Real-time call logs will appear here once AI calls are initiated by your agent.</p>
                  </div>
                </CardContent>
              </GlassPanel>

              {/* WhatsApp Message History */}
              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    WhatsApp Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: 'cwm-001', agentName: 'Ashok', date: '2026-06-25T09:00:00Z', content: 'Hi, this is Ashok from DealFlow AI. I noticed your recent pipeline analysis. Would you be open to a quick call this week?', status: 'read', direction: 'outbound' },
                      { id: 'cwm-002', agentName: 'Harsha', date: '2026-06-23T11:00:00Z', content: 'Your GTM analysis report is ready! Click here to view your customized growth strategy.', status: 'delivered', direction: 'outbound' },
                    ].map(msg => (
                      <div key={msg.id} className={`p-4 rounded-xl border ${
                        msg.direction === 'outbound' ? 'bg-emerald-900/10 border-emerald-700/20 ml-8' : 'bg-slate-800/50 border-slate-700/30 mr-8'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-400">{msg.agentName} · {new Date(msg.date).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            msg.status === 'read' ? 'bg-teal-500/15 text-teal-400' :
                            msg.status === 'delivered' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-slate-500/15 text-slate-400'
                          }`}>{msg.status}</span>
                        </div>
                        <p className="text-slate-200 text-sm">{msg.content}</p>
                      </div>
                    ))}
                    <p className="text-center text-slate-600 text-xs pt-2">Live WhatsApp message logs will appear here as your AI agent engages with you.</p>
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
