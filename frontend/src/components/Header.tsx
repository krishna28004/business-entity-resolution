import React from 'react';
import { Folder, FileCode2, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-mono text-[11px] border border-slate-200">
          <Folder className="w-3.5 h-3.5 text-slate-500" />
          <span>/workspace/business-entity-resolution</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Pipeline Engine: Multi-Pass + LightGBM</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Terminal className="w-3.5 h-3.5" />
          <span>ML Pipeline: Standby</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200">
          Foundation Ready
        </span>
      </div>
    </header>
  );
};
