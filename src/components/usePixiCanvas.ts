import { useEffect, useRef, useCallback } from "react";
import { GameCanvas } from "../pixi/GameCanvas";
import type { Crucible } from "../game/crucibleTypes";
import type { Token } from "../game/tokenTypes";

interface UsePixiCanvasOptions {
  explosionLabel: string;
  renderScale: number;
  mirewroughtEnabled: boolean;
  onBagClick: () => void;
}

interface UsePixiCanvasReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  updateCrucible: (crucible: Crucible) => void;
  animateDraw: (token: Token, onImpact?: () => void, getSpeedMultiplier?: () => number) => Promise<void>;
  updateBagCount: (count: number) => void;
  playExplosion: () => Promise<void>;
  resetRound: () => void;
  setPaused: (paused: boolean) => void;
}

export function usePixiCanvas({ explosionLabel, renderScale, mirewroughtEnabled, onBagClick }: UsePixiCanvasOptions): UsePixiCanvasReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvas | null>(null);
  const pausedRef = useRef(false);

  // Mount Pixi on first render
  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    GameCanvas.create({
      container: containerRef.current,
      explosionLabel,
      renderScale,
      mirewroughtEnabled,
      onBagClick,
    }).then((canvas) => {
      if (destroyed) {
        canvas.destroy();
        return;
      }
      canvasRef.current = canvas;
      canvas.setPaused(pausedRef.current);
    });

    return () => {
      destroyed = true;
      canvasRef.current?.destroy();
      canvasRef.current = null;
    };
  }, [explosionLabel, renderScale, mirewroughtEnabled, onBagClick]);

  // Handle resize - handled internally by GameCanvas now!

  const updateCrucible = useCallback((crucible: Crucible) => {
    canvasRef.current?.updateCrucible(crucible);
  }, []);

  const animateDraw = useCallback(async (token: Token, onImpact?: () => void, getSpeedMultiplier?: () => number) => {
    await canvasRef.current?.animateDraw(token, onImpact, getSpeedMultiplier);
  }, []);

  const updateBagCount = useCallback((count: number) => {
    canvasRef.current?.updateBagCount(count);
  }, []);

  const playExplosion = useCallback(async () => {
    await canvasRef.current?.playExplosion();
  }, []);

  const resetRound = useCallback(() => {
    canvasRef.current?.resetRound();
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    pausedRef.current = paused;
    canvasRef.current?.setPaused(paused);
  }, []);

  return {
    containerRef,
    updateCrucible,
    animateDraw,
    updateBagCount,
    playExplosion,
    resetRound,
    setPaused,
  };
}
