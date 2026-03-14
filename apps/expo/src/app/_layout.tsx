import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Root layout — stack navigator with dark theme.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#000' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'LED Board' }} />
        <Stack.Screen name="director" options={{ title: 'Create Message' }} />
        <Stack.Screen name="qr-distribution" options={{ title: 'Distribute QR Codes' }} />
        <Stack.Screen name="scan" options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="panel" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
