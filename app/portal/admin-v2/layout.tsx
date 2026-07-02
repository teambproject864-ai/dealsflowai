'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState, useEffect } from 'react';
import {
  Home,
  Users,
  Target,
  FileText,
  ClipboardList,
  Settings,
  Activity,
  UserCheck,
  AlertTriangle,
  Bell,
  Clock,
  X
} from 'lucide-react';
import { GlassPanel } from '@/components/immersive';
import { cn } from '@/lib/utils';
import AuthProvider from '@/components/auth/AuthProvider';
import LogoutButton from '@/components/auth/LogoutButton';

const navItems = [
  { href: '/portal/admin-v2', label: 'Dashboard', icon: Home },
  { href: '/portal/admin-v2/customers', label: 'Customers', icon: Users },
  { href: '/portal/admin-v2/icp-management', label: 'ICP Management', icon: Target },
  { href: '/portal/admin-v2/documents', label: 'Documents', icon: FileText },
  { href: '/portal/admin-v2/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/portal/admin-v2/agents', label: 'Agents', icon: UserCheck },
  { href: '/portal/admin-v2/gtm-reports', label: 'GTM Reports', icon: Activity },
  { href: '/portal/admin-v2/settings', label: 'Settings', icon: Settings },
];

export default function AdminV2Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'overdue' | 'duesoon'; message: string; taskId: string }>>([]);
  const [showBanner, setShowBanner] = useState(true);

  // Poll tasks for real-time overdue or approaching deadline alerts
  useEffect(() => {
    const checkTaskDeadlines = async () => {
      try {
        const res = await fetch('/api/portal/tasks');
        const data = await res.json();
        if (data.success && data.tasks) {
          const computedAlerts: typeof alerts = [];
          data.tasks.forEach((task: any) => {
            if (task.status !== 'completed' && task.dueDate) {
              const dueDateObj = new Date(task.dueDate);
              const diffTime = dueDateObj.getTime() - Date.now();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffTime < 0) {
                computedAlerts.push({
                  id: `alert-overdue-${task.id}`,
                  type: 'overdue',
                  message: `Task "${task.title}" assigned to ${task.assignedAgentName || 'Agent'} is OVERDUE (Deadline: ${dueDateObj.toLocaleDateString()}).`,
                  taskId: task.id,
                });
              } else if (diffTime > 0 && diffTime <= 24 * 60 * 60 * 1000) { // less than 24 hours
                computedAlerts.push({
                  id: `alert-soon-${task.id}`,
                  type: 'duesoon',
                  message: `Task "${task.title}" assigned to ${task.assignedAgentName || 'Agent'} is approaching its deadline (Due in less than 24 hours).`,
                  taskId: task.id,
                });
              }
            }
          });
          setAlerts(computedAlerts);
        }
      } catch (err) {
        console.error('Error fetching tasks for alerts:', err);
      }
    };

    checkTaskDeadlines();
    const interval = setInterval(checkTaskDeadlines, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider allowedRoles={['admin']}>
      <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col shrink-0">
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-teal-400" />
              Admin Portal
            </h2>
            <p className="text-slate-500 text-sm mt-1">Next Gen CRM & Monitoring</p>
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm',
                    isActive
                      ? 'bg-gradient-to-r from-teal-600/20 to-cyan-600/20 text-teal-300 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.05)]'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
            <div className="flex justify-between items-center px-2">
              <Link
                href="/portal/admin"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Legacy Admin
              </Link>
              <LogoutButton className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 bg-transparent border-0 cursor-pointer" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Real-time Alerts Warning Banner */}
          {showBanner && alerts.length > 0 && (
            <div className="bg-gradient-to-r from-red-950/70 to-amber-950/70 border-b border-red-900/40 px-6 py-3 flex items-center justify-between text-xs text-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-1.5 rounded-lg text-red-400 animate-pulse">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-red-400 flex items-center gap-1">
                    <Bell className="h-3 w-3" /> CRITICAL WORKFLOW ALERTS ({alerts.length})
                  </p>
                  <p className="text-slate-300 font-medium truncate max-w-xl md:max-w-3xl">
                    {alerts[0].message} {alerts.length > 1 && `+ ${alerts.length - 1} other alerts pending.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/portal/admin-v2/tasks" className="underline hover:text-white mr-2">
                  Take Action
                </Link>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Children View */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

// Simple Helper Icon
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
