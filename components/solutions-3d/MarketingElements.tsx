"use client";

import { useState } from "react";
import { Html, Float } from "@react-three/drei";
import { DataPanel } from "./DataPanel";

export function MarketingElements({ position }: { position: [number, number, number] }) {
  const [roi, setRoi] = useState(250000);

  return (
    <group position={position}>
      {/* ROI Calculator Sphere */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[-4, 0, 0]}>
          <sphereGeometry args={[1.5, 64, 64]} />
          <meshStandardMaterial
            color="#0f766e"
            roughness={0.15}
            metalness={0.6}
            emissive="#0d9488"
            emissiveIntensity={0.25}
          />
          <Html distanceFactor={10} position={[0, 0, 1.6]}>
            <div className="pointer-events-none w-[200px] text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-teal-200">Est. annual impact</div>
              <div className="text-4xl font-black text-white drop-shadow-lg">${roi.toLocaleString()}</div>
              <div className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
                +142% PIPELINE EFFICIENCY
              </div>
            </div>
          </Html>
        </mesh>
      </Float>

      {/* Testimonial Panels */}
      <DataPanel position={[4, 1.5, 0]} title="PIPELINE IMPACT" width="300px">
        <div className="italic text-slate-300 mb-2">
          &quot;The autonomous logic layer completely transformed our scalability. We&apos;re processing 5x more information with near-zero latency.&quot;
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500" />
          <div>
            <div className="font-bold text-white text-xs">Director of Operations</div>
            <div className="text-[10px] text-slate-500">Global Tech Enterprise</div>
          </div>
        </div>
      </DataPanel>

      <DataPanel position={[4, -1.5, 0]} title="REVENUE METRICS" width="300px">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Time Saved</span>
            <span className="text-emerald-400">84%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[84%]" />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Data Integrity</span>
            <span className="text-blue-400">99.99%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[99%]" />
          </div>
        </div>
      </DataPanel>
    </group>
  );
}
