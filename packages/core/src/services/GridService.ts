import type {
  GridDimensions,
  GridPosition,
  GridSlot,
  PanelDimensions,
  PhoneSlice,
} from '../types';

/**
 * Computes grid layouts and phone viewport slices.
 */
export const GridService = {
  /**
   * Generate all grid slots for the QR distribution screen.
   */
  generateSlots(grid: GridDimensions): GridSlot[] {
    const slots: GridSlot[] = [];
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const position: GridPosition = { col, row };
        slots.push({
          position,
          label: this.getSlotLabel(position, grid),
          isAssignedToDirector: false,
        });
      }
    }
    return slots;
  },

  /**
   * Compute the pixel slice for a specific phone in the grid.
   * Each phone shows a viewport-sized piece of the full panel.
   */
  computeSlice(
    position: GridPosition,
    grid: GridDimensions,
    phoneWidth: number,
    phoneHeight: number,
  ): PhoneSlice {
    return {
      offsetX: position.col * phoneWidth,
      offsetY: position.row * phoneHeight,
      width: phoneWidth,
      height: phoneHeight,
    };
  },

  /**
   * Compute total panel dimensions from grid and phone screen size.
   */
  computePanelDimensions(
    grid: GridDimensions,
    phoneWidth: number,
    phoneHeight: number,
  ): PanelDimensions {
    return {
      totalWidth: grid.cols * phoneWidth,
      totalHeight: grid.rows * phoneHeight,
      grid,
    };
  },

  /**
   * Get a human-readable label for a grid position.
   */
  getSlotLabel(position: GridPosition, grid: GridDimensions): string {
    const index = position.row * grid.cols + position.col + 1;
    const total = grid.cols * grid.rows;
    return `Phone ${index} of ${total}`;
  },
};
