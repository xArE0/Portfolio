import React, { useEffect, useState } from 'react';
import { Code, Database, Cpu, Terminal, Globe, GitBranch, Cloud, Bug, RotateCcw, type LucideIcon } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

const FACES: { Icon: LucideIcon; color: string }[] = [
  { Icon: Code, color: 'text-amber-400' },
  { Icon: Database, color: 'text-emerald-400' },
  { Icon: Cpu, color: 'text-cyan-400' },
  { Icon: Terminal, color: 'text-lime-400' },
  { Icon: Globe, color: 'text-blue-400' },
  { Icon: GitBranch, color: 'text-orange-400' },
  { Icon: Cloud, color: 'text-sky-300' },
  { Icon: Bug, color: 'text-rose-400' },
];

const deal = () =>
  [...FACES.keys(), ...FACES.keys()]
    .map(face => ({ face, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ face }) => face);

export const MemoryGame: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [cards, setCards] = useState(deal);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [best, setBest] = usePersistentState<number | null>('memory.best', null);
  const won = matched.size === cards.length;
  const sfx = useSfx();

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const timer = setTimeout(() => {
      if (cards[a] === cards[b]) {
        const next = new Set(matched).add(a).add(b);
        setMatched(next);
        sfx(next.size === cards.length ? 'win' : 'match');
        if (next.size === cards.length) {
          setBest(prev => (prev === null ? moves : Math.min(prev, moves)));
          if (moves <= 12) unlockSecret('memory');
        }
      } else {
        sfx('miss');
      }
      setFlipped([]);
    }, cards[a] === cards[b] ? 250 : 750);
    return () => clearTimeout(timer);
  }, [flipped, cards, matched, moves, setBest, sfx]);

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.has(i)) return;
    if (flipped.length === 1) setMoves(m => m + 1);
    sfx('flip');
    setFlipped(f => [...f, i]);
  };

  const restart = () => {
    setCards(deal());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    sfx('start');
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 h-full">
      <div className="w-full max-w-[360px] flex items-center justify-between text-xs font-mono">
        <span>Moves {moves}</span>
        <span className="opacity-60">Best {best ?? '—'}</span>
        <button onClick={restart} className="p-1.5 rounded-full hover:bg-white/10" title="Shuffle">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
      <div style={{ width: 'min(100cqw, 100cqh, 380px)' }} className="grid grid-cols-4 gap-2 content-start">
        {cards.map((face, i) => {
          const shown = flipped.includes(i) || matched.has(i);
          const { Icon, color } = FACES[face];
          return (
            <button key={i} onClick={() => flip(i)} className="aspect-square [perspective:600px]">
              <div
                className="relative w-full h-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: shown ? 'rotateY(180deg)' : 'none' }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-win11-blue to-violet-600 [backface-visibility:hidden] flex items-center justify-center">
                  <span className="text-white/70 font-mono text-lg">{'</>'}</span>
                </div>
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    darkMode ? 'bg-neutral-800' : 'bg-white border border-gray-200'
                  } ${matched.has(i) ? 'ring-2 ring-emerald-400/60' : ''}`}
                >
                  <Icon size={26} className={color} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {won && <div className="text-sm font-semibold text-emerald-400">Cleared in {moves} moves!</div>}
    </div>
  );
};
