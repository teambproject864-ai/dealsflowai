'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassPanel } from '@/components/immersive';
import {
  Users,
  Search,
  BarChart2,
  Filter,
  Plus,
  Edit,
  Trash2,
  Target,
  Briefcase,
  Layers,
  Map,
  HelpCircle,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../UIComponents';
import { EnhancedICPEntry } from '@/lib/portal-types';

const demoICPEntries: EnhancedICPEntry[] = [
  {
    id: 'icp-1',
    customerId: 'customer-demo',
    customerName: 'Demo Corp',
    name: 'Enterprise SaaS Buyer',
    description: 'VP of Sales at mid-market SaaS companies with ARR of $10M-50M',
    targetIndustries: ['SaaS', 'Fintech', 'Healthcare'],
    targetCompanySizes: ['Mid-Market', 'Enterprise'],
    targetGeographicRegions: ['North America', 'Europe'],
    decisionMakers: ['VP Sales', 'CRO', 'CEO'],
    painPoints: ['Lead conversion', 'Pipeline velocity', 'Forecasting accuracy'],
    valueProposition: 'Increase pipeline by 40% in 90 days',
    assignedAgentId: 'agent-praneeth',
    assignedAgentName: 'Praneeth',
    status: 'active',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    matchingCustomers: ['customer-demo'],
    conversionRate: 42.5,
    averageDealSize: 25000,
  },
  {
    id: 'icp-2',
    customerId: 'customer-anil',
    customerName: 'Cralgo',
    name: 'Mid-Market B2B Services',
    description: 'B2B services companies with 50-200 employees and digital transformation needs',
    targetIndustries: ['Professional Services', 'Technology', 'Consulting'],
    targetCompanySizes: ['SMB', 'Mid-Market'],
    targetGeographicRegions: ['Asia Pacific'],
    decisionMakers: ['Founder/CEO', 'Operations Director'],
    painPoints: ['Client acquisition', 'Operational efficiency', 'Lead quality'],
    valueProposition: 'Reduce lead acquisition cost by 25%',
    assignedAgentId: 'agent-ashok',
    assignedAgentName: 'Ashok',
    status: 'active',
    createdAt: '2026-06-15T00:00:00Z',
    updatedAt: '2026-06-15T00:00:00Z',
    matchingCustomers: ['customer-anil'],
    conversionRate: 35.0,
    averageDealSize: 15000,
  },
];

export default function ICPManagement() {
  const [icpEntries, setIcpEntries] = useState<EnhancedICPEntry[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedICP, setSelectedICP] = useState<EnhancedICPEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Fetch ICPs, Customers, Agents
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [icpRes, custRes, agentRes] = await Promise.all([
        fetch('/api/portal/icps'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/agents')
      ]);

      const icpData = await icpRes.json();
      const custData = await custRes.json();
      const agentData = await agentRes.json();

      if (icpData.success && icpData.icps?.length > 0) {
        setIcpEntries(icpData.icps);
      } else {
        setIcpEntries(demoICPEntries);
      }

      if (custData.success) {
        setCustomers(custData.customers || []);
      }
      if (agentData.success) {
        setAgents(agentData.agents || []);
      }
    } catch (err) {
      console.error('[ICP Management] Fetch error:', err);
      setIcpEntries(demoICPEntries);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter ICP Entries
  const filteredEntries = useMemo(() => {
    return icpEntries.filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || entry.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [icpEntries, searchQuery, filterStatus]);

  // Compute dynamic matching customers count
  const getMatchingCustomersCount = (icpName: string) => {
    return customers.filter(c => c.icpCategory === icpName || c.icpCategory?.name === icpName).length;
  };

  const handleSaveICP = async (icp: EnhancedICPEntry) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/portal/icps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(icp),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to save ICP profile');
        setIsLoading(false);
        return;
      }
      await fetchAllData();
      setIsEditDialogOpen(false);
      setIsNewDialogOpen(false);
    } catch (err) {
      console.error('Error saving ICP:', err);
      alert('Error saving ICP profile');
      setIsLoading(false);
    }
  };

  const handleDeleteICP = async (icpId: string) => {
    if (!confirm('Are you sure you want to delete this Ideal Customer Profile?')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/portal/icps?icpId=${icpId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to delete ICP profile');
        setIsLoading(false);
        return;
      }
      await fetchAllData();
    } catch (err) {
      console.error('Error deleting ICP:', err);
      alert('Error deleting ICP profile');
      setIsLoading(false);
    }
  };

  if (isLoading && icpEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            ICP Management
          </h1>
          <p className="text-slate-400 mt-2">Track and manage Ideal Customer Profiles (ICPs) linked to accounts</p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          onClick={() => setIsNewDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New ICP
        </Button>
      </div>

      {/* Filters */}
      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search ICP profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 rounded-xl"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassPanel>

      {/* ICP List */}
      <div className="grid gap-4">
        {filteredEntries.map((icpEntry) => (
          <GlassPanel key={icpEntry.id} className="border border-slate-800 hover:border-slate-750 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{icpEntry.name}</h3>
                    <Badge variant="outline" className={
                      icpEntry.status === 'active'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/10'
                        : icpEntry.status === 'draft'
                        ? 'text-yellow-400 border-yellow-500/30'
                        : 'text-slate-400 border-slate-500/30'
                    }>
                      {icpEntry.status}
                    </Badge>
                    {icpEntry.assignedAgentName && (
                      <Badge variant="secondary" className="text-purple-300 bg-purple-950/20 border-purple-800/30">
                        Agent Lead: {icpEntry.assignedAgentName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{icpEntry.description}</p>
                  
                  {/* Values & Value Prop */}
                  <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 text-sm text-slate-300">
                    <span className="font-semibold text-teal-400 block mb-1">Value Proposition:</span>
                    {icpEntry.valueProposition}
                  </div>

                  {/* Chips for parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1 font-semibold">Target Industries:</span>
                      <div className="flex flex-wrap gap-1">
                        {icpEntry.targetIndustries?.map((ind, i) => <Badge key={i} variant="outline" className="text-slate-300 border-slate-800">{ind}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 font-semibold">Decision Makers:</span>
                      <div className="flex flex-wrap gap-1">
                        {icpEntry.decisionMakers?.map((dm, i) => <Badge key={i} variant="outline" className="text-blue-300 border-blue-950">{dm}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 font-semibold">Pain Points:</span>
                      <div className="flex flex-wrap gap-1">
                        {icpEntry.painPoints?.map((pp, i) => <Badge key={i} variant="outline" className="text-red-300 border-red-950">{pp}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1 font-semibold">Company Sizes:</span>
                      <div className="flex flex-wrap gap-1">
                        {icpEntry.targetCompanySizes?.map((sz, i) => <Badge key={i} variant="outline" className="text-cyan-300 border-cyan-950">{sz}</Badge>)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Matching Customers</p>
                        <p className="text-white text-sm font-semibold">{getMatchingCustomersCount(icpEntry.name)} accounts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Conversion Rate</p>
                        <p className="text-cyan-400 text-sm font-semibold">{icpEntry.conversionRate || 0}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Avg Deal Size</p>
                        <p className="text-emerald-400 text-sm font-semibold">${(icpEntry.averageDealSize || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-teal-400 hover:bg-slate-800"
                    onClick={() => {
                      setSelectedICP(icpEntry);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-slate-850"
                    onClick={() => handleDeleteICP(icpEntry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No ICP profiles found matching the current filters</p>
          </div>
        )}
      </div>

      <ICPEditDialog
        icp={selectedICP}
        isOpen={isEditDialogOpen || isNewDialogOpen}
        isNew={isNewDialogOpen}
        agents={agents}
        onClose={() => {
          setIsEditDialogOpen(false);
          setIsNewDialogOpen(false);
        }}
        onSave={handleSaveICP}
      />
    </div>
  );
}

function ICPEditDialog({
  icp,
  isOpen,
  isNew,
  agents,
  onClose,
  onSave
}: {
  icp: EnhancedICPEntry | null;
  isOpen: boolean;
  isNew: boolean;
  agents: any[];
  onClose: () => void;
  onSave: (icp: EnhancedICPEntry) => void;
}) {
  const [formData, setFormData] = useState<EnhancedICPEntry>({
    id: '',
    customerId: '',
    customerName: '',
    name: '',
    description: '',
    targetIndustries: [],
    targetCompanySizes: [],
    targetGeographicRegions: [],
    decisionMakers: [],
    painPoints: [],
    valueProposition: '',
    status: 'draft',
    matchingCustomers: [],
    conversionRate: 0,
    averageDealSize: 0,
    createdAt: '',
    updatedAt: '',
  });

  const [industryInput, setIndustryInput] = useState('');
  const [makerInput, setMakerInput] = useState('');
  const [painInput, setPainInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (!isNew && icp) {
        setFormData({ ...icp });
      } else {
        setFormData({
          id: `icp-${Date.now()}`,
          customerId: '',
          customerName: '',
          name: '',
          description: '',
          targetIndustries: [],
          targetCompanySizes: [],
          targetGeographicRegions: [],
          decisionMakers: [],
          painPoints: [],
          valueProposition: '',
          status: 'draft',
          matchingCustomers: [],
          conversionRate: 0,
          averageDealSize: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIndustryInput('');
      setMakerInput('');
      setPainInput('');
    }
  }, [icp, isOpen, isNew]);

  const handleAgentChange = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    setFormData(prev => ({
      ...prev,
      assignedAgentId: agentId,
      assignedAgentName: agent ? agent.name : ''
    }));
  };

  const handleAddIndustry = () => {
    if (industryInput.trim() && !formData.targetIndustries.includes(industryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetIndustries: [...prev.targetIndustries, industryInput.trim()]
      }));
      setIndustryInput('');
    }
  };

  const handleRemoveIndustry = (ind: string) => {
    setFormData(prev => ({
      ...prev,
      targetIndustries: prev.targetIndustries.filter(i => i !== ind)
    }));
  };

  const handleAddMaker = () => {
    if (makerInput.trim() && !formData.decisionMakers.includes(makerInput.trim())) {
      setFormData(prev => ({
        ...prev,
        decisionMakers: [...prev.decisionMakers, makerInput.trim()]
      }));
      setMakerInput('');
    }
  };

  const handleRemoveMaker = (dm: string) => {
    setFormData(prev => ({
      ...prev,
      decisionMakers: prev.decisionMakers.filter(d => d !== dm)
    }));
  };

  const handleAddPain = () => {
    if (painInput.trim() && !formData.painPoints.includes(painInput.trim())) {
      setFormData(prev => ({
        ...prev,
        painPoints: [...prev.painPoints, painInput.trim()]
      }));
      setPainInput('');
    }
  };

  const handleRemovePain = (pp: string) => {
    setFormData(prev => ({
      ...prev,
      painPoints: prev.painPoints.filter(p => p !== pp)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {isNew ? 'Create Ideal Customer Profile' : 'Edit ICP Profile'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icpName">ICP Category Name *</Label>
                <Input
                  id="icpName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Enterprise SaaS Buyer"
                  className="bg-slate-900 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icpStatus">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icpDesc">Description *</Label>
              <Input
                id="icpDesc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Brief summary of who fits in this profile"
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icpValProp">Value Proposition</Label>
              <Input
                id="icpValProp"
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                placeholder="What core value do we propose to this buyer?"
                className="bg-slate-900 border-slate-800"
              />
            </div>

            {/* Target Industries Tags */}
            <div className="space-y-2">
              <Label>Target Industries</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  placeholder="e.g. SaaS, Fintech"
                  className="bg-slate-900 border-slate-800 flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddIndustry} className="bg-slate-800 hover:bg-slate-700">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.targetIndustries.map((ind) => (
                  <Badge key={ind} className="bg-slate-800 text-slate-200 border-slate-700 flex items-center gap-1">
                    {ind}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveIndustry(ind)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Decision Makers Tags */}
            <div className="space-y-2">
              <Label>Decision Makers</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={makerInput}
                  onChange={(e) => setMakerInput(e.target.value)}
                  placeholder="e.g. VP of Sales, CRO"
                  className="bg-slate-900 border-slate-800 flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddMaker} className="bg-slate-800 hover:bg-slate-700">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.decisionMakers.map((dm) => (
                  <Badge key={dm} className="bg-blue-950/40 text-blue-300 border border-blue-800/40 flex items-center gap-1">
                    {dm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveMaker(dm)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pain Points Tags */}
            <div className="space-y-2">
              <Label>Pain Points</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={painInput}
                  onChange={(e) => setPainInput(e.target.value)}
                  placeholder="e.g. Lead quality, forecasting"
                  className="bg-slate-900 border-slate-800 flex-1"
                />
                <Button type="button" size="sm" onClick={handleAddPain} className="bg-slate-800 hover:bg-slate-700">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.painPoints.map((pp) => (
                  <Badge key={pp} className="bg-red-950/40 text-red-300 border border-red-800/40 flex items-center gap-1">
                    {pp}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemovePain(pp)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sizes & Agent Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icpAgent">Assign Agent Lead</Label>
                <Select
                  value={formData.assignedAgentId || 'none'}
                  onValueChange={(val) => handleAgentChange(val === 'none' ? '' : val)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800">
                    <SelectValue placeholder="Select Lead Agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="none">None</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Company Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['SMB', 'Mid-Market', 'Enterprise'].map(sz => {
                    const active = formData.targetCompanySizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-purple-950/30 text-purple-300 border-purple-800/40'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            targetCompanySizes: active
                              ? prev.targetCompanySizes.filter(s => s !== sz)
                              : [...prev.targetCompanySizes, sz]
                          }));
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="icpConv">Assumed Conversion Rate (%)</Label>
                <Input
                  id="icpConv"
                  type="number"
                  step="0.1"
                  value={formData.conversionRate}
                  onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icpDeal">Average Deal Size ($)</Label>
                <Input
                  id="icpDeal"
                  type="number"
                  value={formData.averageDealSize}
                  onChange={(e) => setFormData({ ...formData, averageDealSize: parseInt(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-2 border-t border-slate-800 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              Save Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
