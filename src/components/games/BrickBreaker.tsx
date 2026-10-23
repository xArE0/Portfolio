import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

type Status = 'ready' | 'serve' | 'playing' | 'over';

const W = 400;
const H = 480;
const COLS = 8;
const ROWS = 6;
const BRICK_W = W / COLS;
const BRICK_H = 18;
const TOP = 50;
const PADDLE_W = 70;
const PADDLE_Y = H - 30;
const R = 6;
const ROW_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

const makeBricks = () => Array<boolean>(COLS * ROWS).fill(true);

export const BrickBreaker: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const sfx = useSfx();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatusState] = useState<Status>('ready');
  const statusRef = useRef<Status>('ready');
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 });
  const [best, setBest] = usePersistentState('breakout.best', 0);
  const g = useRef({ paddle: W / 2, ball: { x: W / 2, y: PADDLE_Y - R, vx: 0, vy: 0 }, bricks: makeBricks(), score: 0, lives: 3, level: 1, keys: { left: false, right: false } });

  const setStatus = (next: Status) => {
    statusRef.current = next;
    setStatusState(next);
  };

  const serve = () => {
    const s = g.current;
    const speed = 260 + s.level * 30;
    const angle = (Math.random() * 0.6 - 0.3) - Math.PI / 2;
    s.ball = { x: s.paddle, y: PADDLE_Y - R - 1, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    setStatus('playing');
    sfx('paddle');
  };

  const start = () => {
    g.current = { ...g.current, bricks: makeBricks(), score: 0, lives: 3, level: 1 };
    setHud({ score: 0, lives: 3, level: 1 });
    sfx('start');
    setStatus('serve');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = g.current;

      if (s.keys.left) s.paddle -= 420 * dt;
      if (s.keys.right) s.paddle += 420 * dt;
      s.paddle = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.paddle));

      if (statusRef.current !== 'playing') {
        s.ball.x = s.paddle;
        s.ball.y = PADDLE_Y - R - 1;
      } else {
        const b = s.ball;
        // Sub-step so fast balls don't tunnel through bricks.
        const steps = 3;
        for (let i = 0; i < steps; i++) {
          b.x += (b.vx * dt) / steps;
          b.y += (b.vy * dt) / steps;
          if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); sfx('wall'); }
          if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); sfx('wall'); }
          if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); sfx('wall'); }

          if (b.vy > 0 && b.y + R >= PADDLE_Y && b.y + R <= PADDLE_Y + 10 && Math.abs(b.x - s.paddle) <= PADDLE_W / 2 + R) {
            const speed = Math.hypot(b.vx, b.vy) * 1.015;
            const offset = (b.x - s.paddle) / (PADDLE_W / 2);
            const angle = offset * 1.05 - Math.PI / 2;
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
            b.y = PADDLE_Y - R;
            sfx('paddle');
          }

          const col = Math.floor(b.x / BRICK_W);
          const row = Math.floor((b.y - TOP) / BRICK_H);
          if (row >= 0 && row < ROWS && col >= 0 && col < COLS && s.bricks[row * COLS + col]) {
            s.bricks[row * COLS + col] = false;
            const cx = col * BRICK_W + BRICK_W / 2;
            const cy = TOP + row * BRICK_H + BRICK_H / 2;
            if (Math.abs(b.x - cx) / BRICK_W > Math.abs(b.y - cy) / BRICK_H) b.vx = -b.vx;
            else b.vy = -b.vy;
            s.score += (ROWS - row) * 10;
            sfx('brick', row);
            if (s.bricks.every(x => !x)) {
              s.level++;
              s.bricks = makeBricks();
              unlockSecret('breakout');
              sfx('levelup');
              setStatus('serve');
            }
            setHud({ score: s.score, lives: s.lives, level: s.level });
            break;
          }

          if (b.y > H + R) {
            s.lives--;
            setHud({ score: s.score, lives: s.lives, level: s.level });
            if (s.lives <= 0) {
              setBest(v => Math.max(v, s.score));
              sfx('lose');
              setStatus('over');
            } else {
              sfx('miss');
              setStatus('serve');
            }
            break;
          }
        }
      }

      // draw
      ctx.fillStyle = darkMode ? '#0b0b14' : '#f4f4fa';
      ctx.fillRect(0, 0, W, H);
      s.bricks.forEach((alive, i) => {
        if (!alive) return;
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        ctx.fillStyle = ROW_COLORS[row];
        ctx.beginPath();
        ctx.roundRect(col * BRICK_W + 2, TOP + row * BRICK_H + 2, BRICK_W - 4, BRICK_H - 4, 3);
        ctx.fill();
      });
      ctx.fillStyle = darkMode ? '#e5e7eb' : '#1f2937';
      ctx.beginPath();
      ctx.roundRect(s.paddle - PADDLE_W / 2, PADDLE_Y, PADDLE_W, 10, 5);
      ctx.fill();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  const movePointer = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    g.current.paddle = ((e.clientX - rect.left) / rect.width) * W;
  };

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'ArrowLeft' || k === 'a') g.current.keys.left = down;
    else if (k === 'ArrowRight' || k === 'd') g.current.keys.right = down;
    else if (k === ' ' && down) {
      if (status === 'serve') serve();
      else if (status !== 'playing') start();
    } else return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={e => onKey(e, true)}
      onKeyUp={e => onKey(e, false)}
      className={`flex flex-col items-center h-full w-full p-3 gap-2 outline-none select-none font-mono text-xs ${darkMode ? 'bg-[#0b0b14] text-gray-200' : 'bg-[#f4f4fa] text-gray-700'}`}
    >
      <div className="w-full max-w-[400px] flex justify-between">
        <span>SCORE {hud.score}</span>
        <span>LVL {hud.level}</span>
        <span className="text-rose-400">{'♥'.repeat(Math.max(0, hud.lives))}</span>
        <span className="opacity-60">BEST {best}</span>
      </div>
      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
        <div className="relative h-fit" style={{ width: `min(100cqw, calc(100cqh * ${W / H}), ${W}px)` }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerMove={movePointer}
            onPointerDown={e => {
              movePointer(e);
              if (status === 'serve') serve();
            }}
            className={`w-full h-auto rounded-lg border touch-none ${darkMode ? 'border-white/10' : 'border-gray-300'}`}
          />
          {status === 'serve' && (
            <div className="absolute inset-x-0 bottom-16 text-center text-[11px] opacity-70 pointer-events-none animate-pulse">Click or press space to launch</div>
          )}
          {(status === 'ready' || status === 'over') && (
            <div className="absolute inset-0 rounded-lg bg-black/60 flex flex-col items-center justify-center gap-3 text-white">
              {status === 'over' && <span className="text-lg font-bold">GAME OVER · {hud.score}</span>}
              <button onClick={start} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-win11-blue text-xs">
                {status === 'over' ? <RotateCcw size={13} /> : <Play size={13} />}
                {status === 'over' ? 'Retry' : 'Start'}
              </button>
              <span className="text-[10px] opacity-70">Mouse / touch / ← → to move</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
