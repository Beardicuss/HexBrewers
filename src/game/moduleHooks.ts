import type { GameState } from "./gameState";

export type RuleHookPoint = "before_brew" | "after_brew" | "before_scoring" | "after_scoring";

export interface RuleHook {
  id: string;
  point: RuleHookPoint;
  priority: number;
  applies: (state: GameState) => boolean;
  run: (state: GameState) => GameState;
}

export function runRuleHooks(state: GameState, point: RuleHookPoint, hooks: RuleHook[]): GameState {
  return hooks
    .filter((hook) => hook.point === point && hook.applies(state))
    .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id))
    .reduce((current, hook) => hook.run(current), state);
}
