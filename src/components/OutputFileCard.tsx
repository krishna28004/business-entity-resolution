import React from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';

interface OutputFileCardProps {
  fileName: string;
  filePath: string;
  columns: string[];
  description: string;
  rules: string[];
}

export const OutputFileCard: React.FC<OutputFileCardProps> = ({
  fileName,
  filePath,
  columns,
  description,
  rules,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono">{fileName}</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{filePath}</p>
          </div>
        </div>
        <button
          disabled
          className="px-3 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
        >
          <Download className="w-3.5 h-3.5" />
          Export TSV
        </button>
      </div>

      <p className="text-xs text-slate-600 mb-4">{description}</p>

      {/* Columns box */}
      <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Exact TSV Header Columns:
        </span>
        <div className="flex gap-2">
          {columns.map((col) => (
            <span
              key={col}
              className="px-2.5 py-1 bg-white font-mono text-xs font-semibold text-slate-800 rounded border border-slate-200 shadow-2xs"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Rules checklist */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
          Constraint Compliance Rules:
        </span>
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
