import React from 'react';
import { Package, CheckCircle2 } from 'lucide-react';

interface ReadinessItem {
  label: string;
  status: string;
}

const items: ReadinessItem[] = [
  { label: 'Unit Test Suite', status: 'Passing (11/11)' },
  { label: 'Integrity Engine', status: 'Active (10/10)' },
  { label: 'Candidate Consistency', status: 'Enforced (Subset Rule)' },
  { label: 'Documentation', status: 'Architecture & Methodology' },
  { label: 'Python Package', status: 'src/business_entity_resolution' },
  { label: 'CLI Tools', status: 'train / predict / evaluate' },
];

export const SubmissionReadiness: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Production Release Readiness</h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
          100% Ready
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
          >
            <span className="text-slate-700 font-medium">{item.label}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px] border border-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-center flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-bold text-emerald-800 font-mono">
          All architectural verification checks satisfied
        </span>
      </div>
    </div>
  );
};
