import type { AnimationConfig, AnimationFrame } from '../types';

/**
 * Deterministic animation engine.
 * Given a config and current wall-clock time, computes the animation frame.
 * Pure functions — no state, no side effects.
 */
export const AnimationService = {
  /**
   * Compute the current animation frame based on wall-clock time.
   */
  getFrame(config: AnimationConfig, nowMs: number): AnimationFrame {
    const elapsedMs = nowMs - config.startTimeUTC;
    const countdownMs = Math.max(0, -elapsedMs);
    const isRunning = elapsedMs >= 0;

    const scrollOffsetX = isRunning
      ? this.computeScrollOffset(
          elapsedMs,
          config.speed,
          config.totalTextWidth,
          config.viewportWidth,
        )
      : 0;

    return { scrollOffsetX, elapsedMs: Math.max(0, elapsedMs), isRunning, countdownMs };
  },

  /**
   * Compute scroll offset for looping text.
   * Text starts off-screen right, scrolls left, loops when fully off-screen left.
   */
  computeScrollOffset(
    elapsedMs: number,
    speed: number,
    totalTextWidth: number,
    viewportWidth: number,
  ): number {
    const elapsedSec = elapsedMs / 1000;
    const rawOffset = elapsedSec * speed;
    // Full cycle: text travels from right edge to fully off left edge
    const cycleLength = totalTextWidth + viewportWidth;
    // Start position: text begins just off the right edge
    const loopedOffset = rawOffset % cycleLength;
    // Return x position: starts at +viewportWidth, moves left
    return viewportWidth - loopedOffset;
  },
};
