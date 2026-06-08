"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FunctionalFlow({ position, performance = 'high' }: { position: [number, number, number], performance?: 'high' | 'low' }) {
  const points = useRef<THREE.Points>(null);
  
  const particleCount = performance === 'high' ? 1000 : 200;
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      spd[i] = 0.01 + Math.random() * 0.03;
    }
    return [pos, spd];
  }, [particleCount]);

  useFrame(() => {
    if (points.current) {
      const positionsAttr = points.current.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        positionsAttr.setX(i, positionsAttr.getX(i) + speeds[i]);
        if (positionsAttr.getX(i) > 5) {
          positionsAttr.setX(i, -5);
        }
      }
      positionsAttr.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      <points ref={points}>
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
          size={0.05}
          color="#6366f1"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      
      {/* Visual Flow Nodes */}
      <mesh position={[-5, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={performance === 'high' ? 2 : 1} />
      </mesh>
      <mesh position={[5, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={performance === 'high' ? 2 : 1} />
      </mesh>
    </group>
  );
}
