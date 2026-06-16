import React, { useState, useMemo } from 'react';
import { Trophy, X, ChevronLeft, ChevronRight, FileText, ExternalLink, Image, Folder } from 'lucide-react';
import { loadAchievements, type AchievementItem, type MediaFile } from '../../contentLoader';

interface AchievementsAppProps {
  darkMode: boolean;
  initialFocus?: string;
}

// Sub-component for individual achievement cards
const AchievementCard = React.memo(({
  item,
  idx,
  darkMode,
  animateIntro,
  isExpanded,
  onToggleExpand,
  onOpenLightbox
}: {
  item: AchievementItem;
  idx: number;
  darkMode: boolean;
  animateIntro: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onOpenLightbox: (achievement: AchievementItem, mediaIndex: number) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Logic to find the best thumbnail
  const thumbnail = useMemo(() => {
    // 1. Prefer files with 'thumb' or 'small' in name
    const explicitThumb = item.mediaFiles.find(f =>
      f.type === 'image' &&
      (f.name.toLowerCase().includes('thumb') || f.name.toLowerCase().includes('small'))
    );
    if (explicitThumb) return explicitThumb;

    // 2. Secondary fallback: WhatsApp images (usually small/compressed)
    const compressedImage = item.mediaFiles.find(f => f.type === 'image' && f.name.startsWith('IMG-'));
    if (compressedImage) return compressedImage;

    // 3. Final fallback: First image found
    return item.mediaFiles.find(f => f.type === 'image') || null;
  }, [item.mediaFiles]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          if (item.mediaFiles.length === 1) {
            onOpenLightbox(item, 0);
          } else {
            onToggleExpand(item.id);
          }
        }}
        className={`group relative flex flex-col rounded-lg overflow-hidden border transition-all duration-250 hover:scale-[1.02] hover:shadow-lg cursor-pointer will-change-transform ${
          animateIntro ? 'animate-slide-up' : ''
        } ${
          darkMode
            ? 'bg-neutral-800/30 border-neutral-700 hover:border-neutral-500'
            : 'bg-white border-gray-200 hover:border-gray-400'
        }`}
        style={{ animationDelay: `${idx * 60}ms` }}
      >
        {/* Thumbnail Container */}
        <div className={`relative w-full h-28 overflow-hidden ${
          darkMode ? 'bg-neutral-900' : 'bg-gray-100'
        }`}>
          {thumbnail ? (
            <>
              {/* Skeleton / Placeholder */}
              {!isLoaded && (
                <div className={`absolute inset-0 animate-pulse ${darkMode ? 'bg-neutral-700' : 'bg-gray-200'}`} />
              )}
              <img
                src={thumbnail.path}
                alt={item.meta.title}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
                }`}
                loading="lazy"
                decoding="async"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <Folder size={28} className="text-yellow-500" />
              <span className="text-[9px] font-mono">{item.mediaFiles.length} files</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100">
              {item.mediaFiles.length > 1 ? (
                <Folder size={20} className="text-white drop-shadow-lg" />
              ) : (
                <Image size={20} className="text-white drop-shadow-lg" />
              )}
            </div>
          </div>

          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-black/50 text-white backdrop-blur-sm">
            {item.meta.category}
          </div>

          {item.mediaFiles.length > 1 && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-win11-blue/80 text-white backdrop-blur-sm">
              {item.mediaFiles.length} files
            </div>
          )}
        </div>

        <div className="p-2.5 flex flex-col gap-1">
          <span className="font-semibold text-[11px] truncate">{item.meta.title}</span>
          <span className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {item.meta.date || '2025'}
          </span>
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
              onClick={() => onOpenLightbox(item, fileIdx)}
              className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                darkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-gray-200'
              }`}
            >
              {file.type === 'image' ? (
                <div className="w-full h-12 rounded overflow-hidden bg-black/10">
                  <img
                    src={file.path}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
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
});

AchievementCard.displayName = 'AchievementCard';

export const AchievementsApp: React.FC<AchievementsAppProps> = ({ darkMode, initialFocus }) => {
  const achievements = useMemo(() => loadAchievements(), []);
  const [activeFilter, setActiveFilter] = useState<'all' | 'certificate' | 'award'>('all');
  const [lightboxItem, setLightboxItem] = useState<{ achievement: AchievementItem; mediaIndex: number } | null>(null);
  const [animateIntro, setAnimateIntro] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimateIntro(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => activeFilter === 'all'
    ? achievements
    : achievements.filter(a => a.meta.category === activeFilter),
  [activeFilter, achievements]);

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

        <div className="flex items-center gap-1">
          {['all', 'certificate', 'award'].map(key => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as any)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 capitalize ${
                activeFilter === key
                  ? 'bg-win11-blue text-white'
                  : (darkMode ? 'hover:bg-neutral-700 text-gray-400' : 'hover:bg-gray-300 text-gray-600')
              }`}
            >
              {key}s
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <AchievementCard
              key={item.id}
              item={item}
              idx={idx}
              darkMode={darkMode}
              animateIntro={animateIntro}
              isExpanded={expandedId === item.id}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              onOpenLightbox={openLightbox}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxItem && (() => {
        const { achievement, mediaIndex } = lightboxItem;
        const currentFile = achievement.mediaFiles[mediaIndex];
        return (
          <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in bg-black/90 backdrop-blur-sm" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"><X size={24} /></button>

            {achievement.mediaFiles.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><ChevronLeft size={24} /></button>
                <button onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><ChevronRight size={24} /></button>
              </>
            )}

            <div className="flex flex-col items-center max-w-[90%] max-h-[90%]" onClick={e => e.stopPropagation()}>
              {currentFile.type === 'image' ? (
                <img src={currentFile.path} alt="" className="max-w-full max-h-[75vh] object-contain rounded shadow-2xl animate-lightbox-image" />
              ) : currentFile.type === 'pdf' ? (
                <iframe src={currentFile.path} className="w-[80vw] h-[75vh] rounded bg-white" />
              ) : null}

              <div className="mt-4 text-center text-white">
                <h3 className="font-semibold text-base">{achievement.meta.title}</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-lg">{achievement.meta.description}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
