import * as PIXI from "pixi.js";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual, TOKEN_RADIUS } from "./tokenVisuals";
import { ParticleSystem } from "./ParticleSystem";

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
      const texture = PIXI.Assets.get("/images/brew_bag.png");
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
  async animateDraw(token: Token, targetX: number, targetY: number): Promise<void> {
    const visual = getTokenVisual(token.color);

    // Flash effect on bag
    if (this.bagSprite) {
      this.bagSprite.tint = 0xcc66ff;
      setTimeout(() => { if (this.bagSprite) this.bagSprite.tint = 0xffffff; }, 200);
    }
    this.particles.emitSparks(0, -10, visual.glow, 6);

    // Create a flying token sprite
    const flyingToken = new PIXI.Graphics();
    flyingToken.circle(0, 0, TOKEN_RADIUS);
    flyingToken.fill({ color: visual.fill });
    flyingToken.stroke({ color: visual.border, width: 2 });
    flyingToken.x = this.x;
    flyingToken.y = this.y;

    // Add to parent so it can fly across the screen
    this.parent?.addChild(flyingToken);

    // Animate fly to target
    await this.flyTo(flyingToken, targetX, targetY);

    // Burst on arrival
    this.particles.emitSparks(targetX - this.x, targetY - this.y, visual.glow, 8);

    flyingToken.destroy();
  }

  private flyTo(
    sprite: PIXI.Graphics,
    toX: number,
    toY: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const fromX = sprite.x;
      const fromY = sprite.y;
      const totalFrames = 28;
      let frame = 0;

      const tick = () => {
        frame++;
        const t = frame / totalFrames;
        // Ease out cubic
        const eased = 1 - Math.pow(1 - t, 3);

        // Arc path — rises then falls toward target
        const arc = Math.sin(t * Math.PI) * -60;

        sprite.x = fromX + (toX - fromX) * eased;
        sprite.y = fromY + (toY - fromY) * eased + arc;
        sprite.scale.set(0.6 + eased * 0.4);
        sprite.alpha = t < 0.1 ? t / 0.1 : 1;

        if (frame >= totalFrames) {
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
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
