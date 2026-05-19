import { useEffect, useRef, useCallback } from "react";
import { GameCanvas } from "../pixi/GameCanvas";
import type { Crucible } from "../game/crucibleTypes";
import type { Token } from "../game/tokenTypes";

interface UsePixiCanvasOptions {
  // Empty options now since the canvas binds to window size natively.
}

interface UsePixiCanvasReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  updateCrucible: (crucible: Crucible) => void;
  animateDraw: (token: Token) => Promise<void>;
  updateBagCount: (count: number) => void;
  playExplosion: () => Promise<void>;
  resetRound: () => void;
}

export function usePixiCanvas(options: UsePixiCanvasOptions): UsePixiCanvasReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvas | null>(null);

  // Mount Pixi on first render
  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    GameCanvas.create({
      container: containerRef.current,
    }).then((canvas) => {
      if (destroyed) {
        canvas.destroy();
        return;
      }
      canvasRef.current = canvas;
    });

    return () => {
      destroyed = true;
      canvasRef.current?.destroy();
      canvasRef.current = null;
    };
  }, []); // mount once only

  // Handle resize - handled internally by GameCanvas now!

  const updateCrucible = useCallback((crucible: Crucible) => {
    canvasRef.current?.updateCrucible(crucible);
  }, []);

  const animateDraw = useCallback(async (token: Token) => {
    await canvasRef.current?.animateDraw(token);
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

  return {
    containerRef,
    updateCrucible,
    animateDraw,
    updateBagCount,
    playExplosion,
    resetRound,
  };
}
