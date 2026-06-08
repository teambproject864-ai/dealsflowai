"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Torus() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.8;
      ref.current.rotation.y = clock.getElapsedTime() * 1.2;
    }
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.9, 0.22, 16, 48]} />
      <meshStandardMaterial color="#2dd4bf" emissive="#0d9488" emissiveIntensity={0.4} metalness={0.6} roughness={0.25} />
    </mesh>
  );
}

export function TorusLoaderInner() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1} color="#14b8a6" />
      <Torus />
    </Canvas>
  );
}
