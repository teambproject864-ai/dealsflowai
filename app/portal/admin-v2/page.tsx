'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassPanel } from '@/components/immersive';
import { demoUsers, demoTasks, demoCustomerFeedback, demoAgentMetrics, demoCustomers } from '@/lib/portal-demo-data';
import { Users, CheckSquare, Star, BarChart3, TrendingUp } from 'lucide-react';

export default function AdminV2Dashboard() {
  const stats = [
    {
      title: 'Total Customers',
      value: demoCustomers.length,
      icon: Users,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Active Tasks',
      value: demoTasks.filter((t) => t.status === 'in-progress' || t.status === 'todo').length,
      icon: CheckSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Average Rating',
      value: (
        demoCustomerFeedback.reduce((sum, fb) => sum + fb.rating, 0) / demoCustomerFeedback.length
      ).toFixed(1),
      icon: Star,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Agents Online',
      value: demoUsers.filter((u) => u.role === 'agent').length,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Welcome to the next generation admin dashboard
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <GlassPanel key={idx} className="border border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          );
        })}
      </div>

      {/* Recent Tasks & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="border border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-teal-400" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoTasks.slice(0, 4).map((task, idx) => (
              <div key={idx} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Assigned to {demoUsers.find((u) => u.id === task.assignedAgentId)?.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : task.status === 'in-progress'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </GlassPanel>
        <GlassPanel className="border border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Customer Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoCustomerFeedback.slice(0, 4).map((fb, idx) => (
              <div key={idx} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white">
                    {demoCustomers.find((c) => c.id === fb.customerId)?.name}
                  </p>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{fb.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{fb.comment}</p>
              </div>
            ))}
          </CardContent>
        </GlassPanel>
      </div>
    </div>
  );
}
