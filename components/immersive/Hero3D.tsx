"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Custom shader material for the morphing icosahedron
const MorphShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Simple 3D Noise function
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    
    float noise(in vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                     mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                     mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Wave deformation
      float disp = noise(position * 1.5 + uTime * 0.8) * 0.35;
      vec3 newPosition = position + normal * disp;
      vPosition = newPosition;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Dynamic spectrum color based on normal coordinates and time
      vec3 colorA = vec3(0.0, 0.83, 1.0); // Cyan
      vec3 colorB = vec3(0.49, 0.23, 0.93); // Purple
      vec3 colorC = vec3(0.96, 0.62, 0.04); // Amber
      
      vec3 normalShift = normalize(vNormal);
      vec3 baseColor = mix(colorA, colorB, normalShift.x * 0.5 + 0.5);
      baseColor = mix(baseColor, colorC, normalShift.y * 0.5 + 0.5);
      
      // Rotate colors over time
      vec3 shiftColor = 0.5 + 0.5 * cos(uTime + vNormal.xyz + vec3(0.0, 2.0, 4.0));
      vec3 finalColor = mix(baseColor, shiftColor, 0.4);
      
      // Add Fresnel highlight
      float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
      finalColor += vec3(0.8, 0.9, 1.0) * fresnel * 0.6;
      
      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
};

function MorphingIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(MorphShaderMaterial.uniforms),
      vertexShader: MorphShaderMaterial.vertexShader,
      fragmentShader: MorphShaderMaterial.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    // Spin the core
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;
    
    // Update shader uniform
    material.uniforms.uTime.value = t;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <icosahedronGeometry args={[2.5, 3]} />
    </mesh>
  );
}

function OrbitingElements() {
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const crystalGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.3;
      innerRingRef.current.rotation.y = t * 0.2;
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = -t * 0.15;
      outerRingRef.current.rotation.z = t * 0.1;
    }

    if (crystalGroupRef.current) {
      crystalGroupRef.current.rotation.y = t * 0.25;
      // Oscillate height
      crystalGroupRef.current.position.y = Math.sin(t * 0.8) * 0.2;
    }
  });

  // Position 4 tetrahedrons around the orbit
  const crystals = useMemo(() => {
    const arr = [];
    const colors = ["#00D4FF", "#7c3aed", "#f59e0b", "#14b8a6"];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      arr.push({
        id: i,
        angle,
        radius: 4.8,
        color: colors[i],
        scale: 0.4 + Math.random() * 0.2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Inner glass torus ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[3.8, 0.12, 16, 100]} />
        <meshPhysicalMaterial
          transmission={0.9}
          thickness={1.5}
          roughness={0.05}
          clearcoat={1.0}
          color="#00D4FF"
          transparent
        />
      </mesh>

      {/* Outer glass torus ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[5.2, 0.08, 16, 100]} />
        <meshPhysicalMaterial
          transmission={0.9}
          thickness={1.2}
          roughness={0.05}
          clearcoat={1.0}
          color="#7c3aed"
          transparent
        />
      </mesh>

      {/* Orbiting crystal tetrahedrons */}
      <group ref={crystalGroupRef}>
        {crystals.map((c) => (
          <mesh
            key={c.id}
            position={[Math.cos(c.angle) * c.radius, 0, Math.sin(c.angle) * c.radius]}
            scale={c.scale}
          >
            <tetrahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              transmission={0.95}
              thickness={1.8}
              roughness={0.02}
              clearcoat={1.0}
              color={c.color}
              transparent
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="w-full h-[380px] sm:h-[480px] md:h-[550px] relative pointer-events-none select-none z-[5]">
      {/* Absolute positioning container for R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00D4FF" />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color="#7c3aed" />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.6}>
          <MorphingIcosahedron />
          <OrbitingElements />
        </Float>
      </Canvas>
      {/* Backdrop glowing background reflection */}
      <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(0,212,255,0.06),transparent_65%) pointer-events-none -z-10" />
    </div>
  );
}
