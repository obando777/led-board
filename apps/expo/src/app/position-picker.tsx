import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { SharedQRPayload, QRPayload } from '@led-panel/core';

export default function PositionPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sharedPayload: string }>();

  const [sharedPayload] = useState<SharedQRPayload | null>(() => {
    try {
      return params.sharedPayload ? JSON.parse(params.sharedPayload) : null;
    } catch {
      return null;
    }
  });

  if (!sharedPayload) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#555' }}>No payload data</Text>
      </View>
    );
  }

  const grid = sharedPayload.grid;
  const screenWidth = Dimensions.get('window').width;
  const slotWidth = Math.min(80, (screenWidth - 32 - (grid.cols - 1) * 12) / grid.cols);

  function handleSelect(col: number, row: number) {
    const payload: QRPayload = { ...sharedPayload!, position: { col, row } };
    router.replace({ pathname: '/panel', params: { payload: JSON.stringify(payload) } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Your Position</Text>
      <Text style={styles.hint}>
        Tap the slot where your phone will be placed
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
                  onPress={() => handleSelect(col, row)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  grid: { alignSelf: 'center' },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  slotBtn: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111', borderWidth: 2, borderColor: '#333', borderRadius: 12,
  },
  slotText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
