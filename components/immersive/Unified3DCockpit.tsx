"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { 
  Cpu, 
  Database, 
  Brain, 
  ShieldAlert, 
  Info, 
  RefreshCw, 
  Zap, 
  ChevronRight, 
  Maximize2, 
  Layers, 
  Sliders, 
  MousePointer, 
  ToggleLeft, 
  ToggleRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Procedural 3D Sub-Models
function HermesNode({ active, onClick, reducedMotion }: { active: boolean; onClick: () => void; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.4;
      meshRef.current.rotation.x = t * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.5;
    }
  });

  return (
    <group position={[-3, 1.8, 0]}>
      {/* Click target box */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Visible core */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial 
          color={active ? "#14b8a6" : "#0d9488"} 
          emissive={active ? "#14b8a6" : "#0f766e"} 
          roughness={0.1} 
          metalness={0.8}
          wireframe
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#2dd4bf" roughness={0.2} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.04, 8, 32]} />
        <meshStandardMaterial color="#14b8a6" emissive="#0f766e" />
      </mesh>
    </group>
  );
}

function PalaceNode({ active, onClick, reducedMotion }: { active: boolean; onClick: () => void; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[3, 1.8, 0]}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Structured Cabinet */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[1.6, 1.8, 0.5]} />
        <meshStandardMaterial color={active ? "#0284c7" : "#0f172a"} roughness={0.4} metalness={0.5} wireframe />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.3, 0.4, 0.4]} />
        <meshStandardMaterial color={active ? "#38bdf8" : "#1e293b"} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 0.4, 0.4]} />
        <meshStandardMaterial color={active ? "#38bdf8" : "#1e293b"} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[1.3, 0.4, 0.4]} />
        <meshStandardMaterial color={active ? "#38bdf8" : "#1e293b"} />
      </mesh>
    </group>
  );
}

function AlmaNode({ active, onClick, reducedMotion }: { active: boolean; onClick: () => void; reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = Math.sin(t * 0.4) * 0.2;
    }
  });

  return (
    <group position={[-3, -1.8, 0]}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Geodesic Neural Node */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial 
          color={active ? "#818cf8" : "#4f46e5"} 
          emissive={active ? "#818cf8" : "#312e81"}
          wireframe 
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#6366f1" roughness={0.1} />
      </mesh>
    </group>
  );
}

function ClawpatrolNode({ active, onClick, reducedMotion }: { active: boolean; onClick: () => void; reducedMotion: boolean }) {
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = -t * 0.4;
    }
  });

  return (
    <group position={[3, -1.8, 0]}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Shield containment */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial 
          color={active ? "#fb7185" : "#e11d48"} 
          emissive={active ? "#f43f5e" : "#881337"} 
          wireframe 
        />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.1} />
      </mesh>
    </group>
  );
}

// Center Connector Core representing the reasoning hub
function ReasoningHub({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      const scaleVal = 1 + Math.sin(t * 2) * 0.08;
      meshRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#6C3BFF" 
          roughness={0.1} 
          metalness={0.9} 
          wireframe
        />
      </mesh>
      <pointLight distance={10} intensity={2.5} color="#6C3BFF" />
    </group>
  );
}

// Drawing data flow wires connecting center core to the nodes
function DataStreams() {
  return (
    <group>
      {/* Hermes stream */}
      <mesh rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.015, 0.015, 3.5]} />
        <meshBasicMaterial color="#14b8a6" opacity={0.3} transparent />
      </mesh>

      {/* Palace stream */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.015, 0.015, 3.5]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.3} transparent />
      </mesh>

      {/* ALMA stream */}
      <mesh rotation={[0, 0, Math.PI / 3.5]}>
        <cylinderGeometry args={[0.015, 0.015, 3.5]} />
        <meshBasicMaterial color="#818cf8" opacity={0.3} transparent />
      </mesh>

      {/* Clawpatrol stream */}
      <mesh rotation={[0, 0, -Math.PI / 3.5]}>
        <cylinderGeometry args={[0.015, 0.015, 3.5]} />
        <meshBasicMaterial color="#f43f5e" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

const SYSTEMS_HUD = [
  {
    id: "hermes",
    name: "Memory OS (Hermes)",
    tag: "Foundational Storage Engine",
    icon: Cpu,
    color: "text-teal-400 border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10",
    desc: "Unifies volatile interactions, short-term states, and permanent client indexes using low-latency cache systems and REST security partitions.",
    capabilities: [
      "4-Tier memory layout layout mapping.",
      "Transparent field-level AES encryption.",
      "LRU Cache decreasing database query hits by 60%."
    ],
    synergy: "Feeds structured values directly into MEM Palace, securing variables from external jailbreaks before ALMA analysis models fetch them.",
    benefit: "Predictable, low-overhead performance for instant chatbot memory loading."
  },
  {
    id: "palace",
    name: "MEM Palace",
    tag: "Centralized File Organizer",
    icon: Database,
    color: "text-sky-400 border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10",
    desc: "Organizes raw texts, call details, and webhook updates into structured relational modules, giving AI models immediate index reference points.",
    capabilities: [
      "Objections classification filters.",
      "Tamper-proof file modification access logs.",
      "Bi-directional synchronization paths to Salesforce/HubSpot."
    ],
    synergy: "Organizes logs stored by Hermes, generating index references for ALMA continuous learning models to query.",
    benefit: "Ensures complete history retention of client objectives across sales campaigns."
  },
  {
    id: "alma",
    name: "ALMA",
    tag: "Cognitive Vector Engine",
    icon: Brain,
    color: "text-violet-400 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10",
    desc: "Executes similarity comparisons using Pinecone index databases, promotions, and auto-forgetting routines to filter out stale conversation contexts.",
    capabilities: [
      "Dynamic high-dimensional vector search embeddings.",
      "Short-Term to Long-Term memory promotion metrics.",
      "Forgetting mechanism to prevent context bloat."
    ],
    synergy: "Consolidates working memories indexed inside MEM Palace, creating the vectors that formulate real-time client outbound replies.",
    benefit: "Enables agents to adapt based on previous conversations while minimizing token costs."
  },
  {
    id: "clawpatrol",
    name: "Agent Security Firewall (Clawpatrol)",
    tag: "Zero-Trust Active Isolation",
    icon: ShieldAlert,
    color: "text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10",
    desc: "Inspects inbound instructions and outbound replies to block prompt injection attacks, scrub private fields (PII), and identify behavioral anomalies.",
    capabilities: [
      "Scans 15+ injection/jailbreak patterns.",
      "Automated outbound email/phone number redaction.",
      "Anomaly scoring blocking accounts at >90%."
    ],
    synergy: "Monitors the input/output boundaries of Hermes storage queries, halting malicious context extractions.",
    benefit: "Complete protection against data exfiltration, ensuring SOC2 operational compliance."
  }
];

export function Unified3DCockpit() {
  const [activeSystem, setActiveSystem] = useState<string>("hermes");
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem("df_reduce_motion");
    if (saved) {
      setReducedMotion(saved === "true");
    }
  }, []);

  const toggleMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    localStorage.setItem("df_reduce_motion", String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add("reduce-motion-force");
    } else {
      document.documentElement.classList.remove("reduce-motion-force");
    }
  };

  const selectedData = SYSTEMS_HUD.find(s => s.id === activeSystem) || SYSTEMS_HUD[0];
  const SelectedIcon = selectedData.icon;

  return (
    <div className="w-full min-h-[600px] h-[calc(100vh-140px)] border border-white/10 rounded-[2.5rem] bg-[#03030c] overflow-hidden flex flex-col lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] relative shadow-2xl">
      
      {/* 1. Immersive 3D Space Scene Area */}
      <div className="relative w-full h-full flex-grow lg:h-full bg-radial-gradient">
        
        {/* Telemetry Indicator overlays */}
        <div className="absolute top-6 left-6 z-10 space-y-1 text-left select-none pointer-events-none">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            ARCHITECTURAL MAP
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
            Interactive System Topography Cockpit
          </p>
        </div>

        {/* Global Motion Control inside the cockpit */}
        <div className="absolute bottom-6 left-6 z-10">
          <button
            onClick={toggleMotion}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-[#090918]/80 hover:bg-[#121228] transition-all font-mono text-[9px] font-bold text-slate-400"
          >
            Animations: {reducedMotion ? <ToggleRight className="h-4 w-4 text-teal-400" /> : <ToggleLeft className="h-4 w-4 text-slate-600" />}
          </button>
        </div>

        {/* Interactive Helper Overlay */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 font-mono text-[8px] bg-white/5 px-2.5 py-1 rounded-lg text-slate-400 pointer-events-none border border-white/5">
          <MousePointer className="h-3 w-3" /> CLICK NODES TO INVESTIGATE
        </div>

        {/* The Single Canvas rendering the integrated systems */}
        <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#818cf8" />
          <spotLight position={[-5, 5, 5]} angle={0.25} intensity={2.0} color="#14b8a6" />
          <pointLight position={[0, -5, 5]} intensity={1.0} color="#f43f5e" />

          {/* Unified System Nodes */}
          <HermesNode active={activeSystem === "hermes"} onClick={() => setActiveSystem("hermes")} reducedMotion={reducedMotion} />
          <PalaceNode active={activeSystem === "palace"} onClick={() => setActiveSystem("palace")} reducedMotion={reducedMotion} />
          <AlmaNode active={activeSystem === "alma"} onClick={() => setActiveSystem("alma")} reducedMotion={reducedMotion} />
          <ClawpatrolNode active={activeSystem === "clawpatrol"} onClick={() => setActiveSystem("clawpatrol")} reducedMotion={reducedMotion} />
          
          {/* Core Reasoning Hub & Wires */}
          <ReasoningHub reducedMotion={reducedMotion} />
          <DataStreams />

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3.5}
            maxDistance={8}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.8}
          />
        </Canvas>
      </div>

      {/* 2. Unified Side Panel HUD Card */}
      <div className="w-full lg:h-full border-t lg:border-t-0 lg:border-l border-white/10 bg-[#060612]/95 backdrop-blur-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6 select-none relative z-10">
        <div className="space-y-6">
          
          {/* Quick node navigation */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Node Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYSTEMS_HUD.map((s) => {
                const Icon = s.icon;
                const isSelected = s.id === activeSystem;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSystem(s.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-teal-500/30 bg-teal-500/10 text-white shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                        : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-[10px] font-bold truncate leading-none">{s.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Active node detail presentation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSystem}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5 text-left"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400">
                  {selectedData.tag}
                </span>
                <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  <SelectedIcon className="h-5 w-5 text-teal-400" />
                  {selectedData.name}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {selectedData.desc}
              </p>

              {/* Capabilities checklist */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-teal-400" /> Key Features
                </label>
                <ul className="space-y-1.5">
                  {selectedData.capabilities.map((cap, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-tight">
                      <ChevronRight className="h-3.5 w-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* System Synergy */}
              <div className="space-y-1.5 p-3 rounded-xl border border-white/5 bg-white/5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-teal-400 animate-spin-slow" /> Integration Synergy
                </label>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {selectedData.synergy}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Benefits banner */}
        <div className="border-t border-white/5 pt-4 text-left">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
            <Zap className="h-3 w-3 text-amber-400" /> Architecture Outcome
          </label>
          <p className="text-xs font-semibold text-teal-300">
            {selectedData.benefit}
          </p>
        </div>
      </div>
    </div>
  );
}
