import React, { useEffect, useRef, useState } from 'react';
import { Bug, Rocket, Play, RotateCcw } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { playSound } from '../../lib/sound';
import { useSystem } from '../../system';

type Mole = { kind: 'bug' | 'feature'; id: number } | null;

const HOLES = 9;
const DURATION = 30;

export const WhackABug: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const { soundEnabled } = useSystem();
  const [holes, setHoles] = useState<Mole[]>(() => Array(HOLES).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [playing, setPlaying] = useState(false);
  const [hit, setHit] = useState<number | null>(null);
  const [best, setBest] = usePersistentState('whack.best', 0);
  const idRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const clock = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(clock);
  }, [playing]);

  useEffect(() => {
    if (!playing || timeLeft > 0) return;
    const timer = setTimeout(() => {
      setPlaying(false);
      setHoles(Array(HOLES).fill(null));
      setBest(b => Math.max(b, scoreRef.current));
      if (scoreRef.current >= 25) unlockSecret('whack');
    }, 0);
    return () => clearTimeout(timer);
  }, [playing, timeLeft, setBest]);

  useEffect(() => {
    if (!playing || timeLeft <= 0) return;
    const speed = Math.max(380, 900 - (DURATION - timeLeft) * 18);
    const spawn = setInterval(() => {
      const id = ++idRef.current;
      const slot = Math.floor(Math.random() * HOLES);
      const kind = Math.random() < 0.2 ? 'feature' : 'bug';
      setHoles(prev => prev.map((m, i) => (i === slot && !m ? { kind, id } : m)));
      setTimeout(() => setHoles(prev => prev.map(m => (m?.id === id ? null : m))), speed * 1.4);
    }, speed);
    return () => clearInterval(spawn);
  }, [playing, timeLeft]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(DURATION);
    setHoles(Array(HOLES).fill(null));
    setPlaying(true);
  };

  const whack = (i: number) => {
    const mole = holes[i];
    if (!playing || !mole) return;
    const delta = mole.kind === 'bug' ? 1 : -3;
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
    setHit(i);
    setTimeout(() => setHit(h => (h === i ? null : h)), 150);
    setHoles(prev => prev.map((m, j) => (j === i ? null : m)));
    if (soundEnabled) playSound(mole.kind === 'bug' ? 'beep' : 'error');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-5 h-full select-none">
      <div className="w-full max-w-[360px] flex justify-between font-mono text-xs">
        <span>Bugs squashed: {score}</span>
        <span className={timeLeft <= 5 && playing ? 'text-rose-400' : ''}>{timeLeft}s</span>
        <span className="opacity-60">Best {best}</span>
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-center" style={{ containerType: 'size' }}>
      <div style={{ width: 'min(100cqw, 100cqh, 380px)' }} className="relative grid grid-cols-3 gap-3 content-start">
        {holes.map((m, i) => (
          <button
            key={i}
            onPointerDown={() => whack(i)}
            className={`aspect-square rounded-full flex items-center justify-center overflow-hidden transition-transform ${
              darkMode ? 'bg-neutral-800 shadow-[inset_0_6px_12px_rgba(0,0,0,0.6)]' : 'bg-gray-300 shadow-[inset_0_6px_12px_rgba(0,0,0,0.2)]'
            } ${hit === i ? 'scale-90' : ''}`}
          >
            {m && (
              <div key={m.id} className="animate-slide-up">
                {m.kind === 'bug' ? <Bug size={40} className="text-lime-400 drop-shadow" /> : <Rocket size={40} className="text-sky-400 drop-shadow" />}
              </div>
            )}
          </button>
        ))}

        {!playing && (
          <div className="absolute inset-0 rounded-xl bg-black/60 flex flex-col items-center justify-center gap-3 text-white text-center p-4">
            {timeLeft === 0 && <span className="text-lg font-bold">{score} bugs squashed</span>}
            <span className="text-[11px] opacity-80 flex items-center gap-2">
              <Bug size={14} className="text-lime-400" /> +1 &nbsp; <Rocket size={14} className="text-sky-400" /> −3
            </span>
            <button onClick={start} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-win11-blue text-xs">
              {timeLeft === 0 ? <RotateCcw size={13} /> : <Play size={13} />}
              {timeLeft === 0 ? 'Again' : 'Start'}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
