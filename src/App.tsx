import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Power, RotateCw, RefreshCw, Terminal, Image, SunMoon, Monitor } from 'lucide-react';

import { APPS, VISIBLE_APPS, getApp } from './apps';
import { SystemContext, ACCENTS, type SystemApi } from './system';
import type { Effect, PowerAction, SoundType, WindowState } from './types';
import { useDeviceType } from './hooks/useDeviceType';
import { usePersistentState } from './hooks/usePersistentState';
import { playSound } from './lib/sound';
import { WALLPAPERS, findWallpaper, wallpaperStyle } from './lib/wallpapers';
import { SECRETS, getFoundSecrets, onSecretUnlocked, unlockSecret } from './lib/secrets';

import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { WidgetsPanel } from './components/WidgetsPanel';
import { MonitorFrame } from './components/MonitorFrame';
import { AndroidSystem } from './components/AndroidSystem';
import { AppContent } from './components/AppContent';
import { Toasts, type Toast } from './components/Toasts';
import { MatrixRain } from './components/MatrixRain';
import { ContextMenu, type MenuItem } from './components/ContextMenu';

type Screen = 'boot' | 'desktop' | 'off' | 'restart' | 'bsod';
type Panel = 'closed' | 'open' | 'closing';

declare global {
  interface Window {
    xArE0?: () => string;
  }
}

const ROUTES: Record<string, string> = Object.fromEntries(
  APPS.filter(a => a.hash).map(a => [a.hash as string, a.id]),
);

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const EFFECT_SECRETS: Record<Effect, string> = {
  matrix: 'matrix',
  'barrel-roll': 'barrel-roll',
  bsod: 'bsod',
  rainbow: 'konami',
};

const EFFECT_DURATION: Partial<Record<Effect, number>> = {
  'barrel-roll': 1600,
  rainbow: 8000,
};

const WindowsLogo = ({ className }: { className: string }) => (
  <svg viewBox="0 0 88 88" className={className}>
    <path fill="var(--color-win11-blue)" d="M0 0h41v41H0zM47 0h41v41H47zM0 47h41v41H0zM47 47h41v41H47z" />
  </svg>
);

export default function App() {
  const deviceType = useDeviceType();
  const [wallpaper, setWallpaper] = usePersistentState('wallpaper', 'profile');
  const [darkMode, setDarkMode] = usePersistentState('darkMode', true);
  const [soundEnabled, setSoundEnabled] = usePersistentState('sound', true);
  const [accent, setAccent] = usePersistentState('accent', ACCENTS[0]);

  const [screen, setScreen] = useState<Screen>('boot');
  const [bootPhase, setBootPhase] = useState<'logo' | 'loading' | 'fadeout'>('logo');
  const [biosStage, setBiosStage] = useState(1);
  const [bsodProgress, setBsodProgress] = useState(0);
  const [isIntroAnimating, setIsIntroAnimating] = useState(true);

  const [windows, setWindows] = useState<WindowState[]>(() =>
    APPS.map(a => ({ id: a.id, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10 })),
  );
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [achievementFocus, setAchievementFocus] = useState<string>();

  const [startMenu, setStartMenu] = useState<Panel>('closed');
  const [widgets, setWidgets] = useState<Panel>('closed');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [effect, setEffect] = useState<Effect | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const lastHashRef = useRef('');
  const toastIdRef = useRef(0);
  const konamiRef = useRef(0);
  const soundRef = useRef(soundEnabled);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  const play = useCallback((type: SoundType) => {
    if (soundRef.current) playSound(type);
  }, []);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--color-win11-blue', accent);
    root.setProperty('--color-win11-blue-light', `color-mix(in srgb, ${accent} 85%, white)`);
    root.setProperty('--color-win11-blue-dark', `color-mix(in srgb, ${accent} 85%, black)`);
  }, [accent]);

  const enterDesktop = useCallback(() => {
    setIsIntroAnimating(true);
    setScreen('desktop');
  }, []);

  useEffect(() => {
    if (screen !== 'boot') return;
    const timers = [
      setTimeout(() => setBootPhase('loading'), 1200),
      setTimeout(() => {
        setBootPhase('fadeout');
        play('startup');
      }, 3200),
      setTimeout(enterDesktop, 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [screen, play, enterDesktop]);

  useEffect(() => {
    if (screen !== 'restart') return;
    const timers = [
      setTimeout(() => setBiosStage(2), 1500),
      setTimeout(() => setBiosStage(3), 3200),
      setTimeout(() => {
        enterDesktop();
        play('startup');
      }, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [screen, play, enterDesktop]);

  useEffect(() => {
    if (screen !== 'bsod') return;
    const timer = setInterval(() => {
      setBsodProgress(p => Math.min(100, p + Math.ceil(Math.random() * 12)));
    }, 450);
    return () => clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'bsod' || bsodProgress < 100) return;
    const timer = setTimeout(() => {
      setBiosStage(1);
      setScreen('restart');
    }, 600);
    return () => clearTimeout(timer);
  }, [screen, bsodProgress]);

  useEffect(() => {
    if (!isIntroAnimating || screen !== 'desktop') return;
    const timer = setTimeout(() => setIsIntroAnimating(false), 1200);
    return () => clearTimeout(timer);
  }, [isIntroAnimating, screen]);

  const notify = useCallback((title: string, body: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev.slice(-2), { id, title, body }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => onSecretUnlocked(secret => {
    const count = getFoundSecrets().length;
    play('unlock');
    notify(`Secret found · ${count}/${SECRETS.length}`, secret.title);
    const reward = WALLPAPERS.find(w => w.secretsRequired === count);
    if (reward) notify('Wallpaper unlocked', reward.name);
    if (count === SECRETS.length) notify('Completionist', 'Every secret found. Respect.');
  }), [play, notify]);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => {
      const z = Math.max(...prev.map(w => w.zIndex)) + 1;
      return prev.map(w => (w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: z } : w));
    });
    setActiveWindowId(id);
  }, []);

  const openApp = useCallback((id: string) => {
    if (!getApp(id)) return;
    play('beep');
    bringToFront(id);
  }, [play, bringToFront]);

  const closeApp = useCallback((id: string) => {
    play('beep');
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isOpen: false, isMaximized: false } : w)));
    setActiveWindowId(curr => (curr === id ? null : curr));
    const hash = getApp(id)?.hash;
    if (hash && window.location.hash === hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [play]);

  const minimizeWindow = (id: string) => {
    play('beep');
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
    setActiveWindowId(curr => (curr === id ? null : curr));
  };

  const maximizeWindow = (id: string) => {
    play('beep');
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  };

  const focusWindow = (id: string) => {
    if (activeWindowId !== id) bringToFront(id);
  };

  const toggleFromTaskbar = (id: string) => {
    const target = windows.find(w => w.id === id);
    if (!target) return;
    if (target.isMinimized || activeWindowId !== id) bringToFront(id);
    else minimizeWindow(id);
  };

  const handleHashRoute = useCallback(() => {
    const hash = window.location.hash;
    if (hash === lastHashRef.current) return;
    lastHashRef.current = hash;
    if (hash.startsWith('#certificate/')) {
      setAchievementFocus(decodeURIComponent(hash.slice('#certificate/'.length)));
      bringToFront('achievements');
    } else if (ROUTES[hash]) {
      bringToFront(ROUTES[hash]);
    }
  }, [bringToFront]);

  useEffect(() => {
    if (screen !== 'desktop') return;
    const timer = setTimeout(handleHashRoute, 0);
    window.addEventListener('hashchange', handleHashRoute);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashRoute);
    };
  }, [screen, handleHashRoute]);

  useEffect(() => {
    const hash = activeWindowId && getApp(activeWindowId)?.hash;
    if (hash && hash !== window.location.hash) {
      lastHashRef.current = hash;
      window.history.replaceState(null, '', hash);
    }
  }, [activeWindowId]);

  const closeStartMenu = useCallback(() => {
    setStartMenu(s => (s === 'open' ? 'closing' : s));
    setTimeout(() => setStartMenu(s => (s === 'closing' ? 'closed' : s)), 180);
  }, []);

  const closeWidgets = useCallback(() => {
    setWidgets(s => (s === 'open' ? 'closing' : s));
    setTimeout(() => setWidgets(s => (s === 'closing' ? 'closed' : s)), 250);
  }, []);

  const toggleStartMenu = () => {
    play('beep');
    if (startMenu === 'open') closeStartMenu();
    else setStartMenu('open');
  };

  const toggleWidgets = () => {
    play('beep');
    if (widgets === 'open') closeWidgets();
    else setWidgets('open');
  };

  const power = useCallback((action: PowerAction) => {
    closeStartMenu();
    play('shutdown');
    if (action === 'shutdown') {
      setScreen('off');
    } else {
      setBiosStage(1);
      setScreen('restart');
    }
  }, [closeStartMenu, play]);

  const triggerEffect = useCallback((next: Effect) => {
    unlockSecret(EFFECT_SECRETS[next]);
    if (next === 'bsod') {
      play('error');
      setBsodProgress(0);
      setScreen('bsod');
      return;
    }
    setEffect(next);
    const duration = EFFECT_DURATION[next];
    if (duration) setTimeout(() => setEffect(curr => (curr === next ? null : curr)), duration);
  }, [play]);

  const endEffect = useCallback(() => setEffect(null), []);

  useEffect(() => {
    if (screen !== 'desktop') return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiRef.current = key === KONAMI[konamiRef.current] ? konamiRef.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiRef.current === KONAMI.length) {
        konamiRef.current = 0;
        triggerEffect('rainbow');
      }
      if (e.ctrlKey && e.altKey && key === 't') {
        e.preventDefault();
        openApp('terminal');
      }
      if (key === 'Escape') {
        closeStartMenu();
        closeWidgets();
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, triggerEffect, openApp, closeStartMenu, closeWidgets]);

  useEffect(() => {
    if (screen !== 'desktop') return;
    const timer = setTimeout(() => {
      if (new Date().getHours() < 5) unlockSecret('night-owl');
    }, 2500);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    console.log(
      '%c xArE0 %c Curious? Run xArE0() ',
      'background:#0078d4;color:#fff;font-weight:bold;padding:4px 6px;border-radius:4px 0 0 4px',
      'background:#111;color:#0f0;padding:4px 6px;border-radius:0 4px 4px 0',
    );
    window.xArE0 = () => {
      unlockSecret('devtools');
      return 'Hello, fellow developer. Say hi: abhishrestha987@gmail.com';
    };
    const title = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? 'Come back! 👋' : title;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      delete window.xArE0;
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const system = useMemo<SystemApi>(() => ({
    deviceType,
    darkMode,
    setDarkMode,
    wallpaper,
    setWallpaper,
    soundEnabled,
    setSoundEnabled,
    accent,
    setAccent,
    play,
    openApp,
    closeApp,
    power,
    triggerEffect,
    notify,
  }), [deviceType, darkMode, setDarkMode, wallpaper, setWallpaper, soundEnabled, setSoundEnabled, accent, setAccent, play, openApp, closeApp, power, triggerEffect, notify]);

  const contextItems: MenuItem[] = [
    { label: 'Refresh', icon: <RefreshCw size={13} />, onSelect: () => setIsIntroAnimating(true) },
    { label: 'Open in Terminal', icon: <Terminal size={13} />, shortcut: 'Ctrl+Alt+T', onSelect: () => openApp('terminal') },
    {
      label: 'Next wallpaper',
      icon: <Image size={13} />,
      divider: true,
      onSelect: () => {
        const unlocked = WALLPAPERS.filter(w => (w.secretsRequired ?? 0) <= getFoundSecrets().length);
        const idx = unlocked.findIndex(w => w.id === wallpaper);
        setWallpaper(unlocked[(idx + 1) % unlocked.length].id);
      },
    },
    { label: darkMode ? 'Light mode' : 'Dark mode', icon: <SunMoon size={13} />, onSelect: () => setDarkMode(!darkMode) },
    { label: 'Display settings', icon: <Monitor size={13} />, onSelect: () => openApp('settings') },
    { label: 'Shut down', icon: <Power size={13} />, divider: true, onSelect: () => power('shutdown') },
  ];

  const renderScreen = () => {
    if (screen === 'boot') {
      return (
        <div className={`w-full h-full bg-black flex flex-col items-center justify-center font-segoe ${bootPhase === 'fadeout' ? 'animate-boot-fadeout' : ''}`}>
          <div className="animate-boot-logo">
            <WindowsLogo className="w-16 h-16 mb-8" />
          </div>
          {bootPhase !== 'logo' && (
            <div className="flex items-center gap-2 mt-4">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-boot-dot" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}
          <div className="absolute bottom-12 text-gray-600 text-xs">PortfolioOS • Avishek Shrestha</div>
        </div>
      );
    }

    if (screen === 'off') {
      return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white relative font-segoe">
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <Power size={48} className="text-red-500 border border-red-500/20 p-2 rounded-full bg-red-500/5" />
            <span className="text-sm tracking-wider opacity-60">System Powered Off</span>
          </div>
          <button
            onClick={() => {
              setBootPhase('logo');
              setScreen('boot');
            }}
            className="absolute bottom-16 px-6 py-2.5 rounded-full border border-neutral-700 hover:border-win11-blue hover:text-win11-blue transition-all duration-200 text-xs font-semibold"
          >
            Boot System
          </button>
        </div>
      );
    }

    if (screen === 'restart') {
      return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white font-mono text-xs">
          {biosStage === 1 && (
            <div className="flex flex-col items-center gap-4">
              <RotateCw className="animate-spin text-win11-blue" size={32} />
              <span>Restarting System...</span>
            </div>
          )}
          {biosStage === 2 && (
            <div className="w-[85%] max-w-[500px] flex flex-col gap-2.5 text-left text-[#cccccc]">
              <div>BIOS ROM Version 2.44.15</div>
              <div>Copyright (C) 2026 xArE0 Engineering Corp.</div>
              <div>-----------------------------------------------</div>
              <div>CPU: Intel(R) Core(TM) i9-14900K @ 4.20GHz</div>
              <div>Memory Test: 16777216KB OK (DDR5 5600MHz)</div>
              <div>Detecting SSD Storage Drives... OK</div>
              <div className="text-yellow-500 animate-pulse mt-2">Loading Portfolio OS Kernel...</div>
            </div>
          )}
          {biosStage === 3 && (
            <div className="flex flex-col items-center gap-3">
              <WindowsLogo className="w-10 h-10 animate-pulse" />
              <div className="w-12 h-0.5 bg-neutral-800 rounded overflow-hidden mt-4">
                <div className="h-full bg-win11-blue animate-bios-loading" style={{ width: '40%' }} />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (screen === 'bsod') {
      return (
        <div className="w-full h-full bg-[#0078d7] text-white font-segoe flex items-center justify-center p-8">
          <div className="max-w-xl flex flex-col gap-5">
            <div className="text-7xl font-light">:(</div>
            <p className="text-lg leading-snug">
              Your PC ran into a problem because someone ran a command they really shouldn't have.
              We're just collecting some error info, and then we'll restart for you.
            </p>
            <p className="text-lg">{bsodProgress}% complete</p>
            <div className="text-xs opacity-80 leading-relaxed">
              <div>Stop code: SUDO_RM_RF_SLASH</div>
              <div>What failed: common_sense.sys</div>
            </div>
          </div>
        </div>
      );
    }

    if (deviceType !== 'monitor') {
      return (
        <AndroidSystem
          windows={windows}
          activeWindowId={activeWindowId}
          setActiveWindowId={setActiveWindowId}
          onCloseAll={() => {
            setWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
            setActiveWindowId(null);
          }}
        />
      );
    }

    const current = findWallpaper(wallpaper);

    return (
      <div
        style={wallpaperStyle(current.id)}
        className={`w-full h-full relative overflow-hidden flex flex-col ${isIntroAnimating ? 'animate-desktop-enter' : ''} ${
          current.id === 'profile' ? 'wallpaper-profile' : ''
        }`}
        onClick={() => {
          if (startMenu === 'open') closeStartMenu();
          if (widgets === 'open') closeWidgets();
          setContextMenu(null);
        }}
        onContextMenu={e => {
          e.preventDefault();
          if ((e.target as HTMLElement).closest('[data-window]')) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setContextMenu({
            x: Math.max(0, Math.min(e.clientX - rect.left, rect.width - 220)),
            y: Math.max(0, Math.min(e.clientY - rect.top, rect.height - 260)),
          });
        }}
      >
        {current.id === 'cyber-grid' && (
          <div
            style={{ backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--color-win11-blue) 15%, transparent) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            className="absolute inset-0 pointer-events-none"
          />
        )}

        <main className="flex-1 relative p-4" style={{ zIndex: 1 }}>
          <div className="absolute top-4 left-4 bottom-16 flex flex-col flex-wrap content-start gap-2">
            {VISIBLE_APPS.map((app, idx) => (
              <button
                key={app.id}
                onClick={e => {
                  e.stopPropagation();
                  openApp(app.id);
                }}
                className={`desktop-icon w-20 h-20 flex flex-col items-center justify-center rounded transition-all duration-150 border border-transparent hover:bg-white/10 hover:border-white/10 active:scale-95 group focus:bg-white/10 focus:border-white/20 ${
                  isIntroAnimating ? 'animate-slide-up' : ''
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="mb-1.5 transform group-hover:scale-110 transition-transform duration-200">
                  <app.Icon size={32} className={`${app.color} drop-shadow-md`} />
                </div>
                <span className="text-[10px] text-white text-center font-medium drop-shadow-md truncate w-full px-1">{app.label}</span>
              </button>
            ))}
          </div>

          {windows.map(w => {
            const app = getApp(w.id)!;
            return (
              <Window
                key={w.id}
                title={app.title}
                icon={<app.Icon size={14} className={app.color} />}
                isOpen={w.isOpen}
                isMinimized={w.isMinimized}
                isMaximized={w.isMaximized}
                isActive={activeWindowId === w.id}
                zIndex={w.zIndex}
                darkMode={darkMode}
                onClose={() => closeApp(w.id)}
                onMinimize={() => minimizeWindow(w.id)}
                onMaximize={() => maximizeWindow(w.id)}
                onFocus={() => focusWindow(w.id)}
              >
                <AppContent id={w.id} achievementFocus={achievementFocus} />
              </Window>
            );
          })}
        </main>

        <WidgetsPanel isOpen={widgets !== 'closed'} isClosing={widgets === 'closing'} darkMode={darkMode} />

        <StartMenu isOpen={startMenu !== 'closed'} isClosing={startMenu === 'closing'} onClose={closeStartMenu} />

        <Taskbar
          windows={windows.map(w => {
            const app = getApp(w.id)!;
            return {
              id: w.id,
              title: app.title,
              isOpen: w.isOpen,
              isActive: activeWindowId === w.id,
              icon: <app.Icon size={18} className={app.color} />,
            };
          })}
          onToggleWindow={toggleFromTaskbar}
          onStartToggle={toggleStartMenu}
          onWidgetsToggle={toggleWidgets}
          isStartOpen={startMenu === 'open'}
          darkMode={darkMode}
        />

        {contextMenu && (
          <ContextMenu {...contextMenu} items={contextItems} darkMode={darkMode} onClose={() => setContextMenu(null)} />
        )}
      </div>
    );
  };

  const effectClass = effect === 'barrel-roll' ? 'animate-barrel-roll' : effect === 'rainbow' ? 'animate-rainbow' : '';

  return (
    <SystemContext.Provider value={system}>
      <MonitorFrame deviceType={deviceType}>
        <div className={`w-full h-full relative select-none ${effectClass}`}>
          {renderScreen()}
          {screen === 'desktop' && (
            <Toasts toasts={toasts} darkMode={darkMode} mobile={deviceType !== 'monitor'} onDismiss={dismissToast} />
          )}
          {effect === 'matrix' && <MatrixRain onDone={endEffect} />}
        </div>
      </MonitorFrame>
    </SystemContext.Provider>
  );
}
