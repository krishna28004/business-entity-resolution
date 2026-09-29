import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { ValidationCheck } from '../components/ValidationCheck';
import { SubmissionReadiness } from '../components/SubmissionReadiness';
import { VALIDATION_RULES } from '../utils/constants';
import { ShieldCheck, Play, Info } from 'lucide-react';
import type { PageId } from '../types';

interface ValidationPageProps {
  onNavigate?: (page: PageId) => void;
}

export const ValidationPage: React.FC<ValidationPageProps> = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Output Integrity Validation"
        description="Verify generated output files against schema constraints, candidate subset rules, and formatting integrity."
        badgeText="Pipeline Stage 07"
        actions={
          <button
            disabled
            className="px-3.5 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
          >
            <Play className="w-3.5 h-3.5" />
            Run Validation Suite
          </button>
        }
      />

      {/* Validation Status Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Validation Engine State: Integrity Suite Ready
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              The automated validator checks compliance with data integrity rules, row order alignment, and subset validity.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
          0 / {VALIDATION_RULES.length} Checked
        </span>
      </div>

      {/* Release Readiness Panel */}
      <SubmissionReadiness />

      {/* Validation Checks Grid */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Validation Checks</h3>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Status: Waiting for outputs
          </span>
        </div>

        <div className="space-y-3">
          {VALIDATION_RULES.map((rule) => (
            <ValidationCheck key={rule.id} rule={rule} />
          ))}
        </div>
      </div>

      {/* Constraint Policy Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Validation Policy:</span>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            Checks are marked as PASS once prediction output files are generated and evaluated by the automated integrity validator (`scripts/evaluate.py`).
          </p>
        </div>
      </div>
    </div>
  );
};
