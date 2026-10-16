import React, { useState, useEffect } from 'react';
import { Wifi, Volume2, VolumeX, Battery, Search, ArrowLeft, X, Power } from 'lucide-react';
import { APPS, VISIBLE_APPS, getApp, type AppDef } from '../apps';
import { useSystem } from '../system';
import { findWallpaper, wallpaperStyle } from '../lib/wallpapers';
import type { WindowState } from '../types';
import { AppContent } from './AppContent';

interface AndroidSystemProps {
  windows: WindowState[];
  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;
  onCloseAll: () => void;
}

const AppTile: React.FC<{ app: AppDef; size?: 'md' | 'sm' }> = ({ app, size = 'md' }) => (
  <div
    className={`${size === 'md' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl'} bg-gradient-to-tr ${app.tile} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150`}
  >
    <app.Icon size={size === 'md' ? 24 : 20} className="text-white" />
  </div>
);

export const AndroidSystem: React.FC<AndroidSystemProps> = ({ windows, activeWindowId, setActiveWindowId, onCloseAll }) => {
  const { darkMode, wallpaper, soundEnabled, setSoundEnabled, play, openApp, closeApp, power } = useSystem();
  const [time, setTime] = useState(() => new Date());
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openApps = windows.filter(w => w.isOpen);
  const activeApp = activeWindowId ? getApp(activeWindowId) : undefined;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const launchApp = (id: string) => {
    openApp(id);
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
    setSearchQuery('');
  };

  const handleHome = () => {
    play('beep');
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
    setActiveWindowId(null);
  };

  const handleBack = () => {
    play('beep');
    if (isAppDrawerOpen) setIsAppDrawerOpen(false);
    else if (isRecentsOpen) setIsRecentsOpen(false);
    else setActiveWindowId(null);
  };

  const handleRecents = () => {
    play('beep');
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(!isRecentsOpen);
  };

  const query = searchQuery.trim().toLowerCase();
  const drawerApps = (query.length >= 3 ? APPS : VISIBLE_APPS).filter(app => app.shortLabel.toLowerCase().includes(query) || app.label.toLowerCase().includes(query));
  const dockApps = ['notepad', 'explorer', 'terminal', 'settings'].map(id => getApp(id)!);
  const current = findWallpaper(wallpaper);
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;

  return (
    <div
      style={wallpaperStyle(current.id)}
      className={`w-full h-full relative overflow-hidden flex flex-col font-segoe select-none ${current.id === 'profile' ? 'wallpaper-profile' : ''} ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}
    >
      <header className="w-full h-7 flex items-center justify-between px-6 text-[11px] font-semibold tracking-wider bg-black/10 backdrop-blur-[2px] z-50 text-white">
        <div>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })}</div>
        <div className="flex items-center gap-3.5">
          <Wifi size={12} className="stroke-[2.5]" />
          <button onClick={() => setSoundEnabled(!soundEnabled)}>
            <SoundIcon size={12} className="stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-1">
            <span>87%</span>
            <Battery size={13} className="stroke-[2.5]" />
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col justify-between p-4 pb-2">
        {!activeApp && !isRecentsOpen && (
          <div className="flex-1 flex flex-col justify-between py-6">
            <div className="flex flex-col items-center text-center mt-2 animate-slide-up">
              <div className="text-4xl font-light tracking-tight drop-shadow-md text-white">
                {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="text-xs mt-1.5 opacity-90 drop-shadow-sm font-medium text-white/95">
                {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>

              <button
                onClick={() => setIsAppDrawerOpen(true)}
                className="w-full max-w-[280px] sm:max-w-[340px] mt-6 flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md shadow-lg text-left text-white/80 hover:bg-white/25 active:scale-[0.98] transition-all duration-150 group"
              >
                <Search size={14} className="text-white/70 group-hover:scale-105 transition-transform" />
                <span className="text-[11.5px] font-medium tracking-wide">Search</span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center py-6">
              <div className="grid grid-cols-4 gap-y-5 gap-x-2 w-full max-w-[380px] px-2">
                {VISIBLE_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => launchApp(app.id)}
                    className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform duration-100"
                  >
                    <AppTile app={app} />
                    <span className="text-[10.5px] text-white font-medium text-center truncate w-full px-1 drop-shadow-md">{app.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center w-full mt-auto mb-1 animate-slide-up">
              <div className="px-4 py-3 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-4 sm:gap-6 max-w-[320px]">
                {dockApps.slice(0, 2).map(app => (
                  <button key={app.id} onClick={() => launchApp(app.id)} className="group active:scale-90 transition-all duration-100">
                    <AppTile app={app} size="sm" />
                  </button>
                ))}
                <button
                  onClick={() => setIsAppDrawerOpen(true)}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white/25 hover:bg-white/35 shadow-lg active:scale-95 hover:scale-105 border border-white/20 transition-all duration-150 group"
                  title="App Drawer"
                >
                  <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                </button>
                {dockApps.slice(2).map(app => (
                  <button key={app.id} onClick={() => launchApp(app.id)} className="group active:scale-90 transition-all duration-100">
                    <AppTile app={app} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeApp && !isRecentsOpen && (
          <div className="absolute inset-0 bg-[#0f0f15] z-10 flex flex-col animate-window-open rounded-t-lg overflow-hidden border border-white/5 shadow-2xl">
            <div
              className={`h-11 flex items-center justify-between px-3.5 border-b ${
                darkMode ? 'bg-[#1b1b22] border-white/5 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={handleHome}
                  className={`p-1.5 rounded-full transition-colors ${darkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'}`}
                  title="Home"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2 font-medium text-xs tracking-wide">
                  <activeApp.Icon size={14} className={activeApp.color} />
                  <span>{activeApp.shortLabel}</span>
                </div>
              </div>
              <button
                onClick={() => closeApp(activeApp.id)}
                className={`p-1.5 rounded-full transition-colors hover:bg-red-500 hover:text-white ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-black flex flex-col">
              <AppContent id={activeApp.id} />
            </div>
          </div>
        )}

        {isRecentsOpen && (
          <div className="absolute inset-0 z-30 bg-black/65 backdrop-blur-md flex flex-col justify-between py-8 px-4 animate-fade-in text-white">
            <div className="text-center pt-2">
              <h2 className="text-sm font-semibold tracking-wider opacity-75">Recent Apps</h2>
              <p className="text-[10px] opacity-50 mt-0.5">{openApps.length} running</p>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-x-auto py-4 w-full">
              {openApps.length === 0 ? (
                <div className="text-center opacity-40 py-12 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Search size={16} />
                  </div>
                  <span className="text-[11px]">No recent items</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-8 overflow-visible">
                  {openApps.map(w => {
                    const app = getApp(w.id)!;
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          setActiveWindowId(app.id);
                          setIsRecentsOpen(false);
                        }}
                        className={`w-[170px] aspect-[9/15] rounded-xl flex flex-col overflow-hidden border border-white/10 bg-[#161622] hover:bg-[#1f1f2e] cursor-pointer shadow-2xl relative transition-all duration-200 hover:-translate-y-1.5 group select-none active:scale-[0.98] ${
                          activeWindowId === app.id ? 'ring-2 ring-win11-blue' : ''
                        }`}
                      >
                        <div className="h-9 flex items-center justify-between px-3 border-b border-white/5 bg-black/25">
                          <div className="flex items-center gap-1.5">
                            <app.Icon size={12} className={app.color} />
                            <span className="text-[10.5px] font-semibold">{app.shortLabel}</span>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              closeApp(app.id);
                            }}
                            className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#11111d] to-[#08080f] text-center">
                          <div className="mb-3">
                            <AppTile app={app} size="sm" />
                          </div>
                          <span className="text-[11px] font-medium opacity-80">{app.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {openApps.length > 0 && (
              <div className="flex justify-center mt-2 animate-slide-up">
                <button
                  onClick={() => {
                    onCloseAll();
                    setIsRecentsOpen(false);
                  }}
                  className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/15 text-xs font-semibold tracking-wider active:scale-95 transition-all shadow-md text-red-400 border border-red-500/20"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {isAppDrawerOpen && (
          <div className="absolute inset-0 z-40 bg-[#0f0f16]/95 backdrop-blur-xl flex flex-col animate-widgets-in text-white p-4">
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-white/90 px-1">All Apps</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm('Shut down the system?')) power('shutdown');
                    }}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 active:scale-90 transition-all"
                    title="Shut Down"
                  >
                    <Power size={14} />
                  </button>
                  <button onClick={() => setIsAppDrawerOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/70 active:scale-90 transition-all">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm focus-within:border-win11-blue transition-all">
                <Search size={15} className="text-white/60" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[11px] focus:ring-0 placeholder:text-white/40"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 px-1 pb-6">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {drawerApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => launchApp(app.id)}
                    className="flex flex-col items-center gap-2 group active:scale-90 transition-all duration-100"
                  >
                    <AppTile app={app} />
                    <span className="text-[10px] text-white/80 font-medium text-center truncate w-full px-1">{app.shortLabel}</span>
                  </button>
                ))}
              </div>

              {drawerApps.length === 0 && <div className="text-center py-12 text-white/40 text-xs">No results</div>}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full h-11 flex items-center justify-center bg-black/40 border-t border-white/5 z-50">
        <div className="flex items-center justify-between w-full max-w-[280px] px-4">
          <button onClick={handleBack} className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group" title="Back">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white/80 group-hover:stroke-white transition-colors" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19,12 5,12 12,19 12,5" />
            </svg>
          </button>
          <button onClick={handleHome} className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group" title="Home">
            <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white/85 group-hover:border-white transition-colors" />
          </button>
          <button onClick={handleRecents} className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group" title="Recents">
            <div className="w-3.5 h-3.5 rounded-sm border-[2.5px] border-white/85 group-hover:border-white transition-colors" />
          </button>
        </div>
      </footer>
    </div>
  );
};
