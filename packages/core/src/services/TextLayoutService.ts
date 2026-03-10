import type { LEDRenderConfig } from '../types';

/**
 * Measures and lays out text + emojis for LED rendering.
 * Platform-specific measurement is injected via the measureText callback.
 */
export const TextLayoutService = {
  /**
   * Compute the total pixel width of the text at the given font size.
   */
  computeTextWidth(
    text: string,
    fontSize: number,
    measureText: (text: string, fontSize: number) => number,
  ): number {
    return measureText(text, fontSize);
  },

  /**
   * Derive LED render config from QR payload fields.
   */
  buildRenderConfig(
    style: LEDRenderConfig['style'],
    textColor: string,
    bgColor: string,
    fontSize: number,
  ): LEDRenderConfig {
    switch (style) {
      case 'dot-matrix': {
        const dotSize = Math.max(2, Math.round(fontSize / 8));
        const dotGap = Math.max(1, Math.round(dotSize * 0.4));
        return { style, textColor, bgColor, fontSize, dotSize, dotGap, glowRadius: 0 };
      }
      case 'neon': {
        return {
          style,
          textColor,
          bgColor,
          fontSize,
          dotSize: 0,
          dotGap: 0,
          glowRadius: Math.round(fontSize / 3),
        };
      }
      case 'smooth':
      default:
        return { style, textColor, bgColor, fontSize, dotSize: 0, dotGap: 0, glowRadius: 0 };
    }
  },
};
