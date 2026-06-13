import React, { useState, useEffect } from 'react';
import { 
  Wifi, Volume2, Battery, Search, ArrowLeft, X, 
  Trophy, FileText, Folder, Terminal, Settings, Music, Mail
} from 'lucide-react';

import { NotepadApp } from './apps/NotepadApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { TerminalApp } from './apps/TerminalApp';
import { SettingsApp } from './apps/SettingsApp';
import { AchievementsApp } from './apps/AchievementsApp';
import { MusicPlayerApp } from './apps/MusicPlayerApp';

// Define WindowItem matching App.tsx
interface WindowItem {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  icon: React.ReactNode;
  defaultX: number;
  defaultY: number;
  defaultWidth: number;
  defaultHeight: number;
}

interface AndroidSystemProps {
  darkMode: boolean;
  wallpaper: string;
  wallpaperStyles: Record<string, string>;
  soundEnabled: boolean;
  playSynthSound: (type: 'startup' | 'shutdown' | 'beep') => void;
  windows: WindowItem[];
  setWindows: React.Dispatch<React.SetStateAction<WindowItem[]>>;
  activeWindowId: string | null;
  setActiveWindowId: React.Dispatch<React.SetStateAction<string | null>>;
  deviceType: 'tablet' | 'mobile';
  setWallpaper: (theme: string) => void;
  setDarkMode: (dark: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  triggerPowerAction: (action: 'shutdown' | 'restart') => void;
}

export const AndroidSystem: React.FC<AndroidSystemProps> = ({
  darkMode,
  wallpaper,
  wallpaperStyles,
  soundEnabled,
  playSynthSound,
  windows,
  setWindows,
  activeWindowId,
  setActiveWindowId,
  deviceType,
  setWallpaper,
  setDarkMode,
  setSoundEnabled,
  triggerPowerAction,
}) => {
  const [time, setTime] = useState(new Date());
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track active apps that are open
  const openApps = windows.filter(w => w.isOpen);
  const activeApp = windows.find(w => w.id === activeWindowId);

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Launch app in Android style
  const launchApp = (id: string) => {
    playSynthSound('beep');
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: true, isMinimized: false };
      }
      return w;
    }));
    setActiveWindowId(id);
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
  };

  // Handle Home Button
  const handleHome = () => {
    playSynthSound('beep');
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
    setActiveWindowId(null);
  };

  // Handle Back Button
  const handleBack = () => {
    playSynthSound('beep');
    if (isAppDrawerOpen) {
      setIsAppDrawerOpen(false);
    } else if (isRecentsOpen) {
      setIsRecentsOpen(false);
    } else if (activeWindowId) {
      setActiveWindowId(null);
    }
  };

  // Handle Recents Button
  const handleRecents = () => {
    playSynthSound('beep');
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(!isRecentsOpen);
  };

  // Close app completely (remove from recents)
  const closeApp = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isOpen: false } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  // Clear all background apps
  const clearAllApps = () => {
    setWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
    setActiveWindowId(null);
    setIsRecentsOpen(false);
  };

  // Android launcher apps config
  const appConfigs: Record<string, { name: string; bg: string; icon: React.ReactNode }> = {
    notepad: {
      name: 'Notepad',
      bg: 'bg-gradient-to-tr from-amber-600 to-amber-400',
      icon: <FileText size={24} className="text-white" />
    },
    explorer: {
      name: 'Files',
      bg: 'bg-gradient-to-tr from-yellow-600 to-yellow-400',
      icon: <Folder size={24} className="text-white" />
    },
    terminal: {
      name: 'Terminal',
      bg: 'bg-gradient-to-tr from-emerald-600 to-emerald-400',
      icon: <Terminal size={24} className="text-white" />
    },
    settings: {
      name: 'Settings',
      bg: 'bg-gradient-to-tr from-blue-600 to-blue-400',
      icon: <Settings size={24} className="text-white" />
    },
    achievements: {
      name: 'Trophies',
      bg: 'bg-gradient-to-tr from-orange-600 to-orange-400',
      icon: <Trophy size={24} className="text-white" />
    },
    music: {
      name: 'Music',
      bg: 'bg-gradient-to-tr from-purple-600 to-purple-400',
      icon: <Music size={24} className="text-white" />
    },
    mail: {
      name: 'Contact',
      bg: 'bg-gradient-to-tr from-rose-600 to-rose-400',
      icon: <Mail size={24} className="text-white" />
    }
  };

  const getAppConfig = (id: string) => {
    return appConfigs[id] || {
      name: 'App',
      bg: 'bg-gray-500',
      icon: <FileText size={24} />
    };
  };

  // List of all shortcuts
  const shortcuts = [
    { id: 'notepad', onClick: () => launchApp('notepad') },
    { id: 'explorer', onClick: () => launchApp('explorer') },
    { id: 'achievements', onClick: () => launchApp('achievements') },
    { id: 'music', onClick: () => launchApp('music') },
    { id: 'terminal', onClick: () => launchApp('terminal') },
    { id: 'settings', onClick: () => launchApp('settings') },
    {
      id: 'mail',
      onClick: () => {
        window.open('mailto:avishek.shrestha@example.com', '_self');
      }
    }
  ];

  // Dock items (middle button is App Drawer)
  const dockItemsLeft = shortcuts.slice(0, 2);
  const dockItemsRight = shortcuts.slice(3, 5);

  const isProfileWallpaper = wallpaper === 'profile';

  return (
    <div
      style={{
        background: isProfileWallpaper ? 'none' : wallpaperStyles[wallpaper],
        backgroundImage: isProfileWallpaper ? 'url(/assets/profile.png)' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className={`w-full h-full relative overflow-hidden flex flex-col font-segoe select-none ${
        isProfileWallpaper ? 'wallpaper-profile' : ''
      } ${darkMode ? 'text-white' : 'text-gray-900'}`}
    >
      {/* 1. Android Status Bar */}
      <header className="w-full h-7 flex items-center justify-between px-6 text-[11px] font-semibold tracking-wider bg-black/10 backdrop-blur-[2px] z-50">
        <div>{formatTime(time)}</div>
        <div className="flex items-center gap-3.5">
          <Wifi size={12} className="stroke-[2.5]" />
          <Volume2 size={12} className="stroke-[2.5]" />
          <div className="flex items-center gap-1">
            <span>87%</span>
            <Battery size={13} className="stroke-[2.5]" />
          </div>
        </div>
      </header>

      {/* 2. Main Canvas Body */}
      <main className="flex-1 relative overflow-hidden flex flex-col justify-between p-4 pb-2">
        {/* Render Home Screen if no active app and not in Recents */}
        {activeWindowId === null && !isRecentsOpen && (
          <div className="flex-1 flex flex-col justify-between py-6">
            {/* Clock & Search Widgets */}
            <div className="flex flex-col items-center text-center mt-2 animate-slide-up">
              {/* Digital Clock */}
              <div className="text-4xl font-light tracking-tight drop-shadow-md text-white">
                {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="text-xs mt-1.5 opacity-90 drop-shadow-sm font-medium text-white/95">
                {formatDate(time)}
              </div>

              {/* Google style Search Bar Widget (Start Menu trigger in the middle of screen) */}
              <button 
                onClick={() => setIsAppDrawerOpen(true)}
                className="w-full max-w-[280px] sm:max-w-[340px] mt-6 flex items-center justify-between px-4 py-2.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md shadow-lg text-left text-white/80 hover:bg-white/25 active:scale-[0.98] transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5">
                  <Search size={14} className="text-white/70 group-hover:scale-105 transition-transform" />
                  <span className="text-[11.5px] font-medium tracking-wide">Search apps & projects...</span>
                </div>
                {/* Decorative Mic icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/80">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </button>
            </div>

            {/* App Shortcuts Grid */}
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="grid grid-cols-4 gap-y-5 gap-x-2 w-full max-w-[380px] px-2">
                {shortcuts.map((shortcut) => {
                  const cfg = getAppConfig(shortcut.id);
                  return (
                    <button
                      key={shortcut.id}
                      onClick={shortcut.onClick}
                      className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform duration-100"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-150`}>
                        {cfg.icon}
                      </div>
                      <span className="text-[10.5px] text-white font-medium text-center truncate w-full px-1 drop-shadow-md">
                        {cfg.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Glass Dock (hotseat) */}
            <div className="flex justify-center w-full mt-auto mb-1 animate-slide-up">
              <div className="px-4 py-3 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-4 sm:gap-6 max-w-[320px]">
                {/* Pinned apps left */}
                {dockItemsLeft.map((item) => {
                  const cfg = getAppConfig(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition-all duration-100 shadow-md"
                    >
                      <span className="scale-[0.85]">{cfg.icon}</span>
                    </button>
                  );
                })}

                {/* Central App Drawer Button ("Start Menu in the middle") */}
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

                {/* Pinned apps right */}
                {dockItemsRight.map((item) => {
                  const cfg = getAppConfig(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition-all duration-100 shadow-md"
                    >
                      <span className="scale-[0.85]">{cfg.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Render Active App fullscreen */}
        {activeWindowId !== null && !isRecentsOpen && activeApp && (
          <div className="absolute inset-0 bg-[#0f0f15] z-10 flex flex-col animate-window-open rounded-t-lg overflow-hidden border border-white/5 shadow-2xl">
            {/* Android App Header */}
            <div className={`h-11 flex items-center justify-between px-3.5 border-b ${
              darkMode 
                ? 'bg-[#1b1b22] border-white/5 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleHome}
                  className={`p-1.5 rounded-full transition-colors ${
                    darkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  title="Exit to Home"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex items-center gap-2 font-medium text-xs tracking-wide">
                  <span className="scale-75 opacity-80">{activeApp.icon}</span>
                  <span>{getAppConfig(activeApp.id).name}</span>
                </div>
              </div>

              {/* Close Button on top right */}
              <button
                onClick={() => closeApp(activeApp.id)}
                className={`p-1.5 rounded-full transition-colors hover:bg-red-500 hover:text-white ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                title="Force Close App"
              >
                <X size={15} />
              </button>
            </div>

            {/* App Body Content */}
            <div className="flex-1 overflow-hidden relative bg-black">
              {activeApp.id === 'notepad' && <NotepadApp darkMode={darkMode} />}
              {activeApp.id === 'explorer' && <FileExplorerApp darkMode={darkMode} deviceType={deviceType} />}
              {activeApp.id === 'terminal' && (
                <TerminalApp
                  darkMode={darkMode}
                  onClose={() => closeApp('terminal')}
                  onThemeChange={(theme) => setWallpaper(theme)}
                />
              )}
              {activeApp.id === 'settings' && (
                <SettingsApp
                  currentTheme={wallpaper}
                  onThemeChange={(theme) => setWallpaper(theme)}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  darkMode={darkMode}
                  onToggleDarkMode={() => {
                    setDarkMode(!darkMode);
                    playSynthSound('beep');
                  }}
                  deviceType={deviceType}
                />
              )}
              {activeApp.id === 'achievements' && (
                <AchievementsApp darkMode={darkMode} />
              )}
              {activeApp.id === 'music' && <MusicPlayerApp darkMode={darkMode} />}
            </div>
          </div>
        )}

        {/* 3. Android Recent Apps / Task Switcher */}
        {isRecentsOpen && (
          <div className="absolute inset-0 z-30 bg-black/65 backdrop-blur-md flex flex-col justify-between py-8 px-4 animate-fade-in text-white">
            <div className="text-center pt-2">
              <h2 className="text-sm font-semibold tracking-wider opacity-75">Recent Apps</h2>
              <p className="text-[10px] opacity-50 mt-0.5">
                {openApps.length === 0 ? 'No active background apps' : `${openApps.length} apps running`}
              </p>
            </div>

            {/* Cards List Carousel */}
            <div className="flex-1 flex items-center justify-center overflow-x-auto py-4 w-full">
              {openApps.length === 0 ? (
                <div className="text-center opacity-40 py-12 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Search size={16} />
                  </div>
                  <span className="text-[11px]">No recent items. Launcher is clean!</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-8 overflow-visible">
                  {openApps.map((app) => {
                    const cfg = getAppConfig(app.id);
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          setActiveWindowId(app.id);
                          setIsRecentsOpen(false);
                        }}
                        className={`w-[170px] aspect-[9/15] rounded-xl flex flex-col overflow-hidden border border-white/10 bg-[#161622] hover:bg-[#1f1f2e] cursor-pointer shadow-2xl relative transition-all duration-200 hover:-translate-y-1.5 group select-none active:scale-[0.98] ${
                          activeWindowId === app.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        {/* Card Header */}
                        <div className="h-9 flex items-center justify-between px-3 border-b border-white/5 bg-black/25">
                          <div className="flex items-center gap-1.5">
                            <div className="scale-75">{app.icon}</div>
                            <span className="text-[10.5px] font-semibold">{cfg.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeApp(app.id);
                            }}
                            className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        {/* Card Preview Area */}
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#11111d] to-[#08080f] text-center">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shadow-lg mb-3`}>
                            {cfg.icon}
                          </div>
                          <span className="text-[11px] font-medium opacity-80">{cfg.name} App</span>
                          <span className="text-[9px] opacity-40 mt-1 uppercase font-mono tracking-wider">Tap to resume</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear All apps button */}
            {openApps.length > 0 && (
              <div className="flex justify-center mt-2 animate-slide-up">
                <button
                  onClick={clearAllApps}
                  className="px-6 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-xs font-semibold tracking-wider active:scale-95 transition-all shadow-md text-red-400 border-red-500/20"
                >
                  Clear All Background Apps
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Android App Drawer Overlay */}
        {isAppDrawerOpen && (
          <div className="absolute inset-0 z-40 bg-[#0f0f16]/95 backdrop-blur-xl flex flex-col animate-widgets-in text-white p-4">
            {/* Drawer Header & Search */}
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-white/90 px-1">All Applications</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm('Shut down the system?')) {
                        triggerPowerAction('shutdown');
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 active:scale-90 transition-all"
                    title="Shut Down"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2.5}>
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setIsAppDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/70 active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer Search Input */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm focus-within:border-blue-500 transition-all">
                <Search size={15} className="text-white/60" />
                <input
                  type="text"
                  placeholder="Search drawer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-[11px] focus:ring-0 placeholder:text-white/40"
                  autoFocus
                />
              </div>
            </div>

            {/* App Grid inside drawer */}
            <div className="flex-1 overflow-y-auto mt-4 px-1 pb-6">
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {shortcuts
                  .filter(app => getAppConfig(app.id).name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((app) => {
                    const cfg = getAppConfig(app.id);
                    return (
                      <button
                        key={app.id}
                        onClick={app.onClick}
                        className="flex flex-col items-center gap-2 group active:scale-90 transition-all duration-100"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-white/5`}>
                          {cfg.icon}
                        </div>
                        <span className="text-[10px] text-white/80 font-medium text-center truncate w-full px-1">
                          {cfg.name}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {shortcuts.filter(app => getAppConfig(app.id).name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="text-center py-12 text-white/40 text-xs flex flex-col items-center gap-2">
                  <span>No apps match your search.</span>
                  <span className="text-[10px] opacity-60">Check spelling or search folders instead.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 5. Bottom Navigation Bar */}
      <footer className="w-full h-11 flex items-center justify-center bg-black/40 border-t border-white/5 z-50">
        <div className="flex items-center justify-between w-full max-w-[280px] px-4">
          {/* Back Button (Classic Triangle shape) */}
          <button
            onClick={handleBack}
            className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group"
            title="Back"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white/80 group-hover:stroke-white transition-colors" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19,12 5,12 12,19 12,5" />
            </svg>
          </button>

          {/* Home Button (Circle) */}
          <button
            onClick={handleHome}
            className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group"
            title="Home"
          >
            <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white/85 group-hover:border-white transition-colors" />
          </button>

          {/* Recents Switcher Button (Square) */}
          <button
            onClick={handleRecents}
            className="w-12 h-10 flex items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors group"
            title="Overview / Recents"
          >
            <div className="w-3.5 h-3.5 rounded-sm border-[2.5px] border-white/85 group-hover:border-white transition-colors" />
          </button>
        </div>
      </footer>
    </div>
  );
};
