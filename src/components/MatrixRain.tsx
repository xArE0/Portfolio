import React, { useEffect, useRef } from 'react';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFxArE0';

export const MatrixRain: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const size = 16;
    let drops: number[] = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * -50);
    };
    resize();

    let frame = 0;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (frame++ % 2) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.97 ? '#d1ffd6' : '#22c55e';
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * size, y * size);
        drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    draw();

    const stop = (e: KeyboardEvent) => e.key === 'Escape' && onDone();
    const timer = setTimeout(onDone, 15000);
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', stop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', stop);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onDone}
      style={{ zIndex: 3000 }}
      className="absolute inset-0 w-full h-full bg-black cursor-pointer animate-fade-in"
    />
  );
};
