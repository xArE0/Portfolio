import React, { useEffect, useState } from 'react';
import { Bomb, Flag, RotateCcw, Smile, Frown, PartyPopper } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';

interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  count: number;
}

type Status = 'ready' | 'playing' | 'won' | 'lost';

const LEVELS = {
  easy: { size: 9, mines: 10 },
  medium: { size: 12, mines: 24 },
  hard: { size: 16, mines: 48 },
};
type Level = keyof typeof LEVELS;

const COUNT_COLORS = ['', 'text-blue-400', 'text-emerald-400', 'text-rose-400', 'text-violet-400', 'text-amber-400', 'text-cyan-400', 'text-pink-400', 'text-gray-400'];

const emptyBoard = (size: number): Cell[] =>
  Array.from({ length: size * size }, () => ({ mine: false, open: false, flag: false, count: 0 }));

const neighbors = (i: number, size: number) => {
  const x = i % size;
  const y = Math.floor(i / size);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < size && ny < size) out.push(ny * size + nx);
    }
  return out;
};

const plantMines = (size: number, mines: number, safe: number): Cell[] => {
  const board = emptyBoard(size);
  const forbidden = new Set([safe, ...neighbors(safe, size)]);
  let placed = 0;
  while (placed < mines) {
    const i = Math.floor(Math.random() * board.length);
    if (board[i].mine || forbidden.has(i)) continue;
    board[i].mine = true;
    placed++;
  }
  board.forEach((c, i) => (c.count = neighbors(i, size).filter(n => board[n].mine).length));
  return board;
};

export const Minesweeper: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [level, setLevel] = useState<Level>('easy');
  const { size, mines } = LEVELS[level];
  const [board, setBoard] = useState(() => emptyBoard(size));
  const [status, setStatus] = useState<Status>('ready');
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = usePersistentState<Record<Level, number | null>>('mines.best', { easy: null, medium: null, hard: null });

  useEffect(() => {
    if (status !== 'playing') return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const reset = (next: Level = level) => {
    setLevel(next);
    setBoard(emptyBoard(LEVELS[next].size));
    setStatus('ready');
    setSeconds(0);
  };

  const reveal = (i: number) => {
    if (status === 'won' || status === 'lost') return;
    let next = board.map(c => ({ ...c }));
    if (status === 'ready') {
      next = plantMines(size, mines, i);
      setStatus('playing');
    }
    const cell = next[i];
    if (cell.open || cell.flag) return;

    if (cell.mine) {
      next.forEach(c => c.mine && (c.open = true));
      setBoard(next);
      setStatus('lost');
      return;
    }

    const stack = [i];
    while (stack.length) {
      const j = stack.pop()!;
      const c = next[j];
      if (c.open || c.flag) continue;
      c.open = true;
      if (c.count === 0) stack.push(...neighbors(j, size));
    }

    setBoard(next);
    if (next.every(c => c.mine || c.open)) {
      setStatus('won');
      unlockSecret('minesweeper');
      setBest(b => ({ ...b, [level]: b[level] === null ? seconds : Math.min(b[level]!, seconds) }));
    }
  };

  const toggleFlag = (i: number) => {
    if (status !== 'playing' || board[i].open) return;
    setBoard(prev => prev.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  const flags = board.filter(c => c.flag).length;
  const Face = status === 'lost' ? Frown : status === 'won' ? PartyPopper : Smile;
  const closed = darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-gray-300 hover:bg-gray-200';
  const opened = darkMode ? 'bg-neutral-900' : 'bg-gray-100';

  return (
    <div className="flex flex-col items-center gap-3 p-4 h-full">
      <div className="flex gap-1">
        {(Object.keys(LEVELS) as Level[]).map(l => (
          <button
            key={l}
            onClick={() => reset(l)}
            className={`px-3 py-1 rounded-full text-[10px] capitalize ${level === l ? 'bg-win11-blue text-white' : darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="w-full max-w-[420px] flex items-center justify-between font-mono text-xs">
        <span className="flex items-center gap-1.5"><Bomb size={13} /> {mines - flags}</span>
        <button onClick={() => reset()} className="p-1.5 rounded-full hover:bg-white/10" title="New game">
          <Face size={20} className={status === 'lost' ? 'text-rose-400' : 'text-amber-400'} />
        </button>
        <span>{String(seconds).padStart(3, '0')}s</span>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
      <div
        className="grid gap-[2px] content-start select-none"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 'min(100cqw, 100cqh, 420px)' }}
        onContextMenu={e => e.preventDefault()}
      >
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => (flagMode ? toggleFlag(i) : reveal(i))}
            onContextMenu={e => {
              e.preventDefault();
              toggleFlag(i);
            }}
            className={`aspect-square rounded-[3px] flex items-center justify-center font-bold font-mono text-[11px] transition-colors ${
              c.open ? (c.mine ? 'bg-rose-500/80' : opened) : closed
            }`}
          >
            {c.open && c.mine && <Bomb size={12} />}
            {c.open && !c.mine && c.count > 0 && <span className={COUNT_COLORS[c.count]}>{c.count}</span>}
            {!c.open && c.flag && <Flag size={11} className="text-rose-400" />}
          </button>
        ))}
      </div>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <button
          onClick={() => setFlagMode(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${flagMode ? 'border-rose-400 text-rose-400' : 'border-current opacity-60'}`}
        >
          <Flag size={12} /> Flag mode
        </button>
        <button onClick={() => reset()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current opacity-60 hover:opacity-100">
          <RotateCcw size={12} /> Restart
        </button>
      </div>

      <div className="text-[10px] opacity-50 font-mono">
        {status === 'won' ? `Cleared in ${seconds}s` : status === 'lost' ? 'Boom.' : `Best: ${best[level] ?? '—'}${best[level] !== null ? 's' : ''}`}
      </div>
    </div>
  );
};
