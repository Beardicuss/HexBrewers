import * as PIXI from "pixi.js";

// Full-screen overlay that flashes and shakes when crucible explodes
export class ExplosionOverlay extends PIXI.Container {
  private flash: PIXI.Graphics;
  private text: PIXI.Text;

  constructor(screenW: number, screenH: number) {
    super();

    // Red flash background
    this.flash = new PIXI.Graphics();
    this.flash.rect(0, 0, screenW, screenH);
    this.flash.fill({ color: 0x440000, alpha: 0 });
    this.addChild(this.flash);

    // "CRUCIBLE SHATTERED" warning text
    this.text = new PIXI.Text({
      text: "✦ CRUCIBLE SHATTERED ✦",
      style: {
        fontFamily: "serif",
        fontSize: 36,
        fill: 0xff3300,
        align: "center",
        dropShadow: {
          color: 0xff0000,
          blur: 12,
          distance: 0,
          alpha: 0.9,
        },
        letterSpacing: 4,
      },
    });
    this.text.anchor.set(0.5);
    this.text.x = screenW / 2;
    this.text.y = screenH / 2;
    this.text.alpha = 0;
    this.addChild(this.text);

    this.visible = false;
    this.interactive = false;
  }

  // Play explosion sequence — returns promise when done
  async play(): Promise<void> {
    this.visible = true;

    // Phase 1: flash in fast
    await this.animateFlash(0, 0.55, 10);

    // Phase 2: hold briefly
    await this.wait(18);

    // Phase 3: fade text in
    await this.animateTextIn(20);

    // Phase 4: hold on text
    await this.wait(50);

    // Phase 5: fade everything out
    await this.animateOut(30);

    this.visible = false;
    this.flash.alpha = 0;
    this.text.alpha = 0;
  }

  private animateFlash(from: number, to: number, frames: number): Promise<void> {
    return new Promise((resolve) => {
      let f = 0;
      const tick = () => {
        f++;
        const t = f / frames;
        this.flash.alpha = from + (to - from) * t;
        if (f >= frames) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private animateTextIn(frames: number): Promise<void> {
    return new Promise((resolve) => {
      let f = 0;
      const tick = () => {
        f++;
        this.text.alpha = f / frames;
        this.text.scale.set(0.8 + (f / frames) * 0.2);
        if (f >= frames) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private animateOut(frames: number): Promise<void> {
    return new Promise((resolve) => {
      let f = 0;
      const startFlash = this.flash.alpha;
      const tick = () => {
        f++;
        const t = f / frames;
        this.flash.alpha = startFlash * (1 - t);
        this.text.alpha = 1 - t;
        if (f >= frames) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private wait(frames: number): Promise<void> {
    return new Promise((resolve) => {
      let f = 0;
      const tick = () => {
        f++;
        if (f >= frames) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
}
