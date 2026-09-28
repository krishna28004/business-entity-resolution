import React from 'react';
import type { DatasetFileSpec } from '../types';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface DatasetCardProps {
  spec: DatasetFileSpec;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({ spec }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-mono text-xs flex-shrink-0 mt-0.5">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 font-mono">{spec.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{spec.path}</p>
          </div>
        </div>
        <StatusBadge status="not_uploaded" />
      </div>

      <p className="text-xs text-slate-600 mb-3">{spec.description}</p>

      {/* Required Column Schema Badges */}
      <div className="mb-4 bg-slate-50 p-2.5 rounded border border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
          Expected TSV Columns:
        </span>
        <div className="flex flex-wrap gap-1">
          {spec.columns.map((col) => (
            <span
              key={col}
              className="px-2 py-0.5 bg-white text-slate-700 text-[11px] font-mono rounded border border-slate-200"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Upload Placeholder Zone */}
      <div className="border border-dashed border-slate-300 rounded p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-not-allowed group">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          <span className="font-medium">TSV Upload Ready</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
            .tsv only
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Dataset will be supplied in a future step. Tab-Separated Values required.
        </p>
      </div>
    </div>
  );
};
