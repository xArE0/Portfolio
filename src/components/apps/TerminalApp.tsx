import React, { useState, useRef, useEffect } from 'react';

interface TerminalAppProps {
  onClose: () => void;
  onThemeChange: (theme: string) => void;
  darkMode: boolean;
}

interface CommandHistory {
  type: 'input' | 'output';
  text: string | React.ReactNode;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  onClose,
  onThemeChange,
  darkMode,
}) => {
  const [history, setHistory] = useState<CommandHistory[]>([
    { type: 'output', text: 'Microsoft Windows [Version 10.0.22631.3527]' },
    { type: 'output', text: '(c) Microsoft Corporation. All rights reserved.' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Type "help" to see available commands, or "neofetch" for system specs.' },
    { type: 'output', text: '' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Auto focus input on mount or click on terminal
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmdStr = inputVal.trim();
    if (!cmdStr) return;

    const newHistory: CommandHistory[] = [...history, { type: 'input', text: `C:\\Users\\Avishek\\portfolio> ${cmdStr}` }];
    const parts = cmdStr.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (command) {
      case 'help':
        newHistory.push({
          type: 'output',
          text: (
            <div className="grid grid-cols-1 gap-1 my-1">
              <div><strong className="text-win11-blue">neofetch</strong> - Display portfolio system information</div>
              <div><strong className="text-win11-blue">skills</strong> - List professional programming skills</div>
              <div><strong className="text-win11-blue">projects</strong> - Show featured engineering projects</div>
              <div><strong className="text-win11-blue">about</strong> - Short bio summary</div>
              <div><strong className="text-win11-blue">themes</strong> - List available desktop wallpapers</div>
              <div><strong className="text-win11-blue">theme &lt;name&gt;</strong> - Set desktop wallpaper (e.g. "theme bloom-dark")</div>
              <div><strong className="text-win11-blue">clear</strong> - Clear the terminal screen</div>
              <div><strong className="text-win11-blue">exit</strong> - Close the terminal app</div>
            </div>
          )
        });
        break;

      case 'neofetch':
        newHistory.push({
          type: 'output',
          text: (
            <div className="flex flex-col sm:flex-row gap-6 my-2 font-mono leading-relaxed">
              <pre className="text-win11-blue font-bold text-xs select-none">
{`    .---.      
   /     \\     
   \\     /     
    \`---'      
  /|     |\\    
 / |     | \\   
/  |_____|  \\  
   /     \\     
  /       \\    
 /         \\   
/           \\  `}
              </pre>
              <div className="text-[11px]">
                <div className="text-win11-blue font-bold text-xs">Avishek Shrestha @ PortfolioOS</div>
                <div className="text-gray-400">------------------------------</div>
                <div><strong className="text-gray-300">OS:</strong> Windows 11 Portfolio Edition v2026.6</div>
                <div><strong className="text-gray-300">Host:</strong> Cloudflare Pages Static Hosting</div>
                <div><strong className="text-gray-300">Kernel:</strong> React 19.0.0 / TypeScript</div>
                <div><strong className="text-gray-300">DE:</strong> Fluent Desktop Experience (Tailwind)</div>
                <div><strong className="text-gray-300">WM:</strong> Antigravity Window Manager</div>
                <div><strong className="text-gray-300">Uptime:</strong> Operational</div>
                <div><strong className="text-gray-300">Resolution:</strong> Responsive Web Display</div>
                <div><strong className="text-gray-300">CPU:</strong> Intel Core i9 (16 Cores - Simulated)</div>
                <div><strong className="text-gray-300">Memory:</strong> 16GB DDR5 RAM</div>
                <div><strong className="text-gray-300">Core Stack:</strong> TypeScript, React, Python, SQL, PostgreSQL</div>
              </div>
            </div>
          )
        });
        break;

      case 'about':
        newHistory.push({
          type: 'output',
          text: 'Avishek Shrestha is a Full-Stack developer who enjoys engineering interactive and responsive applications, scaling API gateways, and designing aesthetic frontends.'
        });
        break;

      case 'skills':
        newHistory.push({
          type: 'output',
          text: (
            <div className="my-1.5 flex flex-col gap-1 text-[11px]">
              <div><strong>Languages:</strong> TypeScript, JavaScript, Python, SQL, HTML, CSS</div>
              <div><strong>Frameworks:</strong> React.js, Next.js, Django, FastAPI, Express.js</div>
              <div><strong>Databases:</strong> PostgreSQL, MongoDB, MySQL, Redis</div>
              <div><strong>Tools:</strong> Git, Docker, Cloudflare, Linux, Vite, Postman</div>
            </div>
          )
        });
        break;

      case 'projects':
        newHistory.push({
          type: 'output',
          text: (
            <div className="my-1 flex flex-col gap-1.5 text-[11px]">
              <div>💼 <span className="font-semibold text-amber-400">Urbanfinder-Web:</span> Property browsing platform built in React & TypeScript.</div>
              <div>💼 <span className="font-semibold text-emerald-400">Urbanfinder-Backend:</span> High-performance Django API server.</div>
              <div>💼 <span className="font-semibold text-cyan-400">PortfolioOS:</span> Interactive desktop web simulator mimicking Windows 11 layout.</div>
              <div className="text-gray-400 mt-1">Hint: Open the File Explorer app on the desktop to see images and full code links for these projects!</div>
            </div>
          )
        });
        break;

      case 'themes':
        newHistory.push({
          type: 'output',
          text: 'Available wallpapers: "profile", "bloom-light", "bloom-dark", "fluid-aurora", "cyber-grid"'
        });
        break;

      case 'theme':
        if (['profile', 'bloom-light', 'bloom-dark', 'fluid-aurora', 'cyber-grid'].includes(arg)) {
          onThemeChange(arg);
          newHistory.push({ type: 'output', text: `Wallpaper successfully changed to "${arg}"` });
        } else {
          newHistory.push({ type: 'output', text: `Unknown wallpaper "${arg}". Type "themes" to see the list.` });
        }
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
        onClose();
        setInputVal('');
        return;

      default:
        newHistory.push({ type: 'output', text: `'${command}' is not recognized as an internal or external command, operable program or batch file. Type "help" for a list of commands.` });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div 
      onClick={focusInput}
      className={`flex-1 flex flex-col p-3 font-mono text-[11px] leading-relaxed select-text cursor-text overflow-y-auto ${
        darkMode ? 'bg-[#0f0f0f] text-gray-200' : 'bg-gray-900 text-gray-100'
      }`}
    >
      {/* Scrollable Output */}
      <div className="flex-1 overflow-y-auto pr-1">
        {history.map((line, idx) => (
          <div key={idx} className="mb-1 whitespace-pre-wrap">
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleCommand} className="flex items-center gap-1.5 select-none mt-2">
        <span className="text-emerald-500 font-semibold whitespace-nowrap">
          C:\Users\Avishek\portfolio&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 focus:outline-none font-mono"
          spellCheck="false"
          autoFocus
        />
      </form>
    </div>
  );
};
