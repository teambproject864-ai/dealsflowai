"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  activeHighlight: number;
  onHighlightClick: (index: number) => void;
  reducedMotion: boolean;
}

// 1. Memory OS (Hermes) Model: Glowing Processor Core + 4 orbiting rings
function HermesOSModel({ activeHighlight, onHighlightClick, reducedMotion }: ModelProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.2;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.8;
      ring1Ref.current.rotation.x = Math.sin(t) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.6;
      ring2Ref.current.rotation.y = Math.cos(t) * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = t * 0.4;
      ring3Ref.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.y = -t * 0.3;
      ring4Ref.current.rotation.x = Math.cos(t * 0.4) * 0.4;
    }
  });

  return (
    <group>
      {/* Central core processor */}
      <mesh ref={coreRef} onClick={() => onHighlightClick(0)}>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshStandardMaterial 
          color="#0d9488" 
          emissive="#115e59"
          roughness={0.1}
          metalness={0.8}
          wireframe
        />
      </mesh>
      
      {/* Central solid energy block */}
      <mesh onClick={() => onHighlightClick(0)}>
        <octahedronGeometry args={[0.9]} />
        <meshStandardMaterial 
          color="#14b8a6" 
          emissive="#0f766e"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Orbiting rings */}
      <mesh ref={ring1Ref} onClick={() => onHighlightClick(0)}>
        <torusGeometry args={[1.8, 0.06, 8, 48]} />
        <meshStandardMaterial color={activeHighlight === 0 ? "#14b8a6" : "#0f766e"} emissive="#14b8a6" />
      </mesh>
      <mesh ref={ring2Ref} onClick={() => onHighlightClick(1)} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.2, 0.05, 8, 48]} />
        <meshStandardMaterial color={activeHighlight === 1 ? "#38bdf8" : "#0284c7"} emissive="#38bdf8" />
      </mesh>
      <mesh ref={ring3Ref} onClick={() => onHighlightClick(2)} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.6, 0.05, 8, 48]} />
        <meshStandardMaterial color={activeHighlight === 2 ? "#818cf8" : "#4f46e5"} emissive="#818cf8" />
      </mesh>
      <mesh ref={ring4Ref} onClick={() => onHighlightClick(3)} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.0, 0.04, 8, 48]} />
        <meshStandardMaterial color={activeHighlight === 3 ? "#fbbf24" : "#d97706"} emissive="#fbbf24" />
      </mesh>
    </group>
  );
}

// 2. MEM Palace Model: Organized modular panels that slide forward when clicked
function MEMPalaceModel({ activeHighlight, onHighlightClick, reducedMotion }: ModelProps) {
  const p1Ref = useRef<THREE.Group>(null);
  const p2Ref = useRef<THREE.Group>(null);
  const p3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Smooth drawer sliding transition
    const targetP1 = activeHighlight === 0 ? 0.8 : 0;
    const targetP2 = activeHighlight === 1 ? 0.8 : 0;
    const targetP3 = activeHighlight === 2 ? 0.8 : 0;

    if (p1Ref.current) p1Ref.current.position.z = THREE.MathUtils.lerp(p1Ref.current.position.z, targetP1, 0.1);
    if (p2Ref.current) p2Ref.current.position.z = THREE.MathUtils.lerp(p2Ref.current.position.z, targetP2, 0.1);
    if (p3Ref.current) p3Ref.current.position.z = THREE.MathUtils.lerp(p3Ref.current.position.z, targetP3, 0.1);
  });

  return (
    <group rotation={[Math.PI / 10, -Math.PI / 5, 0]}>
      {/* Frame of the cabinet */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[2.8, 3.2, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} wireframe />
      </mesh>

      {/* Drawer 1: Accounts */}
      <group ref={p1Ref} position={[0, 1.0, 0]}>
        <mesh onClick={() => onHighlightClick(0)}>
          <boxGeometry args={[2.4, 0.8, 0.8]} />
          <meshStandardMaterial color={activeHighlight === 0 ? "#38bdf8" : "#0f172a"} border-color="#38bdf8" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[0.6, 0.1, 0.05]} />
          <meshStandardMaterial color="#0284c7" emissive="#38bdf8" />
        </mesh>
      </group>

      {/* Drawer 2: Objections */}
      <group ref={p2Ref} position={[0, 0, 0]}>
        <mesh onClick={() => onHighlightClick(1)}>
          <boxGeometry args={[2.4, 0.8, 0.8]} />
          <meshStandardMaterial color={activeHighlight === 1 ? "#2dd4bf" : "#0f172a"} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[0.6, 0.1, 0.05]} />
          <meshStandardMaterial color="#0f766e" emissive="#2dd4bf" />
        </mesh>
      </group>

      {/* Drawer 3: Telemetry */}
      <group ref={p3Ref} position={[0, -1.0, 0]}>
        <mesh onClick={() => onHighlightClick(2)}>
          <boxGeometry args={[2.4, 0.8, 0.8]} />
          <meshStandardMaterial color={activeHighlight === 2 ? "#fbbf24" : "#0f172a"} roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[0.6, 0.1, 0.05]} />
          <meshStandardMaterial color="#d97706" emissive="#fbbf24" />
        </mesh>
      </group>
    </group>
  );
}

// 3. ALMA Model: Synaptic geodesic wireframe nodes that pulse
function ALMAModel({ activeHighlight, onHighlightClick, reducedMotion }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const nodesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = t * 0.05;
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.y = t * 0.15;
      nodesRef.current.rotation.x = t * 0.05;
      
      // Scale nodes slightly based on active highlight index
      const scaleVal = 1 + Math.sin(t * 3) * 0.05;
      nodesRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  // Proc nodes positions on sphere
  const nodes = [
    { pos: [0, 1.8, 0], highlight: 0 },
    { pos: [1.5, 0.8, 0.8], highlight: 1 },
    { pos: [-1.2, -1.0, 1.2], highlight: 2 },
    { pos: [1.2, -1.2, -1.0], highlight: 0 },
    { pos: [-1.4, 0.8, -0.8], highlight: 1 },
  ];

  return (
    <group>
      {/* Geodesic wireframe connector network */}
      <mesh ref={meshRef} onClick={() => onHighlightClick(0)}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#818cf8" roughness={0.1} metalness={0.9} wireframe />
      </mesh>

      {/* Nodes mapping */}
      <group ref={nodesRef}>
        {nodes.map((node, i) => (
          <mesh
            key={i}
            position={node.pos as [number, number, number]}
            onClick={() => onHighlightClick(node.highlight)}
          >
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={activeHighlight === node.highlight ? "#a5b4fc" : "#4f46e5"}
              emissive={activeHighlight === node.highlight ? "#818cf8" : "#312e81"}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// 4. Clawpatrol Model: Dual wireframe shield enclosing a core
function ClawpatrolModel({ activeHighlight, onHighlightClick, reducedMotion }: ModelProps) {
  const outerShieldRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return groupRef.current ? (groupRef.current.rotation.y = 0.5) : null;
    const t = state.clock.getElapsedTime();
    if (outerShieldRef.current) {
      outerShieldRef.current.rotation.y = -t * 0.3;
      outerShieldRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = t * 0.6;
      innerCoreRef.current.rotation.x = Math.cos(t) * 0.2;
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0]}>
      {/* Solid protected central core */}
      <mesh ref={innerCoreRef} onClick={() => onHighlightClick(0)}>
        <dodecahedronGeometry args={[0.8]} />
        <meshStandardMaterial 
          color={activeHighlight === 0 ? "#f43f5e" : "#e11d48"} 
          emissive="#9f1239"
          roughness={0.1} 
          metalness={0.9} 
        />
      </mesh>

      {/* Outer firewall protective sphere shield */}
      <mesh ref={outerShieldRef} onClick={() => onHighlightClick(1)}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshStandardMaterial 
          color={activeHighlight === 1 ? "#fda4af" : "#f43f5e"} 
          emissive={activeHighlight === 2 ? "#e11d48" : "#881337"} 
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>
      
      {/* Encapsulating visual scan rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} onClick={() => onHighlightClick(2)}>
        <torusGeometry args={[2.3, 0.03, 8, 32]} />
        <meshStandardMaterial color="#f43f5e" emissive="#9f1239" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

interface Feature3DModelProps {
  featureId: "hermes" | "palace" | "alma" | "clawpatrol";
  activeHighlight: number;
  onHighlightClick: (index: number) => void;
  reducedMotion: boolean;
}

export default function Feature3DModel({
  featureId,
  activeHighlight,
  onHighlightClick,
  reducedMotion,
}: Feature3DModelProps) {
  const getModel = () => {
    const props = { activeHighlight, onHighlightClick, reducedMotion };
    switch (featureId) {
      case "hermes":
        return <HermesOSModel {...props} />;
      case "palace":
        return <MEMPalaceModel {...props} />;
      case "alma":
        return <ALMAModel {...props} />;
      case "clawpatrol":
        return <ClawpatrolModel {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[280px] sm:h-[360px] md:h-[400px] w-full bg-[#050512]/60 rounded-3xl border border-white/5 relative overflow-hidden group/canvas shadow-2xl">
      {/* Help label overlay */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-slate-500 uppercase tracking-widest pointer-events-none">
        Drag to Orbit | Pinch to Zoom
      </div>

      <Canvas shadows camera={{ position: [0, 0, 6.2], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[8, 8, 8]} intensity={1.5} color="#38bdf8" />
        <spotLight position={[-8, 8, 8]} angle={0.25} penumbra={1} intensity={2.0} color="#818cf8" />
        <pointLight position={[0, -4, 4]} intensity={0.8} color="#f43f5e" />

        {/* Model */}
        {getModel()}

        {/* Bounded Orbit Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
