import { useNavigate } from 'react-router-dom';
import { useParticipantController } from '@/controllers/useParticipantController';
import { QRScanner } from '@/components/QRScanner';
import { GridService } from '@led-panel/core';

export function ScanQRView() {
  const navigate = useNavigate();
  const { state, onQRScanned } = useParticipantController();

  function handleScan(data: string) {
    onQRScanned(data);
  }

  // Auto-navigate when scanned successfully
  if (state.status === 'scanned' && state.payload) {
    const label = GridService.getSlotLabel(state.payload.position, state.payload.grid);

    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={{ fontSize: 48 }}>✓</div>
          <h2 style={{ margin: '16px 0 8px' }}>QR Scanned!</h2>
          <p style={{ color: '#aaa' }}>{label}</p>
          <p style={{ color: '#888', fontSize: 13 }}>
            Grid: {state.payload.grid.cols}x{state.payload.grid.rows} |
            Style: {state.payload.style} |
            Text: "{state.payload.text}"
          </p>
          <button
            style={styles.goBtn}
            onClick={() => navigate('/panel', { state: { payload: state.payload } })}
          >
            Go to Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>←</button>
        <h2 style={styles.title}>Scan QR Code</h2>
      </div>

      <p style={styles.hint}>Point your camera at the QR code assigned to you.</p>

      <QRScanner onScan={handleScan} onError={(e) => console.error(e)} />

      {state.error && (
        <p style={styles.error}>{state.error}</p>
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
  error: { color: '#ff4444', textAlign: 'center', marginTop: 16 },
  successCard: {
    textAlign: 'center',
    padding: 32,
    margin: '20vh auto',
    maxWidth: 360,
    background: '#111',
    borderRadius: 16,
    border: '1px solid #333',
  },
  goBtn: {
    marginTop: 20,
    padding: '14px 32px',
    background: '#4444ff',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
