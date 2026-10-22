export type RandomSource = () => number;

let source: RandomSource = Math.random;

export function gameplayRandom(): number {
  return source();
}

export function setGameplayRandomSource(next: RandomSource): void {
  source = next;
}

export function resetGameplayRandomSource(): void {
  source = Math.random;
}

// Mulberry32: compact, deterministic, and sufficient for repeatable balance tests.
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
