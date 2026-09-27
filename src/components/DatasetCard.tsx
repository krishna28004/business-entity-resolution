import React from 'react';
import type { DatasetFileSpec } from '../types';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface DatasetCardProps {
  spec: DatasetFileSpec;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({ spec }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-mono text-xs flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-mono">{spec.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono">{spec.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Type: TSV
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
              Not uploaded
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 my-2 leading-relaxed">{spec.description}</p>

        {/* Expected TSV Columns */}
        <div className="my-3 bg-slate-50 p-2 rounded border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
            Expected Record Fields:
          </span>
          <div className="flex flex-wrap gap-1">
            {spec.columns.map((col) => (
              <span
                key={col}
                className="px-1.5 py-0.5 bg-white text-slate-700 text-[10px] font-mono rounded border border-slate-200"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload / Dropzone Placeholder */}
      <div className="border border-dashed border-slate-300 rounded p-2.5 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-not-allowed">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Select or drop file (.tsv)</span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          Frontend placeholder — Dataset upload pending
        </span>
      </div>
    </div>
  );
};
