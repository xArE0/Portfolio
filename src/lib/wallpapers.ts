import type { CSSProperties } from 'react';

export interface Wallpaper {
  id: string;
  name: string;
  background: string;
  secretsRequired?: number;
}

export const PROFILE_IMAGE = '/assets/profile.jpg';

export const WALLPAPERS: Wallpaper[] = [
  { id: 'profile', name: 'Profile Photo', background: `url(${PROFILE_IMAGE}) center / cover` },
  { id: 'bloom-dark', name: 'Bloom Dark', background: 'linear-gradient(135deg, #0d0c1d 0%, #0c0827 25%, #022349 65%, #05030a 100%)' },
  { id: 'bloom-light', name: 'Bloom Light', background: 'linear-gradient(135deg, #e4eefb 0%, #cfddf2 30%, #f6daea 70%, #edf3fe 100%)' },
  {
    id: 'fluid-aurora',
    name: 'Fluid Aurora',
    background: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 55%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 55%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 55%), radial-gradient(at 50% 100%, hsla(208,44%,20%,1) 0, transparent 55%), #0b0a14',
  },
  { id: 'cyber-grid', name: 'Cyber Grid', background: 'linear-gradient(180deg, #090d16 0%, #02050b 100%)' },
  {
    id: 'synthwave',
    name: 'Synthwave',
    background: 'radial-gradient(circle at 50% 62%, #ffb347 0, #ff4f81 9%, transparent 10%), linear-gradient(180deg, #1a0533 0%, #42106b 45%, #ff2e88 62%, #12002a 63%, #0a0018 100%)',
    secretsRequired: 5,
  },
];

export const findWallpaper = (id: string) => WALLPAPERS.find(w => w.id === id) ?? WALLPAPERS[0];

export const wallpaperStyle = (id: string): CSSProperties => ({ background: findWallpaper(id).background });
