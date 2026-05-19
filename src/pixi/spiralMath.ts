import { CRUCIBLE_SIZE } from "../game/crucibleTypes";

export interface SpiralPoint {
  x: number;
  y: number;
  angle: number; // radians, used for token rotation
}

// Configuration for the spiral shape
const SPIRAL_CONFIG = {
  centerX: 0,
  centerY: 0,
  startRadius: 20,       // inner radius (center of spiral)
  radiusGrowth: 5.5,     // how much radius grows per slot
  rotationsTotal: 2.8,   // how many full rotations the spiral makes
};

// Generate all spiral slot positions.
// Position 0 = center, position CRUCIBLE_SIZE-1 = outermost.
export function generateSpiralPoints(): SpiralPoint[] {
  const { centerX, centerY, startRadius, radiusGrowth, rotationsTotal } =
    SPIRAL_CONFIG;

  const totalAngle = rotationsTotal * Math.PI * 2;

  return Array.from({ length: CRUCIBLE_SIZE }, (_, i) => {
    const t = i / (CRUCIBLE_SIZE - 1); // 0 → 1
    const angle = t * totalAngle - Math.PI / 2; // start from top
    const radius = startRadius + i * radiusGrowth;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      angle,
    };
  });
}

// Get a single point by position index.
export function getSpiralPoint(position: number): SpiralPoint {
  const points = generateSpiralPoints();
  const clamped = Math.max(0, Math.min(position, CRUCIBLE_SIZE - 1));
  return points[clamped];
}

// Interpolate a smooth position between two spiral points (for animation).
export function interpolateSpiralPoint(
  from: number,
  to: number,
  progress: number // 0 → 1
): SpiralPoint {
  const points = generateSpiralPoints();
  const a = points[Math.min(from, CRUCIBLE_SIZE - 1)];
  const b = points[Math.min(to, CRUCIBLE_SIZE - 1)];
  const t = Math.max(0, Math.min(progress, 1));

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: a.angle + (b.angle - a.angle) * t,
  };
}
