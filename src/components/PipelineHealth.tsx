import React from 'react';
import { Activity } from 'lucide-react';

interface HealthRow {
  label: string;
  status: string;
}

const statusRows: HealthRow[] = [
  { label: 'Dataset', status: 'Not loaded' },
  { label: 'Data Preparation', status: 'Waiting' },
  { label: 'Candidate Generation', status: 'Waiting' },
  { label: 'Candidate Set', status: 'Waiting' },
  { label: 'Matching Model', status: 'Not connected' },
  { label: 'Results', status: 'Waiting' },
  { label: 'Validation', status: 'Waiting' },
  { label: 'Submission', status: 'Waiting' },
];

export const PipelineHealth: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Pipeline Status</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          State Monitor
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {statusRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
          >
            <span className="text-slate-700 font-medium">{row.label}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-600 font-mono text-[11px] border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
