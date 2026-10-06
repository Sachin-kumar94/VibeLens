import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FusionSceneProps {
  activeNode?: "image" | "voice" | "body" | "context" | null;
  onSelectNode?: (node: "image" | "voice" | "body" | "context") => void;
  className?: string;
}

const SatelliteNode: React.FC<{
  position: [number, number, number];
  color: string;
  label: string;
  type: "image" | "voice" | "body" | "context";
  isSelected: boolean;
  onSelect: (type: "image" | "voice" | "body" | "context") => void;
}> = ({ position, color, type, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.5;
    }
  });

  // Converging line to core center [0,0,0]
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...position),
    new THREE.Vector3(0, 0, 0),
  ]);

  return (
    <group>
      {/* Converging Signal Beam */}
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(color),
              transparent: true,
              opacity: isSelected ? 0.8 : 0.25,
              linewidth: isSelected ? 2 : 1,
            })
          )
        }
      />

      {/* Interactive Satellite Mesh */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(type);
        }}
        scale={isSelected ? 1.4 : 1.0}
      >
        <dodecahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.9 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

const CoreContent: React.FC<{
  activeNode?: "image" | "voice" | "body" | "context" | null;
  onSelectNode?: (node: "image" | "voice" | "body" | "context") => void;
}> = ({ activeNode, onSelectNode }) => {
  const coreGroup = useRef<THREE.Group>(null);
  const coreSphere = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    if (coreGroup.current) {
      coreGroup.current.rotation.y = THREE.MathUtils.lerp(
        coreGroup.current.rotation.y,
        pointer.x * 0.35,
        0.05
      );
      coreGroup.current.rotation.x = THREE.MathUtils.lerp(
        coreGroup.current.rotation.x,
        -pointer.y * 0.25,
        0.05
      );
    }
    if (coreSphere.current) {
      const t = clock.getElapsedTime();
      coreSphere.current.rotation.y = t * 0.3;
      coreSphere.current.rotation.z = t * 0.2;
    }
  });

  const handleSelect = (node: "image" | "voice" | "body" | "context") => {
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <group ref={coreGroup}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 3]} intensity={2} color="#F4F1EA" />
      <pointLight position={[-4, 2, 2]} intensity={1.5} color="#7C5CFC" />
      <pointLight position={[4, -2, 2]} intensity={1.5} color="#56D9E8" />

      {/* CENTRAL VIBE CORE */}
      <mesh ref={coreSphere}>
        <icosahedronGeometry args={[0.75, 2]} />
        <meshPhysicalMaterial
          color="#7C5CFC"
          emissive="#56D9E8"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.2}
          transmission={0.85}
          ior={1.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Core Orbital Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.15, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#56D9E8"
          emissive="#56D9E8"
          emissiveIntensity={0.6}
          wireframe={true}
        />
      </mesh>

      {/* 4 Multi-modal Satellite Nodes */}
      <SatelliteNode
        position={[-1.8, 1.1, 0.2]}
        color="#7C5CFC"
        label="Image"
        type="image"
        isSelected={activeNode === "image"}
        onSelect={handleSelect}
      />
      <SatelliteNode
        position={[1.8, 1.0, -0.2]}
        color="#4FA7FF"
        label="Voice"
        type="voice"
        isSelected={activeNode === "voice"}
        onSelect={handleSelect}
      />
      <SatelliteNode
        position={[-1.7, -1.1, -0.1]}
        color="#56D9E8"
        label="Body"
        type="body"
        isSelected={activeNode === "body"}
        onSelect={handleSelect}
      />
      <SatelliteNode
        position={[1.7, -1.0, 0.3]}
        color="#E8A46B"
        label="Context"
        type="context"
        isSelected={activeNode === "context"}
        onSelect={handleSelect}
      />
    </group>
  );
};

export const FusionScene: React.FC<FusionSceneProps> = ({
  activeNode,
  onSelectNode,
  className = "",
}) => {
  return (
    <div className={`w-full h-full cursor-pointer ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <CoreContent activeNode={activeNode} onSelectNode={onSelectNode} />
      </Canvas>
    </div>
  );
};
