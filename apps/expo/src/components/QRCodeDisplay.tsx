import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { SharedQRPayload } from '@led-panel/core';
import { QRCodecService } from '@led-panel/core';

interface QRCodeDisplayProps {
  payload: SharedQRPayload;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({ payload, size = 256, label }: QRCodeDisplayProps) {
  const encoded = QRCodecService.encode(payload);

  return (
    <View style={{ alignItems: 'center' }}>
      <QRCode
        value={encoded}
        size={size}
        backgroundColor="#ffffff"
        color="#000000"
        ecl="M"
        quietZone={16}
      />
      {label && (
        <Text style={{ color: '#aaa', marginTop: 8, fontSize: 14, textAlign: 'center' }}>
          {label}
        </Text>
      )}
    </View>
  );
}
