/**
 * QR payload encoded into each phone's QR code.
 * Contains ALL information needed for offline rendering.
 */
export interface QRPayload {
  /** Schema version for forward compat */
  v: 1;
  /** Text + emojis to display */
  text: string;
  /** Scroll speed in pixels per second */
  speed: number;
  /** LED rendering style */
  style: LEDStyle;
  /** Text color as hex string */
  textColor: string;
  /** Background color as hex string */
  bgColor: string;
  /** Phone orientation */
  orientation: Orientation;
  /** Grid dimensions */
  grid: GridDimensions;
  /** This phone's position in the grid (0-indexed) */
  position: GridPosition;
  /** UTC timestamp (ms) when animation starts */
  startTimeUTC: number;
  /** Font size / LED dot scale factor */
  fontSize: number;
  /** Reference phone width (px) — all phones use this for animation math */
  phoneWidth: number;
  /** Reference phone height (px) — all phones use this for animation math */
  phoneHeight: number;
}

export type LEDStyle = 'dot-matrix' | 'smooth' | 'neon';
export type Orientation = 'landscape' | 'portrait';

export interface GridDimensions {
  cols: number;
  rows: number;
}

export interface GridPosition {
  col: number;
  row: number;
}
