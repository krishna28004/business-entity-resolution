import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { ValidationCheck } from '../components/ValidationCheck';
import { VALIDATION_RULES } from '../utils/constants';
import { ShieldCheck, Play, Info } from 'lucide-react';

export const ValidationPage: React.FC = () => {
  return (
    <div>
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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Validation Engine State: Integrity Suite Ready
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              The automated validator checks compliance with data integrity rules, row order alignment, and subset validity.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-mono text-xs font-semibold">
          0 / 10 Checked
        </span>
      </div>

      {/* Validation Rules Grid */}
      <div className="space-y-3 mb-6">
        {VALIDATION_RULES.map((rule) => (
          <ValidationCheck key={rule.id} rule={rule} />
        ))}
      </div>

      {/* PDF Constraint Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Validation Rigor Policy:</span>
          <p className="mt-0.5 text-blue-800">
            No check will be marked as PASS until actual output files are generated and evaluated by the submission validator.
          </p>
        </div>
      </div>
    </div>
  );
};
