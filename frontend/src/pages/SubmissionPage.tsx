import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { SUBMISSION_CHECKLIST } from '../utils/constants';
import { FolderTree, CheckSquare, CheckCircle, Package } from 'lucide-react';
import type { PageId } from '../types';

interface SubmissionPageProps {
  onNavigate?: (page: PageId) => void;
}

export const SubmissionPage: React.FC<SubmissionPageProps> = () => {
  return (
    <div>
      <PageHeader
        title="Release & Packaging"
        description="Verify package layout, modular source code, tests, documentation, and production readiness checklist."
        badgeText="Production Readiness"
        actions={
          <button
            className="px-3.5 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            onClick={() => window.open('https://github.com/krishna28004/business-entity-resolution', '_blank')}
          >
            <Package className="w-3.5 h-3.5" />
            View Repository
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Required Submission File Tree Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Project Architecture Layout
            </h3>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded font-mono text-xs leading-relaxed space-y-1 overflow-x-auto">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              business-entity-resolution/
            </div>
            <div className="pl-4 text-slate-400">├── src/business_entity_resolution/</div>
            <div className="pl-8 text-blue-300">├── normalization.py</div>
            <div className="pl-8 text-blue-300">├── blocking.py</div>
            <div className="pl-8 text-blue-300">├── features.py</div>
            <div className="pl-8 text-blue-300">├── matcher.py</div>
            <div className="pl-8 text-blue-300">└── pipeline.py</div>
            <div className="pl-4 text-slate-400">├── scripts/</div>
            <div className="pl-8 text-emerald-300">├── train.py</div>
            <div className="pl-8 text-emerald-300">├── evaluate.py</div>
            <div className="pl-8 text-emerald-300">└── predict.py</div>
            <div className="pl-4 text-slate-400">├── examples/</div>
            <div className="pl-8 text-amber-300">└── run_demo.py</div>
            <div className="pl-4 text-slate-400">├── tests/</div>
            <div className="pl-4 text-slate-400">├── docs/</div>
            <div className="pl-4 text-purple-300">└── pyproject.toml</div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3">
            Modular Python package architecture designed for clean separation of concerns, unit testability, and deterministic streaming execution.
          </p>
        </div>

        {/* Readiness Checklist Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Production Readiness Checklist</span>
            </h3>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              10 / 10 Complete
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {SUBMISSION_CHECKLIST.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2 rounded bg-emerald-50/50 border border-emerald-100 text-slate-700"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium block leading-tight">{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                    Target: {item.fileOrFolder}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
