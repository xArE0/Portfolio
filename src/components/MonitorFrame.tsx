import React, { useRef, useState } from 'react';
import { Power } from 'lucide-react';
import type { DeviceType } from '../types';
import { unlockSecret } from '../lib/secrets';

interface MonitorFrameProps {
  children: React.ReactNode;
  deviceType: DeviceType;
}

const SIDE_BUTTON = 'linear-gradient(180deg, #2a2a3c 0%, #1c1c2a 100%)';

const PoweredOff: React.FC<{ label: string; size: number; className?: string }> = ({ label, size, className = '' }) => (
  <div className={`absolute inset-0 bg-[#020205] z-[9999] flex flex-col items-center justify-center text-neutral-600 animate-fade-in font-mono tracking-wider ${className}`}>
    <Power size={size} className="text-neutral-500 mb-2" />
    <span>{label}</span>
  </div>
);

export const MonitorFrame: React.FC<MonitorFrameProps> = ({ children, deviceType }) => {
  const [isOn, setIsOn] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const brandClicks = useRef(0);
  const toggle = () => setIsOn(on => !on);

  const handleBrandClick = () => {
    brandClicks.current += 1;
    if (brandClicks.current % 5 !== 0) return;
    setGlitch(true);
    setTimeout(() => setGlitch(false), 1200);
    unlockSecret('brand');
  };

  if (deviceType === 'mobile') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-[#111119] to-[#08080e] flex items-center justify-center select-none overflow-hidden">
        <div className="flex flex-col gap-3 mr-[-2px] z-10">
          {[0, 1].map(i => (
            <div key={i} className="w-[4px] h-10 rounded-l-sm" style={{ background: SIDE_BUTTON, boxShadow: '-2px 0 4px rgba(0,0,0,0.4)' }} />
          ))}
        </div>

        <div className="relative w-[90%] max-w-[380px] aspect-[9/20] rounded-[40px] overflow-hidden border-[12px] border-[#1e1e2d] bg-black">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
            <div className="w-3 h-3 rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)]">
              <div className="w-1 h-1 rounded-full bg-[#1a4f7c] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="w-full h-full relative overflow-hidden pt-8">{children}</div>
          {!isOn && <PoweredOff label="PHONE OFF" size={16} className="text-[9px]" />}
        </div>

        <button onClick={toggle} title="Power" className="ml-[-2px] z-10 active:scale-95 transition-transform">
          <div className="w-[4px] h-14 rounded-r-sm" style={{ background: SIDE_BUTTON, boxShadow: '2px 0 4px rgba(0,0,0,0.4)' }} />
        </button>
      </div>
    );
  }

  if (deviceType === 'tablet') {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-[#111119] to-[#08080e] flex flex-col items-center justify-center select-none overflow-hidden">
        <div className="flex items-center gap-2 mb-[-2px] z-10 self-end pr-[6%]">
          <div className="h-[5px] w-10 rounded-t-sm" style={{ background: SIDE_BUTTON, boxShadow: '0 -2px 4px rgba(0,0,0,0.4)' }} />
          <button onClick={toggle} title="Power" className="active:scale-95 transition-transform">
            <div className="h-[5px] w-6 rounded-t-sm" style={{ background: 'linear-gradient(90deg, #3a3a50 0%, #2a2a3c 100%)', boxShadow: '0 -2px 6px rgba(0,0,0,0.5)' }} />
          </button>
        </div>

        <div className="relative w-[95%] max-w-[900px] aspect-[16/10] rounded-3xl overflow-hidden border-[18px] border-[#1e1e2d] bg-black">
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1e1e2d] rounded-full z-50" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
            <div className="w-4 h-4 rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a4f7c] absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="w-full h-full relative overflow-hidden">{children}</div>
          {!isOn && <PoweredOff label="TABLET OFF" size={24} className="text-[11px]" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-end pb-2 select-none overflow-hidden px-10"
      style={{ background: 'linear-gradient(160deg, #f0ece8 0%, #e8e4e0 40%, #ece8e4 100%)' }}
    >
      <div
        className={`relative w-[98%] max-w-[1720px] flex-1 mt-2 rounded-t-xl overflow-hidden ${glitch ? 'animate-glitch' : ''}`}
        style={{
          border: '10px solid #1e1e2d',
          borderBottom: '8px solid #1e1e2d',
          background: '#000000',
          boxShadow: '0 0 100px rgba(0,0,0,0.85), inset 0 0 2px rgba(255,255,255,0.05)',
        }}
      >
        <div className="absolute inset-0 rounded-[4px] border border-[rgba(255,255,255,0.04)] pointer-events-none z-[60]" />
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 z-[60]">
          <div className="w-[6px] h-[6px] rounded-full bg-[#0d0d16] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
            <div className="w-[2px] h-[2px] rounded-full bg-[#1a4f7c]" />
          </div>
        </div>

        {!isOn && (
          <div className="absolute inset-0 bg-[#020205] z-[9999] flex flex-col items-center justify-center text-neutral-600 animate-fade-in font-mono text-[11px] tracking-wider">
            <div className="w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center mb-3 bg-neutral-900/50">
              <Power size={20} className="text-neutral-500 animate-pulse" />
            </div>
            <span>NO SIGNAL</span>
          </div>
        )}

        <div className="w-full h-full relative overflow-hidden">{children}</div>
      </div>

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
        <div className="w-24" />

        <button
          onClick={handleBrandClick}
          className={`text-[9px] font-mono tracking-[0.4em] uppercase font-bold transition-colors ${glitch ? 'text-win11-blue' : 'text-gray-500 hover:text-gray-400'}`}
        >
          xArE0
        </button>

        <div className="w-24 flex items-center justify-end gap-3">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isOn ? 'bg-[#00d2ff] shadow-[0_0_8px_#00d2ff,0_0_15px_#00d2ff]' : 'bg-[#ff9900] shadow-[0_0_8px_#ff9900,0_0_12px_#ff9900]'
            }`}
          />
          <button onClick={e => { e.stopPropagation(); toggle(); }} className="group focus:outline-none" title="Power">
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

      <div
        className="w-24 h-10"
        style={{
          background: 'linear-gradient(180deg, #1c1c2a 0%, #13131e 100%)',
          borderLeft: '1px solid #28283c',
          borderRight: '1px solid #28283c',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
        }}
      />
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
