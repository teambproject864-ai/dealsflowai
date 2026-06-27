"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShieldCheck, Info, X } from "lucide-react";
import Link from "next/link";

export function CookieConsentBanner() {
  const { user, isLoading } = useCurrentUser();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Consent categories
  const [preferences, setPreferences] = useState({
    essential: true, // always true
    analytics: true,
    marketing: true,
    doNotSell: false,
  });

  useEffect(() => {
    // Check if consent has already been given/dismissed
    const storedConsent = localStorage.getItem("dealflow_cookie_consent");
    if (!storedConsent) {
      // Small delay for natural page load feel
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync locally stored consent to Firestore when the user logs in
  useEffect(() => {
    if (!isLoading && user) {
      const storedConsent = localStorage.getItem("dealflow_cookie_consent");
      const synced = localStorage.getItem("dealflow_cookie_synced");
      if (storedConsent && synced !== "true") {
        const purposes = JSON.parse(localStorage.getItem("dealflow_cookie_purposes") || '["essential"]');
        const doNotSell = localStorage.getItem("dealflow_cookie_donotsell") === "true";
        
        fetch("/api/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consentVersion: "v1.0",
            purposes,
            doNotSell,
          }),
        }).then(res => {
          if (res.ok) {
            localStorage.setItem("dealflow_cookie_synced", "true");
          }
        }).catch(err => console.error("Failed to sync consent on login:", err));
      }
    }
  }, [user, isLoading]);

  const saveConsent = async (
    purposes: string[],
    doNotSell: boolean,
    status: "accepted" | "rejected" | "custom"
  ) => {
    localStorage.setItem("dealflow_cookie_consent", status);
    localStorage.setItem("dealflow_cookie_purposes", JSON.stringify(purposes));
    localStorage.setItem("dealflow_cookie_donotsell", String(doNotSell));
    localStorage.setItem("dealflow_cookie_synced", "false");
    setIsVisible(false);

    // Sync with Firestore if the user is authenticated
    if (user) {
      try {
        const res = await fetch("/api/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consentVersion: "v1.0",
            purposes,
            doNotSell,
          }),
        });
        if (res.ok) {
          localStorage.setItem("dealflow_cookie_synced", "true");
        }
      } catch (err) {
        console.error("Failed to sync cookie consent with database:", err);
      }
    }
  };

  const handleAcceptAll = () => {
    saveConsent(["essential", "analytics", "marketing"], false, "accepted");
  };

  const handleRejectAll = () => {
    saveConsent(["essential"], true, "rejected");
  };

  const handleSaveCustom = () => {
    const purposes = ["essential"];
    if (preferences.analytics) purposes.push("analytics");
    if (preferences.marketing) purposes.push("marketing");
    saveConsent(purposes, preferences.doNotSell, "custom");
  };

  if (!isVisible) return null;

  return (
    <div id="cookie-consent-banner" className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[9999] animate-in slide-in-from-bottom duration-500">
      <div className="bg-slate-950/95 border border-white/10 p-5 rounded-3xl df-glass shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl text-white">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 text-teal-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm tracking-tight text-white">Privacy Preferences</h3>
              <button 
                onClick={handleRejectAll} 
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              We use cookies and telemetry data to secure our autonomous operations (Clawpatrol firewall), evaluate system metrics, and customize your experience.
            </p>
          </div>
        </div>

        {showDetails ? (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3.5 text-xs text-slate-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="font-semibold text-white block">Essential Cookies</label>
                <span className="text-[10px] text-slate-400">Required for platform security and rate limiting. Cannot be disabled.</span>
              </div>
              <input type="checkbox" checked disabled className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-0 opacity-60" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="font-semibold text-white block cursor-pointer" htmlFor="pref-analytics">Performance &amp; Analytics</label>
                <span className="text-[10px] text-slate-400">Helps us monitor WebGL framerates and multi-agent latency profiles.</span>
              </div>
              <input 
                id="pref-analytics"
                type="checkbox" 
                checked={preferences.analytics} 
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-0 cursor-pointer" 
              />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="font-semibold text-white block cursor-pointer" htmlFor="pref-marketing">Marketing &amp; Personalization</label>
                <span className="text-[10px] text-slate-400">Enables our smart CRM integration and target segment matching triggers.</span>
              </div>
              <input 
                id="pref-marketing"
                type="checkbox" 
                checked={preferences.marketing} 
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-0 cursor-pointer" 
              />
            </div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <label className="font-semibold text-teal-300 block cursor-pointer" htmlFor="pref-donotsell">Do Not Sell My Info (CCPA)</label>
                <span className="text-[10px] text-slate-400">Restrict all data sharing with external CRM partner pipelines.</span>
              </div>
              <input 
                id="pref-donotsell"
                type="checkbox" 
                checked={preferences.doNotSell} 
                onChange={(e) => setPreferences({ ...preferences, doNotSell: e.target.checked })}
                className="rounded border-slate-800 bg-slate-900 text-teal-500 focus:ring-0 cursor-pointer" 
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-colors font-semibold"
              >
                Back
              </button>
              <button 
                onClick={handleSaveCustom}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button 
              onClick={() => setShowDetails(true)} 
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-semibold py-1.5"
            >
              <Info className="h-3.5 w-3.5" />
              Customize Options
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRejectAll}
                className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold transition-all hover:scale-102 active:scale-98"
              >
                Reject All
              </button>
              <button 
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-400 font-bold transition-all shadow-md shadow-teal-900/20 hover:scale-102 active:scale-98"
              >
                Accept All
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 text-[9px] text-slate-500 text-center">
          By accepting, you agree to our{" "}
          <Link href="/account/privacy" className="text-teal-400 hover:underline">
            Privacy Portal &amp; Compliance Settings
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
