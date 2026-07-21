// app/portal/admin/security/page.tsx
"use client";

import { SecurityDashboard } from "@/components/security/SecurityDashboard";

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <SecurityDashboard />
    </div>
  );
}
