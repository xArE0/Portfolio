import React, { useState, useEffect } from 'react';
import { Search, Volume2, Wifi, Battery, ChevronUp, LayoutGrid } from 'lucide-react';

interface TaskbarProps {
  windows: Array<{
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isActive: boolean;
    icon: React.ReactNode;
  }>;
  onToggleWindow: (id: string) => void;
  onStartToggle: () => void;
  onWidgetsToggle: () => void;
  isStartOpen: boolean;
  darkMode: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onToggleWindow,
  onStartToggle,
  onWidgetsToggle,
  isStartOpen,
  darkMode,
}) => {
  const [time, setTime] = useState(new Date());

  // Clock ticking
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={{ zIndex: 999 }}
      className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center px-3 select-none glass-panel border-t ${
        darkMode 
          ? 'bg-[rgba(32,32,32,0.6)] border-[rgba(255,255,255,0.06)]' 
          : 'bg-[rgba(243,243,243,0.6)] border-[rgba(0,0,0,0.08)]'
      }`}
    >
      {/* Left side — Widgets button (absolutely positioned) */}
      <div className="absolute left-3 top-0 h-full hidden sm:flex items-center gap-2">
        {/* Widgets Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWidgetsToggle();
          }}
          className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
            darkMode ? 'hover:bg-[rgba(255,255,255,0.05)] text-gray-300' : 'hover:bg-[rgba(0,0,0,0.05)] text-gray-700'
          }`}
          title="Widgets"
        >
          <LayoutGrid size={16} />
        </button>
        <ChevronUp size={16} className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} />
      </div>

      {/* Centered Icons */}
      <div className="flex items-center justify-center gap-1.5 h-full">
        {/* Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartToggle();
          }}
          className={`group relative w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
            isStartOpen 
              ? (darkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.08)]') 
              : (darkMode ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[rgba(0,0,0,0.05)]')
          }`}
          title="Start"
        >
          <svg viewBox="0 0 88 88" className="w-5 h-5 transform group-hover:scale-105 active:scale-95 transition-transform duration-100">
            <path fill="#0078d4" d="M0 0h41v41H0zM47 0h41v41H47zM0 47h41v41H0zM47 47h41v41H47z" />
          </svg>
          <div className={`absolute bottom-0.5 w-1 h-1 rounded-full bg-win11-blue transition-all duration-150 ${isStartOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
        </button>

        {/* Search Bar Icon */}
        <button
          className={`w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
            darkMode ? 'hover:bg-[rgba(255,255,255,0.05)] text-gray-300' : 'hover:bg-[rgba(0,0,0,0.05)] text-gray-700'
          }`}
          title="Search"
          onClick={(e) => {
            e.stopPropagation();
            onStartToggle();
          }}
        >
          <Search size={18} className="transform hover:scale-105" />
        </button>

        {/* Separator if we have open windows */}
        {windows.some(w => w.isOpen) && (
          <div className={`w-[1px] h-6 mx-1 ${darkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.1)]'}`} />
        )}

        {/* Window App Icons */}
        {windows
          .filter(w => w.isOpen)
          .map(w => (
            <button
              key={w.id}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWindow(w.id);
              }}
              className={`group relative w-10 h-10 flex items-center justify-center rounded transition-all duration-150 ${
                w.isActive 
                  ? (darkMode ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-[rgba(0,0,0,0.06)]') 
                  : (darkMode ? 'hover:bg-[rgba(255,255,255,0.04)]' : 'hover:bg-[rgba(0,0,0,0.04)]')
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center transform group-hover:scale-105 active:scale-95 transition-transform duration-100">
                {w.icon}
              </div>
              
              {/* App Status Indicator Bar */}
              <div
                className={`absolute bottom-0.5 h-0.5 rounded-full bg-win11-blue transition-all duration-200 ${
                  w.isActive 
                    ? 'w-4 opacity-100' 
                    : 'w-1.5 opacity-60'
                }`}
              />
              
              {/* Tooltip */}
              <div className={`absolute bottom-12 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom px-2.5 py-1 text-[11px] rounded shadow-lg border pointer-events-none whitespace-nowrap ${
                darkMode 
                  ? 'bg-[#2b2b2b] text-white border-neutral-700' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}>
                {w.title}
              </div>
            </button>
          ))}
      </div>

      {/* System Tray (Right — absolutely positioned) */}
      <div className="absolute right-3 top-0 h-full flex items-center justify-end gap-3.5 pr-2 text-xs">
        {/* Connection, Sound & Battery Status pill */}
        <div className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] cursor-pointer transition-colors duration-150 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Wifi size={14} />
          <Volume2 size={14} />
          <Battery size={14} />
        </div>

        {/* Date and Time */}
        <div className={`flex flex-col items-end justify-center pl-1.5 pr-1 py-1 rounded hover:bg-[rgba(255,255,255,0.08)] cursor-pointer transition-colors duration-150 text-right leading-tight ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <span>{formatTime(time)}</span>
          <span className="text-[10px] opacity-75">{formatDate(time)}</span>
        </div>
      </div>
    </div>
  );
};
