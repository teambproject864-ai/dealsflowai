"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Chart3DDataPoint } from "./Chart3DBars";

function Bars({ data, max }: { data: Chart3DDataPoint[]; max: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.35;
  });

  const gap = 1.2;
  const offset = ((data.length - 1) * gap) / 2;

  return (
    <group ref={group}>
      {data.map((d, i) => {
        const h = (d.value / max) * 3 + 0.2;
        return (
          <mesh key={d.label} position={[i * gap - offset, h / 2 - 1.5, 0]}>
            <boxGeometry args={[0.7, h, 0.7]} />
            <meshStandardMaterial
              color={d.color ?? "#2dd4bf"}
              emissive={d.color ?? "#0d9488"}
              emissiveIntensity={0.25}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Chart3DBarsInner({ data, max }: { data: Chart3DDataPoint[]; max: number }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2, 6], fov: 42 }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#a78bfa" />
      <Bars data={data} max={max} />
    </Canvas>
  );
}
