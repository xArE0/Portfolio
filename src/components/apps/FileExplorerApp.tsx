import React, { useState } from 'react';
import { 
  Folder, FileText, ChevronRight, ArrowLeft, ArrowRight, 
  Search, ExternalLink, Monitor, HardDrive, 
  Sparkles, Code, Server, RefreshCw
} from 'lucide-react';
import { Github } from '../icons';

interface FileExplorerAppProps {
  darkMode: boolean;
}

interface ExplorerItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  category: 'projects' | 'skills' | 'documents' | 'desktop';
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  fileContent?: string;
  icon?: React.ReactNode;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({ darkMode }) => {
  const [currentCategory, setCurrentCategory] = useState<'desktop' | 'documents' | 'projects' | 'skills'>('projects');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyStack, setHistoryStack] = useState<Array<'desktop' | 'documents' | 'projects' | 'skills'>>(['projects']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Seed Data for items
  const items: ExplorerItem[] = [
    // --- PROJECTS ---
    {
      id: 'proj-urbanfinder-web',
      name: 'urbanfinder-web',
      type: 'file',
      category: 'projects',
      description: 'A premium property browsing and filtering platform. Features real-time listings, advanced search filters, bookmarks, and detailed property pages with layout designs.',
      technologies: ['React.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'RESTful API'],
      githubUrl: 'https://github.com',
      liveUrl: 'https://example.com',
      icon: <Monitor className="text-blue-500" size={32} />
    },
    {
      id: 'proj-urbanfinder-backend',
      name: 'urbanfinder-backend',
      type: 'file',
      category: 'projects',
      description: 'The high-performance API server powering Urbanfinder. Built using Django Rest Framework, PostgreSQL, and Redis cache. Features full authentication flow, API seeding commands, search filtering algorithms, and bookmark tracking.',
      technologies: ['Python', 'Django', 'REST Framework', 'PostgreSQL', 'Redis', 'Docker'],
      githubUrl: 'https://github.com',
      icon: <Server className="text-emerald-500" size={32} />
    },
    {
      id: 'proj-portfolio-os',
      name: 'portfolio-os',
      type: 'file',
      category: 'projects',
      description: 'Interactive Windows 11 desktop simulation portfolio. Drag/resize/minimize/maximize windows, customize background theme, run terminal commands, write notes, and browse projects dynamically.',
      technologies: ['React.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5/CSS3'],
      githubUrl: 'https://github.com',
      liveUrl: 'https://example.com',
      icon: <Sparkles className="text-cyan-500" size={32} />
    },

    // --- SKILLS ---
    {
      id: 'skill-languages',
      name: 'Languages.json',
      type: 'file',
      category: 'skills',
      description: 'Languages I use daily for application development.',
      fileContent: `{\n  "programming": [\n    "TypeScript",\n    "JavaScript",\n    "Python",\n    "SQL",\n    "HTML5/CSS3"\n  ]\n}`,
      icon: <Code className="text-amber-500" size={32} />
    },
    {
      id: 'skill-frameworks',
      name: 'Frameworks.json',
      type: 'file',
      category: 'skills',
      description: 'My core libraries and tools of choice.',
      fileContent: `{\n  "frontend": ["React.js", "Next.js", "Tailwind CSS"],\n  "backend": ["Django", "FastAPI", "Express.js"],\n  "databases": ["PostgreSQL", "MongoDB", "MySQL", "Redis"]\n}`,
      icon: <Code className="text-indigo-500" size={32} />
    },

    // --- DOCUMENTS ---
    {
      id: 'doc-achievements',
      name: 'achievements.txt',
      type: 'file',
      category: 'documents',
      description: 'Professional milestones and awards.',
      fileContent: `🏆 MY ACHIEVEMENTS & MILESTONES\n---------------------------------\n\n- Completed urbanfinder-web with 98% Lighthouse performance score.\n- Migrated database queries to optimize response times by 40%.\n- Open source contributor to React community libraries.\n- Built customized CLI tools to automate development workflows.`,
      icon: <FileText className="text-gray-400" size={32} />
    },
    {
      id: 'doc-contact',
      name: 'contact_info.txt',
      type: 'file',
      category: 'documents',
      description: 'How to get in touch with me.',
      fileContent: `📧 CONTACT CHANNELS\n-------------------\n\n- Email: avishek.shrestha@example.com (Simulated)\n- LinkedIn: linkedin.com/in/avishek-shrestha\n- GitHub: github.com/avishek-shrestha\n- Location: Kathmandu, Nepal`,
      icon: <FileText className="text-gray-400" size={32} />
    },

    // --- DESKTOP SHORTCUTS ---
    {
      id: 'desk-notepad',
      name: 'Notepad.lnk',
      type: 'file',
      category: 'desktop',
      description: 'Shortcut to Notepad application.',
      fileContent: 'Link to biography.txt document.',
      icon: <FileText className="text-amber-500" size={32} />
    },
    {
      id: 'desk-terminal',
      name: 'Terminal.lnk',
      type: 'file',
      category: 'desktop',
      description: 'Shortcut to PowerShell / CMD terminal simulation.',
      fileContent: 'Starts active CLI environment.',
      icon: <Code className="text-emerald-500" size={32} />
    }
  ];

  // Navigation handlers
  const navigateTo = (category: 'desktop' | 'documents' | 'projects' | 'skills') => {
    setSelectedItemId(null);
    setCurrentCategory(category);
    
    // Manage history stack
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(category);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentCategory(historyStack[historyIndex - 1]);
      setSelectedItemId(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentCategory(historyStack[historyIndex + 1]);
      setSelectedItemId(null);
    }
  };

  // Filter items based on current category and search query
  const displayedItems = items.filter(
    (item) =>
      item.category === currentCategory &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const formatBreadcrumb = () => {
    const formattedCat = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    return `This PC > ${formattedCat}`;
  };

  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${
      darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
    }`}>
      {/* File Explorer Header toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b gap-4 select-none ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'
      }`}>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={historyIndex === 0} 
            onClick={handleBack}
            className={`p-1 rounded transition-colors ${
              historyIndex === 0 
                ? 'opacity-40 cursor-default' 
                : (darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-300')
            }`}
          >
            <ArrowLeft size={14} />
          </button>
          
          <button 
            disabled={historyIndex === historyStack.length - 1} 
            onClick={handleForward}
            className={`p-1 rounded transition-colors ${
              historyIndex === historyStack.length - 1 
                ? 'opacity-40 cursor-default' 
                : (darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-300')
            }`}
          >
            <ArrowRight size={14} />
          </button>

          <button className={`p-1 rounded transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-300'}`}>
            <RefreshCw size={12} />
          </button>
          
          {/* Breadcrumbs Path */}
          <div className={`flex items-center px-2 py-1 rounded border gap-1.5 ml-2 text-[10.5px] truncate max-w-[280px] sm:max-w-md ${
            darkMode 
              ? 'bg-[rgba(30,30,30,0.5)] border-[rgba(255,255,255,0.06)]' 
              : 'bg-white border-gray-300'
          }`}>
            <HardDrive size={12} className="text-win11-blue" />
            <ChevronRight size={10} className="text-gray-400" />
            <span className="truncate">{formatBreadcrumb()}</span>
          </div>
        </div>

        {/* Search Input */}
        <div className={`flex items-center gap-2 px-2 py-1 rounded border max-w-[150px] sm:max-w-[200px] ${
          darkMode 
            ? 'bg-[rgba(30,30,30,0.5)] border-[rgba(255,255,255,0.06)] focus-within:border-win11-blue' 
            : 'bg-white border-gray-300 focus-within:border-win11-blue'
        }`}>
          <Search size={12} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[10px]"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={`w-[140px] sm:w-[170px] border-r p-2 flex flex-col gap-1.5 overflow-y-auto select-none ${
          darkMode ? 'bg-[#202020] border-[#2d2d2d]' : 'bg-[#fbfbfb] border-gray-200'
        }`}>
          <div className="text-[10px] uppercase font-semibold text-gray-500 px-2.5 mb-1.5">Quick Access</div>
          
          <button
            onClick={() => navigateTo('projects')}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all ${
              currentCategory === 'projects'
                ? 'bg-win11-blue/20 text-win11-blue font-semibold'
                : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
            }`}
          >
            <Folder size={14} className="text-yellow-500" />
            <span>Projects</span>
          </button>
          
          <button
            onClick={() => navigateTo('skills')}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all ${
              currentCategory === 'skills'
                ? 'bg-win11-blue/20 text-win11-blue font-semibold'
                : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
            }`}
          >
            <Code size={14} className="text-emerald-500" />
            <span>Skills</span>
          </button>
          
          <button
            onClick={() => navigateTo('documents')}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all ${
              currentCategory === 'documents'
                ? 'bg-win11-blue/20 text-win11-blue font-semibold'
                : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
            }`}
          >
            <Folder size={14} className="text-yellow-500" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => navigateTo('desktop')}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all ${
              currentCategory === 'desktop'
                ? 'bg-win11-blue/20 text-win11-blue font-semibold'
                : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
            }`}
          >
            <Monitor size={14} className="text-blue-500" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Center Grid of items */}
        <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 content-start">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded border text-center transition-all cursor-pointer ${
                selectedItemId === item.id
                  ? 'bg-win11-blue/15 border-win11-blue/40 ring-1 ring-win11-blue/40'
                  : (darkMode ? 'bg-neutral-800/20 border-transparent hover:bg-neutral-800/40 hover:border-neutral-700' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300')
              }`}
            >
              <div className="mb-2">{item.icon}</div>
              <span className="truncate w-full font-medium text-[11px]">{item.name}</span>
            </div>
          ))}

          {displayedItems.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500">
              This folder is empty.
            </div>
          )}
        </div>

        {/* Right Preview Pane */}
        {selectedItem && (
          <div className={`w-[200px] sm:w-[260px] border-l p-4 flex flex-col overflow-y-auto select-text ${
            darkMode ? 'bg-[#1a1a1a] border-[#2d2d2d]' : 'bg-[#f9f9f9] border-gray-200'
          }`}>
            <div className="flex items-center justify-center mb-3">
              {selectedItem.icon}
            </div>
            
            <h3 className="font-semibold text-sm truncate mb-1 border-b pb-1 text-center select-all">
              {selectedItem.name}
            </h3>

            <div className="text-[11px] leading-relaxed text-gray-400 mb-3 text-center">
              {selectedItem.type === 'file' ? 'File Document' : 'File Folder'}
            </div>

            {/* Description */}
            {selectedItem.description && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1 leading-tight">Description</div>
                <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedItem.description}
                </p>
              </div>
            )}

            {/* Technologies */}
            {selectedItem.technologies && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Tech Stack</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedItem.technologies.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                        darkMode ? 'bg-neutral-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Structured File Contents (Json / Txt representation) */}
            {selectedItem.fileContent && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5">File Contents</div>
                <pre className={`p-2 rounded text-[10px] overflow-x-auto whitespace-pre font-mono ${
                  darkMode ? 'bg-black/40 text-emerald-400' : 'bg-white text-emerald-700 border'
                }`}>
                  {selectedItem.fileContent}
                </pre>
              </div>
            )}

            {/* Links / Actions */}
            {(selectedItem.githubUrl || selectedItem.liveUrl) && (
              <div className="mt-auto pt-4 flex flex-col gap-2">
                {selectedItem.githubUrl && (
                  <a
                    href={selectedItem.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-1.5 rounded bg-win11-blue hover:bg-win11-blue-light transition-colors text-white font-medium text-center text-[10.5px] select-none"
                  >
                    <Github size={12} />
                    <span>View Repository</span>
                    <ExternalLink size={10} />
                  </a>
                )}
                {selectedItem.liveUrl && (
                  <a
                    href={selectedItem.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-2 py-1.5 rounded transition-all font-medium text-center text-[10.5px] border select-none ${
                      darkMode 
                        ? 'border-neutral-700 hover:bg-neutral-800 text-gray-200' 
                        : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
