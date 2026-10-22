import * as PIXI from "pixi.js";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual } from "./tokenVisuals";
import { ParticleSystem } from "./ParticleSystem";
import { prefersReducedMotion } from "../accessibility";
import { CORE_ECONOMY_ASSETS } from "../assets/coreAssets";

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
  async animateDraw(token: Token, _targetX: number, _targetY: number): Promise<void> {
    if (prefersReducedMotion()) return;
    const visual = getTokenVisual(token.color);

    // Flash effect on bag
    if (this.bagSprite) {
      this.bagSprite.tint = 0xcc66ff;
      setTimeout(() => { if (this.bagSprite) this.bagSprite.tint = 0xffffff; }, 200);
    }
    this.particles.emitSparks(0, -10, visual.glow, 6);

    await new Promise((resolve) => window.setTimeout(resolve, 180));
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
