import { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import {
  Canvas,
  Text as SkiaText,
  useFont,
  Circle,
  Group,
  Fill,
  Shadow,
  useCanvasRef,
} from '@shopify/react-native-skia';
import type { QRPayload, AnimationFrame } from '@led-panel/core';
import { AnimationService, GridService, TextLayoutService } from '@led-panel/core';

interface LEDCanvasProps {
  payload: QRPayload;
}

export function LEDCanvas({ payload }: LEDCanvasProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const canvasRef = useCanvasRef();
  const frameRef = useRef<AnimationFrame>({
    scrollOffsetX: 0,
    elapsedMs: 0,
    isRunning: false,
    countdownMs: 0,
  });

  const font = useFont(null, payload.fontSize);
  const renderConfig = TextLayoutService.buildRenderConfig(
    payload.style,
    payload.textColor,
    payload.bgColor,
    payload.fontSize,
  );

  const slice = GridService.computeSlice(
    payload.position,
    payload.grid,
    screenWidth,
    screenHeight,
  );
  const panel = GridService.computePanelDimensions(payload.grid, screenWidth, screenHeight);

  useEffect(() => {
    if (!font) return;

    const textWidth = font.measureText(payload.text).width;
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
      frameRef.current = AnimationService.getFrame(config, Date.now());
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [font, payload, panel.totalWidth]);

  if (!font) return <View style={{ flex: 1, backgroundColor: payload.bgColor }} />;

  // For Skia, we render declaratively. The animation is driven by
  // useEffect + requestAnimationFrame updating frameRef.
  // Skia Canvas redraws when we invalidate via canvasRef.
  // For simplicity, we use a redraw interval.
  return (
    <Canvas ref={canvasRef} style={{ flex: 1 }}>
      <Fill color={renderConfig.bgColor} />
      <Group>
        <SkiaText
          x={frameRef.current.scrollOffsetX - slice.offsetX}
          y={screenHeight / 2 + payload.fontSize / 3}
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
