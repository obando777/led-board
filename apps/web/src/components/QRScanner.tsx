import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(() => {});
        },
        () => {},
      )
      .catch((err) => {
        onError?.(`Camera error: ${err}`);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div>
      <div id={containerId} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }} />
    </div>
  );
}
