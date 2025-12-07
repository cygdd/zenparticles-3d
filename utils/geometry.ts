import * as THREE from 'three';
import { ShapeType } from '../types';

export const PARTICLE_COUNT = 6000;

const getRandomPointInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateParticles = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vector = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (type) {
      case ShapeType.HEART: {
        // Parametric Heart
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        // Modified spherical coordinates for volume
        const r = 10 * Math.cbrt(Math.random()); 
        
        // 2D Shape extrusion logic for simplicity and recognition
        const t = Math.random() * Math.PI * 2;
        // Heart curve
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        z = (Math.random() - 0.5) * 10; // Thickness
        
        // Scale down
        x *= 0.25;
        y *= 0.25;
        z *= 0.25;
        break;
      }

      case ShapeType.FLOWER: {
        // Rose curve / Flower shape
        const k = 4; // Petals
        const theta = Math.random() * Math.PI * 2;
        const rBase = Math.cos(k * theta);
        const r = (rBase + 0.5) * 5 * Math.sqrt(Math.random()); 
        
        x = r * Math.cos(theta);
        y = r * Math.sin(theta);
        z = (Math.random() - 0.5) * 4 * (1 - r/8); // Curvature
        break;
      }

      case ShapeType.SATURN: {
        const isRing = Math.random() > 0.4;
        if (isRing) {
            // Ring
            const angle = Math.random() * Math.PI * 2;
            const dist = 6 + Math.random() * 4;
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
            y = (Math.random() - 0.5) * 0.5;
            
            // Tilt
            const tilt = 0.4;
            const tempY = y * Math.cos(tilt) - z * Math.sin(tilt);
            const tempZ = y * Math.sin(tilt) + z * Math.cos(tilt);
            y = tempY;
            z = tempZ;
        } else {
            // Planet Body
            const p = getRandomPointInSphere(3.5);
            x = p.x;
            y = p.y;
            z = p.z;
        }
        break;
      }

      case ShapeType.BUDDHA: {
         // Abstract Meditative Form (Stacked Spheres forming a body)
         const section = Math.random();
         if (section < 0.3) {
            // Head
            const p = getRandomPointInSphere(1.5);
            x = p.x;
            y = p.y + 3.5;
            z = p.z;
         } else if (section < 0.7) {
            // Torso
             const p = getRandomPointInSphere(2.5);
             x = p.x * 1.2; // Broader shoulders
             y = p.y;
             z = p.z * 0.8;
         } else {
             // Legs/Base (Lotus)
             const p = getRandomPointInSphere(3.5);
             x = p.x * 1.5;
             y = p.y - 3;
             z = p.z;
             if (y > -1) y = -1 - Math.random(); // Flatten top of legs
         }
         break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion snapshot
        const p = getRandomPointInSphere(0.5); // Start tight
        // We will expand this massively in the shader/animation loop based on hand
        x = p.x;
        y = p.y;
        z = p.z;
        break;
      }

      default: // SPHERE
        const p = getRandomPointInSphere(5);
        x = p.x;
        y = p.y;
        z = p.z;
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};
