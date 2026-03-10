import { useNavigate } from 'react-router-dom';

export function HomeView() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.logoArea}>
        <div style={styles.ledDot} />
        <h1 style={styles.title}>LED Board</h1>
        <p style={styles.subtitle}>Turn your phones into a synchronized LED display</p>
      </div>

      <div style={styles.buttons}>
        <button style={styles.primaryBtn} onClick={() => navigate('/director')}>
          <span style={styles.btnIcon}>🎬</span>
          <span>
            <strong>Create Panel</strong>
            <br />
            <small style={{ opacity: 0.7 }}>Set up text, colors &amp; generate QR codes</small>
          </span>
        </button>

        <button style={styles.secondaryBtn} onClick={() => navigate('/scan')}>
          <span style={styles.btnIcon}>📱</span>
          <span>
            <strong>Join Panel</strong>
            <br />
            <small style={{ opacity: 0.7 }}>Scan a QR code to join</small>
          </span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: 24,
    background: '#000',
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: 48,
  },
  ledDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#ff0000',
    boxShadow: '0 0 20px #ff0000, 0 0 40px #ff000088',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 360,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 24px',
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: 16,
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    textAlign: 'left',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 24px',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 16,
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    textAlign: 'left',
  },
  btnIcon: {
    fontSize: 32,
  },
};
