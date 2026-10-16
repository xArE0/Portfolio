export type DeviceType = 'monitor' | 'tablet' | 'mobile';
export type SoundType = 'startup' | 'shutdown' | 'beep' | 'unlock' | 'error';
export type PowerAction = 'shutdown' | 'restart';
export type Effect = 'matrix' | 'barrel-roll' | 'rainbow' | 'bsod';

export interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
