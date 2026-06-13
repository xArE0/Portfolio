import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  darkMode?: boolean;
  deviceType?: 'monitor' | 'tablet' | 'mobile';
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

type AnimState = 'idle' | 'opening' | 'closing' | 'minimizing' | 'restoring';

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  isActive,
  zIndex,
  defaultX = 100,
  defaultY = 100,
  defaultWidth = 700,
  defaultHeight = 450,
  darkMode = true,
  deviceType = 'monitor',
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}) => {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [animState, setAnimState] = useState<AnimState>('idle');
  const [shouldRender, setShouldRender] = useState(false);
  const [wasMinimized, setWasMinimized] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0 });

  // Reset/Position adjustments on mount to avoid overlaying completely
  useEffect(() => {
    const randomOffset = Math.floor(Math.random() * 40) - 20;
    
    // Calculate sizes based on device type
    let initialWidth: number;
    let initialHeight: number;
    let initialX: number;
    let initialY: number;

    if (deviceType === 'mobile') {
      // Mobile: full width, full height with some padding
      initialWidth = Math.max(window.innerWidth - 16, 300);
      initialHeight = Math.max(window.innerHeight - 80, 300);
      initialX = 8;
      initialY = 8;
    } else if (deviceType === 'tablet') {
      // Tablet: scaled down defaults, centered
      const tabletWidth = Math.min(window.innerWidth - 32, 600);
      const tabletHeight = Math.min(window.innerHeight - 100, 500);
      initialWidth = Math.min(tabletWidth, defaultWidth * 0.8);
      initialHeight = Math.min(tabletHeight, defaultHeight * 0.8);
      initialX = Math.max(16, (window.innerWidth - initialWidth) / 2 + randomOffset);
      initialY = Math.max(16, (window.innerHeight - initialHeight) / 2 + randomOffset);
    } else {
      // Desktop: original logic
      initialWidth = defaultWidth;
      initialHeight = defaultHeight;
      initialX = Math.max(20, Math.min(defaultX + randomOffset, window.innerWidth - initialWidth - 20));
      initialY = Math.max(20, Math.min(defaultY + randomOffset, window.innerHeight - initialHeight - 60));
    }

    const timer = setTimeout(() => {
      setSize({
        width: initialWidth,
        height: initialHeight,
      });
      
      setPosition({
        x: initialX,
        y: initialY,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [deviceType, defaultWidth, defaultHeight, defaultX, defaultY]);

  // Handle open/close/minimize transitions
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        setShouldRender(true);
        if (wasMinimized) {
          setAnimState('restoring');
          setWasMinimized(false);
          timer = setTimeout(() => setAnimState('idle'), 300);
        } else {
          setAnimState('opening');
          timer = setTimeout(() => setAnimState('idle'), 280);
        }
      }, 0);
    } else if (isOpen && isMinimized) {
      setTimeout(() => {
        setWasMinimized(true);
        setAnimState('minimizing');
        timer = setTimeout(() => {
          setShouldRender(false);
          setAnimState('idle');
        }, 300);
      }, 0);
    } else if (!isOpen && shouldRender) {
      setTimeout(() => {
        setAnimState('closing');
        timer = setTimeout(() => {
          setShouldRender(false);
          setAnimState('idle');
        }, 200);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, isMinimized, shouldRender, wasMinimized]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    
    const target = e.target as HTMLElement;
    if (target.closest('.titlebar-btn')) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { x: position.x, y: position.y };
    e.preventDefault();
  };

  // Handle Resizing (Bottom Right Corner)
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    sizeStart.current = { width: size.width, height: size.height };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        
        const newX = Math.max(-size.width + 100, Math.min(window.innerWidth - 100, positionStart.current.x + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - 50, positionStart.current.y + dy));
        
        setPosition({ x: newX, y: newY });
      }

      if (isResizing) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        
        const maxWidth = window.innerWidth - 20;
        const maxHeight = window.innerHeight - 80;
        const newWidth = Math.max(320, Math.min(maxWidth, sizeStart.current.width + dx));
        const newHeight = Math.max(200, Math.min(maxHeight, sizeStart.current.height + dy));
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, size.width, isMaximized]);

  if (!shouldRender && !isOpen) return null;
  if (!shouldRender && animState === 'idle') return null;

  // Determine the animation class
  const getAnimClass = () => {
    switch (animState) {
      case 'opening': return 'animate-window-open';
      case 'closing': return 'animate-window-close';
      case 'minimizing': return 'animate-window-minimize';
      case 'restoring': return 'animate-window-restore';
      default: return '';
    }
  };

  return (
    <div
      ref={windowRef}
      onClick={onFocus}
      style={{
        zIndex: zIndex,
        left: isMaximized ? 0 : `${position.x}px`,
        top: isMaximized ? 0 : `${position.y}px`,
        width: isMaximized ? '100%' : `${size.width}px`,
        height: isMaximized ? 'calc(100% - 48px)' : `${size.height}px`,
        maxWidth: '100vw',
        maxHeight: 'calc(100% - 48px)',
      }}
      className={`absolute flex flex-col rounded-lg overflow-hidden glass-panel select-none ${isDragging || isResizing ? '' : 'transition-all duration-200'} shadow-window ${
        isActive 
          ? (darkMode ? 'glass-panel-dark shadow-activeWindow border-[rgba(255,255,255,0.15)]' : 'glass-panel-light shadow-activeWindow border-[rgba(255,255,255,0.55)]')
          : (darkMode ? 'glass-panel-dark opacity-90' : 'glass-panel-light opacity-90')
      } ${isMaximized ? 'rounded-none' : ''} ${getAnimClass()}`}
    >
      {/* Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
        className={`flex items-center justify-between px-3 py-2 text-xs select-none cursor-default ${
          darkMode 
            ? 'bg-[rgba(25,25,25,0.4)] text-[#cccccc] border-b border-[rgba(255,255,255,0.04)]' 
            : 'bg-[rgba(240,240,240,0.5)] text-[#444444] border-b border-[rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="flex items-center gap-2 font-medium overflow-hidden truncate mr-4">
          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{icon}</span>
          <span className="truncate">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center titlebar-btn">
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className={`w-[46px] h-[30px] flex items-center justify-center transition-colors duration-150 rounded-sm ${
              darkMode ? 'hover:bg-[rgba(255,255,255,0.06)] text-[#e3e3e3]' : 'hover:bg-[rgba(0,0,0,0.05)] text-[#1c1c1c]'
            }`}
            title="Minimize"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className={`w-[46px] h-[30px] flex items-center justify-center transition-colors duration-150 rounded-sm ${
              darkMode ? 'hover:bg-[rgba(255,255,255,0.06)] text-[#e3e3e3]' : 'hover:bg-[rgba(0,0,0,0.05)] text-[#1c1c1c]'
            }`}
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? (
              <Copy size={10} strokeWidth={2.5} className="transform rotate-180" />
            ) : (
              <Square size={10} strokeWidth={2.5} />
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-[46px] h-[30px] flex items-center justify-center transition-colors duration-150 hover:bg-[#e81123] hover:text-white rounded-sm text-gray-500"
            title="Close"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Client Window Area */}
      <div className="flex-1 overflow-auto relative flex flex-col focus:outline-none">
        {children}
      </div>

      {/* Resize Handle - only when not maximized */}
      {!isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50 flex items-end justify-end p-0.5"
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
            <path d="M6 6H0M6 3.5H2.5M6 1H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};
