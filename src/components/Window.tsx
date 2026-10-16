import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  darkMode: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

type AnimState = 'idle' | 'opening' | 'closing' | 'minimizing' | 'restoring';

const TASKBAR_HEIGHT = 48;

const ANIM_CLASS: Record<AnimState, string> = {
  idle: '',
  opening: 'animate-window-open',
  closing: 'animate-window-close',
  minimizing: 'animate-window-minimize',
  restoring: 'animate-window-restore',
};

const initialGeometry = () => {
  const offset = Math.floor(Math.random() * 20) - 10;
  const w = window.innerWidth;
  const h = window.innerHeight - TASKBAR_HEIGHT;
  return {
    position: { x: Math.max(8, Math.round(w * 0.05) + offset), y: Math.max(8, 12 + offset) },
    size: { width: Math.round(w * 0.8), height: Math.round(h * 0.72) },
  };
};

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  isActive,
  zIndex,
  darkMode,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}) => {
  const [geometry] = useState(initialGeometry);
  const [position, setPosition] = useState(geometry.position);
  const [size, setSize] = useState(geometry.size);
  const [interaction, setInteraction] = useState<'drag' | 'resize' | null>(null);
  const [animState, setAnimState] = useState<AnimState>('idle');
  const [shouldRender, setShouldRender] = useState(false);
  const wasMinimized = useRef(false);
  const rendered = useRef(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    if (isOpen && !isMinimized) {
      rendered.current = true;
      later(() => {
        setShouldRender(true);
        setAnimState(wasMinimized.current ? 'restoring' : 'opening');
        wasMinimized.current = false;
        later(() => setAnimState('idle'), 300);
      }, 0);
    } else if (isOpen && isMinimized) {
      wasMinimized.current = true;
      rendered.current = false;
      later(() => setAnimState('minimizing'), 0);
      later(() => {
        setShouldRender(false);
        setAnimState('idle');
      }, 300);
    } else if (!isOpen) {
      wasMinimized.current = false;
      if (rendered.current) {
        rendered.current = false;
        later(() => setAnimState('closing'), 0);
        later(() => {
          setShouldRender(false);
          setAnimState('idle');
        }, 200);
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!interaction) return;

    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (interaction === 'drag') {
        setPosition({
          x: Math.max(-size.width + 100, Math.min(window.innerWidth - 100, positionStart.current.x + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 50, positionStart.current.y + dy)),
        });
      } else {
        setSize({
          width: Math.max(320, Math.min(window.innerWidth - 20, sizeStart.current.width + dx)),
          height: Math.max(200, Math.min(window.innerHeight - 80, sizeStart.current.height + dy)),
        });
      }
    };
    const handleUp = () => setInteraction(null);

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, [interaction, size.width]);

  const startDrag = (e: React.PointerEvent) => {
    if (isMaximized || (e.target as HTMLElement).closest('.titlebar-btn')) return;
    onFocus();
    setInteraction('drag');
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = position;
    e.preventDefault();
  };

  const startResize = (e: React.PointerEvent) => {
    if (isMaximized) return;
    onFocus();
    setInteraction('resize');
    dragStart.current = { x: e.clientX, y: e.clientY };
    sizeStart.current = size;
    e.preventDefault();
    e.stopPropagation();
  };

  if (!shouldRender && animState === 'idle') return null;

  const buttonClass = `w-[46px] h-[30px] flex items-center justify-center transition-colors duration-150 rounded-sm ${
    darkMode ? 'hover:bg-[rgba(255,255,255,0.06)] text-[#e3e3e3]' : 'hover:bg-[rgba(0,0,0,0.05)] text-[#1c1c1c]'
  }`;

  return (
    <div
      data-window
      onClick={onFocus}
      style={{
        zIndex,
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100%' : size.width,
        height: isMaximized ? `calc(100% - ${TASKBAR_HEIGHT}px)` : size.height,
        maxWidth: '100vw',
        maxHeight: `calc(100% - ${TASKBAR_HEIGHT}px)`,
      }}
      className={`absolute flex flex-col rounded-lg overflow-hidden glass-panel select-none ${interaction ? '' : 'transition-all duration-200'} shadow-window ${
        darkMode ? 'glass-panel-dark' : 'glass-panel-light'
      } ${isActive ? `shadow-activeWindow ${darkMode ? 'border-[rgba(255,255,255,0.15)]' : 'border-[rgba(255,255,255,0.55)]'}` : 'opacity-90'} ${
        isMaximized ? 'rounded-none' : ''
      } ${ANIM_CLASS[animState]}`}
    >
      <div
        onPointerDown={startDrag}
        onDoubleClick={onMaximize}
        className={`flex items-center justify-between px-3 py-2 text-xs select-none cursor-default touch-none ${
          darkMode
            ? 'bg-[rgba(25,25,25,0.4)] text-[#cccccc] border-b border-[rgba(255,255,255,0.04)]'
            : 'bg-[rgba(240,240,240,0.5)] text-[#444444] border-b border-[rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="flex items-center gap-2 font-medium overflow-hidden truncate mr-4">
          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{icon}</span>
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center titlebar-btn">
          <button onClick={e => { e.stopPropagation(); onMinimize(); }} className={buttonClass} title="Minimize">
            <Minus size={12} strokeWidth={2.5} />
          </button>
          <button onClick={e => { e.stopPropagation(); onMaximize(); }} className={buttonClass} title={isMaximized ? 'Restore Down' : 'Maximize'}>
            {isMaximized ? <Copy size={10} strokeWidth={2.5} className="rotate-180" /> : <Square size={10} strokeWidth={2.5} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            className="w-[46px] h-[30px] flex items-center justify-center transition-colors duration-150 hover:bg-[#e81123] hover:text-white rounded-sm text-gray-500"
            title="Close"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative flex flex-col focus:outline-none">{children}</div>

      {!isMaximized && (
        <div
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50 flex items-end justify-end p-0.5 touch-none"
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="opacity-40">
            <path d="M6 6H0M6 3.5H2.5M6 1H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};
