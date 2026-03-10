import { useRef, useEffect } from 'react';
import type { QRPayload, PhoneSlice, AnimationFrame } from '@led-panel/core';
import { AnimationService, GridService, TextLayoutService } from '@led-panel/core';

interface LEDCanvasProps {
  payload: QRPayload;
  width: number;
  height: number;
}

/**
 * Canvas component that renders the LED panel animation.
 * Handles dot-matrix, smooth, and neon styles.
 */
export function LEDCanvas({ payload, width, height }: LEDCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext('2d')!;
    const renderConfig = TextLayoutService.buildRenderConfig(
      payload.style,
      payload.textColor,
      payload.bgColor,
      payload.fontSize,
    );

    // Measure text width using canvas
    ctx.font = `bold ${payload.fontSize}px system-ui, sans-serif`;
    const totalTextWidth = ctx.measureText(payload.text).width;

    const slice = GridService.computeSlice(
      payload.position,
      payload.grid,
      width,
      height,
    );

    const panel = GridService.computePanelDimensions(payload.grid, width, height);

    const config = {
      text: payload.text,
      speed: payload.speed,
      startTimeUTC: payload.startTimeUTC,
      totalTextWidth,
      viewportWidth: panel.totalWidth,
      loop: true,
    };

    function draw(frame: AnimationFrame) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = renderConfig.bgColor;
      ctx.fillRect(0, 0, width, height);

      if (!frame.isRunning) {
        // Draw countdown
        const secs = Math.ceil(frame.countdownMs / 1000);
        ctx.fillStyle = renderConfig.textColor;
        ctx.font = `bold 72px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(secs), width / 2, height / 2);
        return;
      }

      // Compute text position: scrollOffsetX is in panel coordinates
      // Subtract this phone's slice offset to get local coordinates
      const localX = frame.scrollOffsetX - slice.offsetX;
      const textY = height / 2;

      switch (renderConfig.style) {
        case 'dot-matrix':
          drawDotMatrix(ctx, payload.text, localX, textY, renderConfig, width, height);
          break;
        case 'neon':
          drawNeon(ctx, payload.text, localX, textY, renderConfig);
          break;
        case 'smooth':
        default:
          drawSmooth(ctx, payload.text, localX, textY, renderConfig);
          break;
      }
    }

    function tick() {
      const frame = AnimationService.getFrame(config, Date.now());
      draw(frame);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [payload, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

function drawSmooth(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  config: ReturnType<typeof TextLayoutService.buildRenderConfig>,
) {
  ctx.font = `bold ${config.fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawNeon(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  config: ReturnType<typeof TextLayoutService.buildRenderConfig>,
) {
  ctx.font = `bold ${config.fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Outer glow
  ctx.shadowColor = config.textColor;
  ctx.shadowBlur = config.glowRadius * 2;
  ctx.fillStyle = config.textColor;
  ctx.fillText(text, x, y);

  // Inner glow (brighter)
  ctx.shadowBlur = config.glowRadius;
  ctx.fillText(text, x, y);

  // Core (white-ish center)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.6;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1.0;
}

function drawDotMatrix(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  config: ReturnType<typeof TextLayoutService.buildRenderConfig>,
  canvasWidth: number,
  canvasHeight: number,
) {
  const { dotSize, dotGap, fontSize, textColor, bgColor } = config;
  const cellSize = dotSize + dotGap;

  // Render text to offscreen canvas at bitmap resolution
  const offscreen = document.createElement('canvas');
  const cols = Math.ceil(canvasWidth / cellSize) + 2;
  const rows = Math.ceil(canvasHeight / cellSize) + 2;
  offscreen.width = cols * cellSize;
  offscreen.height = rows * cellSize;
  const offCtx = offscreen.getContext('2d')!;

  // Draw text on offscreen canvas
  offCtx.fillStyle = '#000000';
  offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
  offCtx.font = `bold ${fontSize}px system-ui, sans-serif`;
  offCtx.fillStyle = '#FFFFFF';
  offCtx.textAlign = 'left';
  offCtx.textBaseline = 'middle';
  offCtx.fillText(text, x, canvasHeight / 2);

  // Sample pixels and draw dots
  const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
  const pixels = imageData.data;

  // Draw dim grid dots for background (gives that LED panel feel)
  const dimColor = adjustBrightness(textColor, 0.08);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * cellSize + dotSize / 2;
      const cy = row * cellSize + dotSize / 2;

      // Sample the center pixel of this dot's cell
      const px = Math.floor(cx);
      const py = Math.floor(cy);
      const idx = (py * offscreen.width + px) * 4;
      const brightness = pixels[idx]; // red channel (text is white)

      ctx.beginPath();
      ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);

      if (brightness > 128) {
        // Lit dot
        ctx.fillStyle = textColor;
        ctx.fill();
        // Subtle glow
        ctx.shadowColor = textColor;
        ctx.shadowBlur = dotSize;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Dim dot (unlit LED)
        ctx.fillStyle = dimColor;
        ctx.fill();
      }
    }
  }
}

/** Adjust hex color brightness. factor 0-1 dims, >1 brightens. */
function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n * factor)));
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}
