import React, { useState, useEffect } from 'react';
import { Power } from 'lucide-react';

interface MonitorFrameProps {
  children: React.ReactNode;
  onPowerClick?: () => void;
}

type DeviceType = 'monitor' | 'tablet' | 'mobile';

export const MonitorFrame: React.FC<MonitorFrameProps> = ({ children, onPowerClick }) => {
  const [isMonitorOn, setIsMonitorOn] = useState(true);
  const [deviceType, setDeviceType] = useState<DeviceType>('monitor');

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

  // Render Mobile Frame
  if (deviceType === 'mobile') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-[#111119] to-[#08080e] flex flex-col items-center justify-center select-none overflow-hidden">
        <div className="relative w-[90%] max-w-[380px] aspect-[9/20] rounded-[40px] overflow-hidden border-[12px] border-[#1e1e2d]" style={{ background: '#000' }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#000] rounded-b-3xl z-50" />
          {/* Camera dot */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
            <div className="w-3 h-3 rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)]">
              <div className="w-1 h-1 rounded-full bg-[#1a4f7c] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          {/* Content */}
          <div className="w-full h-full relative overflow-hidden pt-8">
            {children}
          </div>
          {/* Powered off overlay */}
          {!isMonitorOn && (
            <div className="absolute inset-0 bg-[#020205] z-[9999] flex flex-col items-center justify-center text-neutral-600 animate-fade-in font-mono text-[9px] tracking-wider">
              <Power size={16} className="text-neutral-500 mb-2" />
              <span>PHONE OFF</span>
            </div>
          )}
        </div>
        {/* Power button */}
        <button onClick={() => { setIsMonitorOn(!isMonitorOn); onPowerClick?.(); }} className="mt-4 px-4 py-1 text-xs font-mono text-gray-400 border border-gray-600 rounded hover:border-red-500 transition-colors">
          Power
        </button>
      </div>
    );
  }

  // Render Tablet Frame
  if (deviceType === 'tablet') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-[#111119] to-[#08080e] flex flex-col items-center justify-center select-none overflow-hidden">
        <div className="relative w-[95%] max-w-[900px] aspect-[16/10] rounded-3xl overflow-hidden border-[18px] border-[#1e1e2d]" style={{ background: '#000' }}>
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1e1e2d] rounded-full z-50" />
          {/* Camera dot */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
            <div className="w-4 h-4 rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a4f7c] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          {/* Content */}
          <div className="w-full h-full relative overflow-hidden">
            {children}
          </div>
          {/* Powered off overlay */}
          {!isMonitorOn && (
            <div className="absolute inset-0 bg-[#020205] z-[9999] flex flex-col items-center justify-center text-neutral-600 animate-fade-in font-mono text-[11px] tracking-wider">
              <Power size={24} className="text-neutral-500 mb-2" />
              <span>TABLET OFF</span>
            </div>
          )}
        </div>
        {/* Power button */}
        <button onClick={() => { setIsMonitorOn(!isMonitorOn); onPowerClick?.(); }} className="mt-6 px-4 py-1 text-xs font-mono text-gray-400 border border-gray-600 rounded hover:border-red-500 transition-colors">
          Power
        </button>
      </div>
    );
  }

  // Render Desktop Monitor Frame (default)
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#111119] to-[#08080e] flex flex-col items-center justify-end pb-2 select-none overflow-hidden">
      {/* === MONITOR SCREEN === */}
      <div
        className="relative w-[98%] max-w-[1720px] flex-1 mt-2 rounded-t-xl overflow-hidden"
        style={{
          border: '10px solid #1e1e2d',
          borderBottom: '8px solid #1e1e2d',
          background: '#000000',
          boxShadow:
            '0 0 100px rgba(0,0,0,0.85), inset 0 0 2px rgba(255,255,255,0.05)',
        }}
      >
        {/* Subtle bezel inner edge highlight */}
        <div className="absolute inset-0 rounded-[4px] border border-[rgba(255,255,255,0.04)] pointer-events-none z-[60]" />

        {/* Webcam / sensor dot */}
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 z-[60]">
          <div className="w-[6px] h-[6px] rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
            <div className="w-[2px] h-[2px] rounded-full bg-[#1a4f7c]" />
          </div>
        </div>

        {/* Powered off overlay */}
        {!isMonitorOn && (
          <div className="absolute inset-0 bg-[#020205] z-[9999] flex flex-col items-center justify-center text-neutral-600 animate-fade-in font-mono text-[11px] tracking-wider select-none">
            <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center mb-3 bg-neutral-900/50">
              <Power size={20} className="text-neutral-500 animate-pulse" />
            </div>
            <span>MONITOR POWER SAVING MODE</span>
            <span className="text-[9px] text-neutral-700 mt-1">PRESS POWER BUTTON TO ACTIVATE</span>
          </div>
        )}

        {/* Screen content area — fills the entire bezel interior */}
        <div className="w-full h-full relative overflow-hidden">
          {children}
        </div>
      </div>

      {/* === MONITOR CHIN (bottom bezel) === */}
      <div
        className="w-[98%] max-w-[1720px] flex items-center justify-between px-6 relative"
        style={{
          height: '42px',
          background: 'linear-gradient(180deg, #232334 0%, #171722 50%, #1c1c2a 100%)',
          borderLeft: '10px solid #1e1e2d',
          borderRight: '10px solid #1e1e2d',
          borderBottom: '10px solid #1e1e2d',
          borderBottomLeftRadius: '14px',
          borderBottomRightRadius: '14px',
          boxShadow: '0 6px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Left side spacer to keep centering */}
        <div className="w-24" />

        {/* Brand logo (centered) */}
        <span className="text-[9px] font-mono tracking-[0.4em] text-gray-500 uppercase select-none font-bold">
          PortfolioOS UltraWide
        </span>

        {/* Right side power control group */}
        <div className="w-24 flex items-center justify-end gap-3">
          {/* LED Indicator */}
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isMonitorOn 
                ? 'bg-[#00d2ff] shadow-[0_0_8px_#00d2ff,0_0_15px_#00d2ff]' 
                : 'bg-[#ff9900] shadow-[0_0_8px_#ff9900,0_0_12px_#ff9900]'
            }`}
            title={isMonitorOn ? "Monitor: Active" : "Monitor: Standby"}
          />

          {/* Physical Power Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMonitorOn(!isMonitorOn);
              if (onPowerClick) onPowerClick();
            }}
            className="group focus:outline-none"
            title="Monitor Power Button"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border border-[rgba(255,255,255,0.08)] hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] active:scale-90 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #2d2d3f 0%, #1e1e2a 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.6)',
              }}
            >
              <Power size={12} className="text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
            </div>
          </button>
        </div>
      </div>

      {/* === STAND NECK === */}
      <div
        className="w-24 h-10"
        style={{
          background: 'linear-gradient(180deg, #1c1c2a 0%, #13131e 100%)',
          borderLeft: '1px solid #28283c',
          borderRight: '1px solid #28283c',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        }}
      />

      {/* === STAND BASE === */}
      <div
        className="w-60 h-[8px] rounded-b-lg"
        style={{
          background: 'linear-gradient(180deg, #232335 0%, #171722 100%)',
          border: '1px solid #28283c',
          borderTop: 'none',
          boxShadow: '0 6px 30px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
};
