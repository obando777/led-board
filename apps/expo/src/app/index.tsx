import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.ledDot} />
        <Text style={styles.title}>LED Board</Text>
        <Text style={styles.subtitle}>Turn your phones into a synchronized LED display</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/director')}>
          <Text style={styles.btnIcon}>🎬</Text>
          <View>
            <Text style={styles.btnTitle}>Create Panel</Text>
            <Text style={styles.btnDesc}>Set up text, colors & generate QR codes</Text>
          </View>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => router.push('/scan')}>
          <Text style={styles.btnIcon}>📱</Text>
          <View>
            <Text style={styles.btnTitle}>Join Panel</Text>
            <Text style={styles.btnDesc}>Scan a QR code to join</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  ledDot: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#ff0000',
    shadowColor: '#ff0000', shadowRadius: 20, shadowOpacity: 0.8, marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 8 },
  buttons: { width: '100%', maxWidth: 360, gap: 16 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 20, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333', borderRadius: 16,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 20, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 16,
  },
  btnIcon: { fontSize: 32 },
  btnTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  btnDesc: { color: '#888', fontSize: 13 },
});
