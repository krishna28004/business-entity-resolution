import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { SUBMISSION_CHECKLIST } from '../utils/constants';
import { FolderTree, CheckSquare, Square, Archive } from 'lucide-react';

export const SubmissionPage: React.FC = () => {
  return (
    <div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Required Submission File Tree Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Required Submission Zip Layout Specification
            </h3>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded font-mono text-xs leading-relaxed space-y-1 overflow-x-auto">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5" />
              &lt;team_name&gt;_submission.zip
            </div>
            <div className="pl-4 text-slate-400">├── output/</div>
            <div className="pl-8 text-blue-300">├── matching_results.tsv</div>
            <div className="pl-8 text-blue-300">└── candidate_pairs.tsv</div>
            <div className="pl-4 text-slate-400">│</div>
            <div className="pl-4 text-slate-400">├── code/</div>
            <div className="pl-8 text-slate-300">└── business_entity_resolution/</div>
            <div className="pl-12 text-slate-400">├── src/</div>
            <div className="pl-12 text-emerald-300">├── README.md</div>
            <div className="pl-12 text-emerald-300">└── requirements.txt</div>
            <div className="pl-4 text-slate-400">│</div>
            <div className="pl-4 text-purple-300">└── Documentation_template.md</div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3">
            Source code must be strictly reproducible. The README must document data preparation, candidate generation, entity matching model, and output generation.
          </p>
        </div>

        {/* Readiness Checklist Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-600" />
              <span>Submission Readiness Checklist</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              0 / 11 Complete
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {SUBMISSION_CHECKLIST.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-100 text-slate-700"
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
      </div>
    </div>
  );
};
