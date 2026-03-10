import type { GridDimensions, GridPosition } from './qr.types';

/**
 * A slice represents the viewport of a single phone in the grid.
 */
export interface PhoneSlice {
  /** Pixel offset X from the left edge of the full panel */
  offsetX: number;
  /** Pixel offset Y from the top edge of the full panel */
  offsetY: number;
  /** Width of this phone's viewport in pixels */
  width: number;
  /** Height of this phone's viewport in pixels */
  height: number;
}

/**
 * Full panel dimensions (all phones combined).
 */
export interface PanelDimensions {
  /** Total width in pixels */
  totalWidth: number;
  /** Total height in pixels */
  totalHeight: number;
  /** Grid layout */
  grid: GridDimensions;
}

/**
 * A slot in the QR distribution grid.
 */
export interface GridSlot {
  position: GridPosition;
  label: string;
  isAssignedToDirector: boolean;
}
