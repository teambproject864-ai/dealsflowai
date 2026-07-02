'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Filter,
  Loader2,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  MapPin,
  Globe,
  BarChart2,
  Briefcase,
  X,
  Link as LinkIcon,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassPanel } from '@/components/immersive';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '../UIComponents';
import { Badge } from '@/components/ui/badge';
import { ComprehensiveCustomer } from '@/lib/portal-types';
import { demoCustomers } from '@/lib/portal-demo-data';
import { cn } from '@/lib/utils';

// Fallback demo comprehensive customers data
const demoComprehensiveCustomers: ComprehensiveCustomer[] = demoCustomers.map((c) => ({
  id: c.id,
  personalIdentifiers: {
    fullName: c.name,
    email: c.email,
    phoneNumber: c.phone || "",
    secondaryEmail: "",
    linkedinProfile: "",
  },
  companyInformation: {
    companyName: c.companyName || "Unknown Corp",
    websiteUrl: "https://example.com",
    industry: c.industry || "SaaS",
    companySize: "Mid-Market",
    headquarters: { country: "United States", city: "San Francisco" },
    businessModel: c.businessModel || "b2b",
    revenueRange: "$1M-$10M",
    foundingYear: "",
  },
  accountHistory: {
    status: c.status || "active",
    onboardedAt: c.createdAt || new Date().toISOString(),
    totalInteractions: Math.floor(Math.random() * 100),
  },
  icpCategory: c.businessModel === 'b2b' ? "Enterprise SaaS Buyer" : "Mid-Market B2B",
  serviceConfigurations: c.serviceConfigurations || {},
  createdAt: c.createdAt || new Date().toISOString(),
  updatedAt: c.updatedAt || new Date().toISOString(),
  assignedAgentId: c.assignedAgentId || "",
  assignedAgentName: c.assignedAgentName || "",
}));

export default function AdminV2ComprehensiveCustomers() {
  const [customers, setCustomers] = useState<ComprehensiveCustomer[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterICP, setFilterICP] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<ComprehensiveCustomer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);

  // Fetch Customers & Agents from Server
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custRes, agentRes] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/agents')
      ]);
      const custData = await custRes.json();
      const agentData = await agentRes.json();

      if (custData.success && custData.customers?.length > 0) {
        // Map any flat data into full nested ComprehensiveCustomer format if needed
        const mapped = custData.customers.map((c: any) => ({
          id: c.id,
          personalIdentifiers: c.personalIdentifiers || {
            fullName: c.name || "",
            email: c.email || "",
            phoneNumber: c.phone || "",
          },
          companyInformation: c.companyInformation || {
            companyName: c.companyName || "Unknown Corp",
            websiteUrl: c.websiteUrl || "https://example.com",
            industry: c.industry || "SaaS",
            companySize: c.companySize || "Mid-Market",
            headquarters: c.headquarters || { country: "United States", city: "" },
            businessModel: c.businessModel || "b2b",
            revenueRange: c.revenueRange || "$1M-$10M",
          },
          accountHistory: c.accountHistory || {
            status: c.status || "active",
            onboardedAt: c.createdAt || new Date().toISOString(),
            totalInteractions: c.totalInteractions || 0,
          },
          serviceConfigurations: c.serviceConfigurations || {},
          assignedAgentId: c.assignedAgentId || "",
          assignedAgentName: c.assignedAgentName || "",
          icpCategory: c.icpCategory || "Enterprise SaaS Buyer",
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }));
        setCustomers(mapped);
      } else {
        setCustomers(demoComprehensiveCustomers);
      }

      if (agentData.success) {
        setAgents(agentData.agents || []);
      }
    } catch (error) {
      console.error('[Admin Customers] Fetch error:', error);
      setCustomers(demoComprehensiveCustomers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Log View details to Audit log
  const logCustomerView = async (customer: ComprehensiveCustomer) => {
    try {
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'document_access',
          actionDetails: `Viewed customer profile details: ${customer.personalIdentifiers.fullName} (${customer.companyInformation.companyName})`,
          targetId: customer.id,
          targetType: 'customer',
        }),
      });
    } catch (err) {
      console.error('[Audit Log] Failed to log customer view:', err);
    }
  };

  const handleSelectCustomer = (customer: ComprehensiveCustomer) => {
    setSelectedCustomer(customer);
    logCustomerView(customer);
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        (customer.personalIdentifiers?.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (customer.personalIdentifiers?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (customer.companyInformation?.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || customer.accountHistory?.status === filterStatus;
      const matchesIndustry =
        filterIndustry === 'all' || customer.companyInformation?.industry === filterIndustry;
      const matchesICP =
        filterICP === 'all' || customer.icpCategory === filterICP;
      return matchesSearch && matchesStatus && matchesIndustry && matchesICP;
    });
  }, [customers, searchQuery, filterStatus, filterIndustry, filterICP]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'resigned':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'onboarding':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const handleSaveCustomer = async (customer: ComprehensiveCustomer) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: customers.some(c => c.id === customer.id) ? 'update' : 'create',
          customerId: customer.id,
          customer,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        alert(resData.error || 'Failed to save customer');
        setIsLoading(false);
        return;
      }

      await fetchData();
      setIsEditDialogOpen(false);
      setIsNewCustomerDialogOpen(false);
    } catch (err) {
      console.error('[Admin Save Customer] Error:', err);
      alert('Network error saving customer details.');
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This will also remove their portal user login details.')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/customers?customerId=${customerId}`, {
        method: 'DELETE',
      });
      const resData = await response.json();
      if (!resData.success) {
        alert(resData.error || 'Failed to delete customer');
        setIsLoading(false);
        return;
      }

      await fetchData();
      setSelectedCustomer(null);
    } catch (err) {
      console.error('[Admin Delete Customer] Error:', err);
      alert('Network error deleting customer.');
      setIsLoading(false);
    }
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-400 mt-2">
            Manage customers, ICP categories, accounts, and assignments in real-time
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
          onClick={() => setIsNewCustomerDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      {/* Filters */}
      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="Fintech">Fintech</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterICP} onValueChange={setFilterICP}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <BarChart2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="ICP Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All ICPs</SelectItem>
                <SelectItem value="Enterprise SaaS Buyer">Enterprise SaaS Buyer</SelectItem>
                <SelectItem value="Mid-Market B2B">Mid-Market B2B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassPanel>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <GlassPanel
            key={customer.id}
            className="border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            onClick={() => handleSelectCustomer(customer)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {(customer.personalIdentifiers?.fullName || 'C').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {customer.personalIdentifiers?.fullName}
                      </h3>
                      <Badge className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        getStatusColor(customer.accountHistory?.status || "active")
                      )}>
                        {customer.accountHistory?.status}
                      </Badge>
                      {customer.icpCategory && (
                        <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                          {customer.icpCategory}
                        </Badge>
                      )}
                      {customer.assignedAgent?.agentName && (
                        <Badge variant="secondary" className="text-cyan-400 bg-cyan-950/20 border-cyan-800/30">
                          Agent: {customer.assignedAgent.agentName}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.personalIdentifiers?.email}
                      </div>
                      {customer.personalIdentifiers?.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.personalIdentifiers.phoneNumber}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <Building2 className="h-3.5 w-3.5" />
                        {customer.companyInformation?.companyName}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <Globe className="h-3.5 w-3.5" />
                        {customer.companyInformation?.industry}
                      </div>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-slate-800 text-white">
                    <DropdownMenuItem className="cursor-pointer flex gap-2" onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCustomer(customer);
                    }}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex gap-2" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(customer);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 cursor-pointer flex gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomer(customer.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </GlassPanel>
        ))}

        {filteredCustomers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No customers found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters, or onboard a new customer.</p>
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setIsNewCustomerDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" /> Onboard Customer
            </Button>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <Drawer open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
          <DrawerContent className="bg-slate-955 text-slate-100 max-h-[90vh] border-t border-slate-850">
            <DrawerHeader className="border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <DrawerTitle className="text-2xl font-bold text-white">
                    {selectedCustomer.personalIdentifiers?.fullName}
                  </DrawerTitle>
                  <p className="text-sm text-slate-400">
                    ID: {selectedCustomer.id} | Account history & configuration details
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DrawerHeader>
            
            <div className="px-6 py-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <GlassPanel className="border border-slate-800/80 p-5">
                  <h4 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" /> Personal Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="text-white font-medium">{selectedCustomer.personalIdentifiers?.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Primary Email:</span>
                      <span className="text-white font-medium">{selectedCustomer.personalIdentifiers?.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Secondary Email:</span>
                      <span className="text-white font-medium">{selectedCustomer.personalIdentifiers?.secondaryEmail || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Phone Number:</span>
                      <span className="text-white font-medium">{selectedCustomer.personalIdentifiers?.phoneNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">LinkedIn Profile:</span>
                      <span className="text-teal-400 font-medium truncate max-w-xs">
                        {selectedCustomer.personalIdentifiers?.linkedinProfile ? (
                          <a href={selectedCustomer.personalIdentifiers.linkedinProfile} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                            <LinkIcon className="h-3.5 w-3.5" /> LinkedIn
                          </a>
                        ) : '-'}
                      </span>
                    </div>
                  </div>
                </GlassPanel>

                {/* Company Info */}
                <GlassPanel className="border border-slate-800/80 p-5">
                  <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Company Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Company Name:</span>
                      <span className="text-white font-medium">{selectedCustomer.companyInformation?.companyName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Website URL:</span>
                      <span className="text-cyan-400 font-medium truncate max-w-xs">
                        <a href={selectedCustomer.companyInformation?.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {selectedCustomer.companyInformation?.websiteUrl}
                        </a>
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Industry:</span>
                      <span className="text-white font-medium">{selectedCustomer.companyInformation?.industry}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Company Size:</span>
                      <span className="text-white font-medium">{selectedCustomer.companyInformation?.companySize}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Business Model:</span>
                      <span className="text-white font-medium uppercase">{selectedCustomer.companyInformation?.businessModel}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Revenue Range:</span>
                      <span className="text-white font-medium">{selectedCustomer.companyInformation?.revenueRange}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Founding Year:</span>
                      <span className="text-white font-medium">{selectedCustomer.companyInformation?.foundingYear || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Headquarters:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {selectedCustomer.companyInformation?.headquarters?.city ? `${selectedCustomer.companyInformation.headquarters.city}, ` : ''}
                        {selectedCustomer.companyInformation?.headquarters?.country || ''}
                      </span>
                    </div>
                  </div>
                </GlassPanel>

                {/* Account Details & ICP */}
                <GlassPanel className="border border-slate-800/80 p-5">
                  <h4 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" /> Account Details & ICP
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Account Status:</span>
                      <Badge className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        getStatusColor(selectedCustomer.accountHistory?.status || "active")
                      )}>
                        {selectedCustomer.accountHistory?.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Ideal Customer Profile (ICP):</span>
                      <span className="text-purple-400 font-semibold">{selectedCustomer.icpCategory || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Onboarded At:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {selectedCustomer.accountHistory?.onboardedAt ? new Date(selectedCustomer.accountHistory.onboardedAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Total Interactions:</span>
                      <span className="text-white font-medium">{selectedCustomer.accountHistory?.totalInteractions || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Last Interaction:</span>
                      <span className="text-white font-medium">
                        {selectedCustomer.accountHistory?.lastInteractionAt ? new Date(selectedCustomer.accountHistory.lastInteractionAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </GlassPanel>

                {/* Agent & Support Assignments */}
                <GlassPanel className="border border-slate-800/80 p-5">
                  <h4 className="text-lg font-bold text-violet-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> Agent & System Configurations
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Assigned Agent Name:</span>
                      <span className="text-white font-medium">{selectedCustomer.assignedAgent?.agentName || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Assigned Agent ID:</span>
                      <span className="text-slate-500 font-mono text-xs">{selectedCustomer.assignedAgent?.agentId || '-'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-xs block mb-1">Service Configurations:</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {Object.entries(selectedCustomer.serviceConfigurations || {}).map(([key, val]) => (
                          <div key={key} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2 flex justify-between items-center text-xs">
                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <Badge className={val ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400"}>
                              {val ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        ))}
                        {Object.keys(selectedCustomer.serviceConfigurations || {}).length === 0 && (
                          <span className="text-slate-500 italic text-xs">No configuration parameters set.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>

            <DrawerFooter className="border-t border-slate-800/80 px-6 py-4 flex flex-row justify-between bg-slate-900/50">
              <div className="flex gap-2">
                <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteCustomer(selectedCustomer.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
                <Button
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Customer
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Edit/New Customer Dialog */}
      <CustomerEditDialog
        customer={selectedCustomer}
        isOpen={isEditDialogOpen || isNewCustomerDialogOpen}
        isNew={isNewCustomerDialogOpen}
        agents={agents}
        onClose={() => {
          setIsEditDialogOpen(false);
          setIsNewCustomerDialogOpen(false);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}

// Comprehensive Customer Edit Dialog Component
function CustomerEditDialog({
  customer,
  isOpen,
  isNew,
  agents,
  onClose,
  onSave,
}: {
  customer: ComprehensiveCustomer | null;
  isOpen: boolean;
  isNew: boolean;
  agents: any[];
  onClose: () => void;
  onSave: (customer: ComprehensiveCustomer) => void;
}) {
  const [formData, setFormData] = useState<ComprehensiveCustomer>({
    id: '',
    personalIdentifiers: { fullName: '', email: '' },
    companyInformation: { companyName: '', websiteUrl: '', industry: 'SaaS', companySize: 'Mid-Market', headquarters: { country: '', city: '' }, businessModel: 'b2b', revenueRange: '' },
    accountHistory: { status: 'onboarding', onboardedAt: '', totalInteractions: 0 },
    serviceConfigurations: {},
    assignedAgent: { agentId: '', agentName: '', assignedAt: '' },
    icpCategory: 'Enterprise SaaS Buyer',
    createdAt: '',
    updatedAt: '',
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'services'>('personal');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('personal');
      if (!isNew && customer) {
        setFormData({
          ...customer,
          personalIdentifiers: {
            fullName: customer.personalIdentifiers?.fullName || '',
            email: customer.personalIdentifiers?.email || '',
            phoneNumber: customer.personalIdentifiers?.phoneNumber || '',
            secondaryEmail: customer.personalIdentifiers?.secondaryEmail || '',
            linkedinProfile: customer.personalIdentifiers?.linkedinProfile || '',
          },
          companyInformation: {
            companyName: customer.companyInformation?.companyName || '',
            websiteUrl: customer.companyInformation?.websiteUrl || 'https://example.com',
            industry: customer.companyInformation?.industry || 'SaaS',
            companySize: customer.companyInformation?.companySize || 'Mid-Market',
            headquarters: customer.companyInformation?.headquarters || { country: 'United States', city: '' },
            businessModel: customer.companyInformation?.businessModel || 'b2b',
            revenueRange: customer.companyInformation?.revenueRange || '$1M-$10M',
            foundingYear: customer.companyInformation?.foundingYear || '',
          },
          accountHistory: {
            status: customer.accountHistory?.status || 'onboarding',
            onboardedAt: customer.accountHistory?.onboardedAt || new Date().toISOString(),
            totalInteractions: customer.accountHistory?.totalInteractions || 0,
          },
          serviceConfigurations: customer.serviceConfigurations || { gtmReports: true, leadScoring: false, aiCalls: false },
        });
      } else {
        setFormData({
          id: `customer-${Date.now()}`,
          personalIdentifiers: {
            fullName: '',
            email: '',
            phoneNumber: '',
            secondaryEmail: '',
            linkedinProfile: '',
          },
          companyInformation: {
            companyName: '',
            websiteUrl: 'https://example.com',
            industry: 'SaaS',
            companySize: 'Mid-Market',
            headquarters: { country: 'United States', city: '' },
            businessModel: 'b2b',
            revenueRange: '$1M-$10M',
            foundingYear: '',
          },
          accountHistory: {
            status: 'onboarding',
            onboardedAt: new Date().toISOString(),
            totalInteractions: 0,
          },
          serviceConfigurations: { gtmReports: true, leadScoring: false, aiCalls: false },
          assignedAgent: { agentId: '', agentName: '', assignedAt: '' },
          icpCategory: 'Enterprise SaaS Buyer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [customer, isOpen, isNew]);

  const handleAgentChange = (agentId: string) => {
    const selectedAgent = agents.find((a) => a.id === agentId);
    setFormData((prev) => ({
      ...prev,
      assignedAgent: {
        agentId,
        agentName: selectedAgent ? selectedAgent.name : '',
        assignedAt: new Date().toISOString(),
      },
    }));
  };

  const handleToggleService = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceConfigurations: {
        ...prev.serviceConfigurations,
        [key]: !prev.serviceConfigurations[key],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            {isNew ? 'Onboard New Customer' : 'Edit Customer Record'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 my-4">
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all",
              activeTab === 'personal' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-400 hover:text-slate-200"
            )}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all",
              activeTab === 'company' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-400 hover:text-slate-200"
            )}
            onClick={() => setActiveTab('company')}
          >
            Company Details
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-semibold border-b-2 transition-all",
              activeTab === 'services' ? "border-teal-500 text-teal-400" : "border-transparent text-slate-400 hover:text-slate-200"
            )}
            onClick={() => setActiveTab('services')}
          >
            Configurations & Agent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'personal' && (
            <GlassPanel className="border border-slate-800 p-5 space-y-4">
              <h3 className="text-teal-400 font-bold flex items-center gap-2"><Users className="h-4 w-4" /> Personal Identifiers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.personalIdentifiers?.fullName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalIdentifiers: { ...formData.personalIdentifiers, fullName: e.target.value }
                    })}
                    required
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personalIdentifiers?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalIdentifiers: { ...formData.personalIdentifiers, email: e.target.value }
                    })}
                    required
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.personalIdentifiers?.phoneNumber || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalIdentifiers: { ...formData.personalIdentifiers, phoneNumber: e.target.value }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    value={formData.personalIdentifiers?.secondaryEmail || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalIdentifiers: { ...formData.personalIdentifiers, secondaryEmail: e.target.value }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.personalIdentifiers?.linkedinProfile || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalIdentifiers: { ...formData.personalIdentifiers, linkedinProfile: e.target.value }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
              </div>
            </GlassPanel>
          )}

          {activeTab === 'company' && (
            <GlassPanel className="border border-slate-800 p-5 space-y-4">
              <h3 className="text-blue-400 font-bold flex items-center gap-2"><Building2 className="h-4 w-4" /> Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyInformation?.companyName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, companyName: e.target.value }
                    })}
                    required
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.companyInformation?.websiteUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, websiteUrl: e.target.value }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.companyInformation?.industry || 'SaaS'}
                    onValueChange={(val) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, industry: val }
                    })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Professional Services">Professional Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={formData.companyInformation?.companySize || 'Mid-Market'}
                    onValueChange={(val) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, companySize: val }
                    })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="SMB">SMB (1-50)</SelectItem>
                      <SelectItem value="Mid-Market">Mid-Market (51-500)</SelectItem>
                      <SelectItem value="Enterprise">Enterprise (500+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessModel">Business Model</Label>
                  <Select
                    value={formData.companyInformation?.businessModel || 'b2b'}
                    onValueChange={(val: any) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, businessModel: val }
                    })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="b2b">B2B (Enterprise)</SelectItem>
                      <SelectItem value="b2c">B2C (Retail)</SelectItem>
                      <SelectItem value="d2c">D2C (Direct)</SelectItem>
                      <SelectItem value="custom">Custom Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueRange">Annual Revenue Range</Label>
                  <Input
                    id="revenueRange"
                    placeholder="e.g. $1M-$10M"
                    value={formData.companyInformation?.revenueRange || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      companyInformation: { ...formData.companyInformation, revenueRange: e.target.value }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hqCity">Headquarters City</Label>
                  <Input
                    id="hqCity"
                    placeholder="San Francisco"
                    value={formData.companyInformation?.headquarters?.city || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      companyInformation: {
                        ...formData.companyInformation,
                        headquarters: { ...formData.companyInformation.headquarters, city: e.target.value }
                      }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hqCountry">Headquarters Country</Label>
                  <Input
                    id="hqCountry"
                    placeholder="United States"
                    value={formData.companyInformation?.headquarters?.country || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      companyInformation: {
                        ...formData.companyInformation,
                        headquarters: { ...formData.companyInformation.headquarters, country: e.target.value }
                      }
                    })}
                    className="bg-slate-900 border-slate-800 text-white focus:border-teal-500 rounded-lg"
                  />
                </div>
              </div>
            </GlassPanel>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <GlassPanel className="border border-slate-800 p-5 space-y-4">
                <h3 className="text-amber-400 font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Account Status & Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select
                      value={formData.accountHistory?.status || 'onboarding'}
                      onValueChange={(val: any) => setFormData({
                        ...formData,
                        accountHistory: { ...formData.accountHistory, status: val }
                      })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-955 border-slate-800 text-white">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icpCategory">ICP Category (Ideal Customer Profile)</Label>
                    <Select
                      value={formData.icpCategory || 'Enterprise SaaS Buyer'}
                      onValueChange={(val: any) => setFormData({
                        ...formData,
                        icpCategory: val
                      })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-955 border-slate-800 text-white">
                        <SelectItem value="Enterprise SaaS Buyer">Enterprise SaaS Buyer</SelectItem>
                        <SelectItem value="Mid-Market B2B">Mid-Market B2B Services</SelectItem>
                        <SelectItem value="SMB Tech Growth">SMB Tech Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="agentSelect">Assign Agent *</Label>
                    <Select
                      value={formData.assignedAgent?.agentId || 'none'}
                      onValueChange={(val) => handleAgentChange(val === 'none' ? '' : val)}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-800">
                        <SelectValue placeholder="Select Agent to Assign" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-955 border-slate-800 text-white">
                        <SelectItem value="none">Unassigned / None</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="border border-slate-800 p-5 space-y-4">
                <h3 className="text-violet-400 font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Service Enablements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['gtmReports', 'leadScoring', 'aiCalls'].map((srv) => {
                    const isEnabled = !!formData.serviceConfigurations?.[srv];
                    return (
                      <button
                        type="button"
                        key={srv}
                        onClick={() => handleToggleService(srv)}
                        className={cn(
                          "p-3 rounded-xl border transition-all text-xs font-semibold text-center uppercase tracking-wide",
                          isEnabled
                            ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                        )}
                      >
                        {srv.replace(/([A-Z])/g, ' $1')}
                        <div className="text-[10px] text-slate-500 mt-1">
                          {isEnabled ? "Activated" : "Deactivated"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-2 border-t border-slate-800 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
              {isNew ? 'Create & Onboard' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
