"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/components/experience/ExperienceProvider";

export function VoiceOrb() {
  const { voiceListening } = useExperience();
  const { viewport } = useThree();
  const orbMeshRef = useRef<THREE.Mesh>(null);
  const orbGroupRef = useRef<THREE.Group>(null);
  const cylindersRef = useRef<(THREE.Mesh | null)[]>([]);

  // Web Audio Context States
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!voiceListening) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setAnalyser(null);
      return;
    }

    let active = true;
    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        
        const source = ctx.createMediaStreamSource(stream);
        const anal = ctx.createAnalyser();
        anal.fftSize = 256; // Yields 128 frequency bands
        source.connect(anal);
        setAnalyser(anal);
      } catch (err) {
        console.warn("Failed to configure micro-visualizer stream:", err);
      }
    }
    setupAudio();
    return () => {
      active = false;
    };
  }, [voiceListening]);

  // Frequency mapping layout coordinates
  const cylinderLayout = useMemo(() => {
    const arr = [];
    const radius = 2.0;
    for (let i = 0; i < 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotationY = -angle;
      arr.push({ x, z, rotationY, index: i });
    }
    return arr;
  }, []);

  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Rotate visualizer group
    if (orbGroupRef.current) {
      orbGroupRef.current.rotation.y = t * 0.2;
    }

    // Gentle floating orb pulse
    if (orbMeshRef.current) {
      const targetScale = voiceListening 
        ? 1.2 + Math.sin(t * 8) * 0.1 
        : 1.0 + Math.sin(t * 1.5) * 0.05;
      orbMeshRef.current.scale.setScalar(targetScale);
    }

    // Audio stream processing
    let audioData = dataArray;
    if (analyser) {
      analyser.getByteFrequencyData(audioData);
    } else {
      // Idle visualizer animation loops
      for (let i = 0; i < 128; i++) {
        audioData[i] = 12 + Math.sin(t * 2 + i * 0.15) * 10 + Math.cos(t * 3.5 - i * 0.08) * 6;
      }
    }

    // Scale individual 128 glass cylinders
    cylindersRef.current.forEach((mesh, index) => {
      if (!mesh) return;
      const normVal = audioData[index] / 255;
      const targetHeight = 0.2 + normVal * 4.5;
      mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, targetHeight, 0.18);
      // Offset mesh so scaling is directed outward from center
      mesh.position.y = mesh.scale.y / 2;
    });
  });

  // Keep orb position anchored relative to changing viewports (Lower right corner)
  const xPos = viewport.width / 2 - 3.5;
  const yPos = -viewport.height / 2 + 3.5;

  return (
    <group ref={orbGroupRef} position={[xPos, yPos, 20]}>
      {/* Central Glass Orb */}
      <mesh ref={orbMeshRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshPhysicalMaterial
          color={voiceListening ? "#10b981" : "#7c3aed"}
          emissive={voiceListening ? "#10b981" : "#6c3bff"}
          emissiveIntensity={voiceListening ? 2.5 : 0.6}
          roughness={0.05}
          transmission={0.9}
          thickness={0.8}
          clearcoat={1.0}
          transparent
        />
      </mesh>

      {/* 128 Cylinder Waveform ring */}
      {cylinderLayout.map((cell) => (
        <mesh
          key={cell.index}
          ref={(el) => { cylindersRef.current[cell.index] = el; }}
          position={[cell.x, 0, cell.z]}
          rotation={[0, cell.rotationY, 0]}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshPhysicalMaterial
            color={voiceListening ? "#10b981" : "#00d4ff"}
            emissive={voiceListening ? "#10b981" : "#00d4ff"}
            emissiveIntensity={0.6}
            transmission={0.9}
            roughness={0.1}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
