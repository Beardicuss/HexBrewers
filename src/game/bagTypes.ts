import type { Token } from "./tokenTypes";

// The bag holds all tokens not yet drawn this round
export interface Bag {
  tokens: Token[]; // unordered pool — draw is random
}
