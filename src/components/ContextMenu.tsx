import React from 'react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  darkMode: boolean;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, darkMode, onClose }) => (
  <div
    style={{ left: x, top: y, zIndex: 1500 }}
    onClick={e => e.stopPropagation()}
    onContextMenu={e => e.preventDefault()}
    className={`absolute min-w-[210px] p-1 rounded-lg border shadow-activeWindow glass-panel animate-fade-in text-xs ${
      darkMode ? 'glass-panel-dark border-white/10 text-gray-200' : 'glass-panel-light border-black/10 text-gray-800'
    }`}
  >
    {items.map(item => (
      <React.Fragment key={item.label}>
        {item.divider && <div className={`my-1 h-px ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />}
        <button
          onClick={() => { item.onSelect(); onClose(); }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-colors ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
        >
          <span className="w-4 flex justify-center opacity-80">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {item.shortcut && <span className="opacity-40 text-[10px]">{item.shortcut}</span>}
        </button>
      </React.Fragment>
    ))}
  </div>
);
