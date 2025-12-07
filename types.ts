export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha', // Simplified Meditative Shape
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface HandData {
  isOpen: boolean;
  pinchDistance: number; // 0 to 1
  palmPosition: { x: number; y: number };
}

export interface ParticleConfig {
  count: number;
  color: string;
  shape: ShapeType;
}
