# Hexbrewers of Ashenveil

A dark fantasy bag-building brewing game — web adaptation built with React, Pixi.js, and Zustand.

## Stack

- **React 18** — UI components
- **Pixi.js 8** — 2D WebGL rendering (crucible spiral, token animations, particles)
- **Zustand** — game state management
- **TypeScript** — fully typed throughout
- **Vite** — dev server and bundler

## Getting Started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Project Structure

```
src/
├── game/         # Pure game logic (no UI) — 17 files
│   ├── tokenTypes.ts
│   ├── bagTypes.ts
│   ├── crucibleTypes.ts
│   ├── playerTypes.ts
│   ├── omenTypes.ts
│   ├── marketTypes.ts
│   ├── gameState.ts
│   ├── bag.ts
│   ├── bagFactory.ts
│   ├── crucible.ts
│   ├── scoring.ts
│   ├── flask.ts
│   ├── market.ts
│   ├── marketFactory.ts
│   ├── omen.ts
│   ├── omenResolver.ts
│   ├── aiProbability.ts
│   ├── aiStrategy.ts
│   ├── aiMarket.ts
│   ├── ai.ts
│   └── index.ts
│
├── store/        # Zustand store + selectors — 3 files
│   ├── gameStore.ts
│   ├── selectors.ts
│   └── index.ts
│
├── pixi/         # Pixi.js visual layer — 9 files
│   ├── spiralMath.ts
│   ├── tokenVisuals.ts
│   ├── TokenSprite.ts
│   ├── ParticleSystem.ts
│   ├── BagAnimation.ts
│   ├── CrucibleScene.ts
│   ├── ExplosionOverlay.ts
│   ├── GameCanvas.ts
│   └── index.ts
│
├── components/   # React components — 8 files
│   ├── usePixiCanvas.ts
│   ├── OmenCardDisplay.tsx
│   ├── PlayerPanel.tsx
│   ├── BrewingControls.tsx
│   ├── BlackMarket.tsx
│   ├── GameOver.tsx
│   ├── GameBoard.tsx
│   └── index.ts
│
├── App.tsx
└── main.tsx
```

## Game Rules (Hexbrewers edition)

- 9 rounds total
- Each round: reveal Omen Card → brew (draw tokens) → score → shop
- Draw tokens from your bag and place them on your crucible spiral
- **Voidshards (white)** are dangerous — if their total value exceeds 7, your crucible shatters
- If crucible shatters: choose between points OR soulstones (not both)
- If crucible survives: earn both points AND soulstones
- Spend soulstones at the Black Market to buy new ingredients
- Highest prestige after 9 rounds wins

## AI — The Shade

The AI opponent adapts its strategy dynamically:
- **Reckless** — early game or desperate comeback
- **Calculated** — mid game, weighs explosion probability per draw
- **Conservative** — protecting a large lead
