import React, { useEffect, useState } from 'react';
import { Search, FileText, Folder, Terminal, Power, RotateCw, Trophy, Mail } from 'lucide-react';
import { Github, Linkedin } from './icons';
import { APPS, VISIBLE_APPS } from '../apps';
import { useSystem } from '../system';
import { CONTACT } from '../lib/contact';

interface StartMenuProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
}

const BARREL_ROLL = /^(do a )?barrel roll$/;

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, isClosing, onClose }) => {
  const { darkMode, deviceType, openApp, power, triggerEffect } = useSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPowerOptions, setShowPowerOptions] = useState(false);
  const [animateIntro, setAnimateIntro] = useState(true);
  const isMobile = deviceType === 'mobile';

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => setAnimateIntro(false), 600);
    return () => {
      clearTimeout(timer);
      setAnimateIntro(true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!BARREL_ROLL.test(searchQuery.trim().toLowerCase())) return;
    const timer = setTimeout(() => {
      triggerEffect('barrel-roll');
      setSearchQuery('');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, triggerEffect]);

  if (!isOpen && !isClosing) return null;

  const query = searchQuery.trim().toLowerCase();
  const pool = query.length >= 3 ? APPS : VISIBLE_APPS;
  const filteredApps = pool.filter(app => app.label.toLowerCase().includes(query) || app.shortLabel.toLowerCase().includes(query));

  const externalLinks = [
    { name: 'GitHub', url: CONTACT.github, icon: <Github size={22} className={darkMode ? 'text-white' : 'text-gray-900'} /> },
    { name: 'LinkedIn', url: CONTACT.linkedin, icon: <Linkedin size={22} className="text-blue-600" /> },
    { name: 'Email', url: `mailto:${CONTACT.email}`, icon: <Mail size={22} className="text-rose-500" /> },
  ].filter(link => link.name.toLowerCase().includes(query));

  const recommendedItems = [
    { id: 'notepad', name: 'biography.txt', type: 'Notepad document', time: '2h ago', icon: <FileText size={16} className="text-amber-500" /> },
    { id: 'explorer', name: 'Featured Projects', type: 'Folder', time: 'Yesterday', icon: <Folder size={16} className="text-yellow-500" /> },
    { id: 'achievements', name: 'Certificates', type: 'Gallery', time: 'Recently', icon: <Trophy size={16} className="text-amber-400" /> },
    { id: 'terminal', name: 'neofetch', type: 'CLI Shortcut', time: '3d ago', icon: <Terminal size={16} className="text-emerald-500" /> },
  ];

  const launch = (id: string) => {
    openApp(id);
    onClose();
  };

  const tileClass = `flex flex-col items-center justify-center p-2 rounded transition-colors duration-150 ${animateIntro ? 'animate-pin-icon' : ''} ${
    darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(0,0,0,0.06)]'
  }`;
  const menuButton = `w-full text-left px-3 py-1.5 text-xs rounded transition-colors duration-150 flex items-center gap-2 ${
    darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-gray-100'
  }`;

  return (
    <div
      onClick={e => {
        e.stopPropagation();
        if (!(e.target as HTMLElement).closest('.power-btn')) setShowPowerOptions(false);
      }}
      style={{ zIndex: 998, maxHeight: 'calc(100% - 112px)' }}
      className={`absolute bottom-14 left-0 right-0 mx-auto ${
        isMobile ? 'w-[95%] max-w-[380px]' : deviceType === 'tablet' ? 'w-[92%] max-w-[500px]' : 'w-[90%] max-w-[560px]'
      } rounded-xl glass-panel shadow-activeWindow flex flex-col overflow-hidden border ${isClosing ? 'animate-start-close' : 'animate-start-open'} ${
        darkMode ? 'glass-panel-dark border-[rgba(255,255,255,0.08)] text-white' : 'glass-panel-light border-[rgba(0,0,0,0.12)] text-gray-800'
      }`}
    >
      <div className={isMobile ? 'p-3 pb-2' : 'p-6 pb-4'}>
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-md border text-sm ${
            darkMode ? 'bg-[rgba(20,20,20,0.5)] border-[rgba(255,255,255,0.08)] focus-within:border-win11-blue' : 'bg-white border-gray-300 focus-within:border-win11-blue'
          }`}
        >
          <Search size={isMobile ? 14 : 16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filteredApps[0]) launch(filteredApps[0].id);
            }}
            className={`w-full bg-transparent border-none outline-none ${isMobile ? 'text-[11px]' : 'text-xs'}`}
            autoFocus
          />
        </div>
      </div>

      <div className={`flex-1 min-h-0 ${isMobile ? 'px-3' : 'px-8'} overflow-y-auto`}>
        <div className={isMobile ? 'mb-3' : 'mb-6'}>
          <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold px-2 mb-3`}>Pinned</div>

          <div className={`grid ${isMobile ? 'grid-cols-3 gap-y-2 gap-x-1' : 'grid-cols-3 sm:grid-cols-5 gap-y-4 gap-x-2'}`}>
            {filteredApps.map((app, idx) => (
              <button key={app.id} onClick={() => launch(app.id)} className={tileClass} style={{ animationDelay: `${idx * 40}ms` }}>
                <app.Icon size={22} className={`mb-1.5 ${app.color}`} />
                <span className="text-[10.5px] text-center truncate w-full leading-tight">{app.label}</span>
              </button>
            ))}

            {externalLinks.map((link, idx) => (
              <a
                key={link.name}
                href={link.url}
                target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                rel="noreferrer"
                className={tileClass}
                style={{ animationDelay: `${(filteredApps.length + idx) * 40}ms` }}
              >
                <div className="mb-1.5">{link.icon}</div>
                <span className="text-[10.5px] text-center truncate w-full leading-tight">{link.name}</span>
              </a>
            ))}

            {filteredApps.length === 0 && externalLinks.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-gray-400">No results</div>
            )}
          </div>
        </div>

        {!query && (
          <div>
            <div className="text-xs font-semibold px-2 mb-3">Recommended</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pb-4">
              {recommendedItems.map(item => (
                <button
                  key={item.name}
                  onClick={() => launch(item.id)}
                  className={`flex items-center gap-3 p-2 rounded text-left transition-colors duration-150 ${
                    darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(0,0,0,0.05)]'
                  }`}
                >
                  <div className="p-1 rounded bg-[rgba(120,120,120,0.1)]">{item.icon}</div>
                  <div className="flex flex-col text-[11px] leading-snug">
                    <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                    <span className="opacity-60 text-[9.5px]">{item.type} • {item.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`p-4 px-8 flex items-center justify-between border-t relative ${
          darkMode ? 'bg-[rgba(20,20,20,0.45)] border-[rgba(255,255,255,0.06)]' : 'bg-[rgba(240,240,240,0.5)] border-[rgba(0,0,0,0.08)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <img src="/assets/profile.jpg" alt="Avishek" className="w-8 h-8 rounded-full object-cover object-[70%_center] border border-white/20 bg-win11-blue" />
          <div className="flex flex-col leading-tight">
            <span className="text-[11.5px] font-semibold">Avishek Shrestha</span>
            <span className="text-[9.5px] opacity-60">Full-Stack Developer</span>
          </div>
        </div>

        <div className="relative power-btn">
          <button
            onClick={() => setShowPowerOptions(!showPowerOptions)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-150 ${
              darkMode ? 'hover:bg-[rgba(255,255,255,0.08)]' : 'hover:bg-[rgba(0,0,0,0.08)]'
            }`}
            title="Power"
          >
            <Power size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>

          {showPowerOptions && (
            <div
              className={`absolute bottom-10 right-0 w-[140px] rounded shadow-xl border p-1 z-[1000] animate-fade-in ${
                darkMode ? 'bg-[#2b2b2b] border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <button onClick={() => power('restart')} className={menuButton}>
                <RotateCw size={12} />
                <span>Restart</span>
              </button>
              <button onClick={() => power('shutdown')} className={menuButton}>
                <Power size={12} className="text-red-500" />
                <span className="text-red-500">Shut Down</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
