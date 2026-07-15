"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";

export default function LogoutButton({
  variant = "outline",
  onClick,
  disabled,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ExtrudedButton>) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
    setIsLoggingOut(true);
    try {
      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call server-side logout
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Hard reload/redirect to clear any cached state
      window.location.replace("/");
    } catch (e) {
      console.error("Logout failed:", e);
      // Even if server logout fails, clear client storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ExtrudedButton
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut || disabled}
      {...props}
    >
      {children || (
        <>
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          {isLoggingOut ? "Logging out" : "Logout"}
        </>
      )}
    </ExtrudedButton>
  );
}
