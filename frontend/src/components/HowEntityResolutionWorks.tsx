import React from 'react';
import { FileText, Database, Layers, Filter, Cpu, CheckCircle2, ShieldCheck, Package } from 'lucide-react';

interface StageNode {
  step: string;
  label: string;
  sublabel: string;
  file?: string;
  icon: React.ElementType;
}

const flowStages: StageNode[] = [
  { step: '01', label: 'SOURCE 1', sublabel: 'Reference Entity', icon: Database },
  { step: '02', label: 'SOURCE 2 + 3', sublabel: 'Independent Records', icon: Layers },
  { step: '03', label: 'DATA PREPARATION', sublabel: 'Normalization & Cleaning', icon: Filter },
  { step: '04', label: 'CANDIDATE GENERATION', sublabel: 'Blocking & Indexing', icon: Layers },
  { step: '05', label: 'CANDIDATE SET', sublabel: 'Candidate Pairs', file: 'candidate_pairs.tsv', icon: FileText },
  { step: '06', label: 'MATCHING MODEL', sublabel: 'Entity Pair Scoring', icon: Cpu },
  { step: '07', label: 'FINAL MATCHES', sublabel: 'Resolved Matches', file: 'matching_results.tsv', icon: CheckCircle2 },
  { step: '08', label: 'VALIDATION', sublabel: 'Integrity Check', icon: ShieldCheck },
  { step: '09', label: 'SUBMISSION', sublabel: 'Package Archive', icon: Package },
];

export const HowEntityResolutionWorks: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="mb-4 pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono">
            How Entity Resolution Works
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            See how records move from independent sources to candidate generation and final matching.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-slate-50 text-slate-600 px-2.5 py-1 rounded border border-slate-200 font-medium">
          Architecture Flow
        </span>
      </div>

      {/* Horizontal Flow for Desktop / Large Screens */}
      <div className="hidden lg:grid grid-cols-9 gap-1.5 py-2">
        {flowStages.map((stage) => {
          const Icon = stage.icon;
          const isFileNode = !!stage.file;
          return (
            <React.Fragment key={stage.step}>
              <div
                className={`p-2.5 rounded-md border flex flex-col justify-between text-left transition-all ${
                  isFileNode
                    ? 'bg-slate-900 text-slate-100 border-slate-800'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold ${isFileNode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stage.step}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isFileNode ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-[11px] font-bold block leading-tight font-mono ${isFileNode ? 'text-white' : 'text-slate-900'}`}>
                    {stage.label}
                  </span>
                  <span className={`text-[10px] block mt-1 leading-snug ${isFileNode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {stage.sublabel}
                  </span>
                </div>

                {stage.file && (
                  <div className="mt-2.5 pt-1.5 border-t border-slate-800 font-mono text-[9px] font-semibold text-blue-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{stage.file}</span>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Grid Layout for Medium & Mobile Screens */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-2">
        {flowStages.map((stage) => {
          const Icon = stage.icon;
          const isFileNode = !!stage.file;
          return (
            <div
              key={stage.step}
              className={`p-3 rounded-md border flex items-start gap-3 ${
                isFileNode
                  ? 'bg-slate-900 text-slate-100 border-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="p-1.5 rounded bg-slate-200/50 text-slate-700 flex-shrink-0 mt-0.5">
                <Icon className={`w-3.5 h-3.5 ${isFileNode ? 'text-blue-400' : 'text-slate-600'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{stage.step}</span>
                  <span className="text-xs font-bold font-mono">{stage.label}</span>
                </div>
                <span className="text-[11px] text-slate-500 block">{stage.sublabel}</span>
                {stage.file && (
                  <div className="mt-1.5 font-mono text-[10px] font-semibold text-blue-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span>{stage.file}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


