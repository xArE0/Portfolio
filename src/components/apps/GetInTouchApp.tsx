import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';
import { Github, Linkedin } from '../icons';
import { CONTACT } from '../../lib/contact';

interface GetInTouchAppProps {
  darkMode: boolean;
}

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverGlow: string;
}

const socialLinks: SocialLink[] = [
  {
    id: 'email',
    name: 'Email',
    url: `mailto:${CONTACT.email}`,
    icon: <Mail size={28} className="text-white" />,
    color: 'from-rose-500 to-red-600',
    hoverGlow: 'hover:shadow-rose-500/40',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: CONTACT.github,
    icon: <Github size={28} className="text-white" />,
    color: 'from-gray-700 to-gray-900',
    hoverGlow: 'hover:shadow-gray-500/40',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: CONTACT.linkedin,
    icon: <Linkedin size={28} className="text-white" />,
    color: 'from-blue-600 to-blue-700',
    hoverGlow: 'hover:shadow-blue-500/40',
  },
];

export const GetInTouchApp: React.FC<GetInTouchAppProps> = ({ darkMode }) => {
  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'
      }`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-6">
          <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Let's Connect 👋
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {socialLinks.map((link, idx) => (
            <a
              key={link.id}
              href={link.url}
              target={link.id === 'email' ? '_self' : '_blank'}
              rel="noreferrer"
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.03] hover:shadow-lg animate-slide-up ${darkMode
                  ? `bg-neutral-800/30 border-neutral-700/50 hover:border-neutral-500 ${link.hoverGlow}`
                  : `bg-white border-gray-200 hover:border-gray-400 ${link.hoverGlow}`
                }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {link.icon}
              </div>
              <span className={`font-semibold text-[11.5px] ${darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                {link.name}
              </span>
              <ExternalLink size={10} className={`opacity-0 group-hover:opacity-60 transition-opacity duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
