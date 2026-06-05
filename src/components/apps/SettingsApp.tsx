import React, { useState } from 'react';
import { 
  Laptop, Palette, Volume2, Info, Monitor, CheckCircle, 
  RefreshCw
} from 'lucide-react';

interface SettingsAppProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentTheme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'personalization' | 'sound' | 'about'>('personalization');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'upToDate'>('idle');
  
  const checkForUpdates = () => {
    setUpdateStatus('checking');
    setTimeout(() => {
      setUpdateStatus('upToDate');
    }, 2500);
  };

  const wallpapers = [
    { id: 'profile', name: 'Profile Photo', style: 'none', image: '/assets/profile.png' },
    { id: 'bloom-dark', name: 'Bloom Dark', style: 'linear-gradient(135deg, #0f0c20 0%, #15103a 25%, #052c59 60%, #0c0714 100%)' },
    { id: 'bloom-light', name: 'Bloom Light', style: 'linear-gradient(135deg, #e4eefb 0%, #d8e5f7 30%, #f7dced 70%, #e8f0fe 100%)' },
    { id: 'fluid-aurora', name: 'Fluid Aurora', style: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)' },
    { id: 'cyber-grid', name: 'Cyber Grid', style: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }
  ];

  return (
    <div className={`flex-1 flex overflow-hidden text-xs select-none ${
      darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
    }`}>
      {/* Sidebar navigation */}
      <div className={`w-[140px] sm:w-[170px] border-r p-2 flex flex-col gap-1 overflow-y-auto ${
        darkMode ? 'bg-[#202020] border-[#2d2d2d]' : 'bg-[#fbfbfb] border-gray-200'
      }`}>
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <div className="w-10 h-10 rounded bg-win11-blue flex items-center justify-center text-white font-bold select-none text-sm">
            OS
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold truncate">Settings</span>
            <span className="text-[10px] opacity-60">Windows 11</span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
            activeTab === 'system'
              ? 'bg-win11-blue/20 text-win11-blue font-semibold'
              : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
          }`}
        >
          <Laptop size={14} />
          <span>System</span>
        </button>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
            activeTab === 'personalization'
              ? 'bg-win11-blue/20 text-win11-blue font-semibold'
              : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
          }`}
        >
          <Palette size={14} />
          <span>Personalization</span>
        </button>

        <button
          onClick={() => setActiveTab('sound')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
            activeTab === 'sound'
              ? 'bg-win11-blue/20 text-win11-blue font-semibold'
              : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
          }`}
        >
          <Volume2 size={14} />
          <span>Sound</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
            activeTab === 'about'
              ? 'bg-win11-blue/20 text-win11-blue font-semibold'
              : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
          }`}
        >
          <Info size={14} />
          <span>About</span>
        </button>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'system' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold mb-1">System</h2>
              <p className="opacity-60 text-[10.5px]">Configure operating system specifications and components.</p>
            </div>

            {/* Simulated Device Specs card */}
            <div className={`p-4 rounded-lg border flex flex-col gap-3.5 ${
              darkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-white border-gray-200'
            }`}>
              <div className="font-semibold text-xs border-b pb-1.5 flex items-center gap-2">
                <Laptop size={14} className="text-win11-blue" />
                <span>Device Specifications</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[11px]">
                <div className="flex flex-col leading-tight">
                  <span className="opacity-60 text-[10px] mb-0.5">Device Name</span>
                  <span className="font-medium">PORTFOLIO-DESKTOP</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="opacity-60 text-[10px] mb-0.5">Processor</span>
                  <span className="font-medium">Intel Core i9 (16 Cores - Simulated)</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="opacity-60 text-[10px] mb-0.5">Installed RAM</span>
                  <span className="font-medium">16.0 GB (DDR5 Dual-Channel)</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="opacity-60 text-[10px] mb-0.5">System Type</span>
                  <span className="font-medium">64-bit operating system, x64-based processor</span>
                </div>
              </div>
            </div>

            {/* Simulated Windows Updates Card */}
            <div className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              darkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className={`text-win11-blue ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs">Windows Update</span>
                  {updateStatus === 'idle' && <span className="opacity-60 text-[10px]">Updates available periodically.</span>}
                  {updateStatus === 'checking' && <span className="opacity-60 text-[10px]">Checking our repository for changes...</span>}
                  {updateStatus === 'upToDate' && (
                    <span className="text-emerald-500 font-medium text-[10px] flex items-center gap-1.5">
                      <CheckCircle size={10} />
                      <span>You are up to date. Last checked just now.</span>
                    </span>
                  )}
                </div>
              </div>

              {updateStatus !== 'checking' && (
                <button
                  onClick={checkForUpdates}
                  className="px-3.5 py-1.5 rounded bg-win11-blue hover:bg-win11-blue-light transition-colors text-white font-medium select-none"
                >
                  Check for updates
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'personalization' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold mb-1">Personalization</h2>
              <p className="opacity-60 text-[10.5px]">Change desktop backgrounds, dark mode settings, and styles.</p>
            </div>

            {/* Dark mode toggle card */}
            <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${
              darkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-xs">System Color Mode</span>
                <span className="opacity-60 text-[10px] mt-0.5">Toggle between dark theme and light theme.</span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`w-12 h-6 rounded-full relative p-0.5 transition-colors duration-200 ${
                  darkMode ? 'bg-win11-blue' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Desktop Background selection */}
            <div>
              <div className="font-semibold text-xs mb-3 flex items-center gap-1.5">
                <Monitor size={14} className="text-win11-blue" />
                <span>Select Desktop Background</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => onThemeChange(wp.id)}
                    className={`flex flex-col rounded-lg overflow-hidden border transition-all ${
                      currentTheme === wp.id
                        ? 'border-win11-blue ring-2 ring-win11-blue/30 scale-95'
                        : 'border-transparent hover:border-gray-400'
                    }`}
                  >
                    {/* Wallpaper Preview thumbnail */}
                    <div 
                      style={{ 
                        background: (wp as any).image ? `url(${(wp as any).image}) center/cover` : wp.style
                      }}
                      className="w-full h-16"
                    />
                    <div className={`p-2 w-full text-center font-medium text-[10px] ${
                      darkMode ? 'bg-neutral-800' : 'bg-gray-100'
                    }`}>
                      {wp.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold mb-1">Sound</h2>
              <p className="opacity-60 text-[10.5px]">Control notification tones, startup audio triggers, and sound cards.</p>
            </div>

            {/* Sound Toggle card */}
            <div className={`p-4 rounded-lg border flex items-center justify-between gap-4 ${
              darkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-xs">Startup & Error Sounds</span>
                <span className="opacity-60 text-[10px] mt-0.5">Play audio feedback during startup and button clicks.</span>
              </div>
              <button
                onClick={onToggleSound}
                className={`w-12 h-6 rounded-full relative p-0.5 transition-colors duration-200 ${
                  soundEnabled ? 'bg-win11-blue' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold mb-1">About</h2>
              <p className="opacity-60 text-[10.5px]">Technical specifications of the portfolio application framework.</p>
            </div>

            <div className={`p-4 rounded-lg border leading-relaxed ${
              darkMode ? 'bg-neutral-800/20 border-neutral-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
            }`}>
              <p className="mb-3">
                <strong>PortfolioOS</strong> is an open-source interactive desktop simulation application built in 
                React, TypeScript, and Tailwind CSS.
              </p>
              <p className="mb-3">
                Created to showcase Full-Stack software engineering capabilities, design aesthetics, 
                and pixel-perfect UI execution.
              </p>
              <p>
                © 2026 Avishek Shrestha. All Rights Reserved. Engineered with ❤️ and Vite.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
