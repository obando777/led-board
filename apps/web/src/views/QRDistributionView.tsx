import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { GridPosition, QRPayload } from '@led-panel/core';
import { GridService, QRCodecService } from '@led-panel/core';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useDirectorController, type DirectorState } from '@/controllers/useDirectorController';

export function QRDistributionView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: directorCtrl, updateField, generateQRPayloads, regenerateWithStart } = useDirectorController();

  // Restore state from navigation
  const passedState = (location.state as { directorState?: DirectorState })?.directorState;

  const [payloads, setPayloads] = useState<QRPayload[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GridPosition | null>(null);
  const [directorSlot, setDirectorSlot] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startTimeUTC, setStartTimeUTC] = useState(0);

  // Generate payloads on mount
  useEffect(() => {
    if (passedState) {
      const grid = passedState.grid;
      const slots = GridService.generateSlots(grid);
      const st = Date.now() + 60000; // 60s placeholder until "Start" is pressed
      const generated = slots.map(slot => ({
        v: 1 as const,
        text: passedState.text,
        speed: passedState.speed,
        style: passedState.style,
        textColor: passedState.textColor,
        bgColor: passedState.bgColor,
        orientation: passedState.orientation,
        grid: passedState.grid,
        position: slot.position,
        startTimeUTC: st,
        fontSize: passedState.fontSize,
      }));
      setPayloads(generated);
    }
  }, []);

  function handleStart() {
    const delay = 10; // 10 second countdown
    const st = Date.now() + delay * 1000;
    setStartTimeUTC(st);

    // Update all payloads with final startTimeUTC
    setPayloads(prev => prev.map(p => ({ ...p, startTimeUTC: st })));
    setCountdown(delay);

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Navigate director to panel
          if (directorSlot !== null) {
            const myPayload = payloads.find(
              p => p.position.row * p.grid.cols + p.position.col === directorSlot,
            );
            if (myPayload) {
              navigate('/panel', { state: { payload: { ...myPayload, startTimeUTC: st } } });
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const grid = payloads[0]?.grid ?? { cols: 2, rows: 1 };
  const slots = GridService.generateSlots(grid);

  const selectedPayload = selectedSlot
    ? payloads.find(p => p.position.col === selectedSlot.col && p.position.row === selectedSlot.row)
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/director')}>←</button>
        <h2 style={styles.title}>QR Codes</h2>
      </div>

      {/* Grid diagram */}
      <p style={styles.hint}>Tap a slot to show its QR code. Have each friend scan their assigned QR.</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gap: 8,
          maxWidth: 400,
          margin: '0 auto 24px',
        }}
      >
        {slots.map((slot, idx) => (
          <button
            key={idx}
            style={{
              ...styles.slotBtn,
              borderColor:
                selectedSlot?.col === slot.position.col && selectedSlot?.row === slot.position.row
                  ? '#4444ff'
                  : '#333',
              background: directorSlot === idx ? '#1a2e1a' : '#111',
            }}
            onClick={() => setSelectedSlot(slot.position)}
          >
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>{idx + 1}</span>
            {directorSlot === idx && <span style={{ fontSize: 10, color: '#4f4' }}>YOU</span>}
          </button>
        ))}
      </div>

      {/* QR display */}
      {selectedPayload && (
        <div style={{ margin: '0 auto', maxWidth: 300 }}>
          <QRCodeDisplay
            payload={selectedPayload}
            size={280}
            label={GridService.getSlotLabel(selectedPayload.position, grid)}
          />
          {countdown !== null && countdown > 0 && (
            <p style={{ textAlign: 'center', color: '#4444ff', fontSize: 14, marginTop: 8 }}>
              QR updated — starts in {countdown}s
            </p>
          )}
        </div>
      )}

      {/* Director self-assign */}
      {selectedSlot && directorSlot === null && (
        <button
          style={styles.assignBtn}
          onClick={() => {
            const idx = selectedSlot.row * grid.cols + selectedSlot.col;
            setDirectorSlot(idx);
          }}
        >
          I'm this phone (Phone {selectedSlot.row * grid.cols + selectedSlot.col + 1})
        </button>
      )}

      {/* Start button */}
      <button
        style={{
          ...styles.startBtn,
          opacity: countdown !== null ? 0.5 : 1,
        }}
        onClick={handleStart}
        disabled={countdown !== null}
      >
        {countdown !== null && countdown > 0
          ? `Starting in ${countdown}s...`
          : 'Start in 10 seconds'}
      </button>
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
  assignBtn: {
    display: 'block',
    margin: '16px auto',
    padding: '10px 20px',
    background: '#1a2e1a',
    border: '1px solid #4f4',
    borderRadius: 10,
    color: '#4f4',
    fontSize: 14,
    cursor: 'pointer',
  },
  startBtn: {
    display: 'block',
    width: '100%',
    maxWidth: 400,
    margin: '24px auto 0',
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
