import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Customer Sign In — DealFlow AI",
  description: "Sign in or create your DealFlow AI customer account to access GTM analytics and pipeline intelligence.",
};

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      }
    >
      <LoginForm role="customer" allowRegistration />
    </Suspense>
  );
}
