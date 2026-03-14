import { useState, useEffect, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import {
  Canvas,
  Text as SkiaText,
  useFont,
  Group,
  Fill,
  Shadow,
  Circle,
  Paint,
  BlurMask,
} from '@shopify/react-native-skia';
import type { QRPayload, AnimationFrame } from '@led-panel/core';
import { AnimationService, GridService, TextLayoutService } from '@led-panel/core';

// =====================================================
// 5x7 DOT MATRIX FONT
// Bit 6 = top row, bit 0 = bottom row.
// =====================================================
const FONT: Record<string, number[]> = {
  A: [0b0111111,0b1001000,0b1001000,0b1001000,0b0111111],
  B: [0b1111111,0b1001001,0b1001001,0b1001001,0b0110110],
  C: [0b0111110,0b1000001,0b1000001,0b1000001,0b0100010],
  D: [0b1111111,0b1000001,0b1000001,0b1000001,0b0111110],
  E: [0b1111111,0b1001001,0b1001001,0b1001001,0b1000001],
  F: [0b1111111,0b1001000,0b1001000,0b1001000,0b1000000],
  G: [0b0111110,0b1000001,0b1001001,0b1001001,0b0101110],
  H: [0b1111111,0b0001000,0b0001000,0b0001000,0b1111111],
  I: [0b0000000,0b1000001,0b1111111,0b1000001,0b0000000],
  J: [0b0000010,0b0000001,0b0000001,0b0000001,0b1111110],
  K: [0b1111111,0b0001000,0b0010100,0b0100010,0b1000001],
  L: [0b1111111,0b0000001,0b0000001,0b0000001,0b0000001],
  M: [0b1111111,0b0100000,0b0010000,0b0100000,0b1111111],
  N: [0b1111111,0b0100000,0b0010000,0b0001000,0b1111111],
  O: [0b0111110,0b1000001,0b1000001,0b1000001,0b0111110],
  P: [0b1111111,0b1001000,0b1001000,0b1001000,0b0110000],
  Q: [0b0111110,0b1000001,0b1000101,0b1000010,0b0111101],
  R: [0b1111111,0b1001000,0b1001100,0b1001010,0b0110001],
  S: [0b0110010,0b1001001,0b1001001,0b1001001,0b0100110],
  T: [0b1000000,0b1000000,0b1111111,0b1000000,0b1000000],
  U: [0b1111110,0b0000001,0b0000001,0b0000001,0b1111110],
  V: [0b1111100,0b0000010,0b0000001,0b0000010,0b1111100],
  W: [0b1111110,0b0000001,0b0001110,0b0000001,0b1111110],
  X: [0b1100011,0b0010100,0b0001000,0b0010100,0b1100011],
  Y: [0b1100000,0b0010000,0b0001111,0b0010000,0b1100000],
  Z: [0b1000011,0b1000101,0b1001001,0b1010001,0b1100001],
  '0': [0b0111110,0b1000101,0b1001001,0b1010001,0b0111110],
  '1': [0b0000000,0b0100001,0b1111111,0b0000001,0b0000000],
  '2': [0b0100011,0b1000101,0b1001001,0b1001001,0b0110001],
  '3': [0b0100010,0b1000001,0b1001001,0b1001001,0b0110110],
  '4': [0b0011000,0b0101000,0b1001000,0b1111111,0b0001000],
  '5': [0b1110010,0b1010001,0b1010001,0b1010001,0b1001110],
  '6': [0b0111110,0b1001001,0b1001001,0b1001001,0b0100110],
  '7': [0b1000000,0b1000111,0b1001000,0b1010000,0b1100000],
  '8': [0b0110110,0b1001001,0b1001001,0b1001001,0b0110110],
  '9': [0b0110010,0b1001001,0b1001001,0b1001001,0b0111110],
  ' ': [0,0,0,0,0],
  '!': [0b0000000,0b0000000,0b1111010,0b0000000,0b0000000],
  '?': [0b0100000,0b1000000,0b1001101,0b1001000,0b0110000],
  '.': [0b0000000,0b0000011,0b0000011,0b0000000,0b0000000],
  ',': [0b0000000,0b0000001,0b0000110,0b0000100,0b0000000],
  '-': [0b0001000,0b0001000,0b0001000,0b0001000,0b0001000],
  '+': [0b0001000,0b0001000,0b0111110,0b0001000,0b0001000],
  ':': [0b0000000,0b0110110,0b0110110,0b0000000,0b0000000],
  '/': [0b0000001,0b0000110,0b0001000,0b0110000,0b1000000],
  '#': [0b0010100,0b0111110,0b0010100,0b0111110,0b0010100],
};

const CHAR_W = 5;
const CHAR_H = 7;

interface LEDCanvasProps {
  payload: QRPayload;
}

interface DotInfo {
  x: number;
  y: number;
}

export function LEDCanvas({ payload }: LEDCanvasProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const refWidth = payload.phoneWidth;
  const refHeight = payload.phoneHeight;
  const scaleX = screenWidth / refWidth;
  const scaleY = screenHeight / refHeight;

  const [frame, setFrame] = useState<AnimationFrame>({
    scrollOffsetX: 0,
    elapsedMs: 0,
    isRunning: false,
    countdownMs: 0,
  });

  const font = useFont(require('../../assets/fonts/CourierNew.ttf'), payload.fontSize);
  const renderConfig = TextLayoutService.buildRenderConfig(
    payload.style,
    payload.textColor,
    payload.bgColor,
    payload.fontSize,
  );

  // Use reference dimensions for animation math so all phones compute identical values
  const slice = GridService.computeSlice(
    payload.position,
    payload.grid,
    refWidth,
    refHeight,
  );
  const panel = GridService.computePanelDimensions(payload.grid, refWidth, refHeight);

  // Dot matrix sizing
  const scale = payload.fontSize / 80;
  const dotR = Math.max(2, Math.round(4 * scale));
  const dotSpacing = Math.max(5, Math.round(10 * scale));
  const charPixelW = (CHAR_W + 1) * dotSpacing;

  const textChars = useMemo(() => [...payload.text], [payload.text]);
  const totalDotTextWidth = useMemo(() => textChars.length * charPixelW, [textChars, charPixelW]);

  // Dim color for background dots
  const dimColor = useMemo(() => {
    const tc = renderConfig.textColor;
    const r = parseInt(tc.slice(1, 3), 16);
    const g = parseInt(tc.slice(3, 5), 16);
    const b = parseInt(tc.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.07)`;
  }, [renderConfig.textColor]);

  const glowColor = useMemo(() => {
    const tc = renderConfig.textColor;
    const r = parseInt(tc.slice(1, 3), 16);
    const g = parseInt(tc.slice(3, 5), 16);
    const b = parseInt(tc.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.3)`;
  }, [renderConfig.textColor]);

  useEffect(() => {
    if (payload.style !== 'dot-matrix' && !font) return;

    const textWidth = payload.style === 'dot-matrix'
      ? totalDotTextWidth
      : (font ? font.measureText(payload.text).width : 0);

    if (textWidth === 0) return;

    const config = {
      text: payload.text,
      speed: payload.speed,
      startTimeUTC: payload.startTimeUTC,
      totalTextWidth: textWidth,
      viewportWidth: panel.totalWidth,
      loop: true,
    };

    let raf: number;
    function tick() {
      setFrame(AnimationService.getFrame(config, Date.now()));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [font, payload, panel.totalWidth, totalDotTextWidth]);

  // Background dots (static grid)
  const bgDots = useMemo(() => {
    if (payload.style !== 'dot-matrix') return [];
    const dots: DotInfo[] = [];
    const cols = Math.ceil(screenWidth / dotSpacing) + 1;
    const rows = Math.ceil(screenHeight / dotSpacing) + 1;
    const offX = (screenWidth % dotSpacing) / 2;
    const offY = (screenHeight % dotSpacing) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: offX + c * dotSpacing, y: offY + r * dotSpacing });
      }
    }
    return dots;
  }, [screenWidth, screenHeight, dotSpacing, payload.style]);

  // Compute lit dot positions in reference coordinates, then scale to screen
  function getLitDots(chars: string[], scrollX: number): DotInfo[] {
    const dots: DotInfo[] = [];
    const yCenter = refHeight / 2;
    const yStart = yCenter - (CHAR_H * dotSpacing) / 2;

    let cursorX = scrollX;
    for (const ch of chars) {
      if (cursorX + charPixelW < -dotSpacing || cursorX > refWidth + dotSpacing) {
        cursorX += charPixelW;
        continue;
      }
      const colData = FONT[ch.toUpperCase()];
      if (!colData) {
        cursorX += charPixelW;
        continue;
      }
      for (let c = 0; c < CHAR_W; c++) {
        const bits = colData[c];
        for (let r = 0; r < CHAR_H; r++) {
          if (bits & (1 << r)) {
            const x = cursorX + c * dotSpacing;
            const y = yStart + (CHAR_H - 1 - r) * dotSpacing;
            if (x > -dotR * 3 && x < refWidth + dotR * 3) {
              dots.push({ x: x * scaleX, y: y * scaleY });
            }
          }
        }
      }
      cursorX += charPixelW;
    }
    return dots;
  }

  // ====== DOT MATRIX RENDER ======
  if (payload.style === 'dot-matrix') {
    let litDots: DotInfo[] = [];

    if (!frame.isRunning && frame.countdownMs > 0) {
      const seconds = Math.ceil(frame.countdownMs / 1000);
      const numStr = String(seconds);
      const totalW = numStr.length * charPixelW;
      const startX = (refWidth - totalW) / 2;
      litDots = getLitDots([...numStr], startX);
    } else if (frame.isRunning) {
      litDots = getLitDots(textChars, frame.scrollOffsetX - slice.offsetX);
    }

    const scaledDotR = dotR * scaleX;

    return (
      <Canvas style={{ flex: 1 }}>
        <Fill color={renderConfig.bgColor} />
        {/* Background dim dots — use actual screen dimensions (decorative) */}
        {bgDots.map((d, i) => (
          <Circle key={`bg${i}`} cx={d.x} cy={d.y} r={scaledDotR * 0.6} color={dimColor} />
        ))}
        {/* Lit dots with glow — already scaled in getLitDots */}
        {litDots.map((d, i) => (
          <Group key={`lit${i}`}>
            <Circle cx={d.x} cy={d.y} r={scaledDotR * 2.5} color={glowColor}>
              <BlurMask blur={scaledDotR * 1.5} style="normal" />
            </Circle>
            <Circle cx={d.x} cy={d.y} r={scaledDotR} color={renderConfig.textColor} />
          </Group>
        ))}
      </Canvas>
    );
  }

  // ====== NEON / SMOOTH RENDER ======
  if (!font) return <View style={{ flex: 1, backgroundColor: payload.bgColor }} />;

  if (!frame.isRunning && frame.countdownMs > 0) {
    const seconds = Math.ceil(frame.countdownMs / 1000);
    return (
      <Canvas style={{ flex: 1 }}>
        <Fill color={renderConfig.bgColor} />
        <Group transform={[{ scaleX }, { scaleY }]}>
          <SkiaText
            x={refWidth / 2 - payload.fontSize}
            y={refHeight / 2 + payload.fontSize / 3}
            text={String(seconds)}
            font={font}
            color={renderConfig.textColor}
          />
        </Group>
      </Canvas>
    );
  }

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color={renderConfig.bgColor} />
      <Group transform={[{ scaleX }, { scaleY }]}>
        <SkiaText
          x={frame.scrollOffsetX - slice.offsetX}
          y={refHeight / 2 + payload.fontSize / 3}
          text={payload.text}
          font={font}
          color={renderConfig.textColor}
        />
        {renderConfig.style === 'neon' && (
          <Shadow dx={0} dy={0} blur={renderConfig.glowRadius} color={renderConfig.textColor} />
        )}
      </Group>
    </Canvas>
  );
}
