import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

type Status = 'ready' | 'showing' | 'input' | 'correct' | 'over';

const PADS = [
  { base: 'bg-emerald-600', lit: 'bg-emerald-300 shadow-[0_0_40px_rgba(110,231,183,0.9)]', key: '1', corner: 'rounded-tl-[100%]' },
  { base: 'bg-rose-600', lit: 'bg-rose-300 shadow-[0_0_40px_rgba(253,164,175,0.9)]', key: '2', corner: 'rounded-tr-[100%]' },
  { base: 'bg-amber-500', lit: 'bg-amber-200 shadow-[0_0_40px_rgba(253,230,138,0.9)]', key: '3', corner: 'rounded-bl-[100%]' },
  { base: 'bg-sky-600', lit: 'bg-sky-300 shadow-[0_0_40px_rgba(125,211,252,0.9)]', key: '4', corner: 'rounded-br-[100%]' },
];

const randomPad = () => Math.floor(Math.random() * PADS.length);

export const Simon: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const sfx = useSfx();
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('ready');
  const [best, setBest] = usePersistentState('simon.best', 0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const round = sequence.length;

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Play back the sequence whenever a new round begins.
  useEffect(() => {
    if (status !== 'showing') return;
    const gap = Math.max(260, 600 - sequence.length * 25);
    const local: ReturnType<typeof setTimeout>[] = [];
    sequence.forEach((pad, i) => {
      local.push(setTimeout(() => {
        setLit(pad);
        sfx('pad', pad);
      }, 500 + i * gap));
      local.push(setTimeout(() => setLit(null), 500 + i * gap + gap * 0.6));
    });
    local.push(setTimeout(() => {
      setStep(0);
      setStatus('input');
    }, 500 + sequence.length * gap));
    return () => local.forEach(clearTimeout);
  }, [status, sequence, sfx]);

  const nextRound = (seq: number[]) => {
    setSequence([...seq, randomPad()]);
    setStatus('showing');
  };

  const start = () => {
    timers.current.forEach(clearTimeout);
    sfx('start');
    setSequence([]);
    later(() => nextRound([]), 400);
  };

  const press = (pad: number) => {
    if (status !== 'input') return;
    setLit(pad);
    later(() => setLit(l => (l === pad ? null : l)), 180);
    if (pad !== sequence[step]) {
      sfx('bad');
      setStatus('over');
      setBest(b => Math.max(b, round - 1));
      return;
    }
    sfx('pad', pad);
    if (step + 1 < sequence.length) return setStep(step + 1);
    setBest(b => Math.max(b, round));
    if (round >= 10) unlockSecret('simon');
    setStatus('correct');
    later(() => {
      if (round % 5 === 0) sfx('levelup');
      nextRound(sequence);
    }, 450);
  };

  const label = status === 'ready' ? 'Press start' : status === 'showing' ? 'Watch…' : status === 'input' ? 'Your turn' : status === 'correct' ? 'Nice!' : 'Wrong pad!';

  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        const pad = PADS.findIndex(p => p.key === e.key);
        if (pad < 0) return;
        e.preventDefault();
        e.stopPropagation();
        press(pad);
      }}
      className={`flex flex-col items-center h-full w-full p-4 gap-3 outline-none select-none font-mono text-xs ${darkMode ? 'bg-[#111114]' : 'bg-[#f3f3f3]'}`}
    >
      <div className="w-full max-w-[340px] flex justify-between">
        <span>ROUND {round}</span>
        <span className={status === 'over' ? 'text-rose-400' : status === 'input' || status === 'correct' ? 'text-emerald-400' : 'opacity-60'}>{label}</span>
        <span className="opacity-60">BEST {best}</span>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center items-start" style={{ containerType: 'size' }}>
        <div
          style={{ width: 'min(100cqw, 100cqh, 340px)' }}
          className={`relative aspect-square rounded-full p-3 grid grid-cols-2 gap-3 ${darkMode ? 'bg-neutral-900 shadow-[0_0_0_6px_#262626]' : 'bg-neutral-800'}`}
        >
          {PADS.map((p, i) => (
            <button
              key={i}
              onPointerDown={() => press(i)}
              className={`${p.corner} transition-all duration-100 ${lit === i ? p.lit : `${p.base} opacity-80`} ${status === 'input' ? 'hover:opacity-100 cursor-pointer' : 'cursor-default'}`}
              aria-label={`Pad ${p.key}`}
            />
          ))}
          <div className="absolute inset-[32%] rounded-full bg-neutral-900 border-4 border-neutral-700 flex flex-col items-center justify-center text-white gap-1">
            {status === 'ready' || status === 'over' ? (
              <button onClick={start} className="flex flex-col items-center gap-1 hover:scale-105 transition">
                {status === 'over' ? <RotateCcw size={20} /> : <Play size={20} />}
                <span className="text-[10px]">{status === 'over' ? 'AGAIN' : 'START'}</span>
              </button>
            ) : (
              <span className="text-2xl font-bold">{round}</span>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] opacity-50">Keys 1–4 or tap the pads · reach round 10</div>
    </div>
  );
};
