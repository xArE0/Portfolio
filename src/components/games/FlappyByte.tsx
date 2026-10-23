import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

type Status = 'ready' | 'playing' | 'over';

const W = 360;
const H = 480;
const BIRD_X = 90;
const SIZE = 22;
const GAP = 130;
const PIPE_W = 52;
const SPACING = 190;
const GRAVITY = 1300;
const FLAP = -380;
const SPEED = 140;

interface Pipe { x: number; gapY: number; scored: boolean }

const newPipe = (x: number): Pipe => ({ x, gapY: 70 + Math.random() * (H - 140 - GAP), scored: false });

export const FlappyByte: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const sfx = useSfx();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatusState] = useState<Status>('ready');
  const statusRef = useRef<Status>('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = usePersistentState('flappy.best', 0);
  const g = useRef({ y: H / 2, vy: 0, pipes: [] as Pipe[], score: 0, t: 0 });

  const setStatus = (next: Status) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const flap = () => {
    if (statusRef.current === 'over') return;
    if (statusRef.current === 'ready') {
      g.current = { y: H / 2, vy: 0, pipes: [newPipe(W + 40), newPipe(W + 40 + SPACING)], score: 0, t: 0 };
      setScore(0);
      setStatus('playing');
    }
    g.current.vy = FLAP;
    sfx('flap');
  };

  const restart = () => {
    g.current = { y: H / 2, vy: 0, pipes: [], score: 0, t: 0 };
    setScore(0);
    setStatus('ready');
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = g.current;
      s.t += dt;
      const st = statusRef.current;

      if (st === 'ready') {
        s.y = H / 2 + Math.sin(s.t * 3) * 8;
      } else if (st === 'playing') {
        s.vy += GRAVITY * dt;
        s.y += s.vy * dt;
        const speed = SPEED + Math.min(80, s.score * 3);
        s.pipes.forEach(p => (p.x -= speed * dt));
        if (s.pipes[0] && s.pipes[0].x < -PIPE_W) {
          s.pipes.shift();
          s.pipes.push(newPipe(s.pipes[s.pipes.length - 1].x + SPACING));
        }
        let hit = s.y + SIZE / 2 > H - 20 || s.y - SIZE / 2 < 0;
        for (const p of s.pipes) {
          if (!p.scored && p.x + PIPE_W < BIRD_X - SIZE / 2) {
            p.scored = true;
            s.score++;
            setScore(s.score);
            sfx('score');
            if (s.score >= 15) unlockSecret('flappy');
          }
          const overlapX = BIRD_X + SIZE / 2 > p.x && BIRD_X - SIZE / 2 < p.x + PIPE_W;
          const inGap = s.y - SIZE / 2 > p.gapY && s.y + SIZE / 2 < p.gapY + GAP;
          if (overlapX && !inGap) hit = true;
        }
        if (hit) {
          s.y = Math.max(SIZE / 2, Math.min(s.y, H - 20 - SIZE / 2));
          s.vy = Math.max(0, s.vy);
          setBest(b => Math.max(b, s.score));
          sfx('whack');
          setTimeout(() => sfx('lose'), 250);
          setStatus('over');
        }
      } else if (s.y < H - 20 - SIZE / 2) {
        s.vy += GRAVITY * dt;
        s.y = Math.min(H - 20 - SIZE / 2, s.y + s.vy * dt);
      }

      // background with a faint scrolling binary grid
      ctx.fillStyle = darkMode ? '#0a1020' : '#dbeafe';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = darkMode ? 'rgba(56,189,248,0.08)' : 'rgba(30,64,175,0.08)';
      ctx.font = '12px monospace';
      const drift = (s.t * 20) % 24;
      for (let y = 10; y < H; y += 24)
        for (let x = -24; x < W + 24; x += 24) ctx.fillText((x * 7 + y * 3) % 5 ? '0' : '1', x - drift, y);

      for (const p of s.pipes) {
        ctx.fillStyle = darkMode ? '#1e293b' : '#334155';
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
        ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H - p.gapY - GAP);
        ctx.fillStyle = '#22c55e';
        for (let y = 8; y < p.gapY - 6; y += 14) ctx.fillRect(p.x + 8, y, 4, 4);
        for (let y = p.gapY + GAP + 8; y < H - 26; y += 14) ctx.fillRect(p.x + 8, y, 4, 4);
        ctx.fillStyle = darkMode ? '#475569' : '#64748b';
        ctx.fillRect(p.x - 3, p.gapY - 10, PIPE_W + 6, 10);
        ctx.fillRect(p.x - 3, p.gapY + GAP, PIPE_W + 6, 10);
      }

      ctx.fillStyle = darkMode ? '#1e293b' : '#94a3b8';
      ctx.fillRect(0, H - 20, W, 20);

      // the byte
      ctx.save();
      ctx.translate(BIRD_X, s.y);
      ctx.rotate(Math.max(-0.5, Math.min(1.2, s.vy / 600)));
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, 5);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#111';
      ctx.fillRect(3, -5, 4, 4);
      ctx.font = 'bold 8px monospace';
      ctx.fillText('01', -8, 8);
      ctx.restore();

      if (st !== 'ready') {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.strokeText(String(s.score), W / 2, 60);
        ctx.fillText(String(s.score), W / 2, 60);
        ctx.textAlign = 'start';
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [darkMode, sfx, setBest]);

  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        if (e.key !== ' ' && e.key !== 'ArrowUp' && e.key !== 'w') return;
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) flap();
      }}
      className={`flex flex-col items-center h-full w-full p-3 gap-2 outline-none select-none font-mono text-xs ${darkMode ? 'bg-[#0a1020] text-gray-200' : 'bg-[#dbeafe] text-slate-700'}`}
    >
      <div className="w-full max-w-[360px] flex justify-between">
        <span>SCORE {score}</span>
        <span className="opacity-60">BEST {best}</span>
      </div>
      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
        <div className="relative h-fit" style={{ width: `min(100cqw, calc(100cqh * ${W / H}), ${W}px)` }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={flap}
            className={`w-full h-auto rounded-lg border touch-none cursor-pointer ${darkMode ? 'border-white/10' : 'border-slate-300'}`}
          />
          {status === 'ready' && (
            <div className="absolute inset-x-0 top-1/3 text-center pointer-events-none text-white drop-shadow">
              <div className="text-lg font-bold">FLAPPY BYTE</div>
              <div className="text-[11px] opacity-80 mt-1">Tap / space to flap</div>
            </div>
          )}
          {status === 'over' && (
            <div className="absolute inset-0 rounded-lg bg-black/50 flex flex-col items-center justify-center gap-3 text-white">
              <span className="text-lg font-bold">SEGFAULT · {score}</span>
              <button onClick={restart} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-win11-blue text-xs">
                <RotateCcw size={13} /> Retry
              </button>
            </div>
          )}
          {status === 'ready' && (
            <button onClick={flap} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-win11-blue text-white text-xs">
              <Play size={13} /> Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
