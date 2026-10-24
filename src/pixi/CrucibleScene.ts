import * as PIXI from "pixi.js";
import type { Crucible } from "../game/crucibleTypes";
import { CRUCIBLE_SIZE } from "../game/crucibleTypes";
import { generateSpiralPoints } from "./spiralMath";
import { TokenSprite } from "./TokenSprite";
import { ParticleSystem } from "./ParticleSystem";
import { getTokenVisual } from "./tokenVisuals";
import type { Token } from "../game/tokenTypes";
import { prefersReducedMotion } from "../accessibility";

const SPIRAL_POINTS = generateSpiralPoints();

export class CrucibleScene extends PIXI.Container {
  private trackGraphics: PIXI.Graphics;
  private tokenLayer: PIXI.Container;
  private particles: ParticleSystem;
  private positionMarker: PIXI.Graphics;
  private placedSprites: Map<string, TokenSprite> = new Map();
  private warningFrames: Map<string, number> = new Map();
  private reducedMotion = prefersReducedMotion();
  private explosionPlayed = false;

  constructor() {
    super();

    // Draw spiral track
    this.trackGraphics = new PIXI.Graphics();
    this.addChild(this.trackGraphics);

    // Token layer sits above track
    this.tokenLayer = new PIXI.Container();
    this.addChild(this.tokenLayer);

    // Particles on top
    this.particles = new ParticleSystem();
    this.addChild(this.particles);

    // Current position marker
    this.positionMarker = new PIXI.Graphics();
    this.addChild(this.positionMarker);

    this.drawTrack();
  }

  // ── Draw the static spiral track (very subtle guide) ────────────────────────
  private drawTrack(): void {
    const g = this.trackGraphics;
    g.clear();

    // Draw faint dots at score slot positions only
    for (let i = 0; i < SPIRAL_POINTS.length; i++) {
      const p = SPIRAL_POINTS[i];
      const isScoreSlot = [5, 10, 15, 20, 25, 30, 35, 40, 45, 49].includes(i);

      if (isScoreSlot) {
        g.circle(p.x, p.y, 2);
        g.fill({ color: 0x6600aa, alpha: 0.25 });
      }
      // Normal slots are invisible — tokens mark them
    }
    // No connecting line — keep the board clean
  }

  // ── Update scene to match current crucible state ────────────────────────────
  update(crucible: Crucible): void {
    const activeIds = new Set(crucible.placements.map((placement) => placement.token.id));
    for (const [tokenId, sprite] of this.placedSprites) {
      if (!activeIds.has(tokenId)) {
        const warningFrame = this.warningFrames.get(tokenId);
        if (warningFrame !== undefined) cancelAnimationFrame(warningFrame);
        this.warningFrames.delete(tokenId);
        sprite.destroy();
        this.placedSprites.delete(tokenId);
      }
    }

    // Placement history, rather than one-token-per-space slots, is authoritative.
    // This keeps every chip visible and owned even when several reach the spoon.
    for (const placement of crucible.placements) {
      if (!this.placedSprites.has(placement.token.id)) {
        const stackIndex = crucible.placements
          .slice(0, crucible.placements.indexOf(placement))
          .filter((candidate) => candidate.position === placement.position).length;
        this.placeTokenAt(placement.position, placement.token, stackIndex, crucible.whiteSum);
      }
    }

    // Update position marker
    this.updatePositionMarker(crucible.filledUpTo);

    // Trigger explosion effect
    if (crucible.exploded && !this.explosionPlayed) {
      this.explosionPlayed = true;
      this.triggerExplosion(crucible.filledUpTo);
    } else if (!crucible.exploded) {
      this.explosionPlayed = false;
    }
  }

  // ── Animate a token landing at a position ──────────────────────────────────
  private async placeTokenAt(position: number, token: Token, stackIndex = 0, pressure = 0): Promise<void> {
    const point = SPIRAL_POINTS[Math.min(position, CRUCIBLE_SIZE - 1)];
    const visual = getTokenVisual(token.color);

    const sprite = new TokenSprite(token);
    const stackAngle = stackIndex * 2.4;
    const stackRadius = Math.min(stackIndex, 4) * 5;
    sprite.x = point.x + Math.cos(stackAngle) * stackRadius;
    sprite.y = point.y + Math.sin(stackAngle) * stackRadius;
    sprite.scale.set(0.1);
    this.tokenLayer.addChild(sprite);
    this.placedSprites.set(token.id, sprite);

    // The common spark cue confirms placement; the second layer gives each
    // ingredient a recognizable silhouette without changing draw timing.
    if (!this.reducedMotion) {
      this.particles.emitSparks(point.x, point.y, visual.glow, token.color === "white" ? 10 : 5);
      if (token.color === "white") this.playVoidshardImpact(point.x, point.y, pressure);
      else this.playIngredientImpact(point.x, point.y, token);
    }

    // Scale-in animation
    await sprite.animatePlacement();

    // Extra glow for white tokens (dangerous!)
    if (token.color === "white" && !this.reducedMotion) {
      this.pulseWhiteWarning(token.id, sprite);
    }
  }

  private playVoidshardImpact(x: number, y: number, pressure: number): void {
    const fracture = new PIXI.Graphics();
    fracture.position.set(x, y);
    this.addChild(fracture);
    const startedAt = performance.now();
    const danger = pressure >= 5;
    const critical = pressure >= 7;
    const duration = critical ? 620 : danger ? 520 : 440;
    const radiusBoost = critical ? 42 : danger ? 20 : 0;
    const rayCount = critical ? 12 : danger ? 9 : 7;
    const tick = (now: number) => {
      if (fracture.destroyed) return;
      const t = Math.min(1, (now - startedAt) / duration);
      fracture.clear();
      fracture.circle(0, 0, 18 + t * (68 + radiusBoost));
      fracture.stroke({ color: critical ? 0xffffff : 0xdde7ff, width: 3.4 - t * 2.2, alpha: (1 - t) * 0.92 });
      if (danger) {
        fracture.circle(0, 0, 32 + t * (92 + radiusBoost));
        fracture.stroke({ color: 0x8faaff, width: 1.4, alpha: (1 - t) * 0.46 });
      }
      for (let ray = 0; ray < rayCount; ray++) {
        const angle = ray * 0.91 + 0.2;
        const inner = 12 + t * 10;
        const outer = 25 + t * (36 + (ray % 3) * 7);
        fracture.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        fracture.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        fracture.stroke({ color: 0xb8c8ff, width: 1.5, alpha: (1 - t) * 0.72 });
      }
      if (t < 1) requestAnimationFrame(tick);
      else fracture.destroy();
    };
    requestAnimationFrame(tick);
  }

  private playIngredientImpact(x: number, y: number, token: Token): void {
    const effect = new PIXI.Graphics();
    effect.position.set(x, y);
    this.addChild(effect);
    const color = getTokenVisual(token.color).glow;
    const startedAt = performance.now();
    const duration = token.color === "black" ? 560 : 480;
    const tick = (now: number) => {
      if (effect.destroyed) return;
      const t = Math.min(1, (now - startedAt) / duration);
      const fade = 1 - t;
      const eased = 1 - Math.pow(1 - t, 3);
      effect.clear();

      switch (token.color) {
        case "orange": {
          // Heated metal: a compact flare with uneven ember rays.
          effect.circle(0, 0, 12 + eased * 38);
          effect.stroke({ color, width: 2.6 - t * 1.5, alpha: fade * 0.78 });
          for (let i = 0; i < 8; i++) {
            const angle = i * (Math.PI / 4) + 0.15;
            const inner = 9 + eased * 7;
            const outer = 18 + eased * (18 + (i % 3) * 4);
            effect.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            effect.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            effect.stroke({ color: i % 2 ? 0xffb14a : color, width: 1.8, alpha: fade * 0.82 });
          }
          break;
        }
        case "green": {
          // Organic threads grow outward in curling, asymmetric paths.
          for (let thread = 0; thread < 5; thread++) {
            const base = thread * 1.257 - 0.35;
            effect.moveTo(Math.cos(base) * 7, Math.sin(base) * 7);
            for (let segment = 1; segment <= 5; segment++) {
              const radius = 7 + segment * 7 * eased;
              const angle = base + Math.sin(segment * 1.9 + thread) * 0.18 * eased;
              effect.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            effect.stroke({ color, width: 2.1 - t, alpha: fade * 0.7 });
          }
          break;
        }
        case "purple": {
          // Spectral petals unfurl while slowly counter-rotating.
          for (let petal = 0; petal < 6; petal++) {
            const angle = petal * (Math.PI / 3) - eased * 0.7;
            const radius = 11 + eased * 28;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            const tangentX = -Math.sin(angle) * (5 + eased * 3);
            const tangentY = Math.cos(angle) * (5 + eased * 3);
            effect.moveTo(Math.cos(angle) * (radius - 8), Math.sin(angle) * (radius - 8));
            effect.lineTo(px + tangentX, py + tangentY);
            effect.lineTo(Math.cos(angle) * (radius + 8), Math.sin(angle) * (radius + 8));
            effect.lineTo(px - tangentX, py - tangentY);
            effect.closePath();
            effect.fill({ color, alpha: fade * 0.22 });
            effect.stroke({ color: 0xdd8cff, width: 1.1, alpha: fade * 0.62 });
          }
          break;
        }
        case "blue": {
          // Six crystalline branches make the impact readable without color.
          for (let branch = 0; branch < 6; branch++) {
            const angle = branch * (Math.PI / 3);
            const length = 17 + eased * 31;
            const endX = Math.cos(angle) * length;
            const endY = Math.sin(angle) * length;
            effect.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
            effect.lineTo(endX, endY);
            effect.stroke({ color: 0x9edcff, width: 1.8, alpha: fade * 0.78 });
            for (const fork of [0.56, 0.78]) {
              const fx = Math.cos(angle) * length * fork;
              const fy = Math.sin(angle) * length * fork;
              for (const side of [-1, 1]) {
                const forkAngle = angle + side * 0.55;
                effect.moveTo(fx, fy);
                effect.lineTo(fx - Math.cos(forkAngle) * 7, fy - Math.sin(forkAngle) * 7);
                effect.stroke({ color: 0xbcecff, width: 1.1, alpha: fade * 0.62 });
              }
            }
          }
          break;
        }
        case "red": {
          // A low pulse sends short vein branches across the surface.
          effect.circle(0, 0, 10 + eased * 43);
          effect.stroke({ color, width: 3 - t * 1.8, alpha: fade * 0.68 });
          for (let vein = 0; vein < 7; vein++) {
            const angle = vein * 0.9 + 0.3;
            const mid = 16 + eased * 15;
            const outer = 22 + eased * (20 + (vein % 2) * 6);
            effect.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
            effect.lineTo(Math.cos(angle + 0.12) * mid, Math.sin(angle + 0.12) * mid);
            effect.lineTo(Math.cos(angle - 0.08) * outer, Math.sin(angle - 0.08) * outer);
            effect.stroke({ color: 0xa41018, width: 1.7, alpha: fade * 0.72 });
          }
          break;
        }
        case "yellow": {
          // Granular dust disperses in a deterministic uneven cloud.
          for (let mote = 0; mote < 14; mote++) {
            const angle = mote * 2.399 + 0.4;
            const distance = (8 + (mote % 5) * 6) * eased;
            const radius = 1.2 + (mote % 3) * 0.7;
            effect.circle(Math.cos(angle) * distance, Math.sin(angle) * distance, radius);
            effect.fill({ color: mote % 2 ? color : 0xf4d85a, alpha: fade * 0.72 });
          }
          break;
        }
        case "black": {
          // Shadowmoss suppresses light before releasing a thin grey boundary.
          effect.circle(0, 0, 14 + eased * 47);
          effect.fill({ color: 0x000000, alpha: Math.sin(Math.PI * t) * 0.42 });
          effect.circle(0, 0, 18 + eased * 43);
          effect.stroke({ color: 0x85818e, width: 1.5, alpha: fade * 0.46 });
          break;
        }
        case "echo": {
          // Echo Reed answers with evenly spaced water-like rings.
          for (let ring = 0; ring < 3; ring++) {
            const local = Math.max(0, Math.min(1, t * 1.45 - ring * 0.18));
            effect.circle(0, 0, 11 + local * 47);
            effect.stroke({ color, width: 2 - local, alpha: (1 - local) * 0.66 });
          }
          break;
        }
      }

      if (t < 1) requestAnimationFrame(tick);
      else effect.destroy();
    };
    requestAnimationFrame(tick);
  }

  // ── Pulse warning on white tokens ──────────────────────────────────────────
  private pulseWhiteWarning(tokenId: string, sprite: TokenSprite): void {
    let frame = 0;
    const tick = () => {
      if (sprite.destroyed) return;
      frame++;
      const intensity = (Math.sin(frame * 0.1) + 1) / 2;
      sprite.pulseGlow(intensity);
      this.warningFrames.set(tokenId, requestAnimationFrame(tick));
    };
    this.warningFrames.set(tokenId, requestAnimationFrame(tick));
  }

  // ── Move the position indicator ────────────────────────────────────────────
  private updatePositionMarker(position: number): void {
    const g = this.positionMarker;
    const point = SPIRAL_POINTS[Math.min(position, CRUCIBLE_SIZE - 1)];

    g.clear();
    g.circle(point.x, point.y, 22);
    g.stroke({ color: 0xffffff, width: 1.5, alpha: 0.25 });
  }

  // ── Explosion ──────────────────────────────────────────────────────────────
  private async triggerExplosion(position: number): Promise<void> {
    const point = SPIRAL_POINTS[Math.min(position, CRUCIBLE_SIZE - 1)];
    if (!this.reducedMotion) this.particles.emitExplosion(point.x, point.y);

    // Shake all placed tokens
    const sprites = Array.from(this.placedSprites.values());
    await Promise.all(sprites.map((s) => s.animateExplosion()));
  }

  setPaused(paused: boolean): void {
    this.particles.setPaused(paused);
  }

  // ── Reset for new round ────────────────────────────────────────────────────
  reset(): void {
    this.explosionPlayed = false;
    for (const frame of this.warningFrames.values()) cancelAnimationFrame(frame);
    this.warningFrames.clear();
    for (const child of this.tokenLayer.removeChildren()) child.destroy();
    this.placedSprites.clear();
    this.positionMarker.clear();
  }

  destroy(): void {
    for (const frame of this.warningFrames.values()) cancelAnimationFrame(frame);
    this.warningFrames.clear();
    this.particles.destroy();
    super.destroy({ children: true });
  }
}
