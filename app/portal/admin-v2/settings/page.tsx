'use client';

import { GlassPanel } from '@/components/immersive';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Lock, Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-slate-400">Configure global portal parameters and security overrides</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassPanel className="border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-400" />
            Security & RBAC Configuration
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Manage roles, document access rules, and compliance defaults. Currently set to strict GDPR/CCPA auditing mode.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
              <span className="text-slate-300">Auditing Frequency</span>
              <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20">Real-Time</Badge>
            </div>
            <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
              <span className="text-slate-300">Password Policy</span>
              <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20">High Complexity</Badge>
            </div>
            <div className="flex justify-between items-center text-xs py-2">
              <span className="text-slate-300">Session Lockout Threshold</span>
              <span className="text-slate-400">5 attempts</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="border border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" />
            Workflow Notifications
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Toggle global notifications, email reminders, and dashboard warnings for overdue tasks.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
              <span className="text-slate-300">Email Notifications</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50">
              <span className="text-slate-300">Overdue Reminders</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Auto-Send</Badge>
            </div>
            <div className="flex justify-between items-center text-xs py-2">
              <span className="text-slate-300">Lead Assignment Alerts</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Enabled</Badge>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700">
          <Check className="h-4 w-4 mr-2" /> Save System Settings
        </Button>
      </div>
    </div>
  );
}
