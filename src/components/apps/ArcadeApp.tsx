import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bomb, Brain, Bug, Grid2x2, Keyboard, Gamepad2, Lock, type LucideIcon } from 'lucide-react';
import { onGameLaunch, takePendingGame } from '../../lib/arcade';
import { useFoundSecrets } from '../../lib/secrets';
import { Snake } from '../games/Snake';
import { Minesweeper } from '../games/Minesweeper';
import { Game2048 } from '../games/Game2048';
import { MemoryGame } from '../games/MemoryGame';
import { CodeTyper } from '../games/CodeTyper';
import { WhackABug } from '../games/WhackABug';

interface GameDef {
  id: string;
  name: string;
  Icon: LucideIcon;
  tile: string;
  Component: React.FC<{ darkMode: boolean }>;
}

const GAMES: GameDef[] = [
  { id: 'snake', name: 'Snake', Icon: Gamepad2, tile: 'from-lime-500 to-emerald-700', Component: Snake },
  { id: 'minesweeper', name: 'Minesweeper', Icon: Bomb, tile: 'from-slate-500 to-slate-800', Component: Minesweeper },
  { id: '2048', name: '2048', Icon: Grid2x2, tile: 'from-amber-400 to-orange-600', Component: Game2048 },
  { id: 'memory', name: 'Memory', Icon: Brain, tile: 'from-fuchsia-500 to-violet-700', Component: MemoryGame },
  { id: 'typer', name: 'Code Typer', Icon: Keyboard, tile: 'from-sky-400 to-blue-700', Component: CodeTyper },
  { id: 'whack', name: 'Whack-a-Bug', Icon: Bug, tile: 'from-rose-500 to-red-700', Component: WhackABug },
];

export const ArcadeApp: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [gameId, setGameId] = useState<string | null>(takePendingGame);
  const found = useFoundSecrets();
  const game = GAMES.find(g => g.id === gameId);

  useEffect(() => onGameLaunch(() => setGameId(takePendingGame())), []);

  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${darkMode ? 'bg-[#141418] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${darkMode ? 'bg-[#1d1d23] border-white/5' : 'bg-[#e9e9e9] border-gray-200'}`}>
        {game ? (
          <>
            <button onClick={() => setGameId(null)} className={`p-1 rounded ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`} title="Back">
              <ArrowLeft size={14} />
            </button>
            <game.Icon size={14} />
            <span className="font-semibold">{game.name}</span>
          </>
        ) : (
          <span className="font-semibold px-1">Arcade</span>
        )}
      </div>

      {game ? (
        <div key={game.id} className="flex-1 min-h-0 overflow-hidden animate-fade-in">
          <game.Component darkMode={darkMode} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GAMES.map((g, idx) => {
              const beaten = found.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => setGameId(g.id)}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg animate-slide-up ${
                    darkMode ? 'bg-white/[0.03] border-white/10 hover:border-white/25' : 'bg-white border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.tile} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <g.Icon size={28} className="text-white" />
                  </div>
                  <span className="font-semibold text-[12px]">{g.name}</span>
                  <span className="absolute top-2 right-2 opacity-60" title={beaten ? 'Mastered' : 'Not mastered'}>
                    {beaten ? <span className="text-amber-400">★</span> : <Lock size={10} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
