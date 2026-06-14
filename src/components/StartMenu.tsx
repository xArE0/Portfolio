import React, { useState } from 'react';
import { 
  Search, FileText, Folder, Terminal, Settings, Share2, 
  Download, Power, KeyRound, Trophy, Music
} from 'lucide-react';
import { Github, Linkedin } from './icons';

interface StartMenuProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onOpenApp: (id: string) => void;
  darkMode: boolean;
  deviceType?: 'monitor' | 'tablet' | 'mobile';
  onTriggerPower: (action: 'shutdown' | 'restart') => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  isClosing,
  onClose,
  onOpenApp,
  darkMode,
  deviceType = 'monitor',
  onTriggerPower,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPowerOptions, setShowPowerOptions] = useState(false);
  const [animateIntro, setAnimateIntro] = useState(true);

  // Trigger animation lock when menu is opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimateIntro(false);
      }, 600);
      return () => {
        clearTimeout(timer);
        setAnimateIntro(true);
      };
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const pinnedApps = [
    { id: 'notepad', name: 'Notepad', icon: <FileText size={22} className="text-amber-500" /> },
    { id: 'explorer', name: 'File Explorer', icon: <Folder size={22} className="text-yellow-500" /> },
    { id: 'terminal', name: 'Terminal', icon: <Terminal size={22} className="text-emerald-500" /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={22} className="text-blue-500" /> },
    { id: 'achievements', name: 'Achievements', icon: <Trophy size={22} className="text-amber-400" /> },
    { id: 'music', name: 'Music Player', icon: <Music size={22} className="text-purple-500" /> },
    { id: 'getintouch', name: 'Get in Touch', icon: <Share2 size={22} className="text-cyan-500" /> },
  ];

  const externalLinks = [
    { name: 'GitHub', url: 'https://github.com', icon: <Github size={22} className={darkMode ? 'text-white' : 'text-gray-900'} /> },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: <Linkedin size={22} className="text-blue-600" /> },
    { name: 'Resume PDF', url: '#', icon: <Download size={22} className="text-cyan-500" />, download: true },
  ];

  const recommendedItems = [
    { id: 'notepad', name: 'biography.txt', type: 'Notepad document', time: '2h ago', icon: <FileText size={16} className="text-amber-500" /> },
    { id: 'explorer', name: 'Featured Projects', type: 'Folder', time: 'Yesterday', icon: <Folder size={16} className="text-yellow-500" /> },
    { id: 'achievements', name: 'Certificates', type: 'Gallery', time: 'Recently', icon: <Trophy size={16} className="text-amber-400" /> },
    { id: 'terminal', name: 'neofetch', type: 'CLI Shortcut', time: '3d ago', icon: <Terminal size={16} className="text-emerald-500" /> },
  ];

  // Filter pinned items based on search query
  const filteredPinned = pinnedApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLinks = externalLinks.filter(link => 
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.power-btn')) {
          setShowPowerOptions(false);
        }
      }}
      style={{
        zIndex: 998,
        /* 100% = desktop container height; subtract taskbar(48px) + bottom offset(56px) + 8px breathing room */
        maxHeight: 'calc(100% - 112px)',
      }}
      className={`absolute bottom-14 left-0 right-0 mx-auto ${
        deviceType === 'mobile' ? 'w-[95%] max-w-[380px]' :
        deviceType === 'tablet' ? 'w-[92%] max-w-[500px]' :
        'w-[90%] max-w-[560px]'
      } rounded-xl glass-panel shadow-activeWindow flex flex-col overflow-hidden border ${
        isClosing ? 'animate-start-close' : 'animate-start-open'
      } ${
        darkMode 
          ? 'glass-panel-dark border-[rgba(255,255,255,0.08)] text-white' 
          : 'glass-panel-light border-[rgba(0,0,0,0.12)] text-gray-800'
      }`}
    >
      {/* Search Input */}
      <div className={deviceType === 'mobile' ? 'p-3 pb-2' : 'p-6 pb-4'}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md border text-sm ${
          darkMode 
            ? 'bg-[rgba(20,20,20,0.5)] border-[rgba(255,255,255,0.08)] focus-within:border-win11-blue' 
            : 'bg-white border-gray-300 focus-within:border-win11-blue'
        }`}>
          <Search size={deviceType === 'mobile' ? 14 : 16} className="text-gray-400" />
          <input
            type="text"
            placeholder={deviceType === 'mobile' ? 'Search...' : 'Type here to search apps, files or links...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent border-none outline-none ${deviceType === 'mobile' ? 'text-[11px]' : 'text-xs'}`}
            autoFocus
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className={`flex-1 min-h-0 ${deviceType === 'mobile' ? 'px-3' : 'px-8'} overflow-y-auto`}>
        {/* Pinned Section */}
        <div className={deviceType === 'mobile' ? 'mb-3' : 'mb-6'}>
          <div className={`flex items-center justify-between ${deviceType === 'mobile' ? 'text-[10px]' : 'text-xs'} font-semibold px-2 mb-3`}>
            <span>Pinned</span>
            <span className={`text-[9px] px-2 py-0.5 rounded cursor-pointer ${
              darkMode ? 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)]' : 'bg-gray-100 hover:bg-gray-200'
            }`}>All apps</span>
          </div>

          <div className={`grid ${deviceType === 'mobile' ? 'grid-cols-3 gap-y-2 gap-x-1' : 'grid-cols-3 sm:grid-cols-5 gap-y-4 gap-x-2'}`}>
            {/* Mock Local Apps */}
            {filteredPinned.map((app, idx) => (
              <button
                key={app.id}
                onClick={() => {
                  onOpenApp(app.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-2 rounded transition-colors duration-150 ${
                  animateIntro ? 'animate-pin-icon' : ''
                } ${
                  darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(0,0,0,0.06)]'
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="mb-1.5">{app.icon}</div>
                <span className="text-[10.5px] text-center truncate w-full leading-tight">{app.name}</span>
              </button>
            ))}

            {/* External Links */}
            {filteredLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`flex flex-col items-center justify-center p-2 rounded transition-colors duration-150 ${
                  animateIntro ? 'animate-pin-icon' : ''
                } ${
                  darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(0,0,0,0.06)]'
                }`}
                style={{ animationDelay: `${(filteredPinned.length + idx) * 40}ms` }}
              >
                <div className="mb-1.5">{link.icon}</div>
                <span className="text-[10.5px] text-center truncate w-full leading-tight">{link.name}</span>
              </a>
            ))}

            {filteredPinned.length === 0 && filteredLinks.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-gray-400">
                No apps or links found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Recommended / Recent Section */}
        <div>
          <div className="text-xs font-semibold px-2 mb-3">Recommended</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {recommendedItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onOpenApp(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors duration-150 ${
                  darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(0,0,0,0.05)]'
                }`}
              >
                <div className="p-1 rounded bg-[rgba(120,120,120,0.1)]">{item.icon}</div>
                <div className="flex flex-col text-[11px] leading-snug">
                  <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                  <span className="opacity-60 text-[9.5px]">{item.type} • {item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile & Power Bar */}
      <div className={`p-4 px-8 flex items-center justify-between border-t relative ${
        darkMode 
          ? 'bg-[rgba(20,20,20,0.45)] border-[rgba(255,255,255,0.06)]' 
          : 'bg-[rgba(240,240,240,0.5)] border-[rgba(0,0,0,0.08)]'
      }`}>
        <div className="flex items-center gap-3">
          {/* Profile Avatar with actual photo */}
          <div className="w-8 h-8 rounded-full bg-win11-blue flex items-center justify-center font-bold text-white text-xs border border-white/20 overflow-hidden">
            <img
              src="/assets/profile.png"
              alt="Avishek"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.textContent = 'AS';
              }}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11.5px] font-semibold">Avishek Shrestha</span>
            <span className="text-[9.5px] opacity-60">Full-Stack Developer</span>
          </div>
        </div>

        {/* Power Options Button */}
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

          {/* Power Options Menu */}
          {showPowerOptions && (
            <div className={`absolute bottom-10 right-0 w-[140px] rounded shadow-xl border p-1 z-[1000] animate-start-open ${
              darkMode 
                ? 'bg-[#2b2b2b] border-neutral-700 text-white' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}>
              <button
                onClick={() => onTriggerPower('restart')}
                className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors duration-150 flex items-center gap-2 ${
                  darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-gray-100'
                }`}
              >
                <KeyRound size={12} />
                <span>Restart</span>
              </button>
              <button
                onClick={() => onTriggerPower('shutdown')}
                className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors duration-150 flex items-center gap-2 ${
                  darkMode ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-gray-100'
                }`}
              >
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
