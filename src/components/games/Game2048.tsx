import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';

type Dir = 'up' | 'down' | 'left' | 'right';
type Grid = number[];

const N = 4;
const KEYS: Record<string, Dir> = {
  ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
};

const TILE: Record<number, string> = {
  2: 'bg-slate-200 text-slate-800',
  4: 'bg-slate-300 text-slate-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-amber-500 text-white',
  1024: 'bg-emerald-500 text-white',
  2048: 'bg-win11-blue text-white',
};

const addTile = (grid: Grid): Grid => {
  const empty = grid.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return grid;
  const next = [...grid];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const newGrid = () => addTile(addTile(Array(N * N).fill(0)));

const lineIndices = (dir: Dir, k: number) =>
  Array.from({ length: N }, (_, j) => {
    switch (dir) {
      case 'left': return k * N + j;
      case 'right': return k * N + (N - 1 - j);
      case 'up': return j * N + k;
      case 'down': return (N - 1 - j) * N + k;
    }
  });

const slide = (grid: Grid, dir: Dir) => {
  const next = [...grid];
  let gained = 0;
  for (let k = 0; k < N; k++) {
    const idx = lineIndices(dir, k);
    const values = idx.map(i => grid[i]).filter(Boolean);
    const merged: number[] = [];
    for (let j = 0; j < values.length; j++) {
      if (values[j] === values[j + 1]) {
        merged.push(values[j] * 2);
        gained += values[j] * 2;
        j++;
      } else {
        merged.push(values[j]);
      }
    }
    idx.forEach((i, j) => (next[i] = merged[j] ?? 0));
  }
  return { grid: next, gained, moved: next.some((v, i) => v !== grid[i]) };
};

const canMove = (grid: Grid) => (['up', 'down', 'left', 'right'] as Dir[]).some(d => slide(grid, d).moved);

export const Game2048: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [grid, setGrid] = useState<Grid>(newGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = usePersistentState('2048.best', 0);
  const ref = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const over = !canMove(grid);
  const top = Math.max(...grid);

  useEffect(() => ref.current?.focus(), []);

  const move = (dir: Dir) => {
    const res = slide(grid, dir);
    if (!res.moved) return;
    const next = addTile(res.grid);
    setGrid(next);
    setScore(s => {
      const total = s + res.gained;
      setBest(b => Math.max(b, total));
      return total;
    });
    if (Math.max(...next) >= 512) unlockSecret('2048');
  };

  const restart = () => {
    setGrid(newGrid());
    setScore(0);
    ref.current?.focus();
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={e => {
        const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
        if (!dir) return;
        e.preventDefault();
        e.stopPropagation();
        move(dir);
      }}
      onPointerDown={e => (touch.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={e => {
        if (!touch.current) return;
        const dx = e.clientX - touch.current.x;
        const dy = e.clientY - touch.current.y;
        touch.current = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
      }}
      className="flex flex-col items-center gap-3 p-4 h-full outline-none touch-none"
    >
      <div className="w-full max-w-[360px] flex items-center justify-between">
        <div className="flex gap-2">
          {[['Score', score], ['Best', best]].map(([label, value]) => (
            <div key={label} className={`px-3 py-1 rounded-md text-center ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
              <div className="text-[9px] uppercase opacity-60">{label}</div>
              <div className="font-bold text-sm">{value}</div>
            </div>
          ))}
        </div>
        <button onClick={restart} className="p-2 rounded-full hover:bg-white/10" title="New game">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
      <div
        style={{ width: 'min(100cqw, 100cqh, 400px)' }}
        className={`relative grid grid-cols-4 gap-2 p-2 rounded-xl aspect-square ${darkMode ? 'bg-neutral-800' : 'bg-gray-300'}`}
      >
        {grid.map((v, i) => (
          <div
            key={i}
            className={`rounded-lg flex items-center justify-center font-bold transition-all duration-100 ${
              v ? `${TILE[v] ?? 'bg-black text-white'} animate-pin-icon` : darkMode ? 'bg-neutral-700/60' : 'bg-gray-200'
            } ${v >= 1024 ? 'text-lg' : v >= 128 ? 'text-xl' : 'text-2xl'}`}
          >
            {v || ''}
          </div>
        ))}
        {over && (
          <div className="absolute inset-0 rounded-xl bg-black/60 flex flex-col items-center justify-center gap-3 text-white">
            <span className="text-xl font-bold">{top >= 2048 ? 'You win!' : 'Game over'}</span>
            <button onClick={restart} className="px-4 py-1.5 rounded-full bg-win11-blue text-xs">Try again</button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
