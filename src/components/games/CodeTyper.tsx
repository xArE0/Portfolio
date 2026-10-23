import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, SkipForward } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { unlockSecret } from '../../lib/secrets';
import { useSfx } from '../../lib/gameAudio';

const SNIPPETS = [
  'const greet = (name: string) => `Hello, ${name}!`;',
  'for (let i = 1; i <= 100; i++) console.log(i % 15 ? i % 5 ? i % 3 ? i : "Fizz" : "Buzz" : "FizzBuzz");',
  'def fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)',
  'SELECT name, COUNT(*) AS projects FROM devs GROUP BY name ORDER BY projects DESC;',
  'const [state, setState] = useState(() => readStored("key", fallback));',
  'git commit -m "fix: it works on my machine" && git push --force',
  'while (!coffee.isEmpty()) {\n  code.write();\n}',
  'export default function App() {\n  return <Desktop wallpaper="synthwave" />;\n}',
];

const pick = (not?: string) => {
  const pool = SNIPPETS.filter(s => s !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};

export const CodeTyper: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [snippet, setSnippet] = useState(() => pick());
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [best, setBest] = usePersistentState('typer.best', 0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sfx = useSfx();

  const done = typed === snippet;
  const elapsed = startedAt ? Math.max(1, now - startedAt) / 60000 : 0;
  const correct = [...typed].filter((c, i) => c === snippet[i]).length;
  const wpm = startedAt ? Math.round(correct / 5 / elapsed) : 0;
  const accuracy = typed.length + errors ? Math.round((typed.length / (typed.length + errors)) * 100) : 100;

  useEffect(() => {
    if (!startedAt || done) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, done]);

  useEffect(() => inputRef.current?.focus(), [snippet]);

  const onChange = (value: string) => {
    if (done || value.length > snippet.length) return;
    const t = Date.now();
    if (!startedAt) setStartedAt(t);
    const wrong = value.length > typed.length && value[value.length - 1] !== snippet[value.length - 1];
    if (wrong) setErrors(e => e + 1);
    if (value !== snippet) sfx(wrong ? 'typo' : 'key');
    setTyped(value);
    setNow(t);
    if (value === snippet) {
      const finalWpm = Math.round([...value].length / 5 / (Math.max(1, t - (startedAt ?? t)) / 60000));
      setBest(b => Math.max(b, finalWpm));
      sfx('win');
      if (finalWpm >= 40) unlockSecret('typer');
    }
  };

  const next = (same = false) => {
    setSnippet(s => (same ? s : pick(s)));
    setTyped('');
    setErrors(0);
    setStartedAt(null);
    sfx('click');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-5 h-full overflow-auto font-mono">
      <div className="w-full max-w-[560px] grid grid-cols-3 gap-2 text-center">
        {[['WPM', wpm], ['Accuracy', `${accuracy}%`], ['Best', best]].map(([k, v]) => (
          <div key={k} className={`rounded-lg py-2 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <div className="text-[9px] uppercase opacity-50">{k}</div>
            <div className="text-lg font-bold text-win11-blue">{v}</div>
          </div>
        ))}
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={`relative w-full max-w-[560px] rounded-lg p-4 text-[13px] leading-relaxed whitespace-pre-wrap break-all cursor-text ${
          darkMode ? 'bg-black/40' : 'bg-white border border-gray-200'
        }`}
      >
        {[...snippet].map((ch, i) => {
          const state = i >= typed.length ? 'pending' : typed[i] === ch ? 'ok' : 'bad';
          return (
            <span
              key={i}
              className={`${state === 'ok' ? 'text-emerald-400' : state === 'bad' ? 'bg-rose-500/40 text-rose-200' : 'opacity-40'} ${
                i === typed.length ? 'border-l-2 border-win11-blue animate-pulse' : ''
              }`}
            >
              {ch === '\n' ? '↵\n' : ch}
            </span>
          );
        })}
        <textarea
          ref={inputRef}
          value={typed}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Tab') e.preventDefault();
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="absolute inset-0 opacity-0 resize-none cursor-text"
        />
      </div>

      {done && <div className="text-sm text-emerald-400 font-semibold">{wpm} WPM · {accuracy}% accuracy</div>}

      <div className="flex gap-2 text-[11px]">
        <button onClick={() => next(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current opacity-60 hover:opacity-100">
          <RotateCcw size={12} /> Retry
        </button>
        <button onClick={() => next()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-win11-blue text-white">
          <SkipForward size={12} /> Next snippet
        </button>
      </div>
    </div>
  );
};
