import { useState, useCallback, useRef } from "react";
import { aiTurnAnimator } from "../game/AITurnAnimator";
import type { AITurnEvent } from "../game/AITurnAnimator";
import type { Player } from "../game/playerTypes";
import type { GameState } from "../game/gameState";

interface UseAITurnReturn {
  running: boolean;
  events: AITurnEvent[];
  aiWhiteSum: number;
  aiSpiral: number;
  runAITurn: (aiPlayer: Player, state: GameState) => Promise<Player>;
  fastForward: () => void;
  resetFastForward: () => void;
}

export function useAITurn(): UseAITurnReturn {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<AITurnEvent[]>([]);
  const [aiWhiteSum, setAiWhiteSum] = useState(0);
  const [aiSpiral, setAiSpiral] = useState(0);
  const eventsRef = useRef<AITurnEvent[]>([]);
  const fastForwardRef = useRef(false);

  const runAITurn = useCallback(
    async (aiPlayer: Player, state: GameState): Promise<Player> => {
      setRunning(true);
      aiTurnAnimator.setFastForward(fastForwardRef.current);
      eventsRef.current = [];
      setEvents([]);
      setAiWhiteSum(0);
      setAiSpiral(0);

      aiTurnAnimator.onEvent((event) => {
        eventsRef.current = [...eventsRef.current, event];
        setEvents([...eventsRef.current]);

        // Keep stats bar in sync with draw events
        if (event.type === "draw") {
          setAiWhiteSum(event.player.crucible.whiteSum);
          setAiSpiral(event.player.crucible.filledUpTo);
        }
        if (event.type === "exploded") {
          setAiWhiteSum(event.player.crucible.whiteSum);
          setAiSpiral(event.player.crucible.filledUpTo);
        }
      });

      try {
        return await aiTurnAnimator.run(aiPlayer, state);
      } finally {
        setRunning(false);
      }
    },
    []
  );

  const fastForward = useCallback(() => {
    fastForwardRef.current = true;
    aiTurnAnimator.setFastForward(true);
  }, []);

  const resetFastForward = useCallback(() => {
    fastForwardRef.current = false;
    aiTurnAnimator.setFastForward(false);
  }, []);

  return { running, events, aiWhiteSum, aiSpiral, runAITurn, fastForward, resetFastForward };
}
