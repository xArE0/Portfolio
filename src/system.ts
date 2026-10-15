import { createContext, useContext } from 'react';
import type { DeviceType, Effect, PowerAction, SoundType } from './types';

export interface SystemApi {
  deviceType: DeviceType;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  wallpaper: string;
  setWallpaper: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  accent: string;
  setAccent: (color: string) => void;
  play: (type: SoundType) => void;
  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  power: (action: PowerAction) => void;
  triggerEffect: (effect: Effect) => void;
  notify: (title: string, body: string) => void;
}

export const ACCENTS = ['#0078d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export const SystemContext = createContext<SystemApi | null>(null);

export function useSystem(): SystemApi {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used inside SystemContext');
  return ctx;
}
