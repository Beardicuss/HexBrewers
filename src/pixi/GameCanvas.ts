import * as PIXI from "pixi.js";
import { CrucibleScene } from "./CrucibleScene";
import { BagAnimation } from "./BagAnimation";
import { ExplosionOverlay } from "./ExplosionOverlay";
import type { Crucible } from "../game/crucibleTypes";
import type { Token } from "../game/tokenTypes";

export interface GameCanvasOptions {
  container: HTMLElement;
}

// Root Pixi scene — mounts into a React ref
export class GameCanvas {
  private app: PIXI.Application;
  private crucibleScene: CrucibleScene;
  private bagAnimation: BagAnimation;
  private explosionOverlay: ExplosionOverlay;

  private constructor(app: PIXI.Application, container: HTMLElement) {
    this.app = app;

    const { width, height } = app.screen;
    const cx = width / 2;
    const cy = height / 2; // Perfect vertical center!

    // Crucible sits at center
    this.crucibleScene = new CrucibleScene();
    this.crucibleScene.x = cx;
    this.crucibleScene.y = cy;
    this.crucibleScene.scale.set(1.5); // Re-tuned so tokens perfectly fit inside the inner liquid ring of the Cauldron
    app.stage.addChild(this.crucibleScene);

    // Bag sits at bottom-left corner
    this.bagAnimation = new BagAnimation();
    this.bagAnimation.x = 160;
    this.bagAnimation.y = height - 120;
    this.bagAnimation.scale.set(1.5);
    app.stage.addChild(this.bagAnimation);

    // Explosion overlay on top of everything
    this.explosionOverlay = new ExplosionOverlay(width, height);
    app.stage.addChild(this.explosionOverlay);

    // Self-contained resize handling
    window.addEventListener("resize", this.handleResize);
  }

  private handleResize = () => {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    this.crucibleScene.x = w / 2;
    this.crucibleScene.y = h / 2;
    this.bagAnimation.x = 160;
    this.bagAnimation.y = h - 120;
  };

  // Async factory — required because PIXI.Application.init() is async
  static async create(options: GameCanvasOptions): Promise<GameCanvas> {
    const app = new PIXI.Application();

    await app.init({
      resizeTo: window, // <--- Natively make the canvas fill the window!
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // --- PRELOAD ASSETS ---
    await PIXI.Assets.load([
      "/images/cauldron_bg.jpg",
      "/images/brew_bag.png",
      "/images/empty.png",
      "/images/spider.png",
      "/images/deathweave.png",
      "/images/frostbile.png",
      "/images/bloodthorn.png",
      "/images/plaguedust.png",
      "/images/wraithbloom.png",
      "/images/shadowmoss.png"
    ]);

    options.container.appendChild(app.canvas);

    return new GameCanvas(app, options.container);
  }

  // ── Public API called by React components ─────────────────────────────────

  // Sync crucible visuals to game state
  updateCrucible(crucible: Crucible): void {
    this.crucibleScene.update(crucible);
  }

  // Animate a token draw
  async animateDraw(token: Token): Promise<void> {
    const target = {
      x: this.crucibleScene.x,
      y: this.crucibleScene.y,
    };
    await this.bagAnimation.animateDraw(token, target.x, target.y);
  }

  // Update bag token count display
  updateBagCount(count: number): void {
    this.bagAnimation.setTokenCount(count);
  }

  // Trigger explosion overlay
  async playExplosion(): Promise<void> {
    await this.explosionOverlay.play();
  }

  // Reset between rounds
  resetRound(): void {
    this.crucibleScene.reset();
  }

  // Resize handler - deprecated to internal
  resize(width: number, height: number): void {
    // handled internally now
  }

  // Clean up on unmount
  destroy(): void {
    window.removeEventListener("resize", this.handleResize);
    this.crucibleScene.destroy();
    this.bagAnimation.destroy();
    this.app.destroy(true);
  }
}
