"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, BarChart3, TrendingUp, Shield, Users, Calendar, User } from "lucide-react";

interface Category {
  name: string;
  items: { name: string; href: string; icon?: React.ElementType; description: string }[];
}

export default function AllOptionsPage() {
  const router = useRouter();

  const categories: Category[] = [
    {
      name: "AI & Automation",
      items: [
        { name: "Browser Agent", href: "/browser-agent", icon: Bot, description: "Autonomous browser agent for GTM tasks" },
        { name: "GTM Analysis", href: "/llm-comparison", icon: BarChart3, description: "LLM performance comparison & GTM insights" },
      ],
    },
    {
      name: "Solutions",
      items: [
        { name: "GTM Playbooks", href: "/solutions/gtm", icon: TrendingUp, description: "Go-to-market strategy automation" },
        { name: "Sales Acceleration", href: "/solutions/sales", icon: TrendingUp, description: "AI-powered sales workflows" },
        { name: "Marketing Optimization", href: "/solutions/marketing", icon: TrendingUp, description: "Intelligent marketing automation" },
      ],
    },
    {
      name: "Portals",
      items: [
        { name: "Admin Portal", href: "/portal/admin/login", icon: Shield, description: "System administrators control center" },
        { name: "Agent Portal", href: "/portal/agent/login", icon: User, description: "Workspace for AI Revenue Agents" },
        { name: "Customer Portal", href: "/portal/customer/login", icon: Users, description: "Access client dashboard and metrics" },
      ],
    },
    {
      name: "Other Options",
      items: [
        { name: "Book a Demo", href: "/book-demo", icon: Calendar, description: "Schedule a personalized product demo" },
        { name: "Features", href: "/features", icon: TrendingUp, description: "All available platform features" },
        { name: "Support", href: "/support", icon: TrendingUp, description: "Help center and customer support" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-8"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-2">All Application Options</h1>
        <p className="text-slate-400 text-lg mb-12">Explore all available features and sections</p>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-slate-200 mb-4">{category.name}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="block p-6 rounded-3xl bg-[#070718] border border-white/10 hover:border-white/20 hover:bg-white/6 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      {item.icon && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-500/15 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
                          <item.icon className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors duration-300 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
