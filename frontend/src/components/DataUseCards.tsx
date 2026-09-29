import React from 'react';
import { Database, Layers, FileCheck } from 'lucide-react';

interface DataSource {
  sourceTag: string;
  title: string;
  description: string;
  status: string;
  fileType: string;
  icon: React.ElementType;
}

const sources: DataSource[] = [
  {
    sourceTag: 'SOURCE 1',
    title: 'Reference Records',
    description: 'Deduplicated reference records used as the entity anchor.',
    status: 'Not uploaded',
    fileType: 'TSV',
    icon: Database,
  },
  {
    sourceTag: 'SOURCE 2',
    title: 'Candidate Records',
    description: 'Independent business records that may correspond to Source 1 entities.',
    status: 'Not uploaded',
    fileType: 'TSV',
    icon: Layers,
  },
  {
    sourceTag: 'SOURCE 3',
    title: 'Candidate Records',
    description: 'Independent business records that may correspond to Source 1 entities.',
    status: 'Not uploaded',
    fileType: 'TSV',
    icon: Layers,
  },
  {
    sourceTag: 'GROUND TRUTH',
    title: 'Training Labels',
    description: 'Training labels defining known Source 1 to Source 2/3 relationships.',
    status: 'Not uploaded',
    fileType: 'TSV',
    icon: FileCheck,
  },
];

export const DataUseCards: React.FC = () => {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono">
          Data Sources
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">Input TSV Files</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((src) => {
          const Icon = src.icon;
          return (
            <div
              key={src.sourceTag}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {src.sourceTag}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 font-semibold border border-slate-200">
                    {src.fileType}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{src.title}</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {src.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Status</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {src.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

