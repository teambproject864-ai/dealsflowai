'use client';

import { useState, useEffect, useMemo } from 'react';
import { GlassPanel } from '@/components/immersive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClipboardList,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Users,
  Calendar,
  MessageSquare,
  Paperclip,
  Link as LinkIcon,
  Bell,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '../UIComponents';
import { Badge } from '@/components/ui/badge';
import { EnhancedTask, CollaborationNote, SharedFile, SharedLink } from '@/lib/portal-types';
import { demoTasks, demoUsers } from '@/lib/portal-demo-data';

// Map raw tasks to EnhancedTask format
const demoEnhancedTasks: EnhancedTask[] = demoTasks.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  assignedAgentId: t.assignedAgentId,
  assignedAgentName: demoUsers.find(u => u.id === t.assignedAgentId)?.name || 'Unknown',
  customerId: t.customerId,
  customerName: 'Demo Customer',
  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  progressNotes: t.progressNotes || [],
  collaborationNotes: [],
  sharedFiles: [],
  sharedLinks: [],
  milestones: t.milestones || []
}));

export default function TasksPage() {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Drawer / Modal triggers
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [taskForm, setTaskForm] = useState<{
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedAgentId: string;
    customerId: string;
    dueDate: string;
  }>({
    id: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedAgentId: '',
    customerId: '',
    dueDate: '',
  });

  // Collaboration form fields
  const [noteContent, setNoteContent] = useState('');
  const [resourceLink, setResourceLink] = useState({ title: '', url: '' });
  const [resourceFile, setResourceFile] = useState({ fileName: '', fileSize: '150 KB' });

  // Fetch Tasks, Agents, Customers
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [taskRes, agentRes, custRes] = await Promise.all([
        fetch('/api/portal/tasks'),
        fetch('/api/admin/agents'),
        fetch('/api/admin/customers')
      ]);

      const tData = await taskRes.json();
      const aData = await agentRes.json();
      const cData = await custRes.json();

      if (tData.success && tData.tasks?.length > 0) {
        setTasks(tData.tasks);
      } else {
        setTasks(demoEnhancedTasks);
      }

      if (aData.success) setAgents(aData.agents || []);
      if (cData.success) setCustomers(cData.customers || []);
    } catch (err) {
      console.error('[Tasks Page] Error loading:', err);
      setTasks(demoEnhancedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAgent = agentFilter === 'all' || task.assignedAgentId === agentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [tasks, search, statusFilter, priorityFilter, agentFilter]);

  // Handle Save (Create/Update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.customerId || !taskForm.assignedAgentId) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedAgent = agents.find(a => a.id === taskForm.assignedAgentId);
      const selectedCust = customers.find(c => c.id === taskForm.customerId);

      const payload = {
        ...taskForm,
        assignedAgentName: selectedAgent ? selectedAgent.name : '',
        customerName: selectedCust ? (selectedCust.personalIdentifiers?.fullName || selectedCust.name) : '',
        collaborationNotes: taskForm.id ? tasks.find(t => t.id === taskForm.id)?.collaborationNotes || [] : [],
        sharedFiles: taskForm.id ? tasks.find(t => t.id === taskForm.id)?.sharedFiles || [] : [],
        sharedLinks: taskForm.id ? tasks.find(t => t.id === taskForm.id)?.sharedLinks || [] : [],
      };

      const res = await fetch('/api/portal/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (resData.success) {
        await fetchAllData();
        setIsCreateOpen(false);
        setIsEditOpen(false);
      } else {
        alert(resData.error || 'Failed to save task');
      }
    } catch (err) {
      console.error('[Tasks Page] Save Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTrigger = (task: EnhancedTask) => {
    setTaskForm({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedAgentId: task.assignedAgentId || '',
      customerId: task.customerId || '',
      dueDate: task.dueDate || '',
    });
    setIsEditOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/portal/tasks?taskId=${taskId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        setIsDetailsOpen(false);
      } else {
        alert(data.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('[Tasks Page] Delete Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Collaboration Actions
  const handleAddNote = async () => {
    if (!selectedTask || !noteContent.trim()) return;
    
    const newNote: CollaborationNote = {
      id: `note-${Date.now()}`,
      taskId: selectedTask.id,
      authorId: 'admin-user',
      authorName: 'Admin',
      authorRole: 'admin',
      content: noteContent.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [...(selectedTask.collaborationNotes || []), newNote];
    await updateTaskCollaboration(selectedTask.id, { collaborationNotes: updatedNotes });
    setNoteContent('');
  };

  const handleAddLink = async () => {
    if (!selectedTask || !resourceLink.title || !resourceLink.url) return;

    const newLink: SharedLink = {
      id: `link-${Date.now()}`,
      taskId: selectedTask.id,
      addedBy: 'Admin',
      title: resourceLink.title,
      url: resourceLink.url.startsWith('http') ? resourceLink.url : `https://${resourceLink.url}`,
      createdAt: new Date().toISOString()
    };

    const updatedLinks = [...(selectedTask.sharedLinks || []), newLink];
    await updateTaskCollaboration(selectedTask.id, { sharedLinks: updatedLinks });
    setResourceLink({ title: '', url: '' });
  };

  const handleAddFile = async () => {
    if (!selectedTask || !resourceFile.fileName) return;

    const newFile: SharedFile = {
      id: `file-${Date.now()}`,
      taskId: selectedTask.id,
      uploadedBy: 'Admin',
      fileName: resourceFile.fileName,
      fileUrl: `/files/tasks/${selectedTask.id}_${resourceFile.fileName}`,
      fileSize: 120000,
      createdAt: new Date().toISOString()
    };

    const updatedFiles = [...(selectedTask.sharedFiles || []), newFile];
    await updateTaskCollaboration(selectedTask.id, { sharedFiles: updatedFiles });
    setResourceFile({ fileName: '', fileSize: '150 KB' });
  };

  const updateTaskCollaboration = async (taskId: string, partialUpdate: Partial<EnhancedTask>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const payload = {
        ...task,
        ...partialUpdate
      };

      const res = await fetch('/api/portal/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
        // Update current details view state
        const updated = { ...task, ...partialUpdate };
        setSelectedTask(updated);
      }
    } catch (err) {
      console.error('[Tasks Page] Collab Update Error:', err);
    }
  };

  // Reassignment directly from Drawer
  const handleReassign = async (agentId: string) => {
    if (!selectedTask) return;
    const selectedAgent = agents.find(a => a.id === agentId);
    await updateTaskCollaboration(selectedTask.id, {
      assignedAgentId: agentId,
      assignedAgentName: selectedAgent ? selectedAgent.name : ''
    });
  };

  // Send Reminder (creates a notification in agent's inbox)
  const handleSendReminder = async () => {
    if (!selectedTask || !selectedTask.assignedAgentId) return;
    try {
      const res = await fetch('/api/portal/agent-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          agentId: selectedTask.assignedAgentId,
          title: '⚠️ TASK DEADLINE REMINDER',
          description: `Admin sent a reminder for task: "${selectedTask.title}". Please complete it on schedule.`,
          type: 'warning'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Reminder notification successfully sent to ${selectedTask.assignedAgentName || 'Agent'}.`);
      } else {
        alert('Failed to send reminder.');
      }
    } catch (err) {
      console.error('[Tasks Page] Reminder Error:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 border-red-500/20 bg-red-950/10';
      case 'high':
        return 'text-orange-400 border-orange-500/20 bg-orange-950/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/20 bg-yellow-950/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'blocked':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const isNearDeadline = (dueDate: string) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate).getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // less than 24 hours
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-slate-400 mt-2">Assign workflow tasks, track statuses, set deadlines, and assist agents</p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => {
            setTaskForm({
              id: '',
              title: '',
              description: '',
              status: 'todo',
              priority: 'medium',
              assignedAgentId: '',
              customerId: '',
              dueDate: '',
            });
            setIsCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 rounded-xl">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Agent" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-white">
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassPanel>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <GlassPanel key={task.id} className="border border-slate-800 hover:border-slate-750 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    <Badge variant="outline" className={getStatusBadge(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {isOverdue(task.dueDate || '', task.status) && (
                      <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Overdue
                      </Badge>
                    )}
                    {isNearDeadline(task.dueDate || '') && task.status !== 'completed' && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Due Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{task.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Assigned Agent: <strong className="text-slate-300 ml-1">{task.assignedAgentName || 'Unassigned'}</strong>
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Deadline: <strong className="text-slate-300 ml-1">{new Date(task.dueDate).toLocaleDateString()}</strong>
                      </span>
                    )}
                    {task.customerName && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Customer: <strong className="text-slate-300 ml-1">{task.customerName}</strong>
                      </span>
                    )}
                    {(task.collaborationNotes?.length || 0) > 0 && (
                      <span className="flex items-center gap-1 text-teal-400">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {task.collaborationNotes.length} notes
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditTrigger(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    className="bg-purple-950/20 text-purple-300 border border-purple-800/20 hover:bg-purple-850/30 hover:text-white"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDetailsOpen(true);
                    }}
                  >
                    Assist / Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <ClipboardList className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No tasks found matching current filters</p>
          </div>
        )}
      </div>

      {/* Create / Edit Task Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="bg-slate-950 border border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {isEditOpen ? 'Edit Task Parameters' : 'Assign New Task'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tTitle">Task Title *</Label>
              <Input
                id="tTitle"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Schedule GTM Pitch Review"
                required
                className="bg-slate-900 border-slate-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tDesc">Description</Label>
              <Input
                id="tDesc"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Details about task requirements"
                className="bg-slate-900 border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(val: any) => setTaskForm({ ...taskForm, status: val })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(val: any) => setTaskForm({ ...taskForm, priority: val })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link Customer Account *</Label>
              <Select
                value={taskForm.customerId}
                onValueChange={(val) => setTaskForm({ ...taskForm, customerId: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.personalIdentifiers?.fullName || c.name} ({c.companyInformation?.companyName || c.companyName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign Agent *</Label>
              <Select
                value={taskForm.assignedAgentId}
                onValueChange={(val) => setTaskForm({ ...taskForm, assignedAgentId: val })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent className="bg-slate-955 border-slate-800 text-white">
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tDueDate">Due Date / Deadline</Label>
              <Input
                id="tDueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="bg-slate-900 border-slate-800 text-white"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800/80 gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {isEditOpen ? 'Save Changes' : 'Assign Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inspect & Assist Drawer */}
      {selectedTask && (
        <Drawer open={isDetailsOpen} onOpenChange={(open) => !open && setIsDetailsOpen(false)}>
          <DrawerContent className="bg-slate-955 text-slate-100 max-h-[90vh] border-t border-slate-850">
            <DrawerHeader className="border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-purple-400" />
                    Assist: {selectedTask.title}
                  </DrawerTitle>
                  <p className="text-sm text-slate-400">
                    ID: {selectedTask.id} | Direct admin assistance, collaboration resource attachments, and reminders.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDetailsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DrawerHeader>

            <div className="px-6 py-6 overflow-y-auto max-h-[65vh] grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Details Overview */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 space-y-4">
                  <h4 className="text-md font-bold text-purple-400 border-b border-slate-800/50 pb-2">
                    Workflow Parameters
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <Badge variant="outline" className={getStatusBadge(selectedTask.status)}>{selectedTask.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority:</span>
                      <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linked Customer:</span>
                      <span className="text-white font-medium">{selectedTask.customerName || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="text-white">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No limit'}</span>
                    </div>
                    <div className="space-y-1 mt-2 border-t border-slate-800/50 pt-2">
                      <Label className="text-slate-400 text-xs">Reassign Agent Lead</Label>
                      <Select
                        value={selectedTask.assignedAgentId || 'none'}
                        onValueChange={handleReassign}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-xs mt-1">
                          <SelectValue placeholder="Change Agent" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white text-xs">
                          {agents.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-800/50 pt-2">
                    Description: {selectedTask.description || 'No additional details.'}
                  </p>
                </GlassPanel>

                <div className="flex flex-col gap-2">
                  <Button className="w-full bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40 border border-yellow-500/20 hover:text-white" onClick={handleSendReminder}>
                    <Bell className="h-4 w-4 mr-2" /> Send Deadline Reminder
                  </Button>
                </div>
              </div>

              {/* Collaboration Notes */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 h-full flex flex-col">
                  <h4 className="text-md font-bold text-teal-400 flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                    <MessageSquare className="h-4 w-4" /> Admin Guidance Notes
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[30vh] flex-1 mt-3 pr-2 scrollbar-thin">
                    {selectedTask.collaborationNotes?.map((note: CollaborationNote, i) => (
                      <div key={note.id || i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="font-semibold text-teal-400">{note.authorName} ({note.authorRole})</span>
                          <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="text-xs text-white leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                    {(!selectedTask.collaborationNotes || selectedTask.collaborationNotes.length === 0) && (
                      <p className="text-slate-500 text-xs italic text-center py-6">No guidance notes added yet.</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-2">
                    <Input
                      placeholder="Add note for agent..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="bg-slate-900 border-slate-800 text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button size="sm" onClick={handleAddNote} className="w-full text-xs bg-slate-800 hover:bg-slate-700">
                      Add Guidance Note
                    </Button>
                  </div>
                </GlassPanel>
              </div>

              {/* Resources & Links sharing */}
              <div className="lg:col-span-1 space-y-4">
                <GlassPanel className="border border-slate-800/80 p-5 h-full flex flex-col">
                  <h4 className="text-md font-bold text-pink-400 flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
                    <Paperclip className="h-4 w-4" /> Shared Resources
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[30vh] flex-1 mt-3 pr-2 scrollbar-thin">
                    {/* Files List */}
                    {selectedTask.sharedFiles?.map((file: SharedFile, i) => (
                      <div key={file.id || i} className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1 truncate max-w-[150px]">
                          <Paperclip className="h-3 w-3 text-slate-500" /> {file.fileName}
                        </span>
                        <span className="text-[10px] text-slate-500">Shared by: {file.uploadedBy}</span>
                      </div>
                    ))}

                    {/* Links List */}
                    {selectedTask.sharedLinks?.map((link: SharedLink, i) => (
                      <div key={link.id || i} className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline flex items-center gap-1 truncate max-w-[150px]">
                          <LinkIcon className="h-3 w-3 text-slate-500" /> {link.title}
                        </a>
                        <span className="text-[10px] text-slate-500">Shared by: {link.addedBy}</span>
                      </div>
                    ))}

                    {(!selectedTask.sharedFiles || selectedTask.sharedFiles.length === 0) &&
                     (!selectedTask.sharedLinks || selectedTask.sharedLinks.length === 0) && (
                      <p className="text-slate-500 text-xs italic text-center py-6">No shared files or links yet.</p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-400">Share a Web Link</Label>
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="Title"
                          value={resourceLink.title}
                          onChange={(e) => setResourceLink({ ...resourceLink, title: e.target.value })}
                          className="bg-slate-900 border-slate-800 text-[10px] h-7"
                        />
                        <Input
                          placeholder="URL"
                          value={resourceLink.url}
                          onChange={(e) => setResourceLink({ ...resourceLink, url: e.target.value })}
                          className="bg-slate-900 border-slate-800 text-[10px] h-7"
                        />
                      </div>
                      <Button size="sm" onClick={handleAddLink} className="w-full text-xs h-7 bg-slate-800 hover:bg-slate-700">
                        Share Link
                      </Button>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-850 pt-2">
                      <Label className="text-[10px] text-slate-400">Share a File</Label>
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="File name (e.g. guide.pdf)"
                          value={resourceFile.fileName}
                          onChange={(e) => setResourceFile({ ...resourceFile, fileName: e.target.value })}
                          className="bg-slate-900 border-slate-800 text-[10px] h-7 flex-1"
                        />
                      </div>
                      <Button size="sm" onClick={handleAddFile} className="w-full text-xs h-7 bg-slate-800 hover:bg-slate-700">
                        Attach File
                      </Button>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>

            <DrawerFooter className="border-t border-slate-850 px-6 py-4 flex flex-row justify-between bg-slate-900/50">
              <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteTask(selectedTask.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Purge Task
              </Button>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
