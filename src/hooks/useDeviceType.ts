import { useSyncExternalStore } from 'react';
import type { DeviceType } from '../types';

const getDeviceType = (): DeviceType => {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'monitor';
};

const subscribe = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

export const useDeviceType = () => useSyncExternalStore(subscribe, getDeviceType);
