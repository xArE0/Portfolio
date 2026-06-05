import React, { useState } from 'react';
import { Trophy, X, ChevronLeft, ChevronRight, FileText, ExternalLink, Image } from 'lucide-react';

interface AchievementsAppProps {
  darkMode: boolean;
  initialFocus?: string;
}

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: 'certificate' | 'award';
  type: 'image' | 'pdf';
  src: string;
  date?: string;
}

const achievements: AchievementItem[] = [
  {
    id: 'citytech-internship',
    title: 'CityTech Internship Certificate',
    description: 'Successfully completed a software engineering internship at CityTech, gaining hands-on experience with production-grade web applications.',
    category: 'certificate',
    type: 'image',
    src: '/assets/achievements/citytech-internship.png',
    date: '2025',
  },
  {
    id: 'data-viz-certificate',
    title: 'Data Visualization Certificate',
    description: 'Achieved certification in data visualization techniques, showcasing proficiency in transforming complex datasets into insightful visual narratives.',
    category: 'certificate',
    type: 'image',
    src: '/assets/achievements/data-viz-certificate.png',
    date: '2025',
  },
  {
    id: 'android-dev-certificate',
    title: 'Android Development Certificate',
    description: 'Earned certification in Android application development, demonstrating competency in building mobile applications with modern frameworks.',
    category: 'certificate',
    type: 'pdf',
    src: '/assets/achievements/android-dev-certificate.pdf',
    date: '2024',
  },
  {
    id: 'citytech-nda',
    title: 'CityTech NDA Agreement',
    description: 'Non-Disclosure Agreement signed during professional engagement with CityTech, reflecting involvement in proprietary project work.',
    category: 'certificate',
    type: 'image',
    src: '/assets/achievements/citytech-nda.png',
    date: '2025',
  },
];

export const AchievementsApp: React.FC<AchievementsAppProps> = ({ darkMode, initialFocus }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'certificate' | 'award'>('all');
  const [lightboxItem, setLightboxItem] = useState<AchievementItem | null>(
    initialFocus ? achievements.find(a => a.id === initialFocus) || null : null
  );
  const [animateIntro, setAnimateIntro] = useState(true);

  // Turn off intro animation after initial mount animation completes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIntro(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = activeFilter === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeFilter);

  const openLightbox = (item: AchievementItem) => {
    setLightboxItem(item);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxItem) return;
    const currentIdx = filtered.findIndex(a => a.id === lightboxItem.id);
    const nextIdx = direction === 'next'
      ? (currentIdx + 1) % filtered.length
      : (currentIdx - 1 + filtered.length) % filtered.length;
    setLightboxItem(filtered[nextIdx]);
  };

  const filters: Array<{ key: 'all' | 'certificate' | 'award'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'certificate', label: 'Certificates' },
    { key: 'award', label: 'Awards' },
  ];

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
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => openLightbox(item)}
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
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <FileText size={28} className="text-red-400" />
                    <span className="text-[9px] font-mono">PDF Document</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.type === 'image' ? (
                      <Image size={20} className="text-white drop-shadow-lg" />
                    ) : (
                      <ExternalLink size={20} className="text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-black/50 text-white backdrop-blur-sm">
                  {item.category}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 flex flex-col gap-1">
                <span className="font-semibold text-[11px] truncate">{item.title}</span>
                {item.date && (
                  <span className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {item.date}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
            <Trophy size={32} className="opacity-30" />
            <span>No achievements in this category yet.</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center animate-lightbox-open"
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

          {/* Content */}
          <div
            className="flex flex-col items-center max-w-[85%] max-h-[85%] animate-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxItem.type === 'image' ? (
              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <iframe
                src={lightboxItem.src}
                title={lightboxItem.title}
                className="w-[700px] max-w-full h-[65vh] rounded-lg bg-white"
              />
            )}

            {/* Caption */}
            <div className="mt-4 text-center text-white max-w-md">
              <h3 className="font-semibold text-sm mb-1">{lightboxItem.title}</h3>
              <p className="text-[11px] text-gray-300 leading-relaxed">{lightboxItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
