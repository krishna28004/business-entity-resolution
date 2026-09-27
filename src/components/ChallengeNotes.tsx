import React from 'react';
import { Terminal } from 'lucide-react';

interface NoteItem {
  label: string;
  value: string;
}

const notes: NoteItem[] = [
  { label: 'Input Format', value: 'TSV (.tsv)' },
  { label: 'Total Sources', value: '3 Independent Datasets' },
  { label: 'Reference Source', value: 'Source 1 (S1-*)' },
  { label: 'Candidate Sources', value: 'Source 2 (S2-*) + Source 3 (S3-*)' },
  { label: 'Final Outputs', value: '2 TSV files (matching_results.tsv, candidate_pairs.tsv)' },
  { label: 'Evaluation Metric', value: 'F0.5 Score (Precision Weighted)' },
];

export const ChallengeNotes: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Challenge Notes</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Technical Facts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {notes.map((item) => (
          <div key={item.label} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">
              {item.label}
            </span>
            <span className="font-semibold text-slate-800 font-mono block mt-0.5">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
