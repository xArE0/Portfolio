import React, { useState, useRef, useEffect } from 'react';
import { APPS } from '../../apps';
import { ACCENTS, useSystem } from '../../system';
import { loadProjects } from '../../contentLoader';
import { WALLPAPERS } from '../../lib/wallpapers';
import { SECRETS, unlockSecret, useFoundSecrets } from '../../lib/secrets';
import { CONTACT } from '../../lib/contact';
import { GAME_LIST, launchGame } from '../../lib/arcade';

interface TerminalAppProps {
  onClose: () => void;
}

interface Line {
  id: number;
  kind: 'input' | 'output' | 'error';
  content: React.ReactNode;
}

const PROMPT = 'C:\\Users\\Avishek\\portfolio>';

const FILES: Record<string, string> = {
  'about.txt': 'Full-Stack developer who enjoys building interactive apps, scalable APIs and aesthetic frontends.',
  'skills.json': '{ "languages": ["TypeScript", "Python", "SQL"], "frameworks": ["React", "Django", "FastAPI"] }',
  'contact.txt': `${CONTACT.email}\n${CONTACT.github}\n${CONTACT.linkedin}`,
  'todo.md': '- [x] build portfolio\n- [x] hide easter eggs\n- [ ] touch grass',
};

const HIDDEN_FILES: Record<string, string> = {
  '.env': 'API_KEY=hunter2\n# just kidding',
  '.secrets': 'There are more secrets than files. Try `secrets` and `hint`.',
};

const FORTUNES = [
  'There are 10 kinds of people: those who understand binary and those who don\'t.',
  'It works on my machine. Ship the machine.',
  'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
  'Weeks of coding can save you hours of planning.',
  '!false — it\'s funny because it\'s true.',
  'The best code is no code at all.',
  'Debugging: being the detective in a crime movie where you are also the murderer.',
];

const HELP: [string, string][] = [
  ['about', 'Short bio'],
  ['skills', 'Tech stack'],
  ['projects', 'Featured projects'],
  ['neofetch', 'System information'],
  ['ls / cat <file>', 'Browse files'],
  ['open <app>', 'Launch an app'],
  ['games / play <game>', 'Arcade'],
  ['theme <name>', 'Change wallpaper (themes to list)'],
  ['accent <1-7|#hex>', 'Change accent color'],
  ['mode <dark|light>', 'Switch color mode'],
  ['sound <on|off>', 'Toggle system sounds'],
  ['contact', 'Ways to reach me'],
  ['fortune', 'Developer wisdom'],
  ['secrets / hint', 'Easter egg progress'],
  ['history / clear', 'Session utilities'],
  ['restart / shutdown / exit', 'Power'],
];

const COMMANDS = [
  'about', 'skills', 'projects', 'neofetch', 'ls', 'dir', 'cat', 'type', 'open', 'apps', 'theme', 'themes', 'accent', 'mode',
  'sound', 'contact', 'github', 'linkedin', 'email', 'fortune', 'joke', 'secrets', 'hint', 'history', 'clear', 'cls',
  'restart', 'shutdown', 'exit', 'help', 'whoami', 'date', 'echo', 'cowsay', 'ping', 'games', 'play',
];

const cowsay = (text: string) => {
  const bar = '-'.repeat(text.length + 2);
  return ` ${bar}\n< ${text} >\n ${bar}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
};

export const TerminalApp: React.FC<TerminalAppProps> = ({ onClose }) => {
  const { darkMode, setDarkMode, setWallpaper, setAccent, setSoundEnabled, openApp, power, triggerEffect } = useSystem();
  const found = useFoundSecrets();
  const idRef = useRef(0);
  const [lines, setLines] = useState<Line[]>(() => [
    { id: -2, kind: 'output', content: 'PortfolioOS [Version 10.0.22631]' },
    { id: -1, kind: 'output', content: 'Type "help" to get started.\n ' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const print = (content: React.ReactNode, kind: Line['kind'] = 'output') =>
    setLines(prev => [...prev, { id: idRef.current++, kind, content }]);

  const printLater = (items: React.ReactNode[], step: number, then?: () => void) => {
    items.forEach((item, i) => timers.current.push(setTimeout(() => print(item), step * (i + 1))));
    if (then) timers.current.push(setTimeout(then, step * (items.length + 1)));
  };

  const run = (raw: string) => {
    const [name = '', ...rest] = raw.split(/\s+/);
    const cmd = name.toLowerCase();
    const arg = rest.join(' ');
    const argLower = arg.toLowerCase();

    if (/^(sudo\s+)?rm\s+-(rf|fr)\s+(\/|\*|c:\\?)(\s|$)/i.test(raw)) {
      if (cmd !== 'sudo') return print('rm: permission denied. Maybe with more privileges...', 'error');
      printLater(['Deleting System32...', 'Deleting node_modules... (this may take a while)', 'Deleting common_sense.sys...'], 500, () => triggerEffect('bsod'));
      return;
    }

    switch (cmd) {
      case 'help':
        return print(
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 my-1">
            {HELP.map(([c, d]) => (
              <React.Fragment key={c}>
                <strong className="text-win11-blue">{c}</strong>
                <span className="opacity-80">{d}</span>
              </React.Fragment>
            ))}
          </div>,
        );

      case 'about':
        return print(FILES['about.txt']);

      case 'whoami':
        return print('guest\\visitor — but you can call me friend.');

      case 'date':
        return print(new Date().toString());

      case 'echo':
        return print(arg || ' ');

      case 'skills':
        return print(
          <div className="my-1 flex flex-col gap-0.5">
            <div><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL, PHP</div>
            <div><strong>Frameworks:</strong> React, Next.js, Django, FastAPI, Laravel, Express</div>
            <div><strong>Databases:</strong> PostgreSQL, MySQL, MongoDB, Redis</div>
            <div><strong>Tools:</strong> Git, Docker, Linux, Vite, Cloudflare, Postman</div>
          </div>,
        );

      case 'projects':
        return print(
          <div className="my-1 flex flex-col gap-1">
            {loadProjects().map(p => (
              <div key={p.id}>
                <span className="font-semibold text-amber-400">{p.meta.name}</span>
                <span className="opacity-70"> — {p.meta.technologies?.slice(0, 3).join(', ')}</span>
              </div>
            ))}
          </div>,
        );

      case 'neofetch':
        return print(
          <div className="flex flex-col sm:flex-row gap-6 my-2">
            <pre className="text-win11-blue font-bold leading-tight">{`################  ################
################  ################
################  ################
################  ################
################  ################

################  ################
################  ################
################  ################
################  ################
################  ################`}</pre>
            <div>
              <div className="text-win11-blue font-bold">avishek@portfolio-os</div>
              <div className="opacity-50">--------------------</div>
              {[
                ['OS', 'PortfolioOS 2026.10'],
                ['Kernel', 'React 19 / TypeScript'],
                ['Shell', 'portfolio-sh 2.0'],
                ['DE', 'Fluent (Tailwind CSS)'],
                ['Uptime', `${Math.floor(performance.now() / 60000)} mins`],
                ['Secrets', `${found.length}/${SECRETS.length}`],
                ['Stack', 'TypeScript, React, Python, SQL'],
              ].map(([k, v]) => (
                <div key={k}><strong className="text-win11-blue">{k}:</strong> {v}</div>
              ))}
            </div>
          </div>,
        );

      case 'ls':
      case 'dir': {
        const all = argLower.includes('-a');
        const names = [...Object.keys(FILES), ...(all ? Object.keys(HIDDEN_FILES) : [])];
        return print(names.join('    '));
      }

      case 'cat':
      case 'type': {
        const content = FILES[arg] ?? HIDDEN_FILES[arg];
        if (!arg) return print('Usage: cat <file>', 'error');
        return content ? print(content) : print(`cat: ${arg}: No such file`, 'error');
      }

      case 'apps':
        return print(APPS.filter(a => !a.hidden).map(a => a.id).join('    '));

      case 'open':
      case 'start': {
        const target = APPS.find(a => a.id === argLower || a.label.toLowerCase() === argLower || a.shortLabel.toLowerCase() === argLower);
        if (!target) return print(`open: unknown app "${arg}". Try "apps".`, 'error');
        openApp(target.id);
        return print(`Launching ${target.title}...`);
      }

      case 'themes':
        return print(WALLPAPERS.map(w => (w.secretsRequired && found.length < w.secretsRequired ? `${w.id} (locked)` : w.id)).join('    '));

      case 'theme': {
        const wp = WALLPAPERS.find(w => w.id === argLower);
        if (!wp) return print(`Unknown theme "${arg}". Type "themes".`, 'error');
        if (wp.secretsRequired && found.length < wp.secretsRequired) return print(`"${wp.id}" is locked. Find ${wp.secretsRequired} secrets.`, 'error');
        setWallpaper(wp.id);
        return print(`Wallpaper set to ${wp.name}`);
      }

      case 'accent': {
        const color = /^[1-7]$/.test(arg) ? ACCENTS[Number(arg) - 1] : /^#[0-9a-f]{6}$/i.test(arg) ? arg : null;
        if (!color) return print(`Usage: accent <1-7|#rrggbb>`, 'error');
        setAccent(color);
        return print(<span>Accent set to <span style={{ color }}>{color}</span></span>);
      }

      case 'mode':
        if (argLower !== 'dark' && argLower !== 'light') return print(`Current mode: ${darkMode ? 'dark' : 'light'}`);
        setDarkMode(argLower === 'dark');
        return print(`Switched to ${argLower} mode`);

      case 'sound':
        if (argLower !== 'on' && argLower !== 'off') return print('Usage: sound <on|off>', 'error');
        setSoundEnabled(argLower === 'on');
        return print(`Sound ${argLower}`);

      case 'contact':
        return print(FILES['contact.txt']);

      case 'github':
      case 'linkedin':
      case 'email': {
        const url = cmd === 'email' ? `mailto:${CONTACT.email}` : CONTACT[cmd as 'github' | 'linkedin'];
        window.open(url, cmd === 'email' ? '_self' : '_blank', 'noopener');
        return print(`Opening ${cmd}...`);
      }

      case 'fortune':
      case 'joke':
        return print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);

      case 'cowsay':
        return print(<pre>{cowsay(arg || 'Moo. Hire Avishek.')}</pre>);

      case 'ping':
        printLater(
          [0, 1, 2, 3].map(i => `Reply from ${arg || 'localhost'}: bytes=32 time=${4 + i * 3}ms TTL=64`),
          350,
        );
        return print(`Pinging ${arg || 'localhost'} with 32 bytes of data:`);

      case 'secrets':
        return print(
          <div className="my-1 flex flex-col gap-0.5">
            <div className="text-win11-blue font-bold">Secrets found: {found.length}/{SECRETS.length}</div>
            {SECRETS.map(s => (
              <div key={s.id} className={found.includes(s.id) ? 'text-emerald-400' : 'opacity-40'}>
                {found.includes(s.id) ? `✔ ${s.title}` : '✘ ???'}
              </div>
            ))}
          </div>,
        );

      case 'hint': {
        const remaining = SECRETS.filter(s => !found.includes(s.id));
        if (remaining.length === 0) return print('You found everything. Nothing left to hint at.');
        return print(`Hint: ${remaining[Math.floor(Math.random() * remaining.length)].hint}`);
      }

      case 'history':
        return print(history.map((h, i) => `${i + 1}  ${h}`).join('\n') || 'No history yet.');

      case 'clear':
      case 'cls':
        setLines([]);
        return;

      case 'restart':
      case 'reboot':
        return power('restart');

      case 'shutdown':
        return power('shutdown');

      case 'exit':
        return onClose();

      case 'sudo':
        unlockSecret('sudo');
        return print('guest is not in the sudoers file. This incident will be reported.', 'error');

      case 'rm':
        return print('rm: I\'d rather not.', 'error');

      case 'matrix':
      case 'neo':
        print('Wake up, Neo... The Matrix has you. (Esc to exit)');
        return triggerEffect('matrix');

      case 'coffee':
      case 'brew':
        unlockSecret('coffee');
        return print(
          <pre className="text-amber-400">{`   ( (\n    ) )\n  ........\n  |      |]\n  \\      /\n   \`----'\nHTTP 418: I'm a teapot. Brewing tea instead.`}</pre>,
        );

      case 'barrel':
      case 'do':
        if (cmd === 'do' && argLower !== 'a barrel roll') break;
        return triggerEffect('barrel-roll');

      case 'games':
        return print(GAME_LIST.map(g => g.id).join('    '));

      case 'play':
      case 'snake':
      case 'minesweeper':
      case '2048': {
        const query = cmd === 'play' ? argLower : cmd;
        const game = GAME_LIST.find(g => g.id === query || g.name.toLowerCase() === query);
        if (!game) return print(`play: unknown game "${arg}". Try "games".`, 'error');
        launchGame(game.id);
        openApp('arcade');
        return print(`Loading ${game.name}...`);
      }

      case 'hello':
      case 'hi':
      case 'hey':
        return print('Hey there! 👋 Thanks for stopping by.');

      case 'xyzzy':
        return print('A hollow voice says "Wrong app."');

      case '42':
        return print('The answer to life, the universe and everything. But what is the question?');

      case 'vim':
      case 'vi':
      case 'nano':
      case 'emacs':
        return print(`${cmd}: you'd never escape. Type :q! to... oh wait, wrong shell.`);

      case 'git':
        if (argLower.startsWith('blame')) return print('It was you. It\'s always you.');
        if (argLower.startsWith('push')) return print('Everything up-to-date. Unlike your documentation.');
        return print('git: try "git blame" or "git push".');

      case 'hack':
        printLater(
          ['Bypassing firewall...', 'Decrypting mainframe... ██████████ 100%', 'Downloading more RAM...', 'Access granted. Just kidding — this is a portfolio.'],
          400,
        );
        return print('Initializing hack.exe');

      case 'sl':
        return print(
          <pre className="leading-tight">{`      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|_
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\\___/
  \\_/      \\O=====O=====O=====O_/      \\_/
You meant "ls". Choo choo.`}</pre>,
        );
    }

    print(`'${name}' is not recognized as an internal or external command. Type "help".`, 'error');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    setInput('');
    setHistoryIdx(null);
    print(`${PROMPT} ${raw}`, 'input');
    if (!raw) return;
    setHistory(prev => [...prev, raw]);
    run(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (history.length === 0) return;
      e.preventDefault();
      const next = e.key === 'ArrowUp'
        ? Math.max(0, (historyIdx ?? history.length) - 1)
        : historyIdx === null ? null : historyIdx + 1;
      if (next === null || next >= history.length) {
        setHistoryIdx(null);
        setInput('');
      } else {
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [cmd, ...rest] = input.split(' ');
      const options = rest.length === 0
        ? COMMANDS.filter(c => c.startsWith(cmd.toLowerCase()))
        : cmd === 'open'
          ? APPS.filter(a => !a.hidden).map(a => a.id).filter(id => id.startsWith(rest.join(' ')))
          : cmd === 'play'
            ? GAME_LIST.map(g => g.id).filter(id => id.startsWith(rest.join(' ')))
          : cmd === 'cat' || cmd === 'type'
            ? Object.keys(FILES).filter(f => f.startsWith(rest.join(' ')))
            : [];
      if (options.length === 1) setInput(rest.length === 0 ? `${options[0]} ` : `${cmd} ${options[0]}`);
      else if (options.length > 1) print(options.join('    '));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex-1 flex flex-col p-3 font-mono text-[11px] leading-relaxed select-text cursor-text overflow-y-auto ${
        darkMode ? 'bg-[#0f0f0f] text-gray-200' : 'bg-gray-900 text-gray-100'
      }`}
    >
      <div className="flex-1 overflow-y-auto pr-1">
        {lines.map(line => (
          <div
            key={line.id}
            className={`mb-1 whitespace-pre-wrap break-words ${line.kind === 'error' ? 'text-red-400' : line.kind === 'input' ? 'text-gray-400' : ''}`}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-1.5 select-none mt-2">
        <span className="text-emerald-500 font-semibold whitespace-nowrap">{PROMPT}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-white font-mono"
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
        />
      </form>
    </div>
  );
};
