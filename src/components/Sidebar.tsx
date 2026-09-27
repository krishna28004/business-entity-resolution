import React from 'react';
import type { PageId } from '../types';
import {
  LayoutDashboard,
  Database,
  Sliders,
  Layers,
  GitCompare,
  FileCheck2,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'data-prep', label: 'Data Preparation', icon: Sliders },
  { id: 'candidate-gen', label: 'Candidate Generation', icon: Layers },
  { id: 'entity-matching', label: 'Entity Matching', icon: GitCompare },
  { id: 'results', label: 'Results', icon: FileCheck2 },
  { id: 'validation', label: 'Validation', icon: ShieldCheck },
  { id: 'submission', label: 'Submission', icon: Package },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-mono text-xs font-bold">
              ER
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight tracking-tight font-mono">
                Entity Resolution
              </h1>
              <p className="text-[11px] text-slate-400 font-normal">Challenge Workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Environment State */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Environment State
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Dataset</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Not loaded
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pipeline</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Not run
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Model</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Not connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

