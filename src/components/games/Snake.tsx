import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { playSound } from '../../lib/sound';
import { useSystem } from '../../system';

interface SnakeProps {
  darkMode: boolean;
}

type Point = { x: number; y: number };
type Status = 'ready' | 'playing' | 'over';

const GRID = 20;
const DIRS: Record<string, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const KEYS: Record<string, keyof typeof DIRS> = {
  ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
};

const startSnake = (): Point[] => [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

const randomFood = (snake: Point[]): Point => {
  for (;;) {
    const p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some(s => s.x === p.x && s.y === p.y)) return p;
  }
};

export const Snake: React.FC<SnakeProps> = ({ darkMode }) => {
  const { soundEnabled } = useSystem();
  const [snake, setSnake] = useState(startSnake);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [status, setStatus] = useState<Status>('ready');
  const [best, setBest] = usePersistentState('snake.best', 0);
  const dir = useRef<Point>(DIRS.right);
  const queued = useRef<Point>(DIRS.right);
  const containerRef = useRef<HTMLDivElement>(null);
  const game = useRef({ snake, food });

  const score = snake.length - 3;

  const start = () => {
    const s = startSnake();
    const f = randomFood(s);
    game.current = { snake: s, food: f };
    setSnake(s);
    setFood(f);
    dir.current = DIRS.right;
    queued.current = DIRS.right;
    setStatus('playing');
    containerRef.current?.focus();
  };

  const turn = useCallback((name: keyof typeof DIRS) => {
    const next = DIRS[name];
    if (next.x === -dir.current.x && next.y === -dir.current.y) return;
    queued.current = next;
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = setInterval(() => {
      dir.current = queued.current;
      const { snake: prev, food: target } = game.current;
      const head = { x: prev[0].x + dir.current.x, y: prev[0].y + dir.current.y };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
      if (hitWall || prev.some(p => p.x === head.x && p.y === head.y)) {
        setStatus('over');
        if (soundEnabled) playSound('error');
        return;
      }
      const next = [head, ...prev];
      let nextFood = target;
      if (head.x === target.x && head.y === target.y) {
        nextFood = randomFood(next);
        const points = next.length - 3;
        setBest(b => Math.max(b, points));
        if (points >= 10) unlockSecret('snake');
        if (soundEnabled) playSound('beep');
      } else {
        next.pop();
      }
      game.current = { snake: next, food: nextFood };
      setSnake(next);
      setFood(nextFood);
    }, Math.max(60, 140 - score * 4));
    return () => clearInterval(timer);
  }, [status, score, soundEnabled, setBest]);

  const handleKey = (e: React.KeyboardEvent) => {
    const name = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    if (name) {
      e.preventDefault();
      e.stopPropagation();
      if (status === 'playing') turn(name);
    } else if ((e.key === ' ' || e.key === 'Enter') && status !== 'playing') {
      e.preventDefault();
      start();
    }
  };

  const cell = 100 / GRID;
  const pad = `w-11 h-11 rounded-lg flex items-center justify-center active:scale-90 transition ${darkMode ? 'bg-white/10' : 'bg-black/10'}`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKey}
      className={`flex flex-col items-center h-full w-full p-4 gap-3 outline-none select-none font-mono text-xs ${
        darkMode ? 'bg-[#0d130d] text-lime-300' : 'bg-[#eef6e8] text-lime-800'
      }`}
    >
      <div className="w-full max-w-[400px] flex justify-between">
        <span>SCORE {String(score).padStart(3, '0')}</span>
        <span>BEST {String(best).padStart(3, '0')}</span>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
      <div style={{ width: 'min(100cqw, 100cqh, 420px)' }} className={`relative aspect-square rounded border-2 ${darkMode ? 'border-lime-500/40 bg-black/40' : 'border-lime-700/40 bg-white/60'}`}>
        <div
          className="absolute rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          style={{ left: `${food.x * cell}%`, top: `${food.y * cell}%`, width: `${cell}%`, height: `${cell}%` }}
        />
        {snake.map((p, i) => (
          <div
            key={i}
            className={`absolute rounded-sm ${i === 0 ? 'bg-lime-300' : 'bg-lime-500'}`}
            style={{ left: `${p.x * cell}%`, top: `${p.y * cell}%`, width: `${cell}%`, height: `${cell}%`, transform: 'scale(0.9)' }}
          />
        ))}

        {status !== 'playing' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 text-lime-300">
            {status === 'over' && <span className="text-lg font-bold">GAME OVER</span>}
            <button onClick={start} className="flex items-center gap-2 px-4 py-2 rounded border border-lime-400/60 hover:bg-lime-400/10">
              {status === 'over' ? <RotateCcw size={14} /> : <Play size={14} />}
              <span>{status === 'over' ? 'RETRY' : 'START'}</span>
            </button>
          </div>
        )}
      </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:hidden">
        <span />
        <button onClick={() => turn('up')} className={pad}><ArrowUp size={18} /></button>
        <span />
        <button onClick={() => turn('left')} className={pad}><ArrowLeft size={18} /></button>
        <button onClick={() => turn('down')} className={pad}><ArrowDown size={18} /></button>
        <button onClick={() => turn('right')} className={pad}><ArrowRight size={18} /></button>
      </div>
    </div>
  );
};
