"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Orb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * 0.4;
    ref.current.rotation.y = clock.getElapsedTime() * 0.55;
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.08;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color="#6C3BFF"
        emissive="#00D4FF"
        emissiveIntensity={0.35}
        wireframe
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export function MorphOrb() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#00FFB2" />
      <Orb />
    </Canvas>
  );
}
