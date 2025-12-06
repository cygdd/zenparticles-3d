import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { HandData, ShapeType } from '../types';
import { generateParticles, PARTICLE_COUNT } from '../utils/geometry';

interface VisualizerProps {
  handData: HandData | null;
  shapeType: ShapeType;
  color: string;
}

const Particles: React.FC<VisualizerProps> = ({ handData, shapeType, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Target positions based on selected shape
  const targetPositions = useMemo(() => generateParticles(shapeType, PARTICLE_COUNT), [shapeType]);
  
  // Current positions for interpolation
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Initialize current positions to target on first load
  useMemo(() => {
    currentPositions.current.set(targetPositions);
  }, []); // Only run once purely for init

  // Animation Loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Hand Interaction Factor (Smooth damping)
    // If hand detected, use pinchDistance. If not, breathe automatically.
    let expansionFactor = 0;
    
    if (handData) {
       // Map 0-1 pinch to expansion. 
       // If pinch is 1 (open hand), expand. 
       expansionFactor = handData.pinchDistance * 3; 
    } else {
       // Auto breathing if no hand
       expansionFactor = Math.sin(time) * 0.5 + 0.5;
    }

    // Special logic for Fireworks: if expansion is high, explode outward
    const isFireworks = shapeType === ShapeType.FIREWORKS;
    const lerpSpeed = isFireworks ? 0.05 : 0.08;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      
      // Get Target Coordinate
      const tx = targetPositions[idx];
      const ty = targetPositions[idx + 1];
      const tz = targetPositions[idx + 2];

      // Current Coordinate
      let cx = currentPositions.current[idx];
      let cy = currentPositions.current[idx + 1];
      let cz = currentPositions.current[idx + 2];

      // 1. Move towards target shape (Morphing)
      cx += (tx - cx) * lerpSpeed;
      cy += (ty - cy) * lerpSpeed;
      cz += (tz - cz) * lerpSpeed;

      // 2. Apply Expansion/Breathing based on Hand
      // Calculate direction from center
      const dist = Math.sqrt(cx * cx + cy * cy + cz * cz) + 0.001;
      const dirX = cx / dist;
      const dirY = cy / dist;
      const dirZ = cz / dist;

      let finalX = cx;
      let finalY = cy;
      let finalZ = cz;

      if (isFireworks) {
         // Fireworks explode outwards aggressively
         const blast = expansionFactor * 8; 
         finalX = cx + dirX * blast * (Math.random() * 0.5 + 0.5);
         finalY = cy + dirY * blast * (Math.random() * 0.5 + 0.5);
         finalZ = cz + dirZ * blast * (Math.random() * 0.5 + 0.5);
      } else {
         // Standard breathing/scaling
         // Add some noise for organic feel
         const noise = Math.sin(dist * 0.5 - time * 2) * 0.1;
         const scale = 1 + (expansionFactor * 0.8) + noise;
         
         finalX = cx * scale;
         finalY = cy * scale;
         finalZ = cz * scale;
         
         // Rotate slightly over time
         const rotSpeed = 0.1 * (1 + expansionFactor); // Spin faster when expanded
         const cosR = Math.cos(time * 0.1);
         const sinR = Math.sin(time * 0.1);
         const rx = finalX * cosR - finalZ * sinR;
         const rz = finalX * sinR + finalZ * cosR;
         finalX = rx;
         finalZ = rz;
      }

      // Update Buffer for next frame
      currentPositions.current[idx] = cx;
      currentPositions.current[idx + 1] = cy;
      currentPositions.current[idx + 2] = cz;

      // Set Instance Matrix
      dummy.position.set(finalX, finalY, finalZ);
      
      // Scale particles based on distance/depth for aesthetics
      const scaleBase = 0.05;
      dummy.scale.setScalar(scaleBase);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Smooth color transition
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
       meshRef.current.material.color.lerp(new THREE.Color(color), 0.1);
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.8} />
    </instancedMesh>
  );
};

const Visualizer: React.FC<VisualizerProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <Particles {...props} />
      <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={30} />
    </Canvas>
  );
};

export default Visualizer;
