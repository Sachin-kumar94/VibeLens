import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const VoiceObject3D: React.FC<{ isRecording?: boolean; className?: string }> = ({
  isRecording = false,
  className = "",
}) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={1.5} color="#4FA7FF" />
        <pointLight position={[-2, -2, 1]} intensity={1} color="#56D9E8" />
        <VoiceRings isRecording={isRecording} />
      </Canvas>
    </div>
  );
};

const VoiceRings: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.rotation.y = t * 0.4;
      group.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      const scale = isRecording ? 1 + Math.sin(t * 8) * 0.08 : 1;
      group.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color="#4FA7FF"
          emissive="#56D9E8"
          emissiveIntensity={isRecording ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.7}
          wireframe={true}
        />
      </mesh>
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.85, 0.018, 16, 64]} />
        <meshStandardMaterial color="#56D9E8" emissive="#56D9E8" emissiveIntensity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.1, 0.015, 16, 64]} />
        <meshStandardMaterial color="#7C5CFC" emissive="#7C5CFC" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};
