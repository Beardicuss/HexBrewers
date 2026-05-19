import * as PIXI from "pixi.js";

interface Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  scaleDecay?: boolean;
  rotationSpeed?: number;
}

export class ParticleSystem extends PIXI.Container {
  private particles: Particle[] = [];
  private ticker: PIXI.Ticker;

  constructor() {
    super();
    this.ticker = new PIXI.Ticker();
    this.ticker.add(this.updateParticles, this);
    this.ticker.start();
  }

  // ── Smoke wisps — large, slow-rising translucent blobs ──────────────────────
  emitSmoke(x: number, y: number, count = 4): void {
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const r = 3 + Math.random() * 4;
      g.circle(0, 0, r);
      g.fill({ color: 0x443366, alpha: 0.5 });
      g.x = x + (Math.random() - 0.5) * 20;
      g.y = y;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.8 - Math.random() * 0.8,
        life: 60 + Math.random() * 40,
        maxLife: 100,
        color: 0x443366,
      });
    }
  }

  // ── Steam columns — wide, tall, drifting upward with slow fade ─────────────
  emitSteam(x: number, y: number, count = 3): void {
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const r = 8 + Math.random() * 12;
      g.circle(0, 0, r);
      g.fill({ color: 0x6644aa, alpha: 0.15 });
      g.x = x + (Math.random() - 0.5) * 80;
      g.y = y + Math.random() * 20;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.3 - Math.random() * 0.5,
        life: 120 + Math.random() * 80,
        maxLife: 200,
        color: 0x6644aa,
        scaleDecay: true,
      });
    }
  }

  // ── Floating embers — tiny bright dots drifting upward ──────────────────────
  emitEmbers(x: number, y: number, count = 2): void {
    const colors = [0xff6600, 0xffaa00, 0xcc44ff, 0xaa22ff];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const g = new PIXI.Graphics();
      g.circle(0, 0, 1 + Math.random() * 2);
      g.fill({ color, alpha: 0.8 });
      g.x = x + (Math.random() - 0.5) * 160;
      g.y = y + (Math.random() - 0.5) * 60;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 1.2,
        life: 80 + Math.random() * 60,
        maxLife: 140,
        color,
      });
    }
  }

  // ── Magical motes — slow-orbiting glowing specks ───────────────────────────
  emitMotes(x: number, y: number, count = 1): void {
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const r = 1.5 + Math.random() * 2;
      g.circle(0, 0, r);
      g.fill({ color: 0xddaaff, alpha: 0.6 });
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 120;
      g.x = x + Math.cos(angle) * dist;
      g.y = y + Math.sin(angle) * dist;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: Math.cos(angle + Math.PI / 2) * 0.3,
        vy: Math.sin(angle + Math.PI / 2) * 0.3 - 0.2,
        life: 150 + Math.random() * 100,
        maxLife: 250,
        color: 0xddaaff,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
  }

  // ── Sparks — triggered when a token is placed ──────────────────────────────
  emitSparks(x: number, y: number, color: number, count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      const g = new PIXI.Graphics();
      g.rect(-1, -3, 2, 6);
      g.fill({ color, alpha: 0.9 });
      g.x = x;
      g.y = y;
      g.rotation = angle;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        color,
      });
    }
  }

  // ── Explosion burst — triggered when crucible explodes ─────────────────────
  emitExplosion(x: number, y: number): void {
    const colors = [0xff3300, 0xff8800, 0xffcc00, 0x8800ff];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 5;

      const g = new PIXI.Graphics();
      g.circle(0, 0, size);
      g.fill({ color, alpha: 0.95 });
      g.x = x + (Math.random() - 0.5) * 30;
      g.y = y + (Math.random() - 0.5) * 30;
      this.addChild(g);

      this.particles.push({
        sprite: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 40 + Math.random() * 30,
        maxLife: 70,
        color,
      });
    }
  }

  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      p.vy += 0.02; // very gentle gravity

      const ratio = p.life / p.maxLife;
      p.sprite.alpha = ratio * 0.8;

      // Steam particles grow slightly as they rise
      if (p.scaleDecay) {
        p.sprite.scale.set(1 + (1 - ratio) * 0.5);
      }

      // Apply subtle rotation for motes
      if (p.rotationSpeed) {
        p.sprite.rotation += p.rotationSpeed;
      }

      if (p.life <= 0) {
        this.removeChild(p.sprite);
        p.sprite.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    this.ticker.stop();
    this.ticker.destroy();
    super.destroy({ children: true });
  }
}
