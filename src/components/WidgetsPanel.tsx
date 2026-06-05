import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, GitBranch, Star, Zap, Quote, Code, Briefcase, Clock } from 'lucide-react';

interface WidgetsPanelProps {
  isOpen: boolean;
  isClosing: boolean;
  darkMode: boolean;
}

const devQuotes = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine" },
];

const weatherStates = [
  { icon: Sun, label: 'Sunny', temp: '28°C', color: '#f59e0b' },
  { icon: Cloud, label: 'Cloudy', temp: '22°C', color: '#94a3b8' },
  { icon: CloudRain, label: 'Rainy', temp: '19°C', color: '#3b82f6' },
];

const githubActivity = [
  { repo: 'urbanfinder-web', action: 'Pushed 3 commits', time: '2h ago', branch: 'main' },
  { repo: 'portfolio-os', action: 'Merged PR #14', time: '5h ago', branch: 'feat/animations' },
  { repo: 'urbanfinder-backend', action: 'Released v2.1.0', time: '1d ago', branch: 'release' },
  { repo: 'dotfiles', action: 'Updated config', time: '3d ago', branch: 'main' },
];

export const WidgetsPanel: React.FC<WidgetsPanelProps> = ({ isOpen, isClosing, darkMode }) => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [weatherIdx] = useState(() => Math.floor(Math.random() * weatherStates.length));
  const [animateIntro, setAnimateIntro] = useState(true);

  // Trigger animation lock when widgets panel is opened
  useEffect(() => {
    if (isOpen) {
      setAnimateIntro(true);
      const timer = setTimeout(() => {
        setAnimateIntro(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % devQuotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen && !isClosing) return null;

  const weather = weatherStates[weatherIdx];
  const WeatherIcon = weather.icon;
  const quote = devQuotes[quoteIdx];

  const cardClass = `rounded-xl p-4 border transition-all duration-200 ${
    darkMode
      ? 'bg-[rgba(30,30,30,0.8)] border-neutral-700/50 hover:border-neutral-600'
      : 'bg-white/80 border-gray-200 hover:border-gray-300'
  }`;

  return (
    <div
      style={{ zIndex: 997 }}
      className={`absolute left-0 top-0 bottom-12 w-[340px] sm:w-[380px] overflow-y-auto p-4 glass-panel ${
        darkMode ? 'glass-panel-dark' : 'glass-panel-light'
      } ${isClosing ? 'animate-widgets-out' : 'animate-widgets-in'}`}
    >
      {/* Header */}
      <div className="mb-4 px-1">
        <h2 className="text-base font-semibold">Widgets</h2>
        <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Your personalized dashboard
        </p>
      </div>

      {/* Weather Card */}
      <div
        className={`${cardClass} mb-3 ${animateIntro ? 'animate-widget-card' : ''}`}
        style={{ animationDelay: '0.05s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Weather — Kathmandu
          </span>
          <Cloud size={12} className="text-gray-400" />
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: weather.color + '15' }}
          >
            <WeatherIcon size={28} style={{ color: weather.color }} />
          </div>
          <div>
            <div className="text-2xl font-bold">{weather.temp}</div>
            <div className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {weather.label} • Feels like {parseInt(weather.temp) - 2}°C
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div
        className={`${cardClass} mb-3 ${animateIntro ? 'animate-widget-card' : ''}`}
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Quick Stats
          </span>
          <Zap size={12} className="text-amber-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, value: '2+', label: 'Years Exp', color: '#0078d4' },
            { icon: Briefcase, value: '10+', label: 'Projects', color: '#10b981' },
            { icon: Code, value: '15+', label: 'Technologies', color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div className="font-bold text-sm">{stat.value}</div>
              <div className={`text-[9px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Activity Card */}
      <div
        className={`${cardClass} mb-3 ${animateIntro ? 'animate-widget-card' : ''}`}
        style={{ animationDelay: '0.15s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            GitHub Activity
          </span>
          <GitBranch size={12} className="text-emerald-500" />
        </div>
        <div className="flex flex-col gap-2">
          {githubActivity.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-neutral-800/60' : 'hover:bg-gray-50'
              }`}
            >
              <div className="mt-0.5">
                <div className={`w-2 h-2 rounded-full ${
                  idx === 0 ? 'bg-emerald-500' : (darkMode ? 'bg-neutral-600' : 'bg-gray-300')
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[11px] truncate">{item.repo}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${
                    darkMode ? 'bg-neutral-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.branch}
                  </span>
                </div>
                <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.action} • {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspirational Quote Card */}
      <div
        className={`${cardClass} mb-3 ${animateIntro ? 'animate-widget-card' : ''}`}
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Dev Quote
          </span>
          <Quote size={12} className="text-cyan-500" />
        </div>
        <div key={quoteIdx} className="animate-fade-in">
          <p className={`text-[12px] italic leading-relaxed mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            "{quote.text}"
          </p>
          <div className="flex items-center gap-1.5">
            <Star size={10} className="text-amber-500" />
            <span className={`text-[10px] font-medium ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              — {quote.author}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
