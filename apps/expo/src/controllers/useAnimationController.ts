import { useRef, useCallback, useEffect } from 'react';
import type { QRPayload, AnimationFrame, AnimationConfig } from '@led-panel/core';
import { AnimationService, GridService } from '@led-panel/core';

export function useAnimationLoop(payload: QRPayload | null) {
  const rafRef = useRef<number>(0);
  const configRef = useRef<AnimationConfig | null>(null);

  const buildConfig = useCallback((textWidth: number, viewportWidth: number) => {
    if (!payload) return;
    configRef.current = {
      text: payload.text,
      speed: payload.speed,
      startTimeUTC: payload.startTimeUTC,
      totalTextWidth: textWidth,
      viewportWidth,
      loop: true,
    };
  }, [payload]);

  const start = useCallback((onFrame: (frame: AnimationFrame) => void) => {
    function tick() {
      if (!configRef.current) return;
      const frame = AnimationService.getFrame(configRef.current, Date.now());
      onFrame(frame);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, buildConfig };
}
