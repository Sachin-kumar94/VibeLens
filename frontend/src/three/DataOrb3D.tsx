import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const DataOrb3D: React.FC<{ color?: string; size?: number; className?: string }> = ({
  color = "#7C5CFC",
  size = 1.0,
  className = "",
}) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1.5} color={color} />
        <OrbMesh color={color} size={size} />
      </Canvas>
    </div>
  );
};

const OrbMesh: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (mesh.current) {
      const t = clock.getElapsedTime();
      mesh.current.rotation.y = t * 0.4;
      mesh.current.rotation.x = t * 0.25;
    }
  });

  return (
    <mesh ref={mesh} scale={size}>
      <octahedronGeometry args={[0.7, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        wireframe={true}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};
