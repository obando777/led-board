import { useState, useCallback } from 'react';
import type { SharedQRPayload, QRPayload, GridPosition } from '@led-panel/core';
import { QRCodecService } from '@led-panel/core';

export interface ParticipantState {
  sharedPayload: SharedQRPayload | null;
  payload: QRPayload | null;
  status: 'idle' | 'scanned' | 'ready' | 'running';
  error: string | null;
}

export function useParticipantController() {
  const [state, setState] = useState<ParticipantState>({
    sharedPayload: null,
    payload: null,
    status: 'idle',
    error: null,
  });

  const onQRScanned = useCallback((data: string) => {
    const sharedPayload = QRCodecService.decode(data);
    if (sharedPayload) {
      setState({ sharedPayload, payload: null, status: 'scanned', error: null });
    } else {
      setState(prev => ({ ...prev, error: 'Invalid QR code. Make sure you scan a LED Board QR.' }));
    }
  }, []);

  const selectPosition = useCallback((position: GridPosition) => {
    setState(prev => {
      if (!prev.sharedPayload) return prev;
      const payload: QRPayload = { ...prev.sharedPayload, position };
      return { ...prev, payload, status: 'ready', error: null };
    });
  }, []);

  const startPanel = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
  }, []);

  return { state, onQRScanned, selectPosition, startPanel };
}
