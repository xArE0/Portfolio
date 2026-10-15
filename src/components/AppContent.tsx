import React from 'react';
import { useSystem } from '../system';
import { NotepadApp } from './apps/NotepadApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { TerminalApp } from './apps/TerminalApp';
import { SettingsApp } from './apps/SettingsApp';
import { AchievementsApp } from './apps/AchievementsApp';
import { MusicPlayerApp } from './apps/MusicPlayerApp';
import { GetInTouchApp } from './apps/GetInTouchApp';
import { RecycleBinApp } from './apps/RecycleBinApp';
import { SnakeApp } from './apps/SnakeApp';

interface AppContentProps {
  id: string;
  achievementFocus?: string;
}

export const AppContent: React.FC<AppContentProps> = ({ id, achievementFocus }) => {
  const { darkMode, deviceType, closeApp } = useSystem();

  switch (id) {
    case 'notepad': return <NotepadApp darkMode={darkMode} />;
    case 'explorer': return <FileExplorerApp darkMode={darkMode} deviceType={deviceType} />;
    case 'terminal': return <TerminalApp onClose={() => closeApp('terminal')} />;
    case 'settings': return <SettingsApp />;
    case 'achievements': return <AchievementsApp darkMode={darkMode} initialFocus={achievementFocus} />;
    case 'music': return <MusicPlayerApp darkMode={darkMode} />;
    case 'getintouch': return <GetInTouchApp darkMode={darkMode} />;
    case 'recycle': return <RecycleBinApp darkMode={darkMode} />;
    case 'snake': return <SnakeApp darkMode={darkMode} />;
    default: return null;
  }
};
