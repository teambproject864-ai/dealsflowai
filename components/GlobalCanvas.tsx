"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  // Create static positions, animation is done in the shader to save CPU cycles
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#2dd4bf"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function GlobalCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }} style={{ background: "transparent" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
        
        {/* Subtle lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={0.5} color="#0d9488" />
        
        <Stars radius={50} depth={20} count={3000} factor={3} saturation={0} fade speed={0.5} />
        
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <BackgroundParticles />
        </Float>
      </Canvas>
    </div>
  );
}
