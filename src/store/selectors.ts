import { useGameStore } from "./gameStore";

export const useHumanPlayer = () =>
  useGameStore((s) => s.state.players.find((p) => p.kind === "human")!);

export const useAIPlayer = () =>
  useGameStore((s) => s.state.players.find((p) => p.kind === "ai")!);

export const useGamePhase = () => useGameStore((s) => s.state.phase);
export const useCurrentRound = () => useGameStore((s) => s.state.currentRound);
export const useTotalRounds = () => useGameStore((s) => s.state.totalRounds);
export const useCurrentOmen = () => useGameStore((s) => s.state.currentOmen);
export const useMarket = () => useGameStore((s) => s.state.market);
export const useWinner = () => useGameStore((s) => s.state.winner);
export const useBuyPhaseState = () => useGameStore((s) => s.state.buyPhaseState);
export const useBonusDie = () => useGameStore((s) => ({
  result: s.state.bonusDieResult,
  winner: s.state.bonusDieWinner,
}));

export const useIsGameOver = () => useGameStore((s) => s.state.phase === "game_over");

export const useHumanCrucible = () =>
  useGameStore((s) => s.state.players.find((p) => p.kind === "human")!.crucible);

export const useHumanBag = () =>
  useGameStore((s) => s.state.players.find((p) => p.kind === "human")!.bag);

export const useCanHumanDraw = () =>
  useGameStore((s) => {
    const human = s.state.players.find((p) => p.kind === "human")!;
    return (
      s.state.phase === "brewing" &&
      !human.crucible.exploded &&
      human.bag.tokens.length > 0
    );
  });

export const useCanHumanUseFlask = () =>
  useGameStore((s) => {
    const human = s.state.players.find((p) => p.kind === "human")!;
    const token = human.crucible.lastDrawnToken;
    return (
      s.state.phase === "brewing" &&
      human.flask &&
      token !== null &&
      token.color === "white" &&
      !human.crucible.exploded
    );
  });

export const useScores = () =>
  useGameStore((s) =>
    s.state.players.map((p) => ({ id: p.id, name: p.name, score: p.score }))
  );
