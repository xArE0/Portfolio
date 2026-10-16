import React, { useState, useEffect, useRef } from 'react';
import { Search, Volume2, VolumeX, Wifi, Battery, ChevronUp, LayoutGrid } from 'lucide-react';
import { useSystem } from '../system';
import { unlockSecret } from '../lib/secrets';

interface TaskbarProps {
  windows: Array<{
    id: string;
    title: string;
    isOpen: boolean;
    isActive: boolean;
    icon: React.ReactNode;
  }>;
  onToggleWindow: (id: string) => void;
  onStartToggle: () => void;
  onWidgetsToggle: () => void;
  isStartOpen: boolean;
  darkMode: boolean;
}

const toBinary = (n: number, width: number) => n.toString(2).padStart(width, '0');

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onToggleWindow,
  onStartToggle,
  onWidgetsToggle,
  isStartOpen,
  darkMode,
}) => {
  const { soundEnabled, setSoundEnabled } = useSystem();
  const [time, setTime] = useState(() => new Date());
  const [binary, setBinary] = useState(false);
  const clicks = useRef({ count: 0, last: 0 });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockClick = () => {
    const now = Date.now();
    clicks.current.count = now - clicks.current.last < 600 ? clicks.current.count + 1 : 1;
    clicks.current.last = now;
    if (clicks.current.count >= 7) {
      clicks.current.count = 0;
      setBinary(b => !b);
      unlockSecret('binary-clock');
    }
  };

  const hover = darkMode ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[rgba(0,0,0,0.05)]';
  const text = darkMode ? 'text-gray-300' : 'text-gray-700';
  const openWindows = windows.filter(w => w.isOpen);
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;

  return (
    <div
      style={{ zIndex: 999 }}
      className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center px-3 select-none glass-panel border-t ${
        darkMode ? 'bg-[rgba(32,32,32,0.6)] border-[rgba(255,255,255,0.06)]' : 'bg-[rgba(243,243,243,0.6)] border-[rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="absolute left-3 top-0 h-full hidden sm:flex items-center gap-2">
        <button
          onClick={e => { e.stopPropagation(); onWidgetsToggle(); }}
          className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${hover} ${text}`}
          title="Widgets"
        >
          <LayoutGrid size={16} />
        </button>
        <ChevronUp size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
      </div>

      <div className="flex items-center justify-center gap-1.5 h-full">
        <button
          onClick={e => { e.stopPropagation(); onStartToggle(); }}
          className={`group relative w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
            isStartOpen ? (darkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.08)]') : hover
          }`}
          title="Start"
        >
          <svg viewBox="0 0 88 88" className="w-5 h-5 group-hover:scale-105 active:scale-95 transition-transform duration-100">
            <path fill="var(--color-win11-blue)" d="M0 0h41v41H0zM47 0h41v41H47zM0 47h41v41H0zM47 47h41v41H47z" />
          </svg>
        </button>

        <button
          className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${hover} ${text}`}
          title="Search"
          onClick={e => { e.stopPropagation(); onStartToggle(); }}
        >
          <Search size={18} />
        </button>

        {openWindows.length > 0 && <div className={`w-[1px] h-6 mx-1 ${darkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.1)]'}`} />}

        {openWindows.map(w => (
          <button
            key={w.id}
            onClick={e => { e.stopPropagation(); onToggleWindow(w.id); }}
            className={`group relative w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
              w.isActive ? (darkMode ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-[rgba(0,0,0,0.06)]') : hover
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-transform duration-100">{w.icon}</div>
            <div className={`absolute bottom-0.5 h-0.5 rounded-full bg-win11-blue transition-all duration-200 ${w.isActive ? 'w-4 opacity-100' : 'w-1.5 opacity-60'}`} />
            <div
              className={`absolute bottom-12 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom px-2.5 py-1 text-[11px] rounded shadow-lg border pointer-events-none whitespace-nowrap ${
                darkMode ? 'bg-[#2b2b2b] text-white border-neutral-700' : 'bg-white text-gray-800 border-gray-200'
              }`}
            >
              {w.title}
            </div>
          </button>
        ))}
      </div>

      <div className="absolute right-3 top-0 h-full flex items-center justify-end gap-3.5 pr-2 text-xs">
        <button
          onClick={e => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-full transition-colors duration-150 ${hover} ${text}`}
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          <Wifi size={14} />
          <SoundIcon size={14} />
          <Battery size={14} />
        </button>

        <button
          onClick={e => { e.stopPropagation(); handleClockClick(); }}
          className={`flex flex-col items-end justify-center pl-1.5 pr-1 py-1 rounded transition-colors duration-150 text-right leading-tight ${hover} ${text} ${binary ? 'font-mono' : ''}`}
        >
          {binary ? (
            <>
              <span className="text-[10px]">{toBinary(time.getHours(), 5)}:{toBinary(time.getMinutes(), 6)}</span>
              <span className="text-[9px] opacity-75">{toBinary(time.getSeconds(), 6)}</span>
            </>
          ) : (
            <>
              <span>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              <span className="text-[10px] opacity-75">{time.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
