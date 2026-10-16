import { useSyncExternalStore } from 'react';
import { readStored, writeStored } from '../hooks/usePersistentState';

export interface Secret {
  id: string;
  title: string;
  hint: string;
}

export const SECRETS: Secret[] = [
  { id: 'konami', title: 'Old School', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
  { id: 'matrix', title: 'Red Pill', hint: 'Follow the white rabbit in the terminal.' },
  { id: 'sudo', title: 'Not In The Sudoers File', hint: 'Ask the terminal nicely, with superpowers.' },
  { id: 'bsod', title: 'Blue Screen Of Death', hint: 'Some commands should never be run as root.' },
  { id: 'coffee', title: "I'm A Teapot", hint: 'Developers run on caffeine. Ask for some.' },
  { id: 'barrel-roll', title: 'Do A Barrel Roll', hint: 'Star Fox knows what to search for.' },
  { id: 'brand', title: 'Brand Loyalty', hint: 'The monitor has a name. Poke it.' },
  { id: 'binary-clock', title: '10 Kinds Of People', hint: 'Time is just ones and zeros. Click it.' },
  { id: 'recycle', title: 'Dumpster Diver', hint: 'Not everything deleted is gone.' },
  { id: 'xyzzy', title: 'Colossal Cave', hint: 'A magic word, written somewhere you take notes.' },
  { id: 'snake', title: 'Snake Charmer', hint: 'Score 10 in Snake.' },
  { id: 'minesweeper', title: 'Bomb Squad', hint: 'Clear a minefield without a scratch.' },
  { id: '2048', title: 'Tile Tycoon', hint: 'Merge your way to 512.' },
  { id: 'memory', title: 'Photographic Memory', hint: 'Match every pair in 12 moves or less.' },
  { id: 'typer', title: 'Keyboard Warrior', hint: 'Type code at 40 WPM or faster.' },
  { id: 'whack', title: 'Exterminator', hint: 'Squash 25 bugs before time runs out.' },
  { id: 'devtools', title: 'Inspector Gadget', hint: 'Developers always open the console.' },
  { id: 'night-owl', title: 'Night Owl', hint: 'Visit when sensible people are asleep.' },
];

const KEY = 'secrets';
const EVENT = 'portfolio:secret';
let found: string[] = readStored<string[]>(KEY, []).filter(id => SECRETS.some(s => s.id === id));
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(l => l());

export function unlockSecret(id: string) {
  const secret = SECRETS.find(s => s.id === id);
  if (!secret || found.includes(id)) return;
  found = [...found, id];
  writeStored(KEY, found);
  emit();
  window.dispatchEvent(new CustomEvent<Secret>(EVENT, { detail: secret }));
}

export function resetSecrets() {
  found = [];
  writeStored(KEY, found);
  emit();
}

export const getFoundSecrets = () => found;

export function onSecretUnlocked(handler: (secret: Secret) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Secret>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useFoundSecrets = () => useSyncExternalStore(subscribe, getFoundSecrets);
