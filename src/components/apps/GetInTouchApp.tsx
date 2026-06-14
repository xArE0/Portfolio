import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';
import { Github, Linkedin } from '../icons';

interface GetInTouchAppProps {
  darkMode: boolean;
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;        // gradient bg for the icon tile
  hoverGlow: string;    // glow color on hover
}

const socialLinks: SocialLink[] = [
  {
    id: 'email',
    name: 'Email',
    url: 'mailto:avishek.shrestha@example.com',
    icon: <Mail size={28} className="text-white" />,
    color: 'from-rose-500 to-red-600',
    hoverGlow: 'shadow-rose-500/40',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    icon: <Github size={28} className="text-white" />,
    color: 'from-gray-700 to-gray-900',
    hoverGlow: 'shadow-gray-500/40',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    icon: <Linkedin size={28} className="text-white" />,
    color: 'from-blue-600 to-blue-700',
    hoverGlow: 'shadow-blue-500/40',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    url: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'from-neutral-800 to-black',
    hoverGlow: 'shadow-neutral-400/40',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-700',
    hoverGlow: 'shadow-blue-500/40',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: 'from-pink-500 via-purple-500 to-orange-400',
    hoverGlow: 'shadow-pink-500/40',
  },
];

export const GetInTouchApp: React.FC<GetInTouchAppProps> = ({ darkMode }) => {
  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${
      darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
            <ExternalLink size={11} className="text-white" />
          </div>
          <span className="font-semibold text-sm">Get In Touch</span>
        </div>
        <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {socialLinks.length} links
        </span>
      </div>

      {/* Social Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Greeting */}
        <div className="text-center mb-6">
          <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Let's Connect 👋
          </h2>
          <p className={`text-[11px] max-w-sm mx-auto leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Feel free to reach out through any of these platforms. I'm always open to discussing new projects, ideas, or opportunities.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {socialLinks.map((link, idx) => (
            <a
              key={link.id}
              href={link.url}
              target={link.id === 'email' ? '_self' : '_blank'}
              rel="noreferrer"
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.03] hover:shadow-lg animate-slide-up ${
                darkMode
                  ? `bg-neutral-800/30 border-neutral-700/50 hover:border-neutral-500 hover:${link.hoverGlow}`
                  : `bg-white border-gray-200 hover:border-gray-400 hover:${link.hoverGlow}`
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Icon Circle */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {link.icon}
              </div>

              {/* Label */}
              <span className={`font-semibold text-[11.5px] ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {link.name}
              </span>

              {/* Subtle external link indicator */}
              <ExternalLink size={10} className={`opacity-0 group-hover:opacity-60 transition-opacity duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
