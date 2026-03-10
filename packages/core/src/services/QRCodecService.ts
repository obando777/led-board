import type { QRPayload, LEDStyle, Orientation } from '../types';

const VALID_STYLES: LEDStyle[] = ['dot-matrix', 'smooth', 'neon'];
const VALID_ORIENTATIONS: Orientation[] = ['landscape', 'portrait'];

/**
 * Encodes and decodes QR payloads.
 * Uses compact JSON keys to minimize QR data size.
 */
export const QRCodecService = {
  /**
   * Encode a QRPayload into a compact string for QR code generation.
   * Uses short keys to save space (QR capacity ~2953 bytes).
   */
  encode(payload: QRPayload): string {
    const compact = {
      v: payload.v,
      t: payload.text,
      s: payload.speed,
      y: payload.style,
      tc: payload.textColor,
      bc: payload.bgColor,
      o: payload.orientation,
      gc: payload.grid.cols,
      gr: payload.grid.rows,
      pc: payload.position.col,
      pr: payload.position.row,
      st: payload.startTimeUTC,
      fs: payload.fontSize,
    };
    return JSON.stringify(compact);
  },

  /**
   * Decode a scanned QR string back into a QRPayload.
   * Returns null if invalid.
   */
  decode(data: string): QRPayload | null {
    try {
      const compact = JSON.parse(data);
      const payload: QRPayload = {
        v: compact.v,
        text: compact.t,
        speed: compact.s,
        style: compact.y,
        textColor: compact.tc,
        bgColor: compact.bc,
        orientation: compact.o,
        grid: { cols: compact.gc, rows: compact.gr },
        position: { col: compact.pc, row: compact.pr },
        startTimeUTC: compact.st,
        fontSize: compact.fs,
      };
      return this.validate(payload) ? payload : null;
    } catch {
      return null;
    }
  },

  /**
   * Validate that a payload has all required fields and sane values.
   */
  validate(payload: unknown): payload is QRPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;

    if (p.v !== 1) return false;
    if (typeof p.text !== 'string' || p.text.length === 0) return false;
    if (typeof p.speed !== 'number' || p.speed <= 0) return false;
    if (!VALID_STYLES.includes(p.style as LEDStyle)) return false;
    if (typeof p.textColor !== 'string') return false;
    if (typeof p.bgColor !== 'string') return false;
    if (!VALID_ORIENTATIONS.includes(p.orientation as Orientation)) return false;
    if (typeof p.fontSize !== 'number' || p.fontSize <= 0) return false;
    if (typeof p.startTimeUTC !== 'number') return false;

    const grid = p.grid as Record<string, unknown> | undefined;
    if (!grid || typeof grid.cols !== 'number' || typeof grid.rows !== 'number') return false;
    if (grid.cols < 1 || grid.cols > 8 || grid.rows < 1 || grid.rows > 8) return false;

    const pos = p.position as Record<string, unknown> | undefined;
    if (!pos || typeof pos.col !== 'number' || typeof pos.row !== 'number') return false;
    if (pos.col < 0 || pos.col >= (grid.cols as number)) return false;
    if (pos.row < 0 || pos.row >= (grid.rows as number)) return false;

    return true;
  },
};
