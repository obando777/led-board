import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useDirectorController } from '../controllers/useDirectorController';
import type { LEDStyle, Orientation } from '@led-panel/core';

const LED_STYLES: { value: LEDStyle; label: string }[] = [
  { value: 'dot-matrix', label: 'Dot Matrix' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'neon', label: 'Neon' },
];

const PRESET_COLORS = ['#FF0000', '#00FF00', '#0066FF', '#FF6600', '#FF00FF', '#FFFF00', '#FFFFFF'];

export default function DirectorScreen() {
  const router = useRouter();
  const { state, updateField, generateQRPayloads } = useDirectorController();

  function handleGenerate() {
    const payloads = generateQRPayloads();
    router.push({ pathname: '/qr-distribution', params: { payloads: JSON.stringify(payloads) } });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Text & Emojis</Text>
      <TextInput
        style={styles.textInput}
        value={state.text}
        onChangeText={v => updateField('text', v)}
        placeholder="Enter text + emojis..."
        placeholderTextColor="#555"
      />

      <Text style={styles.sectionLabel}>LED Style</Text>
      <View style={styles.toggleGroup}>
        {LED_STYLES.map(s => (
          <Pressable
            key={s.value}
            style={[styles.toggleBtn, state.style === s.value && styles.toggleActive]}
            onPress={() => updateField('style', s.value)}
          >
            <Text style={[styles.toggleText, state.style === s.value && styles.toggleTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Text Color</Text>
      <View style={styles.colorRow}>
        {PRESET_COLORS.map(c => (
          <Pressable
            key={c}
            style={[styles.colorSwatch, { backgroundColor: c }, state.textColor === c && styles.colorSelected]}
            onPress={() => updateField('textColor', c)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Speed: {state.speed} px/s</Text>
      <Slider
        style={styles.slider}
        minimumValue={20}
        maximumValue={400}
        step={10}
        value={state.speed}
        onValueChange={v => updateField('speed', v)}
        minimumTrackTintColor="#4444ff"
        maximumTrackTintColor="#333"
        thumbTintColor="#4444ff"
      />

      <Text style={styles.sectionLabel}>Font Size: {state.fontSize}px</Text>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={300}
        step={4}
        value={state.fontSize}
        onValueChange={v => updateField('fontSize', v)}
        minimumTrackTintColor="#4444ff"
        maximumTrackTintColor="#333"
        thumbTintColor="#4444ff"
      />

      <Text style={styles.sectionLabel}>Orientation</Text>
      <View style={styles.toggleGroup}>
        {(['landscape', 'portrait'] as Orientation[]).map(o => (
          <Pressable
            key={o}
            style={[styles.toggleBtn, state.orientation === o && styles.toggleActive]}
            onPress={() => updateField('orientation', o)}
          >
            <Text style={[styles.toggleText, state.orientation === o && styles.toggleTextActive]}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Grid: {state.grid.cols} x {state.grid.rows} = {state.grid.cols * state.grid.rows} phones</Text>
      <View style={styles.gridRow}>
        <View>
          <Text style={styles.gridLabel}>Columns</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepperBtn} onPress={() => updateField('grid', { ...state.grid, cols: Math.max(1, state.grid.cols - 1) })}>
              <Text style={styles.stepperText}>-</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{state.grid.cols}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => updateField('grid', { ...state.grid, cols: Math.min(8, state.grid.cols + 1) })}>
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>
        <Text style={{ color: '#555', fontSize: 20 }}>×</Text>
        <View>
          <Text style={styles.gridLabel}>Rows</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepperBtn} onPress={() => updateField('grid', { ...state.grid, rows: Math.max(1, state.grid.rows - 1) })}>
              <Text style={styles.stepperText}>-</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{state.grid.rows}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => updateField('grid', { ...state.grid, rows: Math.min(4, state.grid.rows + 1) })}>
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={styles.generateBtn} onPress={handleGenerate}>
        <Text style={styles.generateText}>Generate QR Codes</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionLabel: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  textInput: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 10,
    color: '#fff', fontSize: 18, padding: 12,
  },
  toggleGroup: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1, padding: 10, backgroundColor: '#111',
    borderWidth: 1, borderColor: '#333', borderRadius: 10, alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#1a1a2e', borderColor: '#4444ff' },
  toggleText: { color: '#999', fontSize: 14 },
  toggleTextActive: { color: '#fff' },
  colorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  colorSwatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  colorSelected: { borderColor: '#fff', borderWidth: 2 },
  slider: { width: '100%', height: 40 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  gridLabel: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperBtn: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center',
  },
  stepperText: { color: '#fff', fontSize: 20 },
  stepperValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', width: 30, textAlign: 'center' },
  generateBtn: {
    marginTop: 8, padding: 16, backgroundColor: '#4444ff',
    borderRadius: 12, alignItems: 'center',
  },
  generateText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
