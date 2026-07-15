"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, LineChart, MessageSquare, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/immersive/GlassPanel";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import { StaggerReveal } from "@/components/immersive/StaggerReveal";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function PortalLanding() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(`/portal/${user.role}`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <StaggerReveal className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 immersive-holo-text">
          Customer/Client Management Portal
        </h1>
        <p className="text-xl text-[#C8B8FF] font-medium">
          Choose your role to start using the portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/portal/admin" prefetch={false} className="group">
          <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
            <div>
              <ShieldCheck className="h-12 w-12 text-teal-400 mb-4 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-teal-400 transition-colors mb-2">
                Administrator
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Manage agents, monitor performance, view customer feedback, and generate reports.
              </p>
            </div>
            <ExtrudedButton className="w-full bg-teal-600 hover:bg-teal-700">
              Go to Admin Dashboard
            </ExtrudedButton>
          </GlassPanel>
        </Link>

        <Link href="/portal/agent" prefetch={false} className="group">
          <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
            <div>
              <Users className="h-12 w-12 text-purple-400 mb-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors mb-2">
                Agent
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Workspace for managing tasks, chatting with customers, and initiating calls.
              </p>
            </div>
            <ExtrudedButton className="w-full bg-purple-600 hover:bg-purple-700">
              Go to Agent Portal
            </ExtrudedButton>
          </GlassPanel>
        </Link>

        <Link href="/portal/customer" prefetch={false} className="group">
          <GlassPanel material="glass" depth="mid" tilt={true} className="p-6 h-full flex flex-col justify-between border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
            <div>
              <LineChart className="h-12 w-12 text-orange-400 mb-4 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors mb-2">
                Customer
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                View your account, interact with agents, and track progress on your tasks.
              </p>
            </div>
            <ExtrudedButton className="w-full bg-orange-600 hover:bg-orange-700">
              Go to Customer Portal
            </ExtrudedButton>
          </GlassPanel>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassPanel material="glass" depth="mid" className="p-6">
          <div className="flex gap-4 items-start">
            <MessageSquare className="h-10 w-10 text-blue-400 shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Chat</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Secure, encrypted text communication between agents and customers.
              </p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel material="glass" depth="mid" className="p-6">
          <div className="flex gap-4 items-start">
            <Phone className="h-10 w-10 text-green-400 shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Calls</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                In-platform calling features to connect directly from the dashboard.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </StaggerReveal>
  );
}
