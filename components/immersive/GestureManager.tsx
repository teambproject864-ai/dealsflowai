"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Loader2, Camera, HelpCircle, AlertCircle } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

export function GestureManager() {
  const { inputModality, setInputModality, setVoiceListening } = useExperience();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [activeGesture, setActiveGesture] = useState<string>("Initializing...");
  const [confidence, setConfidence] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const detectIntervalRef = useRef<number | null>(null);

  // Active only when camera/gesture modality is selected
  const isEnabled = inputModality === "camera" || inputModality === "gesture";

  useEffect(() => {
    if (!isEnabled) {
      stopCamera();
      return;
    }

    let active = true;
    async function startCameraAndModel() {
      try {
        setModelLoading(true);
        setModelError(null);

        // 1. Get webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });
        
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // 2. Dynamically import TensorFlow.js and HandPose model
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const handpose = await import("@tensorflow-models/handpose");
        const model = await handpose.load();

        if (!active) return;
        setModelLoading(false);

        // 3. Start hand tracking loop
        let openPalmStartTime = 0;
        
        const detect = async () => {
          if (!videoRef.current || !canvasRef.current || !active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          try {
            const predictions = await model.estimateHands(video);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (predictions.length > 0) {
              const hand = predictions[0];
              const landmarks = hand.landmarks; // 21 3D coordinates
              
              // Draw skeletal landmarks in neon colors
              ctx.fillStyle = "#00D4FF";
              ctx.strokeStyle = "rgba(108, 59, 255, 0.6)";
              ctx.lineWidth = 2;

              // Draw connections
              const drawLine = (p1: number, p2: number) => {
                ctx.beginPath();
                ctx.moveTo(landmarks[p1][0], landmarks[p1][1]);
                ctx.lineTo(landmarks[p2][0], landmarks[p2][1]);
                ctx.stroke();
              };

              // Thumb
              for (let i = 0; i < 4; i++) drawLine(i, i + 1);
              // Index
              drawLine(0, 5); for (let i = 5; i < 8; i++) drawLine(i, i + 1);
              // Middle
              drawLine(0, 9); for (let i = 9; i < 12; i++) drawLine(i, i + 1);
              // Ring
              drawLine(0, 13); for (let i = 13; i < 16; i++) drawLine(i, i + 1);
              // Pinky
              drawLine(0, 17); for (let i = 17; i < 20; i++) drawLine(i, i + 1);

              // Draw joints
              landmarks.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
              });

              // Gesture classification logic
              const thumbTip = landmarks[4];
              const indexTip = landmarks[8];
              const middleTip = landmarks[12];
              const ringTip = landmarks[16];
              const pinkyTip = landmarks[20];
              const wrist = landmarks[0];

              // Calculate distance helper
              const dist = (pt1: number[], pt2: number[]) => 
                Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));

              const pinchDist = dist(thumbTip, indexTip);
              const isPinching = pinchDist < 25;

              // Check if fingers are extended (open palm vs fist)
              const indexExtended = indexTip[1] < landmarks[6][1];
              const middleExtended = middleTip[1] < landmarks[10][1];
              const ringExtended = ringTip[1] < landmarks[14][1];
              const pinkyExtended = pinkyTip[1] < landmarks[18][1];

              let currentGesture = "Detecting...";
              let currentConfidence = 0.5;

              if (isPinching) {
                currentGesture = "INDEX PINCH (CLICK)";
                currentConfidence = 0.95;
                
                // Dispatch click at simulated pointer position
                const simulatedClick = new CustomEvent("df-spatial-click", {
                  detail: { x: indexTip[0], y: indexTip[1] }
                });
                window.dispatchEvent(simulatedClick);

              } else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
                currentGesture = "POINTING (CURSOR)";
                currentConfidence = 0.90;
                
                // Override mouse coordinates
                const normalizedX = (indexTip[0] / canvas.width);
                const normalizedY = (indexTip[1] / canvas.height);
                window.dispatchEvent(new CustomEvent("df-spatial-move", {
                  detail: { x: normalizedX, y: normalizedY }
                }));

              } else if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
                currentGesture = "OPEN PALM (VOICE)";
                currentConfidence = 0.85;
                
                // Activate voice mode if held for 1s
                if (openPalmStartTime === 0) {
                  openPalmStartTime = Date.now();
                } else if (Date.now() - openPalmStartTime > 1000) {
                  setVoiceListening(true);
                  setInputModality("voice");
                  openPalmStartTime = 0; // reset
                }
              } else {
                openPalmStartTime = 0;
              }

              setActiveGesture(currentGesture);
              setConfidence(currentConfidence);
            } else {
              openPalmStartTime = 0;
              setActiveGesture("No Hand Detected");
              setConfidence(0);
            }
          } catch (e) {
            console.error("Frame estimation failed:", e);
          }

          if (active) {
            detectIntervalRef.current = window.requestAnimationFrame(detect);
          }
        };

        detectIntervalRef.current = window.requestAnimationFrame(detect);
      } catch (err) {
        console.warn("Webcam access rejected or tensorflow load error:", err);
        if (active) {
          setModelError("Webcam permissions blocked or hardware acceleration inactive.");
          setModelLoading(false);
        }
      }
    }

    startCameraAndModel();

    return () => {
      active = false;
      stopCamera();
    };
  }, [isEnabled, setVoiceListening, setInputModality]);

  const stopCamera = () => {
    if (detectIntervalRef.current) {
      window.cancelAnimationFrame(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Touch fallback listeners (swipes and pinches)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;

        // Threshold swipe check
        if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
          const dir = deltaX > 0 ? "right" : "left";
          window.dispatchEvent(new CustomEvent("df-swipe-navigation", { detail: { direction: dir } }));
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div className="fixed top-24 right-6 z-[100] w-64 pointer-events-auto">
      <GlassPanel material="neon" glow="primary" className="p-4 space-y-4 border-teal-500/30">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-teal-400" />
            Spatial Tracking Mirror
          </span>
          <button 
            onClick={() => setInputModality("pointer")}
            className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-wider"
          >
            Close
          </button>
        </div>

        {/* Video feed layer */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5">
          {modelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-black/80 z-20">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500 mb-2" />
              <span className="text-[10px] text-slate-400 font-medium">Downloading TFJS models...</span>
            </div>
          )}
          
          {modelError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-rose-950/80 z-20">
              <AlertCircle className="h-6 w-6 text-rose-400 mb-2" />
              <span className="text-[10px] text-slate-300 font-medium leading-normal">{modelError}</span>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none"
          />
        </div>

        {/* Gesture Recognition HUD */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Active gesture</span>
            <span className="text-teal-400 font-bold uppercase tracking-wider">HUD HUD</span>
          </div>
          <div className="text-sm font-extrabold text-white">{activeGesture}</div>
          
          {confidence > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                <span>Confidence</span>
                <span>{Math.round(confidence * 100)}%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                <div 
                  className="bg-teal-500 h-full transition-all duration-300" 
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Gesture instructions */}
        <div className="text-[9px] text-slate-500 leading-normal flex items-start gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-600 mt-0.5" />
          <p>
            Pinch (index+thumb) to select buttons. Hold Open Palm for 1s to start Voice Commands. Point finger to move cursor.
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
