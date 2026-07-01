"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Point } from "@react-three/drei";
import * as THREE from "three";

function PointsCloud({ count = 1200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Create three clusters representing SaaS (cyan), Enterprise (purple), and Growth (gold)
      const cluster = i % 3;
      let x = 0, y = 0, z = 0;

      if (cluster === 0) {
        // SaaS cluster (left-ish)
        x = (Math.random() - 0.5) * 4 - 2;
        y = (Math.random() - 0.5) * 4 + 1;
        z = (Math.random() - 0.5) * 4;
        cols[i * 3] = 0.08;      // Cyan
        cols[i * 3 + 1] = 0.72;
        cols[i * 3 + 2] = 0.65;
      } else if (cluster === 1) {
        // Enterprise cluster (right-ish)
        x = (Math.random() - 0.5) * 5 + 2;
        y = (Math.random() - 0.5) * 5 - 1;
        z = (Math.random() - 0.5) * 5;
        cols[i * 3] = 0.49;      // Violet
        cols[i * 3 + 1] = 0.23;
        cols[i * 3 + 2] = 0.93;
      } else {
        // Growth cluster (centered)
        x = (Math.random() - 0.5) * 3;
        y = (Math.random() - 0.5) * 3;
        z = (Math.random() - 0.5) * 3 - 2;
        cols[i * 3] = 0.96;      // Gold
        cols[i * 3 + 1] = 0.62;
        cols[i * 3 + 2] = 0.04;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }

    return [pos, cols];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    // Slow continuous rotation
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function ScatterCloud3D() {
  return (
    <div className="w-full h-[350px] md:h-[450px] rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-lg relative overflow-hidden flex flex-col justify-end p-6 select-none cursor-grab active:cursor-grabbing">
      
      {/* Legend / Title */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-base font-bold text-white tracking-tight">Pipeline Lead Clusters (3D Scatter)</h3>
        <p className="text-xs text-slate-500 mt-1">Drag to rotate and explore the pipeline densities (1,200 leads mapped)</p>
      </div>

      <div className="absolute top-6 right-6 z-10 pointer-events-none flex flex-col gap-1.5 text-[10px] uppercase tracking-wider font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
          <span className="text-slate-400">SaaS Products</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
          <span className="text-slate-400">Enterprise Deals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-slate-400">Growth Models</span>
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 9], fov: 60 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00D4FF" />
          <PointsCloud />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Axis Guide */}
      <div className="relative z-10 pointer-events-none flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-mono border-t border-white/5 pt-3">
        <span>X: Deal Volume</span>
        <span>Y: Success Probability</span>
        <span>Z: Velocity Index</span>
      </div>
    </div>
  );
}
