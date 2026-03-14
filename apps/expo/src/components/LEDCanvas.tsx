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

  const [frame, setFrame] = useState<AnimationFrame>({
    scrollOffsetX: 0,
    elapsedMs: 0,
    isRunning: false,
    countdownMs: 0,
  });

  const displayFontSize = Math.round(screenHeight * 0.9);
  const font = useFont(require('../../assets/fonts/CourierNew.ttf'), displayFontSize);
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

  // Derive dot grid from ref height so rendering matches computeDotMatrixTextWidth exactly
  const refDotSpacing = Math.floor(refHeight / CHAR_H);
  const scaleY = screenHeight / refHeight;
  const dotR = Math.max(2, Math.floor(refDotSpacing * Math.min(scaleX, scaleY) * 0.3));
  const charPixelW = (CHAR_W + 1) * refDotSpacing; // ref coords

  const textChars = useMemo(() => [...payload.text], [payload.text]);
  // Use deterministic calculation from shared ref dimensions so all phones get the same cycle length
  const totalDotTextWidth = useMemo(
    () => TextLayoutService.computeDotMatrixTextWidth(payload.text, refHeight),
    [payload.text, refHeight]
  );

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

    // Text widths must be deterministic across devices for AnimationService sync
    const textWidth = payload.style === 'dot-matrix'
      ? totalDotTextWidth
      : (font ? font.measureText(payload.text).width / scaleX : 0);

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

  // Background dots (static grid) — compute in ref coords, scale to screen
  const bgDots = useMemo(() => {
    if (payload.style !== 'dot-matrix') return [];
    const dots: DotInfo[] = [];
    const cols = Math.ceil(refWidth / refDotSpacing) + 1;
    const rows = Math.ceil(refHeight / refDotSpacing) + 1;
    const offX = (refWidth % refDotSpacing) / 2;
    const offY = (refHeight % refDotSpacing) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: (offX + c * refDotSpacing) * scaleX, y: (offY + r * refDotSpacing) * scaleY });
      }
    }
    return dots;
  }, [refWidth, refHeight, refDotSpacing, scaleX, scaleY, payload.style]);

  // Compute lit dot positions in ref coordinates, then scale to screen
  function getLitDots(chars: string[], scrollXRef: number): DotInfo[] {
    const dots: DotInfo[] = [];
    const yStartRef = (refHeight - CHAR_H * refDotSpacing) / 2;
    const refViewRight = screenWidth / scaleX; // right edge in ref coords

    let cursorX = scrollXRef; // already in ref coords
    for (const ch of chars) {
      if (cursorX + charPixelW < -refDotSpacing || cursorX > refViewRight + refDotSpacing) {
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
            const xRef = cursorX + c * refDotSpacing;
            const yRef = yStartRef + (CHAR_H - 1 - r) * refDotSpacing;
            const xScreen = xRef * scaleX;
            if (xScreen > -dotR * 3 && xScreen < screenWidth + dotR * 3) {
              dots.push({ x: xScreen, y: yRef * scaleY });
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

    return (
      <Canvas style={{ flex: 1 }}>
        <Fill color={renderConfig.bgColor} />
        {/* Background dim dots */}
        {bgDots.map((d, i) => (
          <Circle key={`bg${i}`} cx={d.x} cy={d.y} r={dotR * 0.4} color={dimColor} />
        ))}
        {/* Lit dots with glow */}
        {litDots.map((d, i) => (
          <Group key={`lit${i}`}>
            <Circle cx={d.x} cy={d.y} r={dotR * 1.5} color={glowColor}>
              <BlurMask blur={dotR * 0.8} style="normal" />
            </Circle>
            <Circle cx={d.x} cy={d.y} r={dotR} color={renderConfig.textColor} />
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
        <SkiaText
          x={screenWidth / 2 - displayFontSize}
          y={screenHeight / 2 + displayFontSize / 3}
          text={String(seconds)}
          font={font}
          color={renderConfig.textColor}
        />
      </Canvas>
    );
  }

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color={renderConfig.bgColor} />
      <SkiaText
        x={(frame.scrollOffsetX - slice.offsetX) * scaleX}
        y={screenHeight / 2 + displayFontSize / 3}
        text={payload.text}
        font={font}
        color={renderConfig.textColor}
      />
      {renderConfig.style === 'neon' && (
        <Shadow dx={0} dy={0} blur={renderConfig.glowRadius} color={renderConfig.textColor} />
      )}
    </Canvas>
  );
}
