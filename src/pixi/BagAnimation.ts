import * as PIXI from "pixi.js";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual } from "./tokenVisuals";
import { ParticleSystem } from "./ParticleSystem";
import { prefersReducedMotion } from "../accessibility";
import { CORE_ECONOMY_ASSETS } from "../assets/coreAssets";
import { TokenSprite } from "./TokenSprite";

// Animates a token flying out of the bag and landing on the crucible
export class BagAnimation extends PIXI.Container {
  private bagSprite: PIXI.Sprite | null = null;
  private bagFallback: PIXI.Graphics;
  private countLabel: PIXI.Text;
  private particles: ParticleSystem;
  private tokenCount: number = 0;

  constructor() {
    super();

    this.particles = new ParticleSystem();
    this.addChild(this.particles);

    // Try to use the real bag asset
    this.bagFallback = new PIXI.Graphics();
    try {
      const texture = PIXI.Assets.get(CORE_ECONOMY_ASSETS.brewBag);
      if (texture) {
        this.bagSprite = new PIXI.Sprite(texture);
        this.bagSprite.anchor.set(0.5);
        this.bagSprite.width = 80;
        this.bagSprite.height = 80;
        this.addChild(this.bagSprite);
      } else {
        this.drawFallbackBag();
        this.addChild(this.bagFallback);
      }
    } catch {
      this.drawFallbackBag();
      this.addChild(this.bagFallback);
    }

    // Token count badge
    this.countLabel = new PIXI.Text({
      text: "0",
      style: {
        fontFamily: "serif",
        fontSize: 14,
        fill: 0xddbbff,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.countLabel.anchor.set(0.5);
    this.countLabel.y = 48;
    this.addChild(this.countLabel);
  }

  // Update token count display
  setTokenCount(count: number): void {
    this.tokenCount = count;
    this.countLabel.text = String(count);
  }

  // Animate a token being drawn from the bag
  async animateDraw(
    token: Token,
    targetX: number,
    targetY: number,
    onImpact?: () => void,
    getSpeedMultiplier: () => number = () => 1,
  ): Promise<void> {
    if (prefersReducedMotion()) {
      onImpact?.();
      return;
    }
    const visual = getTokenVisual(token.color);

    // Physical anticipation: the bag tightens and rattles before release.
    const restingRotation = this.bagSprite?.rotation ?? 0;
    // Setting Sprite.width/height establishes a texture-dependent base scale.
    // Preserve it: resetting scale to 1 would expand the source artwork to its
    // native resolution and make the HUD bag engulf the board.
    const restingScaleX = this.bagSprite?.scale.x ?? 1;
    const restingScaleY = this.bagSprite?.scale.y ?? 1;
    const anticipationStartedAt = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const elapsed = (now - anticipationStartedAt) / Math.max(0.28, getSpeedMultiplier());
        const t = Math.min(1, elapsed / 420);
        if (this.bagSprite) {
          const strength = Math.sin(t * Math.PI);
          this.bagSprite.rotation = restingRotation + Math.sin(t * Math.PI * 7) * 0.045 * strength;
          this.bagSprite.scale.set(
            restingScaleX * (1 + Math.sin(t * Math.PI) * 0.07),
            restingScaleY * (1 - Math.sin(t * Math.PI) * 0.05),
          );
        }
        if (t < 1) requestAnimationFrame(tick);
        else {
          if (this.bagSprite) {
            this.bagSprite.rotation = restingRotation;
            this.bagSprite.scale.set(restingScaleX, restingScaleY);
          }
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

    // Flash effect on bag
    if (this.bagSprite) {
      this.bagSprite.tint = 0xcc66ff;
      setTimeout(() => { if (this.bagSprite) this.bagSprite.tint = 0xffffff; }, 200);
    }
    this.particles.emitSparks(0, -10, visual.glow, token.color === "white" ? 14 : 8);

    const flyingToken = new TokenSprite(token);
    flyingToken.position.set(0, -18);
    flyingToken.scale.set(0.4);
    flyingToken.alpha = 0;
    this.addChild(flyingToken);

    // targetX/targetY are expressed in the stage's coordinate space, while the
    // flying token is a child of this scaled bag container. Convert through
    // Pixi's transform matrix so scaling/responsive layout cannot skew flight.
    const destination = this.toLocal(new PIXI.Point(targetX, targetY), this.parent ?? undefined);
    const destinationX = destination.x;
    const destinationY = destination.y;
    const duration = token.color === "white" ? 760 : 650;
    const startedAt = performance.now();

    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const elapsed = (now - startedAt) / Math.max(0.28, getSpeedMultiplier());
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const arc = Math.sin(Math.PI * t) * -105;
        flyingToken.x = destinationX * eased;
        flyingToken.y = -18 + (destinationY + 18) * eased + arc;
        flyingToken.alpha = Math.min(1, t * 5);
        flyingToken.rotation = (1 - t) * -0.42 + Math.sin(t * Math.PI) * 0.18;
        const scale = 0.4 + eased * 0.78 + Math.sin(t * Math.PI) * 0.2;
        flyingToken.scale.set(scale);

        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }

        onImpact?.();
        this.particles.emitSparks(destinationX, destinationY, visual.glow, token.color === "white" ? 24 : 12);
        window.setTimeout(() => {
          if (!flyingToken.destroyed) flyingToken.destroy({ children: true });
          resolve();
        }, 80);
      };
      requestAnimationFrame(tick);
    });
  }

  private drawFallbackBag(): void {
    const g = this.bagFallback;
    g.clear();
    g.roundRect(-30, -28, 60, 52, 12);
    g.fill({ color: 0x1a0a2e, alpha: 0.85 });
    g.stroke({ color: 0x6622aa, width: 2 });
    g.roundRect(-10, -38, 20, 14, 6);
    g.fill({ color: 0x1a0a2e, alpha: 0.85 });
    g.stroke({ color: 0x6622aa, width: 1.5 });
  }

  destroy(): void {
    this.particles.destroy();
    super.destroy({ children: true });
  }
}
