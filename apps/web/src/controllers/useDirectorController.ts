import { useState, useCallback } from 'react';
import type { LEDStyle, Orientation, GridDimensions, SharedQRPayload } from '@led-panel/core';

export interface DirectorState {
  text: string;
  style: LEDStyle;
  textColor: string;
  bgColor: string;
  speed: number;
  orientation: Orientation;
  grid: GridDimensions;
  sharedPayload: SharedQRPayload | null;
  startTimeUTC: number;
}

const DEFAULT_STATE: DirectorState = {
  text: 'HELLO WORLD',
  style: 'dot-matrix',
  textColor: '#FF0000',
  bgColor: '#000000',
  speed: 100,
  orientation: 'landscape',
  grid: { cols: 2, rows: 1 },
  sharedPayload: null,
  startTimeUTC: 0,
};

export function useDirectorController() {
  const [state, setState] = useState<DirectorState>(DEFAULT_STATE);

  const updateField = useCallback(<K extends keyof DirectorState>(key: K, value: DirectorState[K]) => {
    setState(prev => ({ ...prev, [key]: value, sharedPayload: null }));
  }, []);

  const generateSharedPayload = useCallback((): SharedQRPayload => {
    const startTimeUTC = Date.now() + 60000; // placeholder
    const phoneWidth = window.innerWidth;
    const phoneHeight = window.innerHeight;
    const fontSize = Math.round(phoneHeight * 0.9);

    const payload: SharedQRPayload = {
      v: 1,
      text: state.text,
      speed: state.speed,
      style: state.style,
      textColor: state.textColor,
      bgColor: state.bgColor,
      orientation: state.orientation,
      grid: state.grid,
      startTimeUTC,
      fontSize,
      phoneWidth,
      phoneHeight,
    };

    setState(prev => ({ ...prev, sharedPayload: payload, startTimeUTC }));
    return payload;
  }, [state.text, state.speed, state.style, state.textColor, state.bgColor, state.orientation, state.grid]);

  const setStartTime = useCallback((countdownSeconds: number) => {
    const st = Date.now() + countdownSeconds * 1000;
    setState(prev => ({
      ...prev,
      startTimeUTC: st,
      sharedPayload: prev.sharedPayload ? { ...prev.sharedPayload, startTimeUTC: st } : null,
    }));
    return st;
  }, []);

  return { state, updateField, generateSharedPayload, setStartTime };
}
