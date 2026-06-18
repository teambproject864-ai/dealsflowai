import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Agent Sign In — DealFlow AI",
  description: "Agent portal sign in for DealFlow AI revenue operations platform.",
};

export default function AgentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      }
    >
      <LoginForm role="agent" />
    </Suspense>
  );
}
