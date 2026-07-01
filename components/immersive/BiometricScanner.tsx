"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, Camera, ShieldAlert, Sparkles, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "@/components/ui/button";

interface BiometricScannerProps {
  onSuccess: () => void;
  onCancel?: () => void;
  roleName?: string;
}

export function BiometricScanner({ onSuccess, onCancel, roleName = "User" }: BiometricScannerProps) {
  const [authMode, setAuthMode] = useState<"fingerprint" | "facial">("fingerprint");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "processing" | "success" | "error">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [webcamAvailable, setWebcamAvailable] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Stop camera stream when component unmounts or auth mode changes
  useEffect(() => {
    if (authMode !== "facial") {
      stopCamera();
    }
  }, [authMode]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Play a procedural sound using Web Audio API oscillators to enhance immersion
  const playBeep = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext block:", e);
    }
  };

  // Trigger Biometric authentication process
  const triggerAuth = async () => {
    if (scanState === "scanning" || scanState === "processing") return;
    setScanProgress(0);
    setScanState("scanning");
    
    // Play scanning intro hum
    playBeep(440, 0.4, "triangle");

    if (authMode === "facial") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setWebcamAvailable(true);
      } catch (err) {
        console.warn("Webcam access rejected:", err);
        setWebcamAvailable(false);
      }
    }

    // Simulate scanning sweep progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      
      // Dynamic scanning beep ticks
      if (progress % 20 === 0) {
        playBeep(650 + progress * 2, 0.08, "sine");
      }

      if (progress >= 100) {
        clearInterval(interval);
        processAuth();
      }
    }, 120);
  };

  const processAuth = () => {
    setScanState("processing");
    playBeep(880, 0.3, "sawtooth");

    // Simulate cryptographic processing / WebAuthn validation challenge
    setTimeout(() => {
      // Simulate random auth success (90% success rate for UX, fallback retry on failure)
      const isOk = Math.random() > 0.15;
      if (isOk) {
        setScanState("success");
        playBeep(1200, 0.5, "sine");
        setTimeout(() => {
          stopCamera();
          onSuccess();
        }, 1200);
      } else {
        setScanState("error");
        playBeep(220, 0.6, "sawtooth");
        stopCamera();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#060612]/90 backdrop-blur-2xl p-6 overflow-y-auto">
      {/* Absolute Space Grid background inside portal */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <GlassPanel 
        material="neon" 
        glow={scanState === "success" ? "primary" : scanState === "error" ? "accent" : "none"}
        className={`w-full max-w-lg p-8 border-white/8 relative flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 ${
          scanState === "error" ? "animate-shake border-rose-500/40" : 
          scanState === "success" ? "border-emerald-500/40" : ""
        }`}
        tilt={true}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,59,255,0.06),transparent_60%)] pointer-events-none" />

        <div className="relative space-y-6">
          
          {/* Top Shield Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-sans uppercase tracking-wider">Biometric Verification</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Access Node: {roleName}</p>
              </div>
            </div>
            
            {/* Modal Selector */}
            <div className="flex bg-white/3 border border-white/8 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => { setAuthMode("fingerprint"); setScanState("idle"); }}
                className={`px-3 py-1 rounded-md transition-all font-semibold uppercase tracking-wider ${
                  authMode === "fingerprint" ? "bg-teal-500 text-white shadow" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Touch
              </button>
              <button
                onClick={() => { setAuthMode("facial"); setScanState("idle"); }}
                className={`px-3 py-1 rounded-md transition-all font-semibold uppercase tracking-wider ${
                  authMode === "facial" ? "bg-teal-500 text-white shadow" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Face ID
              </button>
            </div>
          </div>

          {/* Visual Scanner Area */}
          <div className="relative aspect-square max-w-[280px] mx-auto rounded-full bg-slate-950/80 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Fingerprint Scanning Graphics */}
            {authMode === "fingerprint" && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Sweep scan bar */}
                {scanState === "scanning" && (
                  <motion.div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00D4FF] z-10"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Ambient fingerprint pulse grid */}
                <div className={`transition-all duration-500 ${
                  scanState === "scanning" ? "text-cyan-400 scale-105" :
                  scanState === "processing" ? "text-amber-400 animate-pulse" :
                  scanState === "success" ? "text-emerald-400 scale-110" :
                  scanState === "error" ? "text-rose-500 animate-bounce" : "text-slate-700"
                }`}>
                  <Fingerprint className="w-40 h-40 stroke-[1.25]" />
                </div>

                {/* Floating wave concentric rings */}
                {scanState === "scanning" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-ping" />
                    <span className="absolute w-24 h-24 rounded-full border border-cyan-500/10 animate-ping delay-300" />
                  </div>
                )}
              </div>
            )}

            {/* Facial Recognition Graphics */}
            {authMode === "facial" && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Horizontal scanning laser */}
                {scanState === "scanning" && (
                  <motion.div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#14b8a6] z-10"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Webcam Video element */}
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover rounded-full scale-x-[-1] transition-opacity duration-300 ${
                    scanState !== "idle" && webcamAvailable ? "opacity-70" : "opacity-0"
                  }`}
                  muted
                  playsInline
                />

                {/* Camera fallback vector */}
                {(!webcamAvailable || scanState === "idle") && (
                  <Camera className={`w-32 h-32 stroke-[1.0] transition-colors ${
                    scanState === "processing" ? "text-amber-400 animate-pulse" :
                    scanState === "success" ? "text-emerald-400" :
                    scanState === "error" ? "text-rose-500" : "text-slate-700"
                  }`} />
                )}

                {/* Face outline overlays */}
                <div className="absolute inset-8 rounded-full border border-dashed border-white/10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-white/20 rounded-full" />
              </div>
            )}

            {/* Scanning details overlay */}
            <AnimatePresence>
              {scanState !== "idle" && (
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-slate-950 to-transparent text-center space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {scanState === "scanning" && `Reading telemetry data... ${scanProgress}%`}
                    {scanState === "processing" && "Verifying WebAuthn handshake..."}
                    {scanState === "success" && "ACCESS GRANTED"}
                    {scanState === "error" && "AUTHENTICATION FAILURE"}
                  </div>
                  
                  {scanState === "scanning" && (
                    <div className="w-24 bg-white/5 h-1 rounded overflow-hidden mx-auto">
                      <div className="bg-cyan-500 h-full" style={{ width: `${scanProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Verification Status Description */}
          <div className="text-center space-y-2">
            {scanState === "idle" && (
              <p className="text-sm text-slate-400 leading-relaxed">
                Position your {authMode === "fingerprint" ? "registered fingerprint" : "face directly in the camera outline"} to initiate passwordless cryptographic handshakes.
              </p>
            )}
            {scanState === "scanning" && (
              <p className="text-sm text-cyan-300 font-semibold animate-pulse">
                DO NOT MOVE. Scanning biometric landmarks...
              </p>
            )}
            {scanState === "processing" && (
              <p className="text-sm text-amber-300 font-semibold flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Validating cryptographic keys on secure enclaves...
              </p>
            )}
            {scanState === "success" && (
              <p className="text-sm text-emerald-400 font-bold flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 animate-bounce" />
                Decryption successful! Launching secure portal...
              </p>
            )}
            {scanState === "error" && (
              <div className="space-y-3">
                <p className="text-sm text-rose-400 font-bold flex items-center justify-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  Credentials rejected. Please try again.
                </p>
                <Button 
                  onClick={triggerAuth} 
                  className="mx-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs uppercase font-bold tracking-wider px-5 h-9"
                >
                  Retry Scan
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className="flex gap-4 pt-6 border-t border-white/5 mt-6">
          {onCancel && (
            <Button
              variant="outline"
              onClick={() => { stopCamera(); onCancel(); }}
              className="flex-1 h-11 border-white/8 bg-white/3 hover:bg-white/5 text-xs font-bold uppercase tracking-wider rounded-xl text-white"
            >
              Cancel Access
            </Button>
          )}
          {scanState === "idle" && (
            <Button
              onClick={triggerAuth}
              className="flex-1 h-11 bg-teal-500 hover:bg-teal-400 text-xs font-bold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-teal-500/20"
            >
              Start Verification
            </Button>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
