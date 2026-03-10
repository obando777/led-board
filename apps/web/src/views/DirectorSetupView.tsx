import { useNavigate } from 'react-router-dom';
import { useDirectorController } from '@/controllers/useDirectorController';
import type { LEDStyle, Orientation } from '@led-panel/core';

const LED_STYLES: { value: LEDStyle; label: string }[] = [
  { value: 'dot-matrix', label: 'Dot Matrix' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'neon', label: 'Neon' },
];

const PRESET_COLORS = ['#FF0000', '#00FF00', '#0066FF', '#FF6600', '#FF00FF', '#FFFF00', '#FFFFFF'];

export function DirectorSetupView() {
  const navigate = useNavigate();
  const { state, updateField, generateQRPayloads } = useDirectorController();

  function handleGenerate() {
    generateQRPayloads(15);
    navigate('/director/qr', { state: { directorState: state } });
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>←</button>
        <h2 style={styles.title}>Director Setup</h2>
      </div>

      <div style={styles.form}>
        {/* Text input */}
        <label style={styles.label}>Text &amp; Emojis</label>
        <input
          style={styles.textInput}
          value={state.text}
          onChange={e => updateField('text', e.target.value)}
          placeholder="Enter text + emojis..."
        />

        {/* LED Style */}
        <label style={styles.label}>LED Style</label>
        <div style={styles.toggleGroup}>
          {LED_STYLES.map(s => (
            <button
              key={s.value}
              style={{
                ...styles.toggleBtn,
                ...(state.style === s.value ? styles.toggleActive : {}),
              }}
              onClick={() => updateField('style', s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Text Color */}
        <label style={styles.label}>Text Color</label>
        <div style={styles.colorRow}>
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              style={{
                ...styles.colorSwatch,
                background: c,
                outline: state.textColor === c ? '2px solid #fff' : 'none',
              }}
              onClick={() => updateField('textColor', c)}
            />
          ))}
          <input
            type="color"
            value={state.textColor}
            onChange={e => updateField('textColor', e.target.value)}
            style={styles.colorPicker}
          />
        </div>

        {/* Background Color */}
        <label style={styles.label}>Background Color</label>
        <div style={styles.colorRow}>
          <button
            style={{ ...styles.colorSwatch, background: '#000000', outline: state.bgColor === '#000000' ? '2px solid #fff' : 'none' }}
            onClick={() => updateField('bgColor', '#000000')}
          />
          <button
            style={{ ...styles.colorSwatch, background: '#0a0a2e', outline: state.bgColor === '#0a0a2e' ? '2px solid #fff' : 'none' }}
            onClick={() => updateField('bgColor', '#0a0a2e')}
          />
          <input
            type="color"
            value={state.bgColor}
            onChange={e => updateField('bgColor', e.target.value)}
            style={styles.colorPicker}
          />
        </div>

        {/* Speed */}
        <label style={styles.label}>Speed: {state.speed} px/s</label>
        <input
          type="range"
          min={20}
          max={400}
          value={state.speed}
          onChange={e => updateField('speed', Number(e.target.value))}
          style={styles.slider}
        />

        {/* Font Size */}
        <label style={styles.label}>Font Size: {state.fontSize}px</label>
        <input
          type="range"
          min={24}
          max={120}
          value={state.fontSize}
          onChange={e => updateField('fontSize', Number(e.target.value))}
          style={styles.slider}
        />

        {/* Orientation */}
        <label style={styles.label}>Orientation</label>
        <div style={styles.toggleGroup}>
          {(['landscape', 'portrait'] as Orientation[]).map(o => (
            <button
              key={o}
              style={{
                ...styles.toggleBtn,
                ...(state.orientation === o ? styles.toggleActive : {}),
              }}
              onClick={() => updateField('orientation', o)}
            >
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <label style={styles.label}>Grid Layout</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <small style={{ color: '#888' }}>Columns</small>
            <select
              value={state.grid.cols}
              onChange={e => updateField('grid', { ...state.grid, cols: Number(e.target.value) })}
              style={styles.select}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span style={{ color: '#555', fontSize: 20 }}>x</span>
          <div>
            <small style={{ color: '#888' }}>Rows</small>
            <select
              value={state.grid.rows}
              onChange={e => updateField('grid', { ...state.grid, rows: Number(e.target.value) })}
              style={styles.select}
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <span style={{ color: '#666', fontSize: 14 }}>
            = {state.grid.cols * state.grid.rows} phones
          </span>
        </div>

        {/* Generate */}
        <button style={styles.generateBtn} onClick={handleGenerate}>
          Generate QR Codes
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: '#000', color: '#fff', padding: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' },
  title: { fontSize: 22, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480, margin: '0 auto' },
  label: { color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: -8 },
  textInput: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#fff',
    fontSize: 18,
    padding: '12px 16px',
    outline: 'none',
  },
  toggleGroup: { display: 'flex', gap: 8 },
  toggleBtn: {
    flex: 1,
    padding: '10px 0',
    background: '#111',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#999',
    fontSize: 14,
    cursor: 'pointer',
  },
  toggleActive: {
    background: '#1a1a2e',
    borderColor: '#4444ff',
    color: '#fff',
  },
  colorRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #333',
    cursor: 'pointer',
  },
  colorPicker: { width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' },
  slider: { width: '100%', accentColor: '#4444ff' },
  select: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    padding: '8px 12px',
    width: 80,
  },
  generateBtn: {
    marginTop: 8,
    padding: '16px 0',
    background: '#4444ff',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
