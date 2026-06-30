'use client';

import { useState } from 'react';
import { ClipboardList, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassPanel } from '@/components/immersive';
import { demoTasks } from '@/lib/portal-demo-data';

export default function AdminV2Tasks() {
  const [tasks, setTasks] = useState(demoTasks);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Tasks
          </h1>
          <p className="text-slate-400 mt-2">
            Track and manage all agent tasks
          </p>
        </div>
      </div>

      <GlassPanel className="border border-slate-800">
        <CardContent className="p-6">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800/50 border-slate-700 focus:border-teal-500 text-slate-100 placeholder-slate-500 rounded-xl"
          />
        </CardContent>
      </GlassPanel>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <GlassPanel key={task.id} className="border border-slate-800 hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{task.title}</h3>
                  <p className="text-sm text-slate-400">Status: {task.status}</p>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        ))}
      </div>

      <div className="text-center py-8">
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
          <a href="/portal/admin">Use Legacy Portal for Full Functionality</a>
        </Button>
      </div>
    </div>
  );
}
