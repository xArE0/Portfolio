import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, Folder, Terminal, Settings, Mail, 
  Power, RotateCw, Trophy, Music
} from 'lucide-react';

import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { WidgetsPanel } from './components/WidgetsPanel';
import { NotepadApp } from './components/apps/NotepadApp';
import { FileExplorerApp } from './components/apps/FileExplorerApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { AchievementsApp } from './components/apps/AchievementsApp';
import { MusicPlayerApp } from './components/apps/MusicPlayerApp';
import { MonitorFrame } from './components/MonitorFrame';
import { AndroidSystem } from './components/AndroidSystem';

// Type Definitions
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

// Hash route mapping
const HASH_ROUTES: Record<string, string> = {
  '#about': 'notepad',
  '#projects': 'explorer',
  '#terminal': 'terminal',
  '#settings': 'settings',
  '#achievements': 'achievements',
  '#music': 'music',
};

export default function App() {
  const [wallpaper, setWallpaper] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isStartClosing, setIsStartClosing] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [isWidgetsClosing, setIsWidgetsClosing] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [achievementFocus, setAchievementFocus] = useState<string | undefined>(undefined);
  const [deviceType, setDeviceType] = useState<'monitor' | 'tablet' | 'mobile'>('monitor');
  
  // Boot states
  const [isBooting, setIsBooting] = useState(true);
  const [bootPhase, setBootPhase] = useState<'logo' | 'loading' | 'fadeout'>('logo');

  // Power states
  const [isShutDown, setIsShutDown] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [biosStage, setBiosStage] = useState(0);

  // Intro animation lock to prevent flickering on re-render
  const [isIntroAnimating, setIsIntroAnimating] = useState(false);

  // Track the last hash to prevent circular updates
  const lastHashRef = useRef<string>('');
  const windowsRef = useRef<WindowItem[]>([]);

  // Sound Engine (Web Audio API)
  const playSynthSound = useCallback((type: 'startup' | 'shutdown' | 'beep') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'startup') {
        const now = ctx.currentTime;
        const notes = [155.56, 233.08, 311.13, 392.00, 466.16];
        
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = index % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          
          const noteStart = now + (index * 0.12);
          
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.12, noteStart + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.5);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 2.6);
        });
      } else if (type === 'shutdown') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(261.63, now);
        osc.frequency.exponentialRampToValueAtTime(130.81, now + 1.2);
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      } else if (type === 'beep') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      console.warn("Audio Context blocked or not supported", e);
    }
  }, [soundEnabled]);

  // ================================
  // DEVICE TYPE TRACKING
  // ================================
  useEffect(() => {
   const handleResize = () => {
     const width = window.innerWidth;
     if (width < 640) {
       setDeviceType('mobile');
     } else if (width < 1024) {
       setDeviceType('tablet');
     } else {
       setDeviceType('monitor');
     }
   };

   handleResize();
   window.addEventListener('resize', handleResize);
   return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================================
  // BOOT SEQUENCE
  // ================================
  useEffect(() => {
    if (!isBooting) return;
    
    // Phase 1: Show logo (0 - 1.2s)
    const timer1 = setTimeout(() => setBootPhase('loading'), 1200);
    
    // Phase 2: Loading dots (1.2s - 3.2s)
    const timer2 = setTimeout(() => {
      setBootPhase('fadeout');
      playSynthSound('startup');
    }, 3200);
    
    // Phase 3: Fade out boot screen (3.2s - 4s)
    const timer3 = setTimeout(() => {
      setIsBooting(false);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isBooting, playSynthSound]);

  // Handle intro animation timer
  useEffect(() => {
    if (!isBooting) {
      const timer = setTimeout(() => {
        setIsIntroAnimating(false);
      }, 1200);
      return () => {
        clearTimeout(timer);
        setIsIntroAnimating(true);
      };
    }
  }, [isBooting]);

  // System restart routine
  useEffect(() => {
    if (isRestarting) {
      const timer0 = setTimeout(() => setBiosStage(1), 0);
      const timer1 = setTimeout(() => setBiosStage(2), 1500);
      const timer2 = setTimeout(() => setBiosStage(3), 3200);
      const timer3 = setTimeout(() => {
        setIsRestarting(false);
        setBiosStage(0);
        playSynthSound('startup');
      }, 5000);

      return () => {
        clearTimeout(timer0);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isRestarting, playSynthSound]);

  // Window State Management
  const [windows, setWindows] = useState<WindowItem[]>([
    {
      id: 'notepad',
      title: 'biography.txt - Notepad',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 11,
      icon: <FileText size={14} className="text-amber-500" />,
      defaultX: 100,
      defaultY: 30,
      defaultWidth: 780,
      defaultHeight: 520
    },
    {
      id: 'explorer',
      title: 'File Explorer',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      icon: <Folder size={14} className="text-yellow-500" />,
      defaultX: 80,
      defaultY: 25,
      defaultWidth: 880,
      defaultHeight: 560
    },
    {
      id: 'terminal',
      title: 'PowerShell Terminal',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      icon: <Terminal size={14} className="text-emerald-500" />,
      defaultX: 120,
      defaultY: 40,
      defaultWidth: 800,
      defaultHeight: 500
    },
    {
      id: 'settings',
      title: 'Settings',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      icon: <Settings size={14} className="text-blue-500" />,
      defaultX: 90,
      defaultY: 30,
      defaultWidth: 860,
      defaultHeight: 550
    },
    {
      id: 'achievements',
      title: '🏆 Achievements — Gallery',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      icon: <Trophy size={14} className="text-amber-400" />,
      defaultX: 70,
      defaultY: 25,
      defaultWidth: 880,
      defaultHeight: 560
    },
    {
      id: 'music',
      title: '♪ Music Player',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      icon: <Music size={14} className="text-purple-500" />,
      defaultX: 200,
      defaultY: 40,
      defaultWidth: 480,
      defaultHeight: 560
    }
  ]);

  // Keep windows ref in sync with state
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  // ================================
  // HASH-BASED ROUTING
  // ================================
  const handleHashRoute = useCallback(() => {
    const hash = window.location.hash;
    
    // Prevent processing the same hash twice
    if (hash === lastHashRef.current) return;
    lastHashRef.current = hash;
    
    if (!hash) return;

    // Check for certificate deep link: #certificate/id
    if (hash.startsWith('#certificate/')) {
      const certId = hash.replace('#certificate/', '');
      setAchievementFocus(certId);
      // Open achievements window
      setWindows(prev => prev.map(w => {
        if (w.id === 'achievements') {
          const nextZ = windowsRef.current.reduce((max, win) => Math.max(max, win.zIndex), 10) + 1;
          setMaxZIndex(nextZ);
          setActiveWindowId('achievements');
          return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
        }
        return w;
      }));
      return;
    }

    // Standard route mapping
    const windowId = HASH_ROUTES[hash];
    if (windowId) {
      setWindows(prev => prev.map(w => {
        if (w.id === windowId) {
          const nextZ = windowsRef.current.reduce((max, win) => Math.max(max, win.zIndex), 10) + 1;
          setMaxZIndex(nextZ);
          setActiveWindowId(windowId);
          return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
        }
        return w;
      }));
    }
  }, []);

  // Listen for hash changes
  useEffect(() => {
    // Process initial hash after boot
    if (!isBooting) {
      setTimeout(() => handleHashRoute(), 0);
    }
    
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, [isBooting, handleHashRoute]);

  // Update hash when active window changes (only from UI, not from hash routes)
  useEffect(() => {
    if (activeWindowId) {
      const routeEntry = Object.entries(HASH_ROUTES).find(([, id]) => id === activeWindowId);
      if (routeEntry && routeEntry[0] !== window.location.hash) {
        lastHashRef.current = routeEntry[0];
        window.history.replaceState(null, '', routeEntry[0]);
      }
    }
  }, [activeWindowId]);

  // ================================
  // WINDOW ACTIONS
  // ================================
  const openWindow = (id: string) => {
    playSynthSound('beep');
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const nextZ = maxZIndex + 1;
        setMaxZIndex(nextZ);
        setActiveWindowId(id);
        return { ...w, isOpen: true, isMinimized: false, zIndex: nextZ };
      }
      return w;
    }));
  };

  const closeWindow = (id: string) => {
    playSynthSound('beep');
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isOpen: false } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
    // Clear hash if this window's route matches
    const routeEntry = Object.entries(HASH_ROUTES).find(([, wid]) => wid === id);
    if (routeEntry && window.location.hash === routeEntry[0]) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const minimizeWindow = (id: string) => {
    playSynthSound('beep');
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    playSynthSound('beep');
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) return;
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: false, zIndex: nextZ } : w
    ));
  };

  // Toggle Minimize/Restore from Taskbar Click
  const handleTaskbarToggle = (id: string) => {
    const target = windows.find(w => w.id === id);
    if (!target) return;

    if (target.isMinimized || activeWindowId !== target.id) {
      focusWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  // ================================
  // START MENU WITH CLOSE ANIMATION
  // ================================
  const closeStartMenu = () => {
    if (!isStartOpen) return;
    setIsStartClosing(true);
    setTimeout(() => {
      setIsStartOpen(false);
      setIsStartClosing(false);
    }, 180);
  };

  const toggleStartMenu = () => {
    playSynthSound('beep');
    if (isStartOpen) {
      closeStartMenu();
    } else {
      setIsStartOpen(true);
      setIsStartClosing(false);
    }
  };

  // ================================
  // WIDGETS PANEL WITH CLOSE ANIMATION
  // ================================
  const toggleWidgets = () => {
    playSynthSound('beep');
    if (isWidgetsOpen) {
      setIsWidgetsClosing(true);
      setTimeout(() => {
        setIsWidgetsOpen(false);
        setIsWidgetsClosing(false);
      }, 250);
    } else {
      setIsWidgetsOpen(true);
      setIsWidgetsClosing(false);
    }
  };

  // Shut Down/Restart triggers
  const triggerPowerAction = (action: 'shutdown' | 'restart') => {
    closeStartMenu();
    if (action === 'shutdown') {
      playSynthSound('shutdown');
      setIsShutDown(true);
    } else if (action === 'restart') {
      playSynthSound('shutdown');
      setIsRestarting(true);
    }
  };

  const handleTurnOn = () => {
    setIsShutDown(false);
    // Trigger boot sequence
    setIsBooting(true);
    setBootPhase('logo');
  };

  // Desktop shortcuts
  const desktopShortcuts = [
    { id: 'notepad', name: 'About Me', icon: <FileText size={32} className="text-amber-500 drop-shadow-md" /> },
    { id: 'explorer', name: 'Projects', icon: <Folder size={32} className="text-yellow-500 drop-shadow-md" /> },
    { id: 'achievements', name: 'Achievements', icon: <Trophy size={32} className="text-amber-400 drop-shadow-md" /> },
    { id: 'music', name: 'Music', icon: <Music size={32} className="text-purple-500 drop-shadow-md" /> },
    { id: 'terminal', name: 'Terminal', icon: <Terminal size={32} className="text-emerald-500 drop-shadow-md" /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={32} className="text-blue-500 drop-shadow-md" /> },
    {
      id: 'mail',
      name: 'Mail Form',
      icon: <Mail size={32} className="text-rose-500 drop-shadow-md" />,
      onClick: () => {
        window.location.href = 'mailto:avishek.shrestha@example.com';
      }
    }
  ];

  // Wallpaper CSS maps
  const wallpaperStyles: Record<string, string> = {
    'profile': 'none', // Special: uses background-image
    'bloom-dark': 'linear-gradient(135deg, #0d0c1d 0%, #0c0827 25%, #022349 65%, #05030a 100%)',
    'bloom-light': 'linear-gradient(135deg, #e4eefb 0%, #cfddf2 30%, #f6daea 70%, #edf3fe 100%)',
    'fluid-aurora': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 55%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 55%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 55%), radial-gradient(at 50% 100%, hsla(208,44%,20%,1) 0, transparent 55%)',
    'cyber-grid': 'linear-gradient(180deg, #090d16 0%, #02050b 100%)'
  };

  // ================================
  // BOOT SCREEN
  // ================================
  if (isBooting) {
    return (
      <MonitorFrame>
        <div className={`w-full h-full bg-black flex flex-col items-center justify-center select-none font-segoe ${
          bootPhase === 'fadeout' ? 'animate-boot-fadeout' : ''
        }`}>
          {/* Windows Logo */}
          <div className={bootPhase === 'logo' || bootPhase === 'loading' || bootPhase === 'fadeout' ? 'animate-boot-logo' : ''}>
            <svg viewBox="0 0 88 88" className="w-16 h-16 mb-8">
              <path fill="#0078d4" d="M0 0h41v41H0zM47 0h41v41H47zM0 47h41v41H0zM47 47h41v41H47z" />
            </svg>
          </div>

          {/* Loading Dots */}
          {(bootPhase === 'loading' || bootPhase === 'fadeout') && (
            <div className="flex items-center gap-2 mt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white animate-boot-dot"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          )}

          {/* Subtle text */}
          <div className="absolute bottom-12 text-gray-600 text-xs">
            PortfolioOS • Avishek Shrestha
          </div>
        </div>
      </MonitorFrame>
    );
  }

  // ================================
  // SHUTDOWN SCREEN
  // ================================
  if (isShutDown) {
    return (
      <MonitorFrame>
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white select-none relative font-segoe">
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <Power size={48} className="text-red-500 border border-red-500/20 p-2 rounded-full bg-red-500/5" />
            <span className="text-sm tracking-wider opacity-60">System Powered Off</span>
          </div>
          <button
            onClick={handleTurnOn}
            className="absolute bottom-16 px-6 py-2.5 rounded-full border border-neutral-700 hover:border-win11-blue hover:text-win11-blue transition-all duration-200 text-xs font-semibold"
          >
            Boot System
          </button>
        </div>
      </MonitorFrame>
    );
  }

  // ================================
  // RESTART / BIOS SCREEN
  // ================================
  if (isRestarting) {
    return (
      <MonitorFrame>
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white select-none font-mono text-xs">
          {biosStage === 1 && (
            <div className="flex flex-col items-center gap-4">
              <RotateCw className="animate-spin text-win11-blue" size={32} />
              <span>Restarting System...</span>
            </div>
          )}
          
          {biosStage === 2 && (
            <div className="w-[85%] max-w-[500px] flex flex-col gap-2.5 text-left text-[#cccccc]">
              <div>BIOS ROM Version 2.44.15</div>
              <div>Copyright (C) 2026 Antigravity Engineering Corp.</div>
              <div>-----------------------------------------------</div>
              <div>CPU: Intel(R) Core(TM) i9-14900K @ 4.20GHz</div>
              <div>Memory Test: 16777216KB OK (DDR5 5600MHz)</div>
              <div>Detecting SSD Storage Drives... OK</div>
              <div className="text-yellow-500 animate-pulse mt-2">Loading Portfolio OS Kernel...</div>
            </div>
          )}

          {biosStage === 3 && (
            <div className="flex flex-col items-center gap-3">
              <svg viewBox="0 0 88 88" className="w-10 h-10 animate-pulse">
                <path fill="#0078d4" d="M0 0h41v41H0zM47 0h41v41H47zM0 47h41v41H0zM47 47h41v41H47z" />
              </svg>
              <div className="w-12 h-0.5 bg-neutral-800 rounded overflow-hidden mt-4">
                <div className="h-full bg-win11-blue animate-bios-loading" style={{ width: '40%' }} />
              </div>
            </div>
          )}
        </div>
      </MonitorFrame>
    );
  }

  // ================================
  // MAIN DESKTOP
  // ================================
  const isProfileWallpaper = wallpaper === 'profile';

  return (
    <MonitorFrame>
      {deviceType === 'monitor' ? (
        <div
          style={{ 
            background: isProfileWallpaper ? 'none' : wallpaperStyles[wallpaper],
            backgroundImage: isProfileWallpaper ? 'url(/assets/profile.png)' : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={`w-full h-full relative overflow-hidden flex flex-col select-none ${
            isIntroAnimating ? 'animate-desktop-enter' : ''
          } ${
            isProfileWallpaper ? 'wallpaper-profile' : ''
          }`}
          onClick={() => {
            if (isStartOpen) closeStartMenu();
            if (isWidgetsOpen) {
              setIsWidgetsClosing(true);
              setTimeout(() => {
                setIsWidgetsOpen(false);
                setIsWidgetsClosing(false);
              }, 250);
            }
          }}
        >
          {/* Cyber Grid pattern lines if cyber-grid theme is active */}
          {wallpaper === 'cyber-grid' && (
            <div 
              style={{ 
                backgroundImage: 'radial-gradient(circle, rgba(0, 120, 212, 0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
              className="absolute inset-0 pointer-events-none"
            />
          )}

          {/* Main Desktop Canvas Area */}
          <main className="flex-1 relative p-4" id="desktop-canvas" style={{ zIndex: 1 }}>
            {/* Desktop Shortcuts */}
            <div className="absolute top-4 left-4 flex flex-col gap-4">
              {desktopShortcuts.map((shortcut, idx) => (
                <button
                  key={shortcut.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (shortcut.onClick) {
                      shortcut.onClick();
                    } else {
                      openWindow(shortcut.id);
                    }
                  }}
                  className={`desktop-icon w-20 h-20 flex flex-col items-center justify-center rounded transition-all duration-150 border border-transparent hover:bg-white/10 hover:border-white/10 active:scale-95 group focus:bg-white/10 focus:border-white/20 ${
                    isIntroAnimating ? 'animate-slide-up' : ''
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="mb-1.5 transform group-hover:scale-110 transition-transform duration-200">
                    {shortcut.icon}
                  </div>
                  <span className="text-[10px] text-white text-center font-medium drop-shadow-md truncate w-full px-1">
                    {shortcut.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Windows Rendering */}
            {windows.map((w) => (
              <Window
                key={w.id}
                id={w.id}
                title={w.title}
                icon={w.icon}
                isOpen={w.isOpen}
                isMinimized={w.isMinimized}
                isMaximized={w.isMaximized}
                isActive={activeWindowId === w.id}
                zIndex={w.zIndex}
                defaultX={w.defaultX}
                defaultY={w.defaultY}
                defaultWidth={w.defaultWidth}
                defaultHeight={w.defaultHeight}
                darkMode={darkMode}
                deviceType={deviceType}
                onClose={() => closeWindow(w.id)}
                onMinimize={() => minimizeWindow(w.id)}
                onMaximize={() => maximizeWindow(w.id)}
                onFocus={() => focusWindow(w.id)}
              >
                {/* Render app child dynamically */}
                {w.id === 'notepad' && <NotepadApp darkMode={darkMode} />}
                {w.id === 'explorer' && <FileExplorerApp darkMode={darkMode} deviceType={deviceType} />}
                {w.id === 'terminal' && (
                  <TerminalApp
                    darkMode={darkMode}
                    onClose={() => closeWindow('terminal')}
                    onThemeChange={(theme) => setWallpaper(theme)}
                  />
                )}
                {w.id === 'settings' && (
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
                {w.id === 'achievements' && (
                  <AchievementsApp darkMode={darkMode} initialFocus={achievementFocus} />
                )}
                {w.id === 'music' && <MusicPlayerApp darkMode={darkMode} />}
              </Window>
            ))}
          </main>

          {/* Widgets Panel */}
          <WidgetsPanel
            isOpen={isWidgetsOpen}
            isClosing={isWidgetsClosing}
            darkMode={darkMode}
          />

          {/* Start Menu Popup */}
          <StartMenu
            isOpen={isStartOpen}
            isClosing={isStartClosing}
            onClose={closeStartMenu}
            onOpenApp={openWindow}
            darkMode={darkMode}
            deviceType={deviceType}
            onTriggerPower={triggerPowerAction}
          />

          {/* Taskbar Component */}
          <Taskbar
            windows={windows.map(w => ({
              id: w.id,
              title: w.title,
              isOpen: w.isOpen,
              isMinimized: w.isMinimized,
              isActive: activeWindowId === w.id,
              icon: w.icon
            }))}
            onToggleWindow={handleTaskbarToggle}
            onStartToggle={toggleStartMenu}
            onWidgetsToggle={toggleWidgets}
            isStartOpen={isStartOpen}
            darkMode={darkMode}
          />
        </div>
      ) : (
        <AndroidSystem
          darkMode={darkMode}
          wallpaper={wallpaper}
          wallpaperStyles={wallpaperStyles}
          soundEnabled={soundEnabled}
          playSynthSound={playSynthSound}
          windows={windows}
          setWindows={setWindows}
          activeWindowId={activeWindowId}
          setActiveWindowId={setActiveWindowId}
          deviceType={deviceType}
          setWallpaper={setWallpaper}
          setDarkMode={setDarkMode}
          setSoundEnabled={setSoundEnabled}
          triggerPowerAction={triggerPowerAction}
        />
      )}
    </MonitorFrame>
  );
}
