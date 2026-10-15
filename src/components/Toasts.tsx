import React from 'react';
import { Sparkles, X } from 'lucide-react';

export interface Toast {
  id: number;
  title: string;
  body: string;
}

interface ToastsProps {
  toasts: Toast[];
  darkMode: boolean;
  mobile: boolean;
  onDismiss: (id: number) => void;
}

export const Toasts: React.FC<ToastsProps> = ({ toasts, darkMode, mobile, onDismiss }) => (
  <div
    style={{ zIndex: 2000 }}
    className={`absolute flex flex-col gap-2 pointer-events-none ${
      mobile ? 'top-9 left-3 right-3' : 'bottom-14 right-3 w-[300px]'
    }`}
  >
    {toasts.map(t => (
      <div
        key={t.id}
        className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-activeWindow glass-panel animate-toast-in ${
          darkMode ? 'glass-panel-dark border-white/10 text-white' : 'glass-panel-light border-black/10 text-gray-900'
        }`}
      >
        <div className="w-8 h-8 shrink-0 rounded-md bg-win11-blue/20 flex items-center justify-center">
          <Sparkles size={16} className="text-win11-blue" />
        </div>
        <div className="flex-1 min-w-0 text-xs leading-snug">
          <div className="font-semibold">{t.title}</div>
          <div className="opacity-70 truncate">{t.body}</div>
        </div>
        <button onClick={() => onDismiss(t.id)} className="opacity-50 hover:opacity-100">
          <X size={12} />
        </button>
      </div>
    ))}
  </div>
);
