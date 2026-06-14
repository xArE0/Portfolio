import React, { useState, useMemo } from 'react';
import { 
  Folder, FileText, ChevronRight, ArrowLeft, ArrowRight, 
  Search, ExternalLink, Monitor, HardDrive, 
  Code, RefreshCw, X, Image, Film, FileIcon
} from 'lucide-react';
import { Github } from '../icons';
import { loadProjects, type MediaFile } from '../../contentLoader';

interface FileExplorerAppProps {
  darkMode: boolean;
  deviceType?: 'monitor' | 'tablet' | 'mobile';
}

type Category = 'projects' | 'skills' | 'documents' | 'desktop';

interface BreadcrumbEntry {
  type: 'category' | 'project-folder';
  category?: Category;
  projectId?: string;
  label: string;
}

interface StaticItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  category: Category;
  description?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  fileContent?: string;
  icon?: React.ReactNode;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({ darkMode, deviceType = 'monitor' }) => {
  const isMobile = deviceType === 'mobile';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Lightbox for media preview
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'image' | 'video' | 'pdf'>('image');

  // Navigation is a stack of breadcrumbs
  const [navStack, setNavStack] = useState<BreadcrumbEntry[]>([
    { type: 'category', category: 'projects', label: 'Projects' }
  ]);
  const [historyFuture, setHistoryFuture] = useState<BreadcrumbEntry[][]>([]);

  const currentNav = navStack[navStack.length - 1];

  // Load projects dynamically from contentLoader
  const projects = useMemo(() => loadProjects(), []);

  // Static items for skills, documents, desktop
  const staticItems: StaticItem[] = useMemo(() => [
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
      fileContent: `📧 CONTACT CHANNELS\n-------------------\n\n- Email: avishek.shrestha@example.com\n- LinkedIn: linkedin.com/in/avishek-shrestha\n- GitHub: github.com/avishek-shrestha\n- Location: Kathmandu, Nepal`,
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
  ], []);

  // Navigation handlers
  const navigateTo = (entry: BreadcrumbEntry) => {
    setSelectedItemId(null);
    setHistoryFuture([]);
    setNavStack(prev => [...prev, entry]);
    if (isMobile) setIsSidebarOpen(false);
  };

  const navigateToCategory = (cat: Category) => {
    const labels: Record<Category, string> = {
      projects: 'Projects',
      skills: 'Skills',
      documents: 'Documents',
      desktop: 'Desktop',
    };
    navigateTo({ type: 'category', category: cat, label: labels[cat] });
  };

  const handleBack = () => {
    if (navStack.length <= 1) return;
    setSelectedItemId(null);
    setHistoryFuture(prev => [...prev, navStack.slice()]);
    setNavStack(prev => prev.slice(0, -1));
  };

  const handleForward = () => {
    if (historyFuture.length === 0) return;
    setSelectedItemId(null);
    const futureStack = historyFuture[historyFuture.length - 1];
    setHistoryFuture(prev => prev.slice(0, -1));
    setNavStack(futureStack);
  };

  // Get the icon for a media file
  const getMediaIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'image': return <Image className="text-blue-400" size={32} />;
      case 'video': return <Film className="text-purple-400" size={32} />;
      case 'pdf': return <FileText className="text-red-400" size={32} />;
      default: return <FileIcon className="text-gray-400" size={32} />;
    }
  };

  // What to render in the main content area depends on current nav
  const renderContent = () => {
    if (currentNav.type === 'project-folder') {
      // Inside a project folder — show media files
      const project = projects.find(p => p.id === currentNav.projectId);
      if (!project) return <div className="col-span-full py-8 text-center text-gray-500">Project not found.</div>;

      const filtered = project.mediaFiles.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length === 0) {
        return (
          <div className="col-span-full py-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <Folder size={28} className="opacity-30" />
            <span>No media files in this project yet.</span>
            <span className="text-[9px] opacity-50">Add images, PDFs, or videos to the project folder.</span>
          </div>
        );
      }

      return filtered.map(file => (
        <div
          key={file.path}
          onClick={() => {
            if (file.type === 'image' || file.type === 'video' || file.type === 'pdf') {
              setLightboxSrc(file.path);
              setLightboxType(file.type);
            }
          }}
          className={`flex flex-col items-center justify-center p-3 rounded border text-center transition-all cursor-pointer ${
            darkMode 
              ? 'bg-neutral-800/20 border-transparent hover:bg-neutral-800/40 hover:border-neutral-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          {/* Thumbnail for images */}
          {file.type === 'image' ? (
            <div className="w-full h-20 rounded overflow-hidden mb-2 bg-black/10">
              <img src={file.path} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="mb-2">{getMediaIcon(file)}</div>
          )}
          <span className="truncate w-full font-medium text-[11px]">{file.name}</span>
          <span className={`text-[9px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {file.type.toUpperCase()}
          </span>
        </div>
      ));
    }

    // Category view
    const category = currentNav.category || 'projects';

    if (category === 'projects') {
      // Show project folders
      const filtered = projects.filter(p =>
        p.meta.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length === 0) {
        return <div className="col-span-full py-8 text-center text-gray-500">No projects found.</div>;
      }

      return filtered.map(project => (
        <div
          key={project.id}
          onClick={() => {
            navigateTo({
              type: 'project-folder',
              projectId: project.id,
              label: project.meta.name,
            });
          }}
          className={`flex flex-col items-center justify-center p-3 rounded border text-center transition-all cursor-pointer ${
            darkMode ? 'bg-neutral-800/20 border-transparent hover:bg-neutral-800/40 hover:border-neutral-700' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <div className="mb-2">
            <Folder className="text-yellow-500" size={32} />
          </div>
          <span className="truncate w-full font-medium text-[11px]">{project.meta.name}</span>
          <span className={`text-[9px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {project.mediaFiles.length} file{project.mediaFiles.length !== 1 ? 's' : ''}
          </span>
        </div>
      ));
    }

    // Static categories (skills, documents, desktop)
    const filtered = staticItems.filter(item =>
      item.category === category &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      return <div className="col-span-full py-8 text-center text-gray-500">This folder is empty.</div>;
    }

    return filtered.map(item => (
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
    ));
  };

  // Get selected item details for sidebar
  const getSelectedDetails = () => {
    // If inside a project folder, show that project's details by default in the sidebar/preview pane
    if (currentNav.type === 'project-folder') {
      const project = projects.find(p => p.id === currentNav.projectId);
      if (project) {
        return {
          icon: <Folder className="text-yellow-500" size={32} />,
          name: project.meta.name,
          typeLabel: `Project Folder • ${project.mediaFiles.length} files`,
          description: project.meta.description,
          technologies: project.meta.technologies,
          githubUrl: project.meta.githubUrl,
          liveUrl: project.meta.liveUrl,
          fileContent: undefined,
          onOpen: undefined, // Already open
        };
      }
    }

    if (!selectedItemId) return null;

    // Check if it's a project
    const project = projects.find(p => p.id === selectedItemId);
    if (project) {
      return {
        icon: <Folder className="text-yellow-500" size={32} />,
        name: project.meta.name,
        typeLabel: `Project Folder • ${project.mediaFiles.length} files`,
        description: project.meta.description,
        technologies: project.meta.technologies,
        githubUrl: project.meta.githubUrl,
        liveUrl: project.meta.liveUrl,
        fileContent: undefined,
        onOpen: () => navigateTo({
          type: 'project-folder',
          projectId: project.id,
          label: project.meta.name,
        }),
      };
    }

    // Check static items
    const staticItem = staticItems.find(i => i.id === selectedItemId);
    if (staticItem) {
      return {
        icon: staticItem.icon,
        name: staticItem.name,
        typeLabel: staticItem.type === 'file' ? 'File Document' : 'File Folder',
        description: staticItem.description,
        technologies: undefined,
        githubUrl: undefined,
        liveUrl: undefined,
        fileContent: staticItem.fileContent,
        onOpen: undefined,
      };
    }

    return null;
  };

  const selectedDetails = getSelectedDetails();

  const formatBreadcrumb = () => {
    return navStack.map(entry => entry.label).join(' > ');
  };

  const currentCategory = currentNav.category || 'projects';

  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${
      darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
    }`}>
      {/* File Explorer Header toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b gap-4 select-none ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'
      }`}>
        <div className="flex items-center gap-1.5">
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-1 rounded transition-colors mr-1 ${
                darkMode ? 'hover:bg-neutral-700 text-gray-300' : 'hover:bg-gray-300 text-gray-700'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          )}

          <button 
            disabled={navStack.length <= 1} 
            onClick={handleBack}
            className={`p-1 rounded transition-colors ${
              navStack.length <= 1 
                ? 'opacity-40 cursor-default' 
                : (darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-300')
            }`}
          >
            <ArrowLeft size={14} />
          </button>
          
          <button 
            disabled={historyFuture.length === 0} 
            onClick={handleForward}
            className={`p-1 rounded transition-colors ${
              historyFuture.length === 0 
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
            <span className="truncate">This PC &gt; {formatBreadcrumb()}</span>
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Drawer Backdrop */}
        {isMobile && isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-40 animate-fade-in"
          />
        )}

        {/* Left Sidebar */}
        <div className={`${
          isMobile 
            ? `absolute top-0 bottom-0 left-0 w-[190px] z-50 shadow-2xl transition-transform duration-200 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'w-[140px] sm:w-[170px] border-r'
        } p-2 flex flex-col gap-1.5 overflow-y-auto select-none ${
          darkMode ? 'bg-[#202020] border-r border-[#2d2d2d]' : 'bg-[#fbfbfb] border-r border-gray-200'
        }`}>
          <div className="text-[10px] uppercase font-semibold text-gray-500 px-2.5 mb-1.5">Quick Access</div>
          
          {(['projects', 'skills', 'documents', 'desktop'] as Category[]).map(cat => {
            const icons: Record<Category, React.ReactNode> = {
              projects: <Folder size={14} className="text-yellow-500" />,
              skills: <Code size={14} className="text-emerald-500" />,
              documents: <Folder size={14} className="text-yellow-500" />,
              desktop: <Monitor size={14} className="text-blue-500" />,
            };
            const labels: Record<Category, string> = {
              projects: 'Projects',
              skills: 'Skills',
              documents: 'Documents',
              desktop: 'Desktop',
            };
            const isActive = currentNav.type === 'category' && currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => navigateToCategory(cat)}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all ${
                  isActive
                    ? 'bg-win11-blue/20 text-win11-blue font-semibold'
                    : (darkMode ? 'hover:bg-neutral-800' : 'hover:bg-gray-200')
                }`}
              >
                {icons[cat]}
                <span>{labels[cat]}</span>
              </button>
            );
          })}
        </div>

        {/* Center Grid of items */}
        <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 content-start">
          {renderContent()}
        </div>

        {/* Right Preview Pane */}
        {selectedDetails && (
          <div className={`${
            isMobile 
              ? 'absolute inset-0 z-30 flex flex-col animate-slide-up p-4' 
              : 'w-[200px] sm:w-[260px] border-l p-4 flex flex-col'
          } overflow-y-auto select-text ${
            darkMode ? 'bg-[#1a1a1a] border-l border-[#2d2d2d]' : 'bg-[#f9f9f9] border-l border-gray-200'
          }`}>
            {isMobile && (
              <div className="flex items-center justify-between border-b pb-2 mb-3 border-neutral-700/25">
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="flex items-center gap-1.5 text-win11-blue font-semibold"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Files</span>
                </button>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className={`p-1.5 rounded-full ${
                    darkMode ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center mb-3">
              {selectedDetails.icon}
            </div>
            
            <h3 className="font-semibold text-sm truncate mb-1 border-b pb-1 text-center select-all">
              {selectedDetails.name}
            </h3>

            <div className="text-[11px] leading-relaxed text-gray-400 mb-3 text-center">
              {selectedDetails.typeLabel}
            </div>

            {/* Open folder button for projects */}
            {selectedDetails.onOpen && (
              <button
                onClick={selectedDetails.onOpen}
                className="flex items-center justify-center gap-2 py-1.5 mb-3 rounded bg-win11-blue/10 hover:bg-win11-blue/20 text-win11-blue font-medium text-[10.5px] border border-win11-blue/20 transition-colors"
              >
                <Folder size={12} />
                <span>Open Folder</span>
              </button>
            )}

            {/* Description */}
            {selectedDetails.description && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1 leading-tight">Description</div>
                <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedDetails.description}
                </p>
              </div>
            )}

            {/* Technologies */}
            {selectedDetails.technologies && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Tech Stack</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedDetails.technologies.map((tech, idx) => (
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

            {/* File Contents */}
            {selectedDetails.fileContent && (
              <div className="mb-4">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5">File Contents</div>
                <pre className={`p-2 rounded text-[10px] overflow-x-auto whitespace-pre font-mono ${
                  darkMode ? 'bg-black/40 text-emerald-400' : 'bg-white text-emerald-700 border'
                }`}>
                  {selectedDetails.fileContent}
                </pre>
              </div>
            )}

            {/* Links / Actions */}
            {(selectedDetails.githubUrl || selectedDetails.liveUrl) && (
              <div className="mt-auto pt-4 flex flex-col gap-2">
                {selectedDetails.githubUrl && (
                  <a
                    href={selectedDetails.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-1.5 rounded bg-win11-blue hover:bg-win11-blue-light transition-colors text-white font-medium text-center text-[10.5px] select-none"
                  >
                    <Github size={12} />
                    <span>View Repository</span>
                    <ExternalLink size={10} />
                  </a>
                )}
                {selectedDetails.liveUrl && (
                  <a
                    href={selectedDetails.liveUrl}
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

        {/* Lightbox for media preview */}
        {lightboxSrc && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)' }}
            onClick={() => setLightboxSrc(null)}
          >
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 z-10"
            >
              <X size={18} />
            </button>

            <div
              className="flex flex-col items-center max-w-[90%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxType === 'image' && (
                <img
                  src={lightboxSrc}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              )}
              {lightboxType === 'video' && (
                <video
                  src={lightboxSrc}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                />
              )}
              {lightboxType === 'pdf' && (
                <iframe
                  src={lightboxSrc}
                  title="PDF Preview"
                  className="w-[700px] max-w-full h-[75vh] rounded-lg bg-white"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
