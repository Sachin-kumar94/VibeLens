import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingNodeProps {
  position: [number, number, number];
  color: string;
  speed?: number;
  size?: number;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({ position, color, speed = 1, size = 0.08 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.position.y = initialY + Math.sin(t) * 0.12;
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  );
};

const SignalRing: React.FC<{ radius: number; tube: number; color: string; speed?: number; tilt?: [number, number, number] }> = ({
  radius,
  tube,
  color,
  speed = 0.5,
  tilt = [0.4, 0, 0],
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * speed;
    }
  });

  return (
    <mesh ref={ringRef} rotation={tilt}>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        wireframe={true}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
};

const SceneContent: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Gentle damping parallax
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.15, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.12, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#7C5CFC" />
      <pointLight position={[-5, -5, 3]} intensity={0.8} color="#4FA7FF" />

      {/* Central Thin Wireframe Sphere */}
      <mesh position={[0, 0, -1]}>
        <sphereGeometry args={[1.8, 20, 20]} />
        <meshStandardMaterial
          color="#56D9E8"
          emissive="#56D9E8"
          emissiveIntensity={0.25}
          wireframe={true}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Concentric Signal Rings */}
      <SignalRing radius={2.2} tube={0.015} color="#7C5CFC" speed={0.2} tilt={[0.6, 0.3, 0]} />
      <SignalRing radius={2.7} tube={0.012} color="#4FA7FF" speed={-0.15} tilt={[-0.4, 0.5, 0.2]} />
      <SignalRing radius={3.1} tube={0.010} color="#E8A46B" speed={0.1} tilt={[0.2, -0.6, -0.1]} />

      {/* Physical Floating Nodes */}
      <FloatingNode position={[-1.6, 0.8, 0.5]} color="#7C5CFC" speed={0.9} size={0.12} />
      <FloatingNode position={[1.8, -0.6, 0.3]} color="#56D9E8" speed={1.1} size={0.10} />
      <FloatingNode position={[-1.2, -1.2, 0.2]} color="#4FA7FF" speed={0.8} size={0.09} />
      <FloatingNode position={[1.4, 1.2, -0.2]} color="#E8A46B" speed={1.3} size={0.11} />
    </group>
  );
};

export const HeroScene: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};
