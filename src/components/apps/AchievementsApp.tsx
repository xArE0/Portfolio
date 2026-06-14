import React, { useState, useMemo } from 'react';
import { Trophy, X, ChevronLeft, ChevronRight, FileText, ExternalLink, Image, Folder } from 'lucide-react';
import { loadAchievements, type AchievementItem, type MediaFile } from '../../contentLoader';

interface AchievementsAppProps {
  darkMode: boolean;
  initialFocus?: string;
}

export const AchievementsApp: React.FC<AchievementsAppProps> = ({ darkMode, initialFocus }) => {
  const achievements = useMemo(() => loadAchievements(), []);

  const [activeFilter, setActiveFilter] = useState<'all' | 'certificate' | 'award'>('all');
  const [lightboxItem, setLightboxItem] = useState<{ achievement: AchievementItem; mediaIndex: number } | null>(
    () => {
      if (initialFocus) {
        const found = achievements.find(a => a.id === initialFocus);
        if (found && found.mediaFiles.length > 0) {
          return { achievement: found, mediaIndex: 0 };
        }
      }
      return null;
    }
  );
  const [animateIntro, setAnimateIntro] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Turn off intro animation after initial mount
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateIntro(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = activeFilter === 'all'
    ? achievements
    : achievements.filter(a => a.meta.category === activeFilter);

  const openLightbox = (achievement: AchievementItem, mediaIndex: number) => {
    setLightboxItem({ achievement, mediaIndex });
  };

  const closeLightbox = () => setLightboxItem(null);

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxItem) return;
    const { achievement, mediaIndex } = lightboxItem;
    const total = achievement.mediaFiles.length;
    if (total <= 1) return;
    const nextIdx = direction === 'next'
      ? (mediaIndex + 1) % total
      : (mediaIndex - 1 + total) % total;
    setLightboxItem({ achievement, mediaIndex: nextIdx });
  };

  const filters: Array<{ key: 'all' | 'certificate' | 'award'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'certificate', label: 'Certificates' },
    { key: 'award', label: 'Awards' },
  ];

  // Get the first image media file for thumbnail, or null
  const getThumbnail = (item: AchievementItem): MediaFile | null => {
    return item.mediaFiles.find(f => f.type === 'image') || null;
  };

  return (
    <div className={`flex flex-col h-full w-full text-xs select-none relative ${
      darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <Trophy size={18} className="text-amber-500" />
          <span className="font-semibold text-sm">Achievements & Certificates</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-win11-blue text-white'
                  : (darkMode ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-300 text-gray-600')
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((item, idx) => {
            const thumbnail = getThumbnail(item);
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="flex flex-col gap-2">
                {/* Main Card */}
                <button
                  onClick={() => {
                    if (item.mediaFiles.length === 1) {
                      // Only one file — open lightbox directly
                      openLightbox(item, 0);
                    } else {
                      // Toggle expand to show all files
                      setExpandedId(isExpanded ? null : item.id);
                    }
                  }}
                  className={`group relative flex flex-col rounded-lg overflow-hidden border transition-all duration-250 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                    animateIntro ? 'animate-slide-up' : ''
                  } ${
                    darkMode
                      ? 'bg-neutral-800/30 border-neutral-700 hover:border-neutral-500'
                      : 'bg-white border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Thumbnail */}
                  <div className={`relative w-full h-28 overflow-hidden ${
                    darkMode ? 'bg-neutral-900' : 'bg-gray-100'
                  }`}>
                    {thumbnail ? (
                      <img
                        src={thumbnail.path}
                        alt={item.meta.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                        {item.mediaFiles.length > 0 && item.mediaFiles[0].type === 'pdf' ? (
                          <>
                            <FileText size={28} className="text-red-400" />
                            <span className="text-[9px] font-mono">PDF Document</span>
                          </>
                        ) : (
                          <>
                            <Folder size={28} className="text-yellow-500" />
                            <span className="text-[9px] font-mono">{item.mediaFiles.length} files</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.mediaFiles.length > 1 ? (
                          <Folder size={20} className="text-white drop-shadow-lg" />
                        ) : thumbnail ? (
                          <Image size={20} className="text-white drop-shadow-lg" />
                        ) : (
                          <ExternalLink size={20} className="text-white drop-shadow-lg" />
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-black/50 text-white backdrop-blur-sm">
                      {item.meta.category}
                    </div>

                    {/* File count badge */}
                    {item.mediaFiles.length > 1 && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-win11-blue/80 text-white backdrop-blur-sm">
                        {item.mediaFiles.length} files
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="font-semibold text-[11px] truncate">{item.meta.title}</span>
                    {item.meta.date && (
                      <span className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {item.meta.date}
                      </span>
                    )}
                  </div>
                </button>

                {/* Expanded media files */}
                {isExpanded && item.mediaFiles.length > 1 && (
                  <div className={`grid grid-cols-2 gap-1.5 p-2 rounded-lg border animate-slide-up ${
                    darkMode ? 'bg-neutral-800/40 border-neutral-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {item.mediaFiles.map((file, fileIdx) => (
                      <button
                        key={file.path}
                        onClick={() => openLightbox(item, fileIdx)}
                        className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                          darkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-gray-200'
                        }`}
                      >
                        {file.type === 'image' ? (
                          <div className="w-full h-12 rounded overflow-hidden bg-black/10">
                            <img src={file.path} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <FileText size={20} className="text-red-400" />
                        )}
                        <span className="text-[8px] truncate w-full text-center opacity-70">{file.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
            <Trophy size={32} className="opacity-30" />
            <span>No achievements in this category yet.</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (() => {
        const { achievement, mediaIndex } = lightboxItem;
        const currentFile = achievement.mediaFiles[mediaIndex];
        if (!currentFile) return null;

        return (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 z-10"
            >
              <X size={18} />
            </button>

            {/* Navigation Arrows */}
            {achievement.mediaFiles.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 z-10"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Content */}
            <div
              className="flex flex-col items-center max-w-[85%] max-h-[85%]"
              onClick={(e) => e.stopPropagation()}
            >
              {currentFile.type === 'image' ? (
                <img
                  src={currentFile.path}
                  alt={achievement.meta.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
              ) : currentFile.type === 'pdf' ? (
                <iframe
                  src={currentFile.path}
                  title={achievement.meta.title}
                  className="w-[700px] max-w-full h-[65vh] rounded-lg bg-white"
                />
              ) : currentFile.type === 'video' ? (
                <video
                  src={currentFile.path}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
                />
              ) : null}

              {/* Caption */}
              <div className="mt-4 text-center text-white max-w-md">
                <h3 className="font-semibold text-sm mb-1">{achievement.meta.title}</h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">{achievement.meta.description}</p>
                {achievement.mediaFiles.length > 1 && (
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    {mediaIndex + 1} / {achievement.mediaFiles.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
