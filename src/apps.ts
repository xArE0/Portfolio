import { FileText, Folder, Terminal, Settings, Share2, Trophy, Music, Trash2, Joystick, type LucideIcon } from 'lucide-react';

export interface AppDef {
  id: string;
  title: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  color: string;
  tile: string;
  hash?: string;
  width: number;
  height: number;
  hidden?: boolean;
}

export const APPS: AppDef[] = [
  { id: 'notepad', title: 'biography.txt - Notepad', label: 'About Me', shortLabel: 'Notepad', Icon: FileText, color: 'text-amber-500', tile: 'from-amber-600 to-amber-400', hash: '#about', width: 780, height: 520 },
  { id: 'explorer', title: 'File Explorer', label: 'Projects', shortLabel: 'Files', Icon: Folder, color: 'text-yellow-500', tile: 'from-yellow-600 to-yellow-400', hash: '#projects', width: 880, height: 560 },
  { id: 'achievements', title: 'Achievements', label: 'Achievements', shortLabel: 'Trophies', Icon: Trophy, color: 'text-amber-400', tile: 'from-orange-600 to-orange-400', hash: '#achievements', width: 880, height: 560 },
  { id: 'music', title: 'Music Player', label: 'Music', shortLabel: 'Music', Icon: Music, color: 'text-purple-500', tile: 'from-purple-600 to-purple-400', hash: '#music', width: 480, height: 560 },
  { id: 'terminal', title: 'PowerShell Terminal', label: 'Terminal', shortLabel: 'Terminal', Icon: Terminal, color: 'text-emerald-500', tile: 'from-emerald-600 to-emerald-400', hash: '#terminal', width: 800, height: 500 },
  { id: 'settings', title: 'Settings', label: 'Settings', shortLabel: 'Settings', Icon: Settings, color: 'text-blue-500', tile: 'from-blue-600 to-blue-400', hash: '#settings', width: 860, height: 550 },
  { id: 'getintouch', title: 'Get In Touch', label: 'Get in Touch', shortLabel: 'Connect', Icon: Share2, color: 'text-cyan-500', tile: 'from-cyan-600 to-cyan-400', hash: '#contact', width: 680, height: 500 },
  { id: 'arcade', title: 'Arcade', label: 'Arcade', shortLabel: 'Arcade', Icon: Joystick, color: 'text-pink-400', tile: 'from-pink-600 to-fuchsia-400', hash: '#arcade', width: 720, height: 640 },
  { id: 'recycle', title: 'Recycle Bin', label: 'Recycle Bin', shortLabel: 'Bin', Icon: Trash2, color: 'text-slate-300', tile: 'from-slate-600 to-slate-400', width: 640, height: 460 },
];

export const getApp = (id: string) => APPS.find(a => a.id === id);

export const VISIBLE_APPS = APPS.filter(a => !a.hidden);
