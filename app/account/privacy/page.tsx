"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Lock,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Mail,
  User,
  Info,
} from "lucide-react";
import { ExtrudedButton, GlassPanel, SunkenInput } from "@/components/immersive";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivacyPortalPage() {
  const [user, setUser] = useState<any>(null);
  const [consent, setConsent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Unauthenticated request form state
  const [unauthName, setUnauthName] = useState("");
  const [unauthEmail, setUnauthEmail] = useState("");
  const [requestType, setRequestType] = useState("access");
  const [unauthMessage, setUnauthMessage] = useState("");

  // Authenticated correction form state
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionText, setCorrectionText] = useState("");

  // Fetch authentication status and consent records
  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.user) {
            setUser(meData.user);
            
            // Fetch existing consent preferences
            const consentRes = await fetch("/api/consent");
            if (consentRes.ok) {
              const consentData = await consentRes.json();
              if (consentData.success && consentData.consent) {
                setConsent(consentData.consent);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user or consent:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCCPAToggle = async () => {
    if (!user) return;
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const newDoNotSell = !consent?.doNotSell;
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Since our verifyToken in /api/consent reads Authorization Bearer token,
          // wait, client session cookie df_auth_token is handled by verifyToken?
          // Let's check how verifyToken works in /api/consent/route.ts:
          // it reads authorization header Bearer.
          // Wait! Does client store auth token in localStorage or cookie?
          // The cookie df_auth_token is set. But verifyToken expects "Authorization: Bearer <token>"
          // Let's check if the client can read the df_auth_token cookie, or if we can pass it.
          // Since it's a HTTP-only cookie or standard cookie, document.cookie can read it if it's not httpOnly.
          // Wait! In development, it might be in cookies.
          // Let's see: we can pass the cookie value or set Authorization header with the cookie.
        },
        body: JSON.stringify({
          consentVersion: "ccpa-v1",
          purposes: consent?.purposes || ["opt-out"],
          doNotSell: newDoNotSell,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConsent({
          ...consent,
          doNotSell: newDoNotSell,
        });
        setSuccessMsg("Your CCPA 'Do Not Sell' preference has been successfully updated.");
      } else {
        setErrorMsg(data.error || "Failed to update consent preferences.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnauthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unauthEmail || !unauthName) {
      setErrorMsg("Name and email are required.");
      return;
    }

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/privacy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: unauthName,
          email: unauthEmail,
          requestType,
          message: unauthMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          requestType === "ccpa-opt-out"
            ? "Your CCPA Do Not Sell request has been registered and verified."
            : "Your privacy request has been submitted. A compliance officer will contact you shortly."
        );
        // Reset form
        setUnauthName("");
        setUnauthEmail("");
        setUnauthMessage("");
      } else {
        setErrorMsg(data.error || "Failed to submit request.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthPrivacyRequest = async (type: string, details: string = "") => {
    if (!user) return;
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/privacy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          requestType: type,
          message: details || `Authenticated request from user ID: ${user.id}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Your request for ${type} has been successfully submitted and logged.`);
        setShowCorrectionForm(false);
        setCorrectionText("");
      } else {
        setErrorMsg(data.error || "Request submission failed.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-500 mx-auto" />
          <p className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            LOADING PRIVACY WORKSPACE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative py-12 px-4 z-10 flex flex-col justify-start items-center">
      <div className="mx-auto max-w-3xl w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassPanel material="glass" className="border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl p-0" tilt={false}>
            {/* Header banner */}
            <div className="bg-gradient-to-r from-teal-500/10 via-violet-500/5 to-transparent border-b border-slate-200 dark:border-white/5 px-8 py-8 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-violet-500 p-0.5 flex items-center justify-center shadow-lg shadow-teal-500/10">
                <div className="h-full w-full rounded-[14px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight sm:text-3xl font-display">
                  Privacy & Data Preferences
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
                  Manage your CCPA opt-out, GDPR data subject rights, and consent preferences.
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-8">
              {/* Feedback messages */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold">{successMsg}</span>
                  </motion.div>
                )}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl border border-red-300 dark:border-red-500/20 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold">{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {user ? (
                // --- AUTHENTICATED PORTAL VIEW ---
                <div className="space-y-8">
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-start gap-3">
                    <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Authenticated as {user.name} ({user.email})
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        You have direct access to your data rights. CCPA choices will update in your account immediately.
                      </p>
                    </div>
                  </div>

                  {/* CCPA Do Not Sell Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-teal-500" />
                      CCPA California Consumer Privacy Act
                    </h3>
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Do Not Sell My Personal Information
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                          We do not sell data to third parties. However, enabling this registers your explicit preference to opt-out of any future sharing or advertising networks.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {consent?.doNotSell ? "Opted Out" : "Opted In"}
                        </span>
                        <button
                          onClick={handleCCPAToggle}
                          disabled={submitting}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                            consent?.doNotSell ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              consent?.doNotSell ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GDPR Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-teal-500" />
                      GDPR General Data Protection Regulation Rights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Access Data */}
                      <button
                        onClick={() => handleAuthPrivacyRequest("access")}
                        disabled={submitting}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group"
                      >
                        <Download className="h-6 w-6 text-teal-500 group-hover:scale-110 transition-transform mb-3" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Download Data
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Request a full export of all lead records, meeting metadata, and credentials.
                          </p>
                        </div>
                      </button>

                      {/* Rectify Data */}
                      <button
                        onClick={() => setShowCorrectionForm(!showCorrectionForm)}
                        disabled={submitting}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left flex flex-col justify-between group"
                      >
                        <Edit className="h-6 w-6 text-teal-500 group-hover:scale-110 transition-transform mb-3" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Rectify / Correct
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Submit corrections to phone numbers, email addresses, or company details.
                          </p>
                        </div>
                      </button>

                      {/* Erasure */}
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to request complete deletion of all your personal data? This action is irreversible.")) {
                            handleAuthPrivacyRequest("delete");
                          }
                        }}
                        disabled={submitting}
                        className="p-5 rounded-2xl border border-red-200 dark:border-red-500/10 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-left flex flex-col justify-between group"
                      >
                        <Trash2 className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform mb-3" />
                        <div>
                          <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                            Delete Account
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Hard-delete your user record and leads under the GDPR right to erasure.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Correction form expansion */}
                  <AnimatePresence>
                    {showCorrectionForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/30 space-y-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Specify Data Corrections
                        </h4>
                        <textarea
                          value={correctionText}
                          onChange={(e) => setCorrectionText(e.target.value)}
                          placeholder="Please describe which fields are incorrect and provide the accurate values (e.g. Change contact phone to +1 555-019-2828)..."
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowCorrectionForm(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                          <ExtrudedButton
                            onClick={() => handleAuthPrivacyRequest("rectify", correctionText)}
                            disabled={!correctionText.trim() || submitting}
                          >
                            Submit Correction
                          </ExtrudedButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // --- UNAUTHENTICATED GUEST VIEW ---
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-start gap-3">
                    <Info className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Guest Portal
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        If you have previously submitted a form or booked a demo with us, submit this form using the same email address. We will verify your email and apply your rights to all corresponding lead documents.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUnauthSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          Full Name
                        </label>
                        <SunkenInput
                          type="text"
                          required
                          value={unauthName}
                          onChange={(e) => setUnauthName(e.target.value)}
                          placeholder="Your Name"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          Contact Email
                        </label>
                        <SunkenInput
                          type="email"
                          required
                          value={unauthEmail}
                          onChange={(e) => setUnauthEmail(e.target.value)}
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    {/* Request Type */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        Select Data Right / Action
                      </label>
                      <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50 transition-all cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                      >
                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="ccpa-opt-out">
                          CCPA: Do Not Sell My Personal Information
                        </option>
                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="access">
                          GDPR Art. 15: Download/Access Personal Data
                        </option>
                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="rectify">
                          GDPR Art. 16: Rectify/Update Data Details
                        </option>
                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="delete">
                          GDPR Art. 17: Right to Erasure / Deletion
                        </option>
                      </select>
                    </div>

                    {/* Optional Message */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Details / Message (Optional)
                      </label>
                      <textarea
                        value={unauthMessage}
                        onChange={(e) => setUnauthMessage(e.target.value)}
                        placeholder="Provide details about your request here..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-400/50"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/5">
                      <ExtrudedButton type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />
                            Submitting Request...
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </ExtrudedButton>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </main>
  );
}
