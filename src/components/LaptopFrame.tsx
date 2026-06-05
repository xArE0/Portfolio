import React from 'react';

interface LaptopFrameProps {
  children: React.ReactNode;
}

export const LaptopFrame: React.FC<LaptopFrameProps> = ({ children }) => (
  <div className="laptop-wrapper h-screen w-screen bg-gradient-to-b from-[#1a1a2e] via-[#12121f] to-[#0a0a14] flex flex-col items-center justify-center select-none overflow-hidden">
    {/* === LAPTOP LID (SCREEN) === */}
    <div className="laptop-lid relative w-[94%] max-w-[1280px] flex-1 max-h-[78vh] flex flex-col">
      {/* Outer bezel — dark aluminum frame */}
      <div
        className="relative flex-1 rounded-t-2xl overflow-hidden border-[6px] border-b-[4px] border-[#1e1e2a]"
        style={{
          background: '#18181f',
          boxShadow:
            '0 -2px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Webcam dot */}
        <div className="absolute top-[5px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5">
          <div className="w-[5px] h-[5px] rounded-full bg-[#1a1a24] border border-[rgba(255,255,255,0.06)] shadow-[inset_0_0_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Inner screen area */}
        <div className="w-full h-full relative overflow-hidden rounded-[4px]">
          {children}
        </div>
      </div>
    </div>

    {/* === HINGE === */}
    <div className="w-[96%] max-w-[1320px] h-[6px] relative z-10">
      <div
        className="w-full h-full rounded-b-sm"
        style={{
          background: 'linear-gradient(180deg, #252530 0%, #1c1c28 40%, #28283a 100%)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      />
    </div>

    {/* === KEYBOARD BASE / DECK === */}
    <div
      className="w-[100%] max-w-[1380px] relative z-10"
      style={{
        background: 'linear-gradient(180deg, #222230 0%, #1a1a28 100%)',
        boxShadow: '0 6px 30px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        perspective: '800px',
      }}
    >
      {/* Deck surface with keyboard hint */}
      <div
        className="w-full rounded-b-xl overflow-hidden border-x-[3px] border-b-[3px] border-[#1a1a26]"
        style={{
          transform: 'rotateX(4deg)',
          transformOrigin: 'top center',
        }}
      >
        {/* Keyboard area */}
        <div className="px-6 pt-3 pb-1.5">
          {/* Keyboard rows - stylized dots */}
          <div className="flex flex-col gap-[3px] items-center">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex gap-[3px] justify-center">
                {Array.from({ length: row === 3 ? 18 : row === 0 ? 14 : 15 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[2px] ${
                      row === 3 && i >= 6 && i <= 11
                        ? 'w-12 h-[6px]' // spacebar area
                        : 'w-[14px] h-[6px]'
                    }`}
                    style={{
                      background: 'linear-gradient(180deg, #2a2a38 0%, #222230 100%)',
                      boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.02), 0 1px 1px rgba(0,0,0,0.3)',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Trackpad */}
        <div className="flex justify-center pb-3 pt-1.5">
          <div
            className="w-28 h-[36px] rounded-md"
            style={{
              background: 'linear-gradient(180deg, #252534 0%, #1e1e2c 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>
    </div>

    {/* Subtle desk reflection */}
    <div
      className="w-[80%] max-w-[1100px] h-3 mt-0 rounded-b-full opacity-30"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(30, 30, 50, 0.8) 0%, transparent 70%)',
      }}
    />
  </div>
);
