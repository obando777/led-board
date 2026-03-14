import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { SharedQRPayload } from '@led-panel/core';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

type Phase = 'setup' | 'scanning';

export default function QRDistributionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload: string }>();

  const [sharedPayload, setSharedPayload] = useState<SharedQRPayload | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [delaySec, setDelaySec] = useState(3);
  const [phase, setPhase] = useState<Phase>('setup');

  useEffect(() => {
    if (params.payload) {
      try {
        setSharedPayload(JSON.parse(params.payload));
      } catch {}
    }
  }, [params.payload]);

  function handleStart() {
    const delay = delaySec;
    const st = Date.now() + delay * 1000;
    const updatedPayload = sharedPayload ? { ...sharedPayload, startTimeUTC: st } : null;
    setSharedPayload(updatedPayload);
    setCountdown(delay);
    setPhase('scanning');

    let remaining = delay;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(0);
        // Navigate director to position picker
        if (updatedPayload) {
          router.push({
            pathname: '/position-picker',
            params: { sharedPayload: JSON.stringify(updatedPayload) },
          });
        }
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }

  const screenWidth = Dimensions.get('window').width;
  const qrSize = Math.min(300, screenWidth - 64);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Phase 1: Setup — set delay, press Start */}
      {phase === 'setup' && (
        <>
          <Text style={styles.title}>Share QR Code</Text>
          <Text style={styles.hint}>
            1. Set countdown delay{'\n'}
            2. Press Start — one QR code will appear{'\n'}
            3. All friends scan the same QR{'\n'}
            4. Everyone picks their position after scanning
          </Text>

          {sharedPayload && (
            <View style={styles.previewInfo}>
              <Text style={styles.previewText}>
                Grid: {sharedPayload.grid.cols}x{sharedPayload.grid.rows} | Style: {sharedPayload.style}
              </Text>
              <Text style={styles.previewText}>Text: "{sharedPayload.text}"</Text>
            </View>
          )}

          {/* Delay picker */}
          <View style={styles.delayRow}>
            <Text style={styles.delayLabel}>Countdown:</Text>
            {[3, 5, 10, 15, 30, 60].map(s => (
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
          <Pressable style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startText}>Start ({delaySec}s countdown)</Text>
          </Pressable>
        </>
      )}

      {/* Phase 2: Scanning — countdown running, show single QR */}
      {phase === 'scanning' && (
        <>
          <Text style={styles.countdownBig}>{countdown}s</Text>
          <Text style={styles.scanNow}>HAVE ALL PHONES SCAN NOW</Text>
          <Text style={styles.hint}>
            Everyone scans this same QR code, then picks their position
          </Text>

          {sharedPayload && (
            <View style={styles.qrContainer}>
              <QRCodeDisplay
                payload={sharedPayload}
                size={qrSize}
              />
            </View>
          )}
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
  previewInfo: { alignItems: 'center', gap: 4 },
  previewText: { color: '#666', fontSize: 13 },
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
  qrContainer: { alignItems: 'center', marginTop: 16 },
});
