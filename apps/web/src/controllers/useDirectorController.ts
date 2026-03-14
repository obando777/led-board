import { useState, useCallback } from 'react';
import type { LEDStyle, Orientation, GridDimensions, QRPayload } from '@led-panel/core';
import { GridService } from '@led-panel/core';

export interface DirectorState {
  text: string;
  style: LEDStyle;
  textColor: string;
  bgColor: string;
  speed: number;
  orientation: Orientation;
  grid: GridDimensions;
  fontSize: number;
  qrPayloads: QRPayload[];
  startTimeUTC: number;
}

const DEFAULT_STATE: DirectorState = {
  text: 'HELLO WORLD 🎉',
  style: 'dot-matrix',
  textColor: '#FF0000',
  bgColor: '#000000',
  speed: 100,
  orientation: 'landscape',
  grid: { cols: 2, rows: 1 },
  fontSize: 48,
  qrPayloads: [],
  startTimeUTC: 0,
};

export function useDirectorController() {
  const [state, setState] = useState<DirectorState>(DEFAULT_STATE);

  const updateField = useCallback(<K extends keyof DirectorState>(key: K, value: DirectorState[K]) => {
    setState(prev => ({ ...prev, [key]: value, qrPayloads: [] }));
  }, []);

  const generateQRPayloads = useCallback((countdownSeconds: number = 10): QRPayload[] => {
    const startTimeUTC = Date.now() + countdownSeconds * 1000;
    const slots = GridService.generateSlots(state.grid);
    const phoneWidth = window.innerWidth;
    const phoneHeight = window.innerHeight;

    const payloads: QRPayload[] = slots.map(slot => ({
      v: 1 as const,
      text: state.text,
      speed: state.speed,
      style: state.style,
      textColor: state.textColor,
      bgColor: state.bgColor,
      orientation: state.orientation,
      grid: state.grid,
      position: slot.position,
      startTimeUTC,
      fontSize: state.fontSize,
      phoneWidth,
      phoneHeight,
    }));

    setState(prev => ({ ...prev, qrPayloads: payloads, startTimeUTC }));
    return payloads;
  }, [state.text, state.speed, state.style, state.textColor, state.bgColor, state.orientation, state.grid, state.fontSize]);

  const regenerateWithStart = useCallback((countdownSeconds: number) => {
    const startTimeUTC = Date.now() + countdownSeconds * 1000;
    setState(prev => ({
      ...prev,
      startTimeUTC,
      qrPayloads: prev.qrPayloads.map(p => ({ ...p, startTimeUTC })),
    }));
    return startTimeUTC;
  }, []);

  return { state, updateField, generateQRPayloads, regenerateWithStart };
}
