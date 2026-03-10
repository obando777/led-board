import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { QRPayload } from '@led-panel/core';
import { LEDCanvas } from '@/components/LEDCanvas';

export function PanelDisplayView() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = (location.state as { payload?: QRPayload })?.payload ?? null;
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (!payload) {
      navigate('/');
      return;
    }

    // Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Lock orientation if supported
    try {
      const orientation = payload.orientation === 'landscape' ? 'landscape' : 'portrait';
      (screen.orientation as any)?.lock?.(orientation).catch(() => {});
    } catch {}

    // Hide cursor
    document.body.style.cursor = 'none';

    // Handle resize
    function onResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);

    // Keep screen awake via wake lock if available
    let wakeLock: any = null;
    (navigator as any).wakeLock?.request?.('screen').then((wl: any) => {
      wakeLock = wl;
    }).catch(() => {});

    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.cursor = '';
      document.exitFullscreen?.().catch(() => {});
      wakeLock?.release?.();
    };
  }, [payload, navigate]);

  function handleExit() {
    document.exitFullscreen?.().catch(() => {});
    navigate('/');
  }

  if (!payload) return null;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: payload.bgColor,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
      onDoubleClick={handleExit}
    >
      <LEDCanvas
        payload={payload}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Invisible exit button in top-right corner */}
      <button
        onClick={handleExit}
        style={{
          position: 'fixed',
          top: 8,
          right: 8,
          width: 44,
          height: 44,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10,
        }}
        aria-label="Exit panel"
      />
    </div>
  );
}
