import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { QRPayload, GridPosition } from '@led-panel/core';
import { GridService } from '@led-panel/core';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export default function QRDistributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payloads: string }>();

  const [payloads, setPayloads] = useState<QRPayload[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GridPosition | null>(null);
  const [directorSlot, setDirectorSlot] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (params.payloads) {
      try {
        setPayloads(JSON.parse(params.payloads));
      } catch {}
    }
  }, [params.payloads]);

  function handleStart() {
    const delay = 10;
    const st = Date.now() + delay * 1000;
    setPayloads(prev => prev.map(p => ({ ...p, startTimeUTC: st })));
    setCountdown(delay);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (directorSlot !== null && payloads[directorSlot]) {
            router.push({
              pathname: '/panel',
              params: { payload: JSON.stringify({ ...payloads[directorSlot], startTimeUTC: st }) },
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const grid = payloads[0]?.grid ?? { cols: 2, rows: 1 };
  const slots = GridService.generateSlots(grid);
  const screenWidth = Dimensions.get('window').width;
  const slotWidth = Math.min(80, (screenWidth - 32 - (grid.cols - 1) * 8) / grid.cols);

  const selectedPayload = selectedSlot
    ? payloads.find(p => p.position.col === selectedSlot.col && p.position.row === selectedSlot.row)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>Tap a slot to show its QR code. Have each friend scan their assigned QR.</Text>

      {/* Grid */}
      <View style={[styles.grid, { width: slotWidth * grid.cols + (grid.cols - 1) * 8 }]}>
        {Array.from({ length: grid.rows }).map((_, row) => (
          <View key={row} style={styles.gridRow}>
            {Array.from({ length: grid.cols }).map((_, col) => {
              const idx = row * grid.cols + col;
              const isSelected = selectedSlot?.col === col && selectedSlot?.row === row;
              return (
                <Pressable
                  key={col}
                  style={[
                    styles.slotBtn,
                    { width: slotWidth, height: slotWidth },
                    isSelected && styles.slotSelected,
                    directorSlot === idx && styles.slotDirector,
                  ]}
                  onPress={() => setSelectedSlot({ col, row })}
                >
                  <Text style={styles.slotText}>{idx + 1}</Text>
                  {directorSlot === idx && <Text style={styles.youLabel}>YOU</Text>}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* QR display */}
      {selectedPayload && (
        <View style={styles.qrContainer}>
          <QRCodeDisplay
            payload={selectedPayload}
            size={Math.min(280, screenWidth - 64)}
            label={GridService.getSlotLabel(selectedPayload.position, grid)}
          />
          {countdown !== null && countdown > 0 && (
            <Text style={styles.countdownHint}>QR updated — starts in {countdown}s</Text>
          )}
        </View>
      )}

      {/* Director assign */}
      {selectedSlot && directorSlot === null && (
        <Pressable
          style={styles.assignBtn}
          onPress={() => setDirectorSlot(selectedSlot.row * grid.cols + selectedSlot.col)}
        >
          <Text style={styles.assignText}>
            I'm this phone (Phone {selectedSlot.row * grid.cols + selectedSlot.col + 1})
          </Text>
        </Pressable>
      )}

      {/* Start */}
      <Pressable
        style={[styles.startBtn, countdown !== null && { opacity: 0.5 }]}
        onPress={handleStart}
        disabled={countdown !== null}
      >
        <Text style={styles.startText}>
          {countdown !== null && countdown > 0 ? `Starting in ${countdown}s...` : 'Start in 10 seconds'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, alignItems: 'center', gap: 16, paddingBottom: 40 },
  hint: { color: '#888', fontSize: 13, textAlign: 'center' },
  grid: { alignSelf: 'center' },
  gridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  slotBtn: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111', borderWidth: 2, borderColor: '#333', borderRadius: 12,
  },
  slotSelected: { borderColor: '#4444ff' },
  slotDirector: { backgroundColor: '#1a2e1a' },
  slotText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  youLabel: { color: '#4f4', fontSize: 10 },
  qrContainer: { alignItems: 'center' },
  countdownHint: { color: '#4444ff', fontSize: 14, marginTop: 8 },
  assignBtn: {
    padding: 12, backgroundColor: '#1a2e1a',
    borderWidth: 1, borderColor: '#4f4', borderRadius: 10,
  },
  assignText: { color: '#4f4', fontSize: 14, textAlign: 'center' },
  startBtn: {
    width: '100%', padding: 16, backgroundColor: '#ff4444',
    borderRadius: 12, alignItems: 'center',
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
