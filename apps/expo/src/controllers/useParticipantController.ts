import { useState, useCallback } from 'react';
import type { QRPayload } from '@led-panel/core';
import { QRCodecService } from '@led-panel/core';

export interface ParticipantState {
  payload: QRPayload | null;
  status: 'idle' | 'scanned' | 'waiting' | 'running';
  error: string | null;
}

export function useParticipantController() {
  const [state, setState] = useState<ParticipantState>({
    payload: null,
    status: 'idle',
    error: null,
  });

  const onQRScanned = useCallback((data: string) => {
    const payload = QRCodecService.decode(data);
    if (payload) {
      setState({ payload, status: 'scanned', error: null });
    } else {
      setState(prev => ({ ...prev, error: 'Invalid QR code. Make sure you scan a LED Board QR.' }));
    }
  }, []);

  const startPanel = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
  }, []);

  return { state, onQRScanned, startPanel };
}
