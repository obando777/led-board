import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useParticipantController } from '../controllers/useParticipantController';
import { QRScanner } from '../components/QRScanner';

export default function ScanScreen() {
  const router = useRouter();
  const { state, onQRScanned, selectPosition } = useParticipantController();

  // After scanning: show position picker
  if (state.status === 'scanned' && state.sharedPayload) {
    const grid = state.sharedPayload.grid;
    const screenWidth = Dimensions.get('window').width;
    const slotWidth = Math.min(80, (screenWidth - 32 - (grid.cols - 1) * 12) / grid.cols);

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Pick Your Position</Text>
        <Text style={styles.pickerHint}>
          Grid: {grid.cols}x{grid.rows} | Tap the slot where your phone will be placed
        </Text>

        <View style={[styles.grid, { width: slotWidth * grid.cols + (grid.cols - 1) * 12 }]}>
          {Array.from({ length: grid.rows }).map((_, row) => (
            <View key={row} style={styles.gridRow}>
              {Array.from({ length: grid.cols }).map((_, col) => {
                const idx = row * grid.cols + col + 1;
                return (
                  <Pressable
                    key={col}
                    style={[styles.slotBtn, { width: slotWidth, height: slotWidth }]}
                    onPress={() => selectPosition({ col, row })}
                  >
                    <Text style={styles.slotText}>{idx}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // After position selected: navigate to panel
  if (state.status === 'ready' && state.payload) {
    router.replace({ pathname: '/panel', params: { payload: JSON.stringify(state.payload) } });
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Joining panel...</Text>
      </View>
    );
  }

  // Default: show scanner
  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Point your camera at the QR code to join.</Text>
      <QRScanner onScan={onQRScanned} />
      {state.error && <Text style={styles.error}>{state.error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', padding: 16 },
  error: { color: '#ff4444', textAlign: 'center', padding: 16 },
  pickerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  pickerHint: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  grid: { alignSelf: 'center' },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  slotBtn: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111', borderWidth: 2, borderColor: '#333', borderRadius: 12,
  },
  slotText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
