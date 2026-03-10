import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useParticipantController } from '../controllers/useParticipantController';
import { QRScanner } from '../components/QRScanner';
import { GridService } from '@led-panel/core';

export default function ScanScreen() {
  const router = useRouter();
  const { state, onQRScanned } = useParticipantController();

  if (state.status === 'scanned' && state.payload) {
    const label = GridService.getSlotLabel(state.payload.position, state.payload.grid);

    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={{ fontSize: 48 }}>✓</Text>
          <Text style={styles.successTitle}>QR Scanned!</Text>
          <Text style={styles.successLabel}>{label}</Text>
          <Text style={styles.successDetail}>
            Grid: {state.payload.grid.cols}x{state.payload.grid.rows} | Style: {state.payload.style}
          </Text>
          <Text style={styles.successDetail}>Text: "{state.payload.text}"</Text>
          <Pressable
            style={styles.goBtn}
            onPress={() => router.push({ pathname: '/panel', params: { payload: JSON.stringify(state.payload) } })}
          >
            <Text style={styles.goBtnText}>Go to Panel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Point your camera at the QR code assigned to you.</Text>
      <QRScanner onScan={onQRScanned} />
      {state.error && <Text style={styles.error}>{state.error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', padding: 16 },
  error: { color: '#ff4444', textAlign: 'center', padding: 16 },
  successContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: {
    backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#333',
    padding: 32, alignItems: 'center', maxWidth: 360, width: '100%',
  },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  successLabel: { color: '#aaa', fontSize: 16 },
  successDetail: { color: '#888', fontSize: 13, marginTop: 4 },
  goBtn: {
    marginTop: 20, backgroundColor: '#4444ff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  goBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
