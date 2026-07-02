'use client';

import { useState, useEffect, useMemo } from 'react';
import { GlassPanel } from '@/components/immersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Edit,
  Search,
  Filter,
  Eye,
  History,
  ShieldAlert,
  Calendar,
  Layers,
  Users,
  Loader2,
  X,
  PlusCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../UIComponents';
import { Badge } from '@/components/ui/badge';
import { EnhancedDocument, DocumentVersion, DocumentAuditLog } from '@/lib/portal-types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<EnhancedDocument[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  // Modals & Drawers
  const [selectedDoc, setSelectedDoc] = useState<EnhancedDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form Fields
  const [newDocData, setNewDocData] = useState({
    customerId: '',
    documentType: 'contract',
    title: '',
    description: '',
    type: 'pdf',
    size: '250 KB',
  });

  const [versionNotes, setVersionNotes] = useState('');

  // Fetch Documents & Customers
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [docRes, custRes] = await Promise.all([
        fetch('/api/portal/documents'),
        fetch('/api/admin/customers')
      ]);

      const docData = await docRes.json();
      const custData = await custRes.json();

      if (docData.success) {
        setDocuments(docData.documents || []);
      }
      if (custData.success) {
        setCustomers(custData.customers || []);
      }
    } catch (err) {
      console.error('[Documents Page] Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
      
      let matchesCustomer = true;
      if (customerFilter !== 'all') {
        matchesCustomer = doc.customerId === customerFilter;
      }

      return matchesSearch && matchesType && matchesCustomer;
    });
  }, [documents, searchQuery, typeFilter, customerFilter]);

  // Log View/Download interaction
  const logDocumentAccess = async (docId: string, actionType: 'view' | 'download') => {
    try {
      await fetch('/api/portal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: docId,
          action: 'log_access',
          accessAction: actionType,
        }),
      });
      // Refresh documents to update access logs view
      const docRes = await fetch('/api/portal/documents');
      const docData = await docRes.json();
      if (docData.success) {
        setDocuments(docData.documents || []);
        // update selectedDoc state to show new logs
        const updated = docData.documents.find((d: any) => d.id === docId);
        if (updated) setSelectedDoc(updated);
      }
    } catch (err) {
      console.error('[Documents Page] Error logging access:', err);
    }
  };

  const handleOpenDetails = (doc: EnhancedDocument) => {
    setSelectedDoc(doc);
    setIsDetailsOpen(true);
    logDocumentAccess(doc.id, 'view');
  };

  const handleDownload = (doc: EnhancedDocument) => {
    logDocumentAccess(doc.id, 'download');
    // Simulate download
    alert(`Downloading: ${doc.title} (${doc.fileAttachment?.fileSize ? (doc.fileAttachment.fileSize / 1024).toFixed(0) + ' KB' : 'unknown size'})`);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.customerId || !newDocData.title) {
      alert('Please select a customer and enter a title.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/portal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocData),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        setIsUploadOpen(false);
        setNewDocData({
          customerId: '',
          documentType: 'contract',
          title: '',
          description: '',
          type: 'pdf',
          size: '250 KB',
        });
      } else {
        alert(data.error || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !versionNotes) {
      alert('Please enter change notes.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/portal/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDoc.id,
          action: 'upload_version',
          updateNotes: versionNotes,
          size: '450 KB',
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        setIsNewVersionOpen(false);
        setIsDetailsOpen(false);
        setVersionNotes('');
      } else {
        alert(data.error || 'Failed to upload version');
      }
    } catch (err) {
      console.error('Error uploading version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This will purge all version histories and access logs.')) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/portal/documents?docId=${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        setIsDetailsOpen(false);
      } else {
        alert(data.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/10';
      case 'icp':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/10';
      case 'requirement':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/10';
      case 'onboarding':
        return 'text-blue-400 border-blue-500/30 bg-blue-950/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Document Repository
          </h1>
          <p className="text-slate-400">中央 documentation store with version control, access logs, and RBAC visibility</p>
        </div>
        <Button
          className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700"
          onClick={() => setIsUploadOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search documents by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 rounded-xl"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-850 text-white">
                <SelectItem value="all">All Document Types</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="icp">ICP Details</SelectItem>
                <SelectItem value="requirement">Requirements</SelectItem>
                <SelectItem value="onboarding">Onboarding Forms</SelectItem>
                <SelectItem value="identification">Identification Files</SelectItem>
                <SelectItem value="financial">Financial Forms</SelectItem>
                <SelectItem value="other">Other / General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Customer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-955 border-slate-800 text-white">
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.personalIdentifiers?.fullName || c.name} ({c.companyInformation?.companyName || c.companyName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassPanel>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocs.map((doc, idx) => (
          <GlassPanel key={doc.id || idx} className="border border-slate-800 hover:border-slate-700 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex-shrink-0">
                    <FileText className="h-6 w-6 text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-semibold text-white truncate max-w-xs">{doc.title}</h3>
                      <Badge variant="outline" className={getDocTypeColor(doc.documentType)}>
                        {doc.documentType}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                        v{doc.currentVersion?.toFixed(1) || '1.0'}
                      </Badge>
                      {doc.customerId && (
                        <Badge variant="outline" className="text-cyan-400 border-cyan-800/40 text-[10px]">
                          Account: {customers.find(c => c.id === doc.customerId)?.companyInformation?.companyName || customers.find(c => c.id === doc.customerId)?.companyName || 'Linked Account'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-1">{doc.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Size: {doc.fileAttachment?.fileSize ? (doc.fileAttachment.fileSize / 1024).toFixed(0) + ' KB' : '150 KB'}</span>
                      <span>Uploaded: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-slate-800" onClick={() => handleOpenDetails(doc)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Inspect
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-slate-800" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}

        {filteredDocs.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">No documents found</h3>
            <p className="text-slate-500 mb-4">Upload a document or change filters to get started.</p>
          </div>
        )}
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Upload New Document
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div className="space-y-2">
              <Label>Link Customer Account *</Label>
              <Select
                value={newDocData.customerId}
                onValueChange={(val) => setNewDocData({ ...newDocData, customerId: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-955 border-slate-800 text-white">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.personalIdentifiers?.fullName || c.name} ({c.companyInformation?.companyName || c.companyName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select
                value={newDocData.documentType}
                onValueChange={(val) => setNewDocData({ ...newDocData, documentType: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-955 border-slate-800 text-white">
                  <SelectItem value="contract">Contract / NDA</SelectItem>
                  <SelectItem value="icp">ICP Specifications</SelectItem>
                  <SelectItem value="requirement">Requirements Document</SelectItem>
                  <SelectItem value="onboarding">Onboarding Questionnaire</SelectItem>
                  <SelectItem value="identification">Identification Doc</SelectItem>
                  <SelectItem value="financial">Financial / Invoices</SelectItem>
                  <SelectItem value="other">Other / Support Files</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docTitle">Document Title *</Label>
              <Input
                id="docTitle"
                value={newDocData.title}
                onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                placeholder="e.g. Executed Master Service Agreement"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="docDesc">Description</Label>
              <Input
                id="docDesc"
                value={newDocData.description}
                onChange={(e) => setNewDocData({ ...newDocData, description: e.target.value })}
                placeholder="Brief summary of document content"
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="docFileFormat">Simulated File Format</Label>
                <Select
                  value={newDocData.type}
                  onValueChange={(val) => setNewDocData({ ...newDocData, type: val })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white text-xs">
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="docx">Word DOCX</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="png">PNG Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="docSize">Simulated Size</Label>
                <Input
                  id="docSize"
                  value={newDocData.size}
                  onChange={(e) => setNewDocData({ ...newDocData, size: e.target.value })}
                  placeholder="e.g. 1.2 MB"
                  className="bg-slate-900 border-slate-800"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/80 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700">
                Upload & Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Version Dialog */}
      <Dialog open={isNewVersionOpen} onOpenChange={setIsNewVersionOpen}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Upload New Version
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadVersion} className="space-y-4">
            <p className="text-xs text-slate-400">
              Uploading a new file revision for <strong>{selectedDoc?.title}</strong>. This increments the version number automatically (e.g. v1.0 → v1.1).
            </p>
            <div className="space-y-2">
              <Label htmlFor="verNotes">Revision Notes / Change Details *</Label>
              <Input
                id="verNotes"
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="e.g. Added section 4 signatures, minor formatting edits."
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-slate-800/80 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsNewVersionOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                Upload Revision
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect Document Drawer */}
      {selectedDoc && (
        <Drawer open={isDetailsOpen} onOpenChange={(open) => !open && setIsDetailsOpen(false)}>
          <DrawerContent className="bg-slate-955 text-slate-100 max-h-[90vh] border-t border-slate-850">
            <DrawerHeader className="border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-teal-400" />
                    {selectedDoc.title}
                  </DrawerTitle>
                  <p className="text-sm text-slate-400">
                    ID: {selectedDoc.id} | Detailed history, version audit, and regulatory access logs
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDetailsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DrawerHeader>

            <div className="px-6 py-6 overflow-y-auto max-h-[65vh] grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Overview */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 space-y-4">
                  <h4 className="text-md font-bold text-teal-400 flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                    Metadata Overview
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Doc Type:</span>
                      <Badge variant="outline" className={getDocTypeColor(selectedDoc.documentType)}>{selectedDoc.documentType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Version:</span>
                      <span className="text-white font-semibold">v{selectedDoc.currentVersion?.toFixed(1) || '1.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linked Customer:</span>
                      <span className="text-white truncate max-w-[150px]">
                        {customers.find(c => c.id === selectedDoc.customerId)?.companyInformation?.companyName || customers.find(c => c.id === selectedDoc.customerId)?.companyName || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">File Format:</span>
                      <span className="text-white font-mono uppercase">{selectedDoc.fileAttachment?.fileType || 'PDF'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Size:</span>
                      <span className="text-white">{selectedDoc.fileAttachment?.fileSize ? (selectedDoc.fileAttachment.fileSize / 1024).toFixed(0) + ' KB' : '0 KB'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created At:</span>
                      <span className="text-white">{selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleString() : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Updated At:</span>
                      <span className="text-white">{selectedDoc.updatedAt ? new Date(selectedDoc.updatedAt).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-800/50 pt-2">
                    Description: {selectedDoc.description || 'No description provided.'}
                  </p>
                </GlassPanel>

                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-amber-300 hover:from-amber-600/50 border border-amber-500/20 hover:text-white" onClick={() => setIsNewVersionOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Upload New Version
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleDownload(selectedDoc)}>
                    <Download className="h-4 w-4 mr-2" /> Download Current File
                  </Button>
                </div>
              </div>

              {/* Version History */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 h-full flex flex-col">
                  <h4 className="text-md font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                    <History className="h-4 w-4" /> Version History
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[40vh] flex-1 mt-3 pr-2 scrollbar-thin">
                    {selectedDoc.versions?.map((ver: DocumentVersion, i) => (
                      <div key={ver.id || i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-teal-400">Version {ver.versionNumber?.toFixed(1) || '1.0'}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">&quot;{ver.changeDescription || 'No description'}&quot;</p>
                        <p className="text-[10px] text-slate-500">By: {ver.uploadedBy || 'System'}</p>
                      </div>
                    ))}
                    {(!selectedDoc.versions || selectedDoc.versions.length === 0) && (
                      <p className="text-slate-500 text-xs italic text-center py-6">No previous versions registered.</p>
                    )}
                  </div>
                </GlassPanel>
              </div>

              {/* Regulatory Access Logs */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 h-full flex flex-col">
                  <h4 className="text-md font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                    <UserCheck className="h-4 w-4" /> GDPR/Compliance Access logs
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[40vh] flex-1 mt-3 pr-2 scrollbar-thin">
                    {selectedDoc.accessLogs?.map((log: DocumentAuditLog, i) => (
                      <div key={log.id || i} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white">{log.performedBy}</span>
                          <Badge variant="outline" className={
                            log.action === 'download'
                              ? 'text-rose-400 border-rose-500/20 bg-rose-950/10'
                              : 'text-cyan-400 border-cyan-500/20 bg-cyan-950/10'
                          }>
                            {log.action}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>IP: {log.ipAddress || 'unknown'}</span>
                          <span>{log.performedAt ? new Date(log.performedAt).toLocaleString() : '-'}</span>
                        </div>
                      </div>
                    ))}
                    {(!selectedDoc.accessLogs || selectedDoc.accessLogs.length === 0) && (
                      <p className="text-slate-500 text-xs italic text-center py-6">No access logs recorded yet.</p>
                    )}
                  </div>
                </GlassPanel>
              </div>
            </div>

            <DrawerFooter className="border-t border-slate-850 px-6 py-4 flex flex-row justify-between bg-slate-900/50">
              <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteDocument(selectedDoc.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Purge Document
              </Button>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
