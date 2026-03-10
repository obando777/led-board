import { useRef, useCallback, useEffect } from 'react';
import type { QRPayload, AnimationFrame, AnimationConfig } from '@led-panel/core';
import { AnimationService, GridService, TextLayoutService } from '@led-panel/core';

/**
 * Drives the animation loop using requestAnimationFrame.
 * Returns current frame state that updates every frame.
 */
export function useAnimationLoop(
  payload: QRPayload | null,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const rafRef = useRef<number>(0);
  const configRef = useRef<AnimationConfig | null>(null);

  const measureText = useCallback((text: string, fontSize: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return text.length * fontSize * 0.6;
    const ctx = canvas.getContext('2d');
    if (!ctx) return text.length * fontSize * 0.6;
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    return ctx.measureText(text).width;
  }, [canvasRef]);

  const start = useCallback((onFrame: (frame: AnimationFrame) => void) => {
    if (!payload) return;

    const textWidth = TextLayoutService.computeTextWidth(payload.text, payload.fontSize, measureText);
    const panel = GridService.computePanelDimensions(
      payload.grid,
      window.innerWidth,
      window.innerHeight,
    );

    configRef.current = {
      text: payload.text,
      speed: payload.speed,
      startTimeUTC: payload.startTimeUTC,
      totalTextWidth: textWidth,
      viewportWidth: panel.totalWidth,
      loop: true,
    };

    function tick() {
      if (!configRef.current) return;
      const frame = AnimationService.getFrame(configRef.current, Date.now());
      onFrame(frame);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [payload, measureText]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop, measureText };
}
