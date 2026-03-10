import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { QRPayload } from '@led-panel/core';
import { QRCodecService } from '@led-panel/core';

interface QRCodeDisplayProps {
  payload: QRPayload;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({ payload, size = 256, label }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const encoded = QRCodecService.encode(payload);
    QRCode.toCanvas(canvas, encoded, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  }, [payload, size]);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} />
      {label && <p style={{ color: '#aaa', marginTop: 8, fontSize: 14 }}>{label}</p>}
    </div>
  );
}
