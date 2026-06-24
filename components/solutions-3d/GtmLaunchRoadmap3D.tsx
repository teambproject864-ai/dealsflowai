"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Html,
  Float,
  Line,
  PerformanceMonitor,
  BakeShadows,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { GtmMilestone, seedGtmMilestones } from "@/lib/seed-data";
import { useFirestoreCollection } from "@/lib/firestore-realtime";
import { OnboardingTour } from "./OnboardingTour";

// ─── Milestone Node ────────────────────────────────────────────────────────────

function MilestoneNode({
  milestone,
  onClick,
  isSelected,
}: {
  milestone: GtmMilestone;
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    if (milestone.status === "completed") return "#10b981";
    if (milestone.status === "in-progress") return "#f59e0b";
    return "#6366f1";
  }, [milestone.status]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
    }
    if (ringRef.current && milestone.status === "in-progress") {
      ringRef.current.rotation.z += delta * 1.2;
    }
  });

  return (
    <group
      position={milestone.position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.9 : 0.3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Spinning ring for in-progress */}
        {milestone.status === "in-progress" && (
          <mesh ref={ringRef}>
            <torusGeometry args={[0.85, 0.04, 8, 40]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.8}
            />
          </mesh>
        )}

        {/* Label */}
        <Text
          position={[0, -1.0, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          {milestone.title}
        </Text>

        {/* Progress bar ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <torusGeometry args={[0.55, 0.06, 4, 64, (milestone.completionPct / 100) * Math.PI * 2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>

        {/* Click detail panel */}
        {isSelected && (
          <Html distanceFactor={8} position={[0, 1.6, 0]}>
            <div className="pointer-events-none w-[clamp(180px,40vw,240px)] rounded-xl border border-white/10 bg-slate-900/90 p-3 backdrop-blur-md shadow-2xl hidden md:block">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {milestone.territory}
              </div>
              <div className="text-sm font-bold text-white">{milestone.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Owner</span>
                <span className="text-teal-400">{milestone.owner}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Due</span>
                <span className="text-white">{milestone.dueDate}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${milestone.completionPct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <div className="mt-1 text-right text-[10px] text-slate-400">
                {milestone.completionPct}% complete
              </div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

// ─── Dependency Arc ───────────────────────────────────────────────────────────

function DependencyArc({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = useMemo(() => {
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 2,
      (from[2] + to[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(40);
  }, [from, to]);

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={1}
      transparent
      opacity={0.35}
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

// ─── Globe Territory ──────────────────────────────────────────────────────────

function TerritoryGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group position={[0, -4, -6]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#1e3a5f"
          emissiveIntensity={0.3}
          roughness={0.9}
          metalness={0.1}
          wireframe
        />
      </mesh>
      {/* Territory hemispheres */}
      {[
        { color: "#10b981", rot: [0, 0, 0] as [number, number, number] },
        { color: "#6366f1", rot: [0, Math.PI / 2, 0] as [number, number, number] },
        { color: "#f59e0b", rot: [0, Math.PI, 0] as [number, number, number] },
        { color: "#ec4899", rot: [0, -Math.PI / 2, 0] as [number, number, number] },
      ].map(({ color, rot }, i) => (
        <mesh key={i} rotation={rot}>
          <sphereGeometry args={[2.52, 16, 16, 0, Math.PI * 0.4]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.18}
            emissive={color}
            emissiveIntensity={0.4}
            side={THREE.FrontSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main 3D Scene ────────────────────────────────────────────────────────────

import { useWebGLAvailable } from "./useWebGLAvailable";
import { CheckCircle2, PlayCircle, Calendar, ArrowRight, User } from "lucide-react";

export function GtmLaunchRoadmap3D() {
  const [dpr, setDpr] = useState(1.5);
  const [perf, setPerf] = useState<"high" | "low">("high");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isGl = useWebGLAvailable();

  const { data: milestones } = useFirestoreCollection<GtmMilestone>(
    "gtm_progress",
    [],
    seedGtmMilestones
  );

  const milestoneMap = useMemo(() => {
    const map = new Map<string, GtmMilestone>();
    milestones.forEach((m) => map.set(m.id, m));
    return map;
  }, [milestones]);

  const avgCompletion = useMemo(() => {
    if (milestones.length === 0) return 0;
    return Math.round(milestones.reduce((acc, m) => acc + m.completionPct, 0) / milestones.length);
  }, [milestones]);

  const selectedMilestone = useMemo(() => {
    return milestones.find(m => m.id === selectedId) || null;
  }, [milestones, selectedId]);

  if (!isGl) {
    // Premium 2D GTM Roadmap Timeline Fallback
    return (
      <div className="h-full w-full bg-[#030712] text-white pt-16 px-6 pb-6 overflow-hidden select-none flex flex-col justify-between">
        
        {/* Header summary */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-white/5 bg-slate-900/35 backdrop-blur-md rounded-2xl p-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              GTM Launch Roadmap
              <span className="text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                2D Strategic Timeline
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              Launch roadmap milestones, dependencies and territory statuses
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-center">
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">GTM Completion</div>
              <div className="text-white font-bold">{avgCompletion}%</div>
            </div>
            <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl">
              <div className="text-slate-500 text-[10px] uppercase">Milestones</div>
              <div className="text-indigo-400 font-bold">{milestones.length} Total</div>
            </div>
          </div>
        </div>

        {/* Timeline Path Flow */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-270px)] py-2">
          {milestones.map((m) => {
            const isSelected = selectedId === m.id;
            const statusColor = 
              m.status === "completed" ? "text-emerald-400" :
              m.status === "in-progress" ? "text-amber-400" : "text-indigo-400";
            const StatusIcon = 
              m.status === "completed" ? CheckCircle2 :
              m.status === "in-progress" ? PlayCircle : Calendar;

            return (
              <div 
                key={m.id}
                onClick={() => setSelectedId(isSelected ? null : m.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isSelected 
                    ? "bg-white/10 border-white/30 shadow-lg shadow-white/5" 
                    : "bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/60"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <StatusIcon className={`h-6 w-6 shrink-0 ${statusColor}`} />
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {m.title}
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                        {m.territory}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {m.owner}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {m.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar and percentage */}
                <div className="w-full md:w-60 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Progress</span>
                    <span className="font-bold text-white">{m.completionPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${m.completionPct}%`,
                        backgroundColor: m.status === "completed" ? "#10b981" : m.status === "in-progress" ? "#f59e0b" : "#6366f1"
                      }}
                    />
                  </div>
                  {m.dependencies.length > 0 && (
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider truncate">
                      Depends on: {m.dependencies.map(depId => milestoneMap.get(depId)?.title || depId).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Milestone Detail HUD */}
        {selectedMilestone && (
          <div className="mt-4 p-4 border border-teal-500/20 bg-teal-950/10 rounded-2xl flex justify-between items-center animate-fade-in">
            <div className="flex gap-6 items-center">
              <div>
                <div className="text-xs text-slate-400">Milestone</div>
                <div className="text-sm font-bold text-white">{selectedMilestone.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Owner Unit</div>
                <div className="text-sm font-bold text-white">{selectedMilestone.owner}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Territory Scope</div>
                <div className="text-sm font-bold text-teal-400">{selectedMilestone.territory}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Milestone ID</div>
              <div className="text-sm font-mono text-white">{selectedMilestone.id}</div>
            </div>
          </div>
        )}

      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (milestones.length === 0) return;
    const currentIndex = milestones.findIndex((m) => m.id === selectedId);
    if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % milestones.length;
      setSelectedId(milestones[nextIndex].id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + milestones.length) % milestones.length;
      setSelectedId(milestones[prevIndex].id);
    } else if (e.key === "Escape") {
      setSelectedId(null);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectedId) {
        setSelectedId(null);
      } else {
        setSelectedId(milestones[0].id);
      }
    }
  };

  return (
    <div
      className="relative h-full w-full focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:outline-none rounded-3xl overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="3D GTM Launch Roadmap. Use Arrow keys or Tab key to cycle through milestones, and Escape to clear selection."
    >
      <OnboardingTour sceneKey="gtm" />
      {/* Screen-reader accessible GTM milestones data table */}
      <table className="sr-only">
        <caption>GTM Launch Roadmap Milestones</caption>
        <thead>
          <tr>
            <th scope="col">Milestone</th>
            <th scope="col">Status</th>
            <th scope="col">Completion</th>
            <th scope="col">Owner</th>
            <th scope="col">Territory</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{m.status}</td>
              <td>{m.completionPct}%</td>
              <td>{m.owner}</td>
              <td>{m.territory}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Canvas shadows dpr={dpr} onClick={() => setSelectedId(null)}>
        <PerformanceMonitor
          onIncline={() => { setDpr(2); setPerf("high"); }}
          onDecline={() => { setDpr(1); setPerf("low"); }}
        />
        {perf === "low" && <BakeShadows />}

        <PerspectiveCamera makeDefault position={[3, 5, 18]} fov={50} />
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={30}
          autoRotate={perf === "high"}
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 12, 10]} intensity={3} color="#6366f1" castShadow />
        <pointLight position={[-8, 8, -5]} intensity={2} color="#10b981" />
        <spotLight position={[0, 15, 5]} angle={0.3} penumbra={1} intensity={4} color="#818cf8" />

        {perf === "high" && (
          <Stars radius={120} depth={60} count={3000} factor={3} fade speed={0.5} />
        )}

        {/* Dependency arcs */}
        {milestones.map((m) =>
          m.dependencies.map((depId) => {
            const dep = milestoneMap.get(depId);
            if (!dep) return null;
            return (
              <DependencyArc
                key={`arc-${depId}-${m.id}`}
                from={dep.position}
                to={m.position}
              />
            );
          })
        )}

        {/* Milestone nodes */}
        {milestones.map((m) => (
          <MilestoneNode
            key={m.id}
            milestone={m}
            isSelected={selectedId === m.id}
            onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
          />
        ))}

        {/* Globe */}
        <TerritoryGlobe />

        {/* Ground grid */}
        <gridHelper args={[40, 40, "#1e293b", "#1e293b"]} position={[0, -1.5, 0]} />
      </Canvas>

      {/* HUD overlay */}
      <div className="pointer-events-none absolute left-6 top-6 space-y-1">
        {[
          { color: "bg-emerald-500", label: "Completed" },
          { color: "bg-amber-500", label: "In Progress" },
          { color: "bg-indigo-500", label: "Upcoming" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-6 text-[10px] uppercase tracking-widest text-slate-500">
        Real-time sync · {milestones.length} milestones
      </div>

      {/* Mobile / Responsive Bottom Sheet for Milestone Details */}
      {selectedMilestone && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex justify-between items-center z-20 pointer-events-auto md:hidden animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  selectedMilestone.status === "completed" ? "#10b981" :
                  selectedMilestone.status === "in-progress" ? "#f59e0b" : "#6366f1"
              }}
            />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectedMilestone.territory} · {selectedMilestone.owner}
              </div>
              <div className="text-sm font-bold text-white">{selectedMilestone.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {selectedMilestone.completionPct}% complete · Due: {selectedMilestone.dueDate}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedId(null)}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 active:bg-white/10"
            style={{ minHeight: "44px", minWidth: "44px" }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

