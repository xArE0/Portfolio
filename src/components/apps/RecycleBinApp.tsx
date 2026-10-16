import React, { useState } from 'react';
import { FileText, FileCode, FolderX, RotateCcw, Trash2 } from 'lucide-react';
import { useSystem } from '../../system';
import { unlockSecret } from '../../lib/secrets';

interface RecycleBinAppProps {
  darkMode: boolean;
}

interface BinItem {
  name: string;
  size: string;
  deleted: string;
  restore: string;
  Icon: typeof FileText;
}

const ITEMS: BinItem[] = [
  { name: 'sleep_schedule.txt', size: '0 KB', deleted: '3 years ago', restore: 'Restored. It is still empty.', Icon: FileText },
  { name: 'my_social_life.exe', size: '404 KB', deleted: 'Freshman year', restore: 'Error: file not found. Was it ever there?', Icon: FileCode },
  { name: 'final_FINAL_v7_real.docx', size: '2.1 MB', deleted: 'Yesterday', restore: 'Restored v8. Somehow.', Icon: FileText },
  { name: 'node_modules', size: '2.3 TB', deleted: 'Last week', restore: 'Restoring 1,204,331 files... please wait 4 years.', Icon: FolderX },
  { name: 'jquery-1.4.2.min.js', size: '72 KB', deleted: '2014', restore: 'Restored. It is 2014 again. $(document).ready!', Icon: FileCode },
  { name: 'bugs_fixed_on_friday.log', size: '12 MB', deleted: 'Friday 4:59 PM', restore: 'Restored. Production is on fire again.', Icon: FileText },
];

export const RecycleBinApp: React.FC<RecycleBinAppProps> = ({ darkMode }) => {
  const { notify, play } = useSystem();
  const [items, setItems] = useState(ITEMS);

  const restore = (item: BinItem) => {
    setItems(prev => prev.filter(i => i.name !== item.name));
    notify(item.name, item.restore);
    unlockSecret('recycle');
  };

  const empty = () => {
    play('error');
    const stubborn = items.filter(i => i.name === 'node_modules');
    setItems(stubborn);
    if (stubborn.length) notify('Recycle Bin', 'node_modules is too heavy to delete.');
  };

  const row = darkMode ? 'hover:bg-white/5 border-white/5' : 'hover:bg-black/5 border-black/5';

  return (
    <div className={`flex flex-col h-full w-full text-xs select-none ${darkMode ? 'bg-[#1c1c1c] text-[#e3e3e3]' : 'bg-[#f3f3f3] text-gray-800'}`}>
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${darkMode ? 'bg-[#252526] border-[#2d2d2d]' : 'bg-[#e9e9e9] border-gray-200'}`}>
        <span className="font-semibold">{items.length} items</span>
        <button
          onClick={empty}
          disabled={items.length === 0}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-win11-blue/15 text-win11-blue hover:bg-win11-blue/25 disabled:opacity-40 transition-colors"
        >
          <Trash2 size={12} />
          <span>Empty Recycle Bin</span>
        </button>
      </div>

      <div className={`grid grid-cols-[1fr_80px_110px_32px] gap-2 px-4 py-1.5 text-[10px] uppercase font-semibold opacity-50 border-b ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
        <span>Name</span>
        <span>Size</span>
        <span>Deleted</span>
        <span />
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map(item => (
          <div key={item.name} className={`group grid grid-cols-[1fr_80px_110px_32px] gap-2 items-center px-4 py-2 border-b transition-colors ${row}`}>
            <span className="flex items-center gap-2 truncate">
              <item.Icon size={14} className="opacity-60 shrink-0" />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="opacity-60">{item.size}</span>
            <span className="opacity-60 truncate">{item.deleted}</span>
            <button onClick={() => restore(item)} title="Restore" className="opacity-40 group-hover:opacity-100 hover:text-win11-blue transition-opacity">
              <RotateCcw size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 opacity-40">
            <Trash2 size={32} />
            <span>Empty</span>
          </div>
        )}
      </div>
    </div>
  );
};
