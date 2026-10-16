import React, { useState } from 'react';
import { Laptop, Palette, Volume2, Info, Monitor, CheckCircle, RefreshCw, ArrowLeft, Sparkles, Lock, Check } from 'lucide-react';
import { ACCENTS, useSystem } from '../../system';
import { WALLPAPERS } from '../../lib/wallpapers';
import { SECRETS, resetSecrets, useFoundSecrets } from '../../lib/secrets';

type Tab = 'system' | 'personalization' | 'sound' | 'secrets' | 'about';

const TABS: { id: Tab; label: string; Icon: typeof Laptop }[] = [
  { id: 'system', label: 'System', Icon: Laptop },
  { id: 'personalization', label: 'Personalization', Icon: Palette },
  { id: 'sound', label: 'Sound', Icon: Volume2 },
  { id: 'secrets', label: 'Secrets', Icon: Sparkles },
  { id: 'about', label: 'About', Icon: Info },
];

const Toggle: React.FC<{ on: boolean; onClick: () => void }> = ({ on, onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-6 shrink-0 rounded-full relative p-0.5 transition-colors duration-200 ${on ? 'bg-win11-blue' : 'bg-gray-300'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

export const SettingsApp: React.FC = () => {
  const { darkMode, setDarkMode, wallpaper, setWallpaper, soundEnabled, setSoundEnabled, accent, setAccent, deviceType, play } = useSystem();
  const found = useFoundSecrets();
  const isMobile = deviceType === 'mobile';
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('personalization');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'upToDate'>('idle');

  const card = `p-4 rounded-lg border ${darkMode ? 'bg-neutral-800/20 border-neutral-700' : 'bg-white border-gray-200'}`;

  const checkForUpdates = () => {
    setUpdateStatus('checking');
    setTimeout(() => setUpdateStatus('upToDate'), 2500);
  };

  return (
    <div className={`flex-1 flex overflow-hidden text-xs select-none ${darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'}`}>
      {(!isMobile || !showDetail) && (
        <div
          className={`${isMobile ? 'w-full' : 'w-[140px] sm:w-[170px] border-r'} p-2 flex flex-col gap-1 overflow-y-auto ${
            darkMode ? 'bg-[#202020] border-[#2d2d2d]' : 'bg-[#fbfbfb] border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-4 mb-2">
            <div className="w-10 h-10 rounded bg-win11-blue flex items-center justify-center text-white font-bold text-sm">OS</div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold truncate">Settings</span>
              <span className="text-[10px] opacity-60">PortfolioOS</span>
            </div>
          </div>

          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (isMobile) setShowDetail(true);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-all ${
                activeTab === id ? 'bg-win11-blue/20 text-win11-blue font-semibold' : darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {(!isMobile || showDetail) && (
        <div className="flex-1 p-6 overflow-y-auto">
          {isMobile && (
            <button onClick={() => setShowDetail(false)} className="flex items-center gap-1.5 text-win11-blue font-semibold text-[11px] mb-4">
              <ArrowLeft size={14} />
              <span>Settings</span>
            </button>
          )}

          <div key={activeTab} className="flex flex-col gap-5 animate-tab-content">
            <h2 className="text-base font-semibold">{TABS.find(t => t.id === activeTab)?.label}</h2>

            {activeTab === 'system' && (
              <>
                <div className={`${card} flex flex-col gap-3.5`}>
                  <div className="font-semibold text-xs border-b pb-1.5 flex items-center gap-2">
                    <Laptop size={14} className="text-win11-blue" />
                    <span>Device Specifications</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[11px]">
                    {[
                      ['Device Name', 'PORTFOLIO-DESKTOP'],
                      ['Processor', 'Intel Core i9 (16 Cores - Simulated)'],
                      ['Installed RAM', '16.0 GB (DDR5 Dual-Channel)'],
                      ['System Type', '64-bit operating system, x64-based processor'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex flex-col leading-tight">
                        <span className="opacity-60 text-[10px] mb-0.5">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3">
                    <RefreshCw size={24} className={`text-win11-blue ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs">Windows Update</span>
                      {updateStatus === 'checking' && <span className="opacity-60 text-[10px]">Checking for updates...</span>}
                      {updateStatus === 'upToDate' && (
                        <span className="text-emerald-500 font-medium text-[10px] flex items-center gap-1.5">
                          <CheckCircle size={10} />
                          <span>You're up to date</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {updateStatus !== 'checking' && (
                    <button onClick={checkForUpdates} className="px-3.5 py-1.5 rounded bg-win11-blue hover:bg-win11-blue-light transition-colors text-white font-medium">
                      Check for updates
                    </button>
                  )}
                </div>
              </>
            )}

            {activeTab === 'personalization' && (
              <>
                <div className={`${card} flex items-center justify-between gap-4`}>
                  <span className="font-semibold text-xs">Dark mode</span>
                  <Toggle
                    on={darkMode}
                    onClick={() => {
                      setDarkMode(!darkMode);
                      play('beep');
                    }}
                  />
                </div>

                <div className={`${card} flex flex-col gap-3`}>
                  <span className="font-semibold text-xs">Accent color</span>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map(color => (
                      <button
                        key={color}
                        onClick={() => setAccent(color)}
                        style={{ backgroundColor: color }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                          accent === color ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/70' : ''
                        }`}
                      >
                        {accent === color && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                    <label
                      className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer overflow-hidden relative"
                      title="Custom"
                    >
                      <span className="text-[10px] opacity-60">+</span>
                      <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-xs mb-3 flex items-center gap-1.5">
                    <Monitor size={14} className="text-win11-blue" />
                    <span>Background</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {WALLPAPERS.map(wp => {
                      const locked = (wp.secretsRequired ?? 0) > found.length;
                      return (
                        <button
                          key={wp.id}
                          disabled={locked}
                          onClick={() => setWallpaper(wp.id)}
                          className={`flex flex-col rounded-lg overflow-hidden border transition-all ${
                            wallpaper === wp.id ? 'border-win11-blue ring-2 ring-win11-blue/30 scale-95' : 'border-transparent hover:border-gray-400'
                          } ${locked ? 'cursor-not-allowed' : ''}`}
                        >
                          <div style={{ background: wp.background }} className={`w-full h-16 flex items-center justify-center ${locked ? 'grayscale blur-[2px]' : ''}`}>
                            {locked && <Lock size={16} className="text-white drop-shadow" />}
                          </div>
                          <div className={`p-2 w-full text-center font-medium text-[10px] ${darkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
                            {locked ? `${found.length}/${wp.secretsRequired} secrets` : wp.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'sound' && (
              <div className={`${card} flex items-center justify-between gap-4`}>
                <span className="font-semibold text-xs">System sounds</span>
                <Toggle on={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)} />
              </div>
            )}

            {activeTab === 'secrets' && (
              <>
                <div className={`${card} flex flex-col gap-2`}>
                  <div className="flex items-center justify-between font-semibold text-xs">
                    <span>Found</span>
                    <span className="text-win11-blue">{found.length}/{SECRETS.length}</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}>
                    <div className="h-full bg-win11-blue transition-all duration-500" style={{ width: `${(found.length / SECRETS.length) * 100}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECRETS.map(s => {
                    const done = found.includes(s.id);
                    return (
                      <div key={s.id} className={`${card} flex items-center gap-3 !p-3 ${done ? '' : 'opacity-50'}`}>
                        {done ? <Sparkles size={14} className="text-win11-blue shrink-0" /> : <Lock size={14} className="shrink-0" />}
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="font-semibold text-[11px]">{done ? s.title : '???'}</span>
                          {done && <span className="text-[10px] opacity-60 truncate">{s.hint}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {found.length > 0 && (
                  <button
                    onClick={resetSecrets}
                    className={`self-start px-3 py-1.5 rounded border text-[11px] ${darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-gray-300 hover:bg-gray-100'}`}
                  >
                    Reset progress
                  </button>
                )}
              </>
            )}

            {activeTab === 'about' && (
              <div className={`${card} leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="mb-3">
                  <strong>PortfolioOS</strong> — built with React, TypeScript and Tailwind CSS.
                </p>
                <p>© {new Date().getFullYear()} Avishek Shrestha</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
