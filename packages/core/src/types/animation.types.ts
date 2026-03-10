/**
 * State of the animation at a given frame.
 */
export interface AnimationFrame {
  /** Horizontal scroll offset in pixels */
  scrollOffsetX: number;
  /** Current time elapsed since start in ms */
  elapsedMs: number;
  /** Whether the animation has started */
  isRunning: boolean;
  /** Time remaining before start (ms), 0 if started */
  countdownMs: number;
}

/**
 * Configuration derived from QR payload for the animation engine.
 */
export interface AnimationConfig {
  text: string;
  speed: number;
  startTimeUTC: number;
  /** Total width of the full text in pixels (computed by TextLayoutService) */
  totalTextWidth: number;
  /** Total viewport width of the full panel (all phones combined) */
  viewportWidth: number;
  /** Whether the animation loops */
  loop: boolean;
}
