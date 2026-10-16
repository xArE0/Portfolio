export const GAME_LIST = [
  { id: 'snake', name: 'Snake' },
  { id: 'minesweeper', name: 'Minesweeper' },
  { id: '2048', name: '2048' },
  { id: 'memory', name: 'Memory' },
  { id: 'typer', name: 'Code Typer' },
  { id: 'whack', name: 'Whack-a-Bug' },
];

const EVENT = 'portfolio:arcade';
let pending: string | null = null;

export function launchGame(id: string) {
  pending = id;
  window.dispatchEvent(new Event(EVENT));
}

export function takePendingGame() {
  const id = pending;
  pending = null;
  return id;
}

export function onGameLaunch(handler: () => void) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
