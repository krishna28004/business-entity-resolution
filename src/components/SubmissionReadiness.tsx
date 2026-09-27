import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

interface ReadinessItem {
  label: string;
  status: string;
}

const items: ReadinessItem[] = [
  { label: 'Output Files', status: 'Waiting' },
  { label: 'Validation', status: 'Waiting' },
  { label: 'Source Coverage', status: 'Waiting' },
  { label: 'Candidate Consistency', status: 'Waiting' },
  { label: 'Documentation', status: 'Waiting' },
  { label: 'Code Package', status: 'Waiting' },
];

export const SubmissionReadiness: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Submission Readiness</h3>
        </div>
        <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
          Initial Readiness State
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
          >
            <span className="text-slate-700 font-medium">{item.label}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-500 font-mono text-[11px] border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded p-3 text-center flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-bold text-slate-700 font-mono">
          Not ready for submission
        </span>
      </div>
    </div>
  );
};
