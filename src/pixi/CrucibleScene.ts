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
        this.placeTokenAt(placement.position, placement.token, stackIndex);
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
  private async placeTokenAt(position: number, token: Token, stackIndex = 0): Promise<void> {
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

    // Spark burst on placement
    if (!this.reducedMotion) this.particles.emitSparks(point.x, point.y, visual.glow, 10);

    // Scale-in animation
    await sprite.animatePlacement();

    // Extra glow for white tokens (dangerous!)
    if (token.color === "white" && !this.reducedMotion) {
      this.pulseWhiteWarning(token.id, sprite);
    }
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
