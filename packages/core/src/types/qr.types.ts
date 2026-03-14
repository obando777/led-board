/**
 * Shared QR payload — what goes into the QR code (no position).
 * All phones scan the same QR, then pick their position locally.
 */
export interface SharedQRPayload {
  v: 1;
  text: string;
  speed: number;
  style: LEDStyle;
  textColor: string;
  bgColor: string;
  orientation: Orientation;
  grid: GridDimensions;
  startTimeUTC: number;
  fontSize: number;
  phoneWidth: number;
  phoneHeight: number;
}

/**
 * Full QR payload with position — used for rendering.
 * Created locally after scanning by combining SharedQRPayload + selected position.
 */
export interface QRPayload extends SharedQRPayload {
  position: GridPosition;
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
