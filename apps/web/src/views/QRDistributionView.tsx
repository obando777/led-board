import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SharedQRPayload, QRPayload } from '@led-panel/core';
import { GridService } from '@led-panel/core';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useDirectorController, type DirectorState } from '@/controllers/useDirectorController';

export function QRDistributionView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: directorCtrl } = useDirectorController();

  const passedState = (location.state as { directorState?: DirectorState })?.directorState;

  const [sharedPayload, setSharedPayload] = useState<SharedQRPayload | null>(() => {
    if (!passedState) return null;
    return {
      v: 1,
      text: passedState.text,
      speed: passedState.speed,
      style: passedState.style,
      textColor: passedState.textColor,
      bgColor: passedState.bgColor,
      orientation: passedState.orientation,
      grid: passedState.grid,
      startTimeUTC: Date.now() + 60000,
      fontSize: Math.round(window.innerHeight * 0.9),
      phoneWidth: window.innerWidth,
      phoneHeight: window.innerHeight,
    };
  });

  const [countdown, setCountdown] = useState<number | null>(null);
  const [delaySec, setDelaySec] = useState(10);
  const [phase, setPhase] = useState<'setup' | 'scanning' | 'picking'>('setup');

  const grid = sharedPayload?.grid ?? { cols: 2, rows: 1 };
  const slots = GridService.generateSlots(grid);

  function handleStart() {
    const delay = delaySec;
    const st = Date.now() + delay * 1000;
    const updatedPayload = sharedPayload ? { ...sharedPayload, startTimeUTC: st } : null;
    setSharedPayload(updatedPayload);
    setCountdown(delay);
    setPhase('scanning');

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setPhase('picking');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handlePickPosition(col: number, row: number) {
    if (!sharedPayload) return;
    const payload: QRPayload = { ...sharedPayload, position: { col, row } };
    navigate('/panel', { state: { payload } });
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/director')}>&#8592;</button>
        <h2 style={styles.title}>Share QR Code</h2>
      </div>

      {phase === 'setup' && (
        <>
          <p style={styles.hint}>
            Set a countdown delay, then press Start.<br />
            All friends scan the same QR code, then pick their position.
          </p>

          {sharedPayload && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ color: '#666', fontSize: 13 }}>
                Grid: {grid.cols}x{grid.rows} | Style: {sharedPayload.style} | Text: &quot;{sharedPayload.text}&quot;
              </p>
            </div>
          )}

          {/* Delay picker */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ color: '#888', fontSize: 14, alignSelf: 'center' }}>Countdown:</span>
            {[3, 5, 10, 15, 30, 60].map(s => (
              <button
                key={s}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${delaySec === s ? '#ff4444' : '#333'}`,
                  background: delaySec === s ? '#2a1111' : '#111',
                  color: delaySec === s ? '#ff4444' : '#888',
                  fontWeight: delaySec === s ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                onClick={() => setDelaySec(s)}
              >
                {s}s
              </button>
            ))}
          </div>

          <button style={styles.startBtn} onClick={handleStart}>
            Start ({delaySec}s countdown)
          </button>
        </>
      )}

      {phase === 'scanning' && (
        <>
          <p style={{ textAlign: 'center', color: '#ff4444', fontSize: 64, fontWeight: 'bold', margin: '16px 0 0' }}>
            {countdown}s
          </p>
          <p style={{ textAlign: 'center', color: '#ff4444', fontSize: 20, fontWeight: 'bold' }}>
            HAVE ALL PHONES SCAN NOW
          </p>
          <p style={styles.hint}>Everyone scans this same QR code, then picks their position</p>

          {sharedPayload && (
            <div style={{ margin: '16px auto', maxWidth: 320 }}>
              <QRCodeDisplay payload={sharedPayload} size={300} />
            </div>
          )}
        </>
      )}

      {phase === 'picking' && (
        <>
          <p style={{ textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>
            Pick Your Position
          </p>
          <p style={styles.hint}>Tap the slot where your phone will be placed</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
              gap: 12,
              maxWidth: 400,
              margin: '16px auto',
            }}
          >
            {slots.map((slot, idx) => (
              <button
                key={idx}
                style={styles.slotBtn}
                onClick={() => handlePickPosition(slot.position.col, slot.position.row)}
              >
                <span style={{ fontSize: 20, fontWeight: 'bold' }}>{idx + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: '#000', color: '#fff', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' },
  title: { fontSize: 22, margin: 0 },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  slotBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    border: '2px solid #333',
    borderRadius: 12,
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    minHeight: 60,
  },
  startBtn: {
    display: 'block',
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
    padding: '16px 0',
    background: '#ff4444',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
