import React, { useState } from 'react';

interface NotepadAppProps {
  darkMode: boolean;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({ darkMode }) => {
  const [text, setText] = useState(`===================================================
ABOUT ME - AVISHEK SHRESTHA
===================================================

👋 Hi there! I'm Avishek, a passionate Full-Stack Software Developer.
I specialize in building premium web applications with modern design
architectures, robust backends, and pixel-perfect responsive user interfaces.

🚀 MY WORK PHILOSOPHY
-------------------
I believe that code should not only compile but also be elegant,
maintainable, and highly performant. From smooth UI micro-animations 
to optimizing SQL query execution plans, I love polishing every layer.

💻 MY CURRENT TECH STACK
------------------------
- Frontend: React.js, TypeScript, Next.js, Tailwind CSS, HTML5/CSS3
- Backend: Python (Django/FastAPI), Node.js (Express), RESTful APIs
- Database: PostgreSQL, MySQL, Redis, MongoDB
- Devops & Deployments: Cloudflare Pages, GitHub Actions, Docker, Linux

📚 BACKGROUND & EDUCATION
-------------------------
I have a solid background in Computer Science & Software Engineering. 
I spend my free time exploring new backend frameworks, experimenting with
system architectures, or building fun projects like this Windows simulator!

💡 HOBBIES
----------
- Gaming (both console and PC)
- Building custom keyboards
- Contributing to open source projects
- Reading tech blogs & blogs about system designs

---------------------------------------------------
[End of biography.txt - Click anywhere in this note to edit it!]`);

  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    updateCursorPos(e.target);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    updateCursorPos(e.currentTarget);
  };

  const updateCursorPos = (textarea: HTMLTextAreaElement) => {
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      ln: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const menuItems = ['File', 'Edit', 'Format', 'View', 'Help'];

  return (
    <div className={`flex flex-col h-full w-full font-mono text-xs select-text ${
      darkMode ? 'bg-[#1e1e1e] text-[#cccccc]' : 'bg-white text-[#1e1e1e]'
    }`}>
      {/* Menu Bar */}
      <div className={`flex items-center gap-4 px-3 py-1.5 border-b select-none ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d] text-gray-400' : 'bg-[#f3f3f3] border-gray-200 text-gray-600'
      }`}>
        {menuItems.map((item, idx) => (
          <span 
            key={idx} 
            className={`cursor-pointer px-1 py-0.5 rounded transition-colors duration-100 hover:text-opacity-100 ${
              darkMode ? 'hover:bg-[rgba(255,255,255,0.06)] text-gray-300' : 'hover:bg-[rgba(0,0,0,0.05)] text-gray-800'
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Main Textarea */}
      <div className="flex-1 p-2 relative overflow-hidden flex">
        <textarea
          value={text}
          onChange={handleTextChange}
          onSelect={handleSelect}
          onKeyUp={handleSelect}
          onMouseUp={handleSelect}
          style={{ resize: 'none' }}
          className="w-full h-full bg-transparent border-none outline-none overflow-y-auto font-mono text-xs leading-relaxed p-1 focus:ring-0 focus:outline-none"
          spellCheck="false"
        />
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-3 py-1 border-t text-[10px] select-none ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d] text-gray-400' : 'bg-[#f3f3f3] border-gray-200 text-gray-600'
      }`}>
        <div>
          <span>Status: </span>
          <span className="text-emerald-500 font-semibold">Ready</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
