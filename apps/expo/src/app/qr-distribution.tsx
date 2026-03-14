import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { QRPayload } from '@led-panel/core';
import { GridService } from '@led-panel/core';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

type Phase = 'setup' | 'scanning' | 'navigate';

export default function QRDistributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payloads: string }>();

  const [payloads, setPayloads] = useState<QRPayload[]>([]);
  const [directorSlot, setDirectorSlot] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [delaySec, setDelaySec] = useState(10);
  const [phase, setPhase] = useState<Phase>('setup');

  useEffect(() => {
    if (params.payloads) {
      try {
        setPayloads(JSON.parse(params.payloads));
      } catch {}
    }
  }, [params.payloads]);

  function handleStart() {
    const delay = delaySec;
    const st = Date.now() + delay * 1000;
    const updatedPayloads = payloads.map(p => ({ ...p, startTimeUTC: st }));
    setPayloads(updatedPayloads);
    const slot = directorSlot ?? 0;
    setCountdown(delay);
    setPhase('scanning');

    let remaining = delay;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(0);
        setPhase('navigate');
        setTimeout(() => {
          router.push({
            pathname: '/panel',
            params: { payload: JSON.stringify(updatedPayloads[slot]) },
          });
        }, 0);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }

  const grid = payloads[0]?.grid ?? { cols: 2, rows: 1 };
  const screenWidth = Dimensions.get('window').width;
  const slotWidth = Math.min(80, (screenWidth - 32 - (grid.cols - 1) * 8) / grid.cols);
  const totalSlots = grid.cols * grid.rows;

  // In scanning phase, show all QR codes except director's
  const friendPayloads = payloads.filter((_, idx) => idx !== (directorSlot ?? 0));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Phase 1: Setup — pick your slot, set delay, press Start */}
      {phase === 'setup' && (
        <>
          <Text style={styles.title}>Setup</Text>
          <Text style={styles.hint}>
            1. Tap your slot below{'\n'}
            2. Set countdown delay{'\n'}
            3. Press Start — QR codes will appear for friends to scan
          </Text>

          {/* Grid for director slot selection */}
          <View style={[styles.grid, { width: slotWidth * grid.cols + (grid.cols - 1) * 8 }]}>
            {Array.from({ length: grid.rows }).map((_, row) => (
              <View key={row} style={styles.gridRow}>
                {Array.from({ length: grid.cols }).map((_, col) => {
                  const idx = row * grid.cols + col;
                  const isDirector = directorSlot === idx;
                  return (
                    <Pressable
                      key={col}
                      style={[
                        styles.slotBtn,
                        { width: slotWidth, height: slotWidth },
                        isDirector && styles.slotDirector,
                      ]}
                      onPress={() => setDirectorSlot(idx)}
                    >
                      <Text style={styles.slotText}>{idx + 1}</Text>
                      {isDirector && <Text style={styles.youLabel}>YOU</Text>}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Delay picker */}
          <View style={styles.delayRow}>
            <Text style={styles.delayLabel}>Countdown:</Text>
            {[5, 10, 15, 30, 60].map(s => (
              <Pressable
                key={s}
                style={[styles.delayBtn, delaySec === s && styles.delayBtnActive]}
                onPress={() => setDelaySec(s)}
              >
                <Text style={[styles.delayBtnText, delaySec === s && styles.delayBtnTextActive]}>{s}s</Text>
              </Pressable>
            ))}
          </View>

          {/* Start button */}
          <Pressable
            style={[styles.startBtn, directorSlot === null && { opacity: 0.4 }]}
            onPress={handleStart}
            disabled={directorSlot === null}
          >
            <Text style={styles.startText}>Start ({delaySec}s countdown)</Text>
          </Pressable>

          {directorSlot === null && (
            <Text style={styles.hintSmall}>Select your phone's slot first</Text>
          )}
        </>
      )}

      {/* Phase 2: Scanning — countdown running, show all QR codes */}
      {phase === 'scanning' && (
        <>
          <Text style={styles.countdownBig}>{countdown}s</Text>
          <Text style={styles.scanNow}>HAVE ALL PHONES SCAN NOW</Text>
          <Text style={styles.hint}>
            Friends: scan your assigned QR code before the countdown ends
          </Text>

          {/* Show all friend QR codes in a grid */}
          <View style={styles.qrGrid}>
            {friendPayloads.map((p) => {
              const label = GridService.getSlotLabel(p.position, grid);
              return (
                <View key={label} style={styles.qrItem}>
                  <QRCodeDisplay
                    payload={p}
                    size={totalSlots <= 3 ? Math.min(260, screenWidth - 64) : Math.min(180, (screenWidth - 48) / 2)}
                    label={label}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, alignItems: 'center', gap: 16, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  hint: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  hintSmall: { color: '#666', fontSize: 12, textAlign: 'center' },
  grid: { alignSelf: 'center' },
  gridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  slotBtn: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#111', borderWidth: 2, borderColor: '#333', borderRadius: 12,
  },
  slotDirector: { borderColor: '#4f4', backgroundColor: '#1a2e1a' },
  slotText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  youLabel: { color: '#4f4', fontSize: 10 },
  delayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  delayLabel: { color: '#888', fontSize: 14 },
  delayBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#333', backgroundColor: '#111',
  },
  delayBtnActive: { borderColor: '#ff4444', backgroundColor: '#2a1111' },
  delayBtnText: { color: '#888', fontSize: 14 },
  delayBtnTextActive: { color: '#ff4444', fontWeight: 'bold' },
  startBtn: {
    width: '100%', padding: 16, backgroundColor: '#ff4444',
    borderRadius: 12, alignItems: 'center',
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  countdownBig: { color: '#ff4444', fontSize: 64, fontWeight: 'bold' },
  scanNow: { color: '#ff4444', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  qrItem: { alignItems: 'center' },
});
