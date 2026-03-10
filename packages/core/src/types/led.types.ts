import type { LEDStyle } from './qr.types';

/**
 * Configuration for the LED renderer.
 */
export interface LEDRenderConfig {
  style: LEDStyle;
  textColor: string;
  bgColor: string;
  fontSize: number;
  /** Dot size for dot-matrix style (derived from fontSize) */
  dotSize: number;
  /** Gap between dots for dot-matrix style */
  dotGap: number;
  /** Glow radius for neon style */
  glowRadius: number;
}

/**
 * Platform-agnostic draw commands that the renderer produces.
 * Each platform (web Canvas, Skia) translates these to native calls.
 */
export interface LEDDot {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowRadius?: number;
}
