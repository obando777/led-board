import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { QRPayload } from '@led-panel/core';
import { LEDCanvas } from '../components/LEDCanvas';

export default function PanelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload: string }>();
  const [payload, setPayload] = useState<QRPayload | null>(null);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    if (params.payload) {
      try {
        setPayload(JSON.parse(params.payload));
      } catch {}
    }
  }, [params.payload]);

  useEffect(() => {
    if (!payload) return;

    // Lock orientation
    const orientationLock = payload.orientation === 'landscape'
      ? ScreenOrientation.OrientationLock.LANDSCAPE
      : ScreenOrientation.OrientationLock.PORTRAIT;

    ScreenOrientation.lockAsync(orientationLock).catch(() => {});

    // Keep screen awake
    // expo-keep-awake could be used here but we avoid extra deps
    // activateKeepAwakeAsync().catch(() => {});

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, [payload]);

  function handleExit() {
    ScreenOrientation.unlockAsync().catch(() => {});
    router.back();
  }

  if (!payload) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#555' }}>No payload</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <LEDCanvas payload={payload} />

      {/* Tap to show exit */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setShowExit(prev => !prev)}
      >
        {showExit && (
          <Pressable style={styles.exitBtn} onPress={handleExit}>
            <Text style={styles.exitText}>✕ Exit</Text>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  exitBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exitText: { color: '#fff', fontSize: 16 },
});
