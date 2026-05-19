import * as PIXI from "pixi.js";
import type { Crucible } from "../game/crucibleTypes";
import { CRUCIBLE_SIZE } from "../game/crucibleTypes";
import { generateSpiralPoints } from "./spiralMath";
import { TokenSprite } from "./TokenSprite";
import { ParticleSystem } from "./ParticleSystem";
import { getTokenVisual } from "./tokenVisuals";
import type { Token } from "../game/tokenTypes";
import { useSettingsStore } from "../store/settingsStore";

const SPIRAL_POINTS = generateSpiralPoints();

export class CrucibleScene extends PIXI.Container {
  private trackGraphics: PIXI.Graphics;
  private tokenLayer: PIXI.Container;
  private particles: ParticleSystem;
  private positionMarker: PIXI.Graphics;
  private placedSprites: Map<number, TokenSprite> = new Map();

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
    this.startAmbientEffects();
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
    // Place any newly filled slots
    for (const slot of crucible.slots) {
      if (slot.token && !this.placedSprites.has(slot.position)) {
        this.placeTokenAt(slot.position, slot.token);
      }
    }

    // Update position marker
    this.updatePositionMarker(crucible.filledUpTo);

    // Trigger explosion effect
    if (crucible.exploded) {
      this.triggerExplosion(crucible.filledUpTo);
    }
  }

  // ── Animate a token landing at a position ──────────────────────────────────
  private async placeTokenAt(position: number, token: Token): Promise<void> {
    const point = SPIRAL_POINTS[Math.min(position, CRUCIBLE_SIZE - 1)];
    const visual = getTokenVisual(token.color);

    const sprite = new TokenSprite(token);
    sprite.x = point.x;
    sprite.y = point.y;
    sprite.scale.set(0.1);
    this.tokenLayer.addChild(sprite);
    this.placedSprites.set(position, sprite);

    // Spark burst on placement
    this.particles.emitSparks(point.x, point.y, visual.glow, 10);

    // Scale-in animation
    await sprite.animatePlacement();

    // Extra glow for white tokens (dangerous!)
    if (token.color === "white") {
      this.pulseWhiteWarning(sprite);
    }
  }

  // ── Pulse warning on white tokens ──────────────────────────────────────────
  private pulseWhiteWarning(sprite: TokenSprite): void {
    let frame = 0;
    const tick = () => {
      frame++;
      const intensity = (Math.sin(frame * 0.1) + 1) / 2;
      sprite.pulseGlow(intensity);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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
    this.particles.emitExplosion(point.x, point.y);

    // Shake all placed tokens
    const sprites = Array.from(this.placedSprites.values());
    await Promise.all(sprites.map((s) => s.animateExplosion()));
  }

  // ── Rich ambient particle atmosphere ───────────────────────────────────────
  private startAmbientEffects(): void {
    const center = SPIRAL_POINTS[0];
    let frame = 0;

    const tick = () => {
      frame++;

      // Read quality setting — controls particle density
      const quality = useSettingsStore.getState().quality;

      // Low = no ambient particles at all
      if (quality === "low") {
        requestAnimationFrame(tick);
        return;
      }

      // Medium = half density (double the frame intervals)
      const mult = quality === "medium" ? 2 : 1;

      // Smoke wisps from center
      if (frame % (6 * mult) === 0) {
        this.particles.emitSmoke(
          center.x + (Math.random() - 0.5) * 60,
          center.y + (Math.random() - 0.5) * 30,
          1
        );
      }

      // Steam columns rising from the edges
      if (frame % (12 * mult) === 0) {
        this.particles.emitSteam(
          center.x + (Math.random() - 0.5) * 200,
          center.y + 40 + Math.random() * 30,
          1
        );
      }

      // Floating embers
      if (frame % (18 * mult) === 0) {
        this.particles.emitEmbers(center.x, center.y, 1);
      }

      // Magical motes orbiting gently
      if (frame % (30 * mult) === 0) {
        this.particles.emitMotes(center.x, center.y, 1);
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Reset for new round ────────────────────────────────────────────────────
  reset(): void {
    this.tokenLayer.removeChildren();
    this.placedSprites.clear();
    this.positionMarker.clear();
  }

  destroy(): void {
    this.particles.destroy();
    super.destroy({ children: true });
  }
}
