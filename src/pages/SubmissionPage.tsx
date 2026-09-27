import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { SubmissionReadiness } from '../components/SubmissionReadiness';
import { SubmissionPackageTree } from '../components/SubmissionPackageTree';
import { SUBMISSION_CHECKLIST } from '../utils/constants';
import { CheckSquare, Square, Archive, Info } from 'lucide-react';
import type { PageId } from '../types';

interface SubmissionPageProps {
  onNavigate?: (page: PageId) => void;
}

export const SubmissionPage: React.FC<SubmissionPageProps> = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Final Submission Package"
        description="Verify submission zip package layout, source code reproducibility, documentation, and completion checklist."
        badgeText="Pipeline Stage 08"
        actions={
          <button
            disabled
            className="px-3.5 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
          >
            <Archive className="w-3.5 h-3.5" />
            Generate &lt;team_name&gt;_submission.zip
          </button>
        }
      />

      {/* 18. SUBMISSION READINESS PANEL */}
      <SubmissionReadiness />

      {/* 19. FINAL SUBMISSION PACKAGE FILE-TREE */}
      <SubmissionPackageTree />

      {/* SUBMISSION READINESS CHECKLIST CARD */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Submission Verification Checklist
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            0 / {SUBMISSION_CHECKLIST.length} Completed
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {SUBMISSION_CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
            >
              <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-medium block leading-tight">{item.label}</span>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Target: {item.fileOrFolder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The final submission archive will be generated automatically once all pipeline stages complete and pass validation.
        </p>
      </div>
    </div>
  );
};
