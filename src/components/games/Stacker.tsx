import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

type Status = 'ready' | 'playing' | 'paused' | 'over';
interface Piece { type: number; rot: number; x: number; y: number }

const W = 10;
const H = 20;
const LINE_POINTS = [0, 100, 300, 500, 800];

// [cells, bounding box size]; colors index matches type + 1 on the board.
const SHAPES: { cells: [number, number][]; size: number }[] = [
  { cells: [[0, 1], [1, 1], [2, 1], [3, 1]], size: 4 }, // I
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], size: 2 }, // O
  { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], size: 3 }, // T
  { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], size: 3 }, // S
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], size: 3 }, // Z
  { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], size: 3 }, // J
  { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], size: 3 }, // L
];
const COLORS = ['', 'bg-cyan-400', 'bg-yellow-400', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-blue-500', 'bg-orange-500'];

const cellsOf = ({ type, rot, x, y }: Piece) => {
  const { cells, size } = SHAPES[type];
  return cells.map(([cx, cy]) => {
    for (let r = 0; r < rot % 4; r++) [cx, cy] = [size - 1 - cy, cx];
    return [x + cx, y + cy] as [number, number];
  });
};

const fits = (board: number[], piece: Piece) =>
  cellsOf(piece).every(([x, y]) => x >= 0 && x < W && y < H && (y < 0 || !board[y * W + x]));

const makeBag = () => [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);

interface Game {
  board: number[];
  piece: Piece;
  bag: number[];
  next: number;
  status: Status;
  score: number;
  lines: number;
  flash: number[];
}

const initialGame = (): Game => ({
  board: Array<number>(W * H).fill(0),
  piece: spawn(0),
  bag: makeBag(),
  next: 0,
  status: 'ready',
  score: 0,
  lines: 0,
  flash: [],
});

const drawPiece = (g: Game) => {
  if (!g.bag.length) g.bag = makeBag();
  return g.bag.pop()!;
};

function spawn(type: number): Piece {
  return { type, rot: 0, x: type === 1 ? 4 : 3, y: type === 0 ? -1 : 0 };
}

export const Stacker: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const sfx = useSfx();
  const [best, setBest] = usePersistentState('stacker.best', 0);
  const ref = useRef<HTMLDivElement>(null);
  // Game logic mutates the ref; `view` is the snapshot React renders from.
  const g = useRef<Game>(initialGame());
  const [view, setView] = useState<Game>(initialGame);
  const render = useCallback(() => setView({ ...g.current }), []);
  const level = Math.floor(view.lines / 10) + 1;

  const start = () => {
    const s = g.current;
    s.board = Array(W * H).fill(0);
    s.bag = makeBag();
    s.piece = spawn(drawPiece(s));
    s.next = drawPiece(s);
    s.score = 0;
    s.lines = 0;
    s.status = 'playing';
    sfx('start');
    render();
    ref.current?.focus();
  };

  const lock = useCallback(() => {
    const s = g.current;
    cellsOf(s.piece).forEach(([x, y]) => {
      if (y >= 0) s.board[y * W + x] = s.piece.type + 1;
    });
    const full = Array.from({ length: H }, (_, y) => y).filter(y => s.board.slice(y * W, y * W + W).every(Boolean));
    if (full.length) {
      const prevLevel = Math.floor(s.lines / 10);
      const kept = Array.from({ length: H }, (_, y) => y).filter(y => !full.includes(y)).flatMap(y => s.board.slice(y * W, y * W + W));
      s.board = [...Array(full.length * W).fill(0), ...kept];
      s.lines += full.length;
      s.score += LINE_POINTS[full.length] * (prevLevel + 1);
      s.flash = full;
      setTimeout(() => {
        s.flash = [];
        render();
      }, 180);
      if (Math.floor(s.lines / 10) > prevLevel) sfx('levelup');
      else sfx('lines', full.length);
      if (s.lines >= 10) unlockSecret('stacker');
    } else {
      sfx('drop');
    }
    s.piece = spawn(s.next);
    s.next = drawPiece(s);
    if (!fits(s.board, s.piece)) {
      s.status = 'over';
      setBest(b => Math.max(b, s.score));
      sfx('lose');
    }
    render();
  }, [sfx, setBest, render]);

  const shift = useCallback((dx: number, dy: number) => {
    const s = g.current;
    if (s.status !== 'playing') return false;
    const moved = { ...s.piece, x: s.piece.x + dx, y: s.piece.y + dy };
    if (!fits(s.board, moved)) return false;
    s.piece = moved;
    render();
    return true;
  }, [render]);

  const rotate = () => {
    const s = g.current;
    if (s.status !== 'playing') return;
    for (const kick of [0, -1, 1, -2, 2]) {
      const turned = { ...s.piece, rot: s.piece.rot + 1, x: s.piece.x + kick };
      if (fits(s.board, turned)) {
        s.piece = turned;
        sfx('rotate');
        return render();
      }
    }
  };

  const hardDrop = () => {
    const s = g.current;
    if (s.status !== 'playing') return;
    let dropped = 0;
    while (fits(s.board, { ...s.piece, y: s.piece.y + 1 })) {
      s.piece = { ...s.piece, y: s.piece.y + 1 };
      dropped++;
    }
    s.score += dropped * 2;
    lock();
  };

  const togglePause = () => {
    const s = g.current;
    if (s.status === 'playing') s.status = 'paused';
    else if (s.status === 'paused') s.status = 'playing';
    sfx('click');
    render();
  };

  useEffect(() => {
    if (view.status !== 'playing') return;
    const timer = setInterval(() => {
      if (!shift(0, 1)) lock();
    }, Math.max(90, 750 - (level - 1) * 70));
    return () => clearInterval(timer);
  }, [view.status, level, shift, lock]);

  const handleKey = (e: React.KeyboardEvent) => {
    const s = g.current;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => shift(-1, 0) && sfx('turn'),
      a: () => shift(-1, 0) && sfx('turn'),
      ArrowRight: () => shift(1, 0) && sfx('turn'),
      d: () => shift(1, 0) && sfx('turn'),
      ArrowDown: () => shift(0, 1) && (s.score += 1),
      s: () => shift(0, 1) && (s.score += 1),
      ArrowUp: rotate,
      w: rotate,
      x: rotate,
      ' ': () => (s.status === 'playing' ? hardDrop() : s.status === 'paused' ? togglePause() : start()),
      p: togglePause,
      Escape: togglePause,
    };
    if (!actions[k]) return;
    e.preventDefault();
    e.stopPropagation();
    actions[k]();
  };

  // Compose the visible grid: locked cells, ghost, then active piece.
  const s = view;
  const cells = s.board.map(v => (v ? COLORS[v] : ''));
  if (s.status !== 'ready') {
    let ghost = s.piece;
    while (fits(s.board, { ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 };
    cellsOf(ghost).forEach(([x, y]) => y >= 0 && !cells[y * W + x] && (cells[y * W + x] = 'ghost'));
    if (s.status !== 'over') cellsOf(s.piece).forEach(([x, y]) => y >= 0 && (cells[y * W + x] = COLORS[s.piece.type + 1]));
  }
  const nextCells = cellsOf({ type: s.next, rot: 0, x: 0, y: 0 });
  const pad = `w-11 h-11 rounded-lg flex items-center justify-center active:scale-90 transition ${darkMode ? 'bg-white/10' : 'bg-black/10'}`;

  return (
    <div
      ref={ref}
      tabIndex={0}
      onKeyDown={handleKey}
      className={`flex flex-col items-center h-full w-full p-3 gap-2 outline-none select-none font-mono text-xs ${darkMode ? 'bg-[#0f0f1a]' : 'bg-[#eef0f8]'}`}
    >
      <div className="flex-1 min-h-0 w-full flex justify-center gap-3" style={{ containerType: 'size' }}>
        <div
          style={{ width: 'min(calc(100cqw - 90px), calc(100cqh / 2), 260px)' }}
          className={`relative grid grid-cols-10 gap-px p-1 rounded-lg h-fit ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-300 border border-gray-400/40'}`}
        >
          {cells.map((c, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[2px] ${
                s.flash.includes(Math.floor(i / W)) ? 'bg-white' :
                c === 'ghost' ? (darkMode ? 'border border-white/25' : 'border border-black/25') :
                c ? `${c} shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]` : darkMode ? 'bg-black/40' : 'bg-white/70'
              }`}
            />
          ))}

          {s.status !== 'playing' && (
            <div className="absolute inset-0 rounded-lg bg-black/65 flex flex-col items-center justify-center gap-3 text-white text-center">
              {s.status === 'over' && <span className="text-lg font-bold">STACK OVERFLOW</span>}
              {s.status === 'paused' && <span className="text-lg font-bold">PAUSED</span>}
              <button
                onClick={s.status === 'paused' ? togglePause : start}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-win11-blue text-xs"
              >
                {s.status === 'over' ? <RotateCcw size={13} /> : <Play size={13} />}
                {s.status === 'over' ? 'Retry' : s.status === 'paused' ? 'Resume' : 'Start'}
              </button>
              {s.status === 'ready' && <span className="text-[10px] opacity-70 px-4">← → move · ↑ rotate · space drop · P pause</span>}
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-3 w-[78px] shrink-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <div>
            <div className="text-[9px] uppercase opacity-50 mb-1">Next</div>
            <div className={`relative w-[64px] h-[40px] rounded ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              {nextCells.map(([x, y], i) => (
                <div key={i} className={`absolute w-3 h-3 rounded-[2px] ${COLORS[s.next + 1]}`} style={{ left: 8 + x * 12, top: 8 + y * 12 }} />
              ))}
            </div>
          </div>
          {[['Score', s.score], ['Lines', s.lines], ['Level', level], ['Best', best]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[9px] uppercase opacity-50">{k}</div>
              <div className="font-bold text-sm">{v}</div>
            </div>
          ))}
          {(s.status === 'playing' || s.status === 'paused') && (
            <button onClick={togglePause} className="self-start p-1.5 rounded hover:bg-white/10" title="Pause">
              {s.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 sm:hidden">
        <button onClick={() => shift(-1, 0) && sfx('turn')} className={pad}><ArrowLeft size={18} /></button>
        <button onClick={() => shift(0, 1)} className={pad}><ArrowDown size={18} /></button>
        <button onClick={() => shift(1, 0) && sfx('turn')} className={pad}><ArrowRight size={18} /></button>
        <button onClick={rotate} className={pad}><RotateCw size={18} /></button>
        <button onClick={hardDrop} className={pad}><ChevronsDown size={18} /></button>
      </div>
    </div>
  );
};
