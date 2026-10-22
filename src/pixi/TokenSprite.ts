import * as PIXI from "pixi.js";
import type { Token } from "../game/tokenTypes";
import { getTokenVisual, TOKEN_RADIUS } from "./tokenVisuals";
import { prefersReducedMotion } from "../accessibility";
import { MIREWROUGHT_ASSETS } from "../assets/mirewroughtAssets";
import { CORE_INGREDIENT_ASSETS } from "../assets/coreAssets";

export class TokenSprite extends PIXI.Container {
  private circle: PIXI.Graphics;
  private glowCircle: PIXI.Graphics;
  private valueText: PIXI.Text;
  private token: Token;

  constructor(token: Token) {
    super();
    this.token = token;

    const visual = getTokenVisual(token.color);

    // Outer glow ring (slightly larger, semi-transparent)
    this.glowCircle = new PIXI.Graphics();
    this.glowCircle.circle(0, 0, TOKEN_RADIUS + 6);
    this.glowCircle.fill({ color: visual.glow, alpha: 0.25 });
    this.addChild(this.glowCircle);

    // Main circle
    this.circle = new PIXI.Graphics();
    this.circle.circle(0, 0, TOKEN_RADIUS);
    this.circle.fill({ color: visual.fill });
    this.circle.stroke({ color: visual.border, width: 2, alpha: 0.9 });
    this.addChild(this.circle);

    const assetPath = token.color === "echo"
      ? MIREWROUGHT_ASSETS.echoReed
      : token.color === "orange" && token.value === 6
        ? MIREWROUGHT_ASSETS.embercore
        : CORE_INGREDIENT_ASSETS[token.color];
    try {
      const texture = assetPath ? PIXI.Assets.get(assetPath) : null;
      if (texture) {
        const icon = new PIXI.Sprite(texture);
        icon.anchor.set(0.5);
        icon.width = TOKEN_RADIUS * 1.4;
        icon.height = TOKEN_RADIUS * 1.4;
        this.addChild(icon);
      }
    } catch {
      // Fallback: just use base circle
    }

    // Value label
    this.valueText = new PIXI.Text({
      text: `${visual.symbol}${token.resolvedMovement ?? (token.color === "echo" ? "?" : token.value)}`,
      style: {
        fontFamily: "serif",
        fontSize: 12,
        fill: visual.border,
        fontWeight: "bold",
        align: "center",
      },
    });
    this.valueText.anchor.set(0.5);
    this.addChild(this.valueText);

    this.interactive = true;
    this.cursor = "pointer";
  }

  // Pulse animation — called when token is placed
  async animatePlacement(): Promise<void> {
    if (prefersReducedMotion()) {
      this.scale.set(1);
      return;
    }
    return new Promise((resolve) => {
      let frame = 0;
      const totalFrames = 22;

      const tick = () => {
        frame++;
        const t = frame / totalFrames;
        const scale = t < 0.58
          ? 0.15 + (t / 0.58) * 1.12
          : 1.27 - ((t - 0.58) / 0.42) * 0.27;
        this.scale.set(scale);

        if (frame >= totalFrames) {
          this.scale.set(1);
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  // Glow pulse — used to highlight dangerous white tokens
  pulseGlow(intensity: number): void {
    const visual = getTokenVisual(this.token.color);
    this.glowCircle.clear();
    this.glowCircle.circle(0, 0, TOKEN_RADIUS + 6 + intensity * 8);
    this.glowCircle.fill({ color: visual.glow, alpha: 0.15 + intensity * 0.35 });
  }

  // Shake animation — used on explosion
  async animateExplosion(): Promise<void> {
    if (prefersReducedMotion()) {
      this.alpha = 0;
      return;
    }
    return new Promise((resolve) => {
      let frame = 0;
      const totalFrames = 24;

      const tick = () => {
        frame++;
        const shake = Math.sin(frame * 1.8) * (1 - frame / totalFrames) * 10;
        this.x += shake * 0.3;
        this.alpha = 1 - frame / totalFrames;

        if (frame >= totalFrames) {
          this.alpha = 0;
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  getToken(): Token {
    return this.token;
  }
}
