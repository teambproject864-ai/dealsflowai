"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace } from "lucide-react";
import { SPRING_BOUNCY, SPRING_SNAPPY } from "@/lib/immersive3d/motion";

type AuthState = "idle" | "scanning" | "success" | "error";

export function BiometricAuthPanel({ onSuccess }: { onSuccess?: () => void }) {
  const [state, setState] = useState<AuthState>("idle");
  const [mode, setMode] = useState<"fingerprint" | "face">("fingerprint");

  const authenticate = useCallback(async () => {
    setState("scanning");
    try {
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: "required",
            rpId: window.location.hostname,
          },
        } as CredentialRequestOptions);
        setState("success");
        onSuccess?.();
      } else {
        await new Promise((r) => setTimeout(r, 1800));
        setState("success");
        onSuccess?.();
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 1200);
    }
  }, [onSuccess]);

  return (
    <div className="df-glass p-8 max-w-sm w-full text-center" role="region" aria-label="Biometric authentication">
      <div className="flex justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMode("fingerprint")}
          className={`p-2 rounded-lg ${mode === "fingerprint" ? "text-cyan-400" : "text-slate-500"}`}
          aria-pressed={mode === "fingerprint"}
        >
          <Fingerprint className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setMode("face")}
          className={`p-2 rounded-lg ${mode === "face" ? "text-cyan-400" : "text-slate-500"}`}
          aria-pressed={mode === "face"}
        >
          <ScanFace className="h-6 w-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={authenticate}
        disabled={state === "scanning"}
        className="relative mx-auto h-32 w-32 rounded-full df-glass flex items-center justify-center overflow-hidden immersive-touch-press"
        aria-label={mode === "fingerprint" ? "Scan fingerprint" : "Scan face"}
      >
        {mode === "fingerprint" ? (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-4 rounded-full border border-cyan-400/40"
                animate={state === "scanning" ? { scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
            <Fingerprint className="h-12 w-12 text-cyan-300 relative z-10" />
          </>
        ) : (
          <div className="relative h-24 w-20 rounded-[50%] border-2 border-cyan-400/50">
            {state === "scanning" && (
              <motion.div
                className="absolute left-1 right-1 h-0.5 bg-cyan-400 shadow-[0_0_12px_#00D4FF]"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <ScanFace className="absolute inset-0 m-auto h-10 w-10 text-cyan-300" />
          </div>
        )}
      </button>

      <AnimatePresence mode="wait">
        {state === "success" && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-teal-400 font-semibold"
          >
            Verified
          </motion.p>
        )}
        {state === "error" && (
          <motion.p
            initial={{ x: 0 }}
            animate={{ x: [-8, 8, -6, 6, 0] }}
            transition={{ duration: 0.5, type: "tween" }}
            className="mt-4 text-red-400 font-semibold"
          >
            Authentication failed
          </motion.p>
        )}
        {state === "scanning" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-[#C8B8FF] text-sm"
          >
            Scanning…
          </motion.p>
        )}
        {state === "idle" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-[#8B9BB8]">
            Tap to authenticate with {mode === "fingerprint" ? "Touch ID / Windows Hello" : "Face ID"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
