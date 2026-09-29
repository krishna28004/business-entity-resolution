import React from 'react';
import { FileText, ArrowRight, AlertTriangle, Cpu } from 'lucide-react';

export const OutputContractCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Output Contract</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Required output files and their strict structural specifications.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-200 font-semibold">
          Pipeline Specs
        </span>
      </div>

      {/* Two Required Output File Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Card 1: matching_results.tsv */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900 font-mono">
                matching_results.tsv
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-indigo-700 font-semibold border border-indigo-200">
              Primary Resolution Target
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Final entity matches produced by the resolution engine.
          </p>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
              Required Schema Columns:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                source1_entity_id
              </span>
              <span className="text-slate-400">,</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                matched_entity_ids
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: candidate_pairs.tsv */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900 font-mono">
                candidate_pairs.tsv
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-blue-700 font-semibold border border-blue-200">
              Candidate Set Target
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Final candidate set passed to the matching model before final matching decisions.
          </p>
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
              Required Schema Columns:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                source1_entity_id
              </span>
              <span className="text-slate-400">,</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                candidate_entity_ids
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Relationship Diagram */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-lg border border-slate-800 mb-4">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mb-3">
          Artifact Dependency Pipeline
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="bg-slate-800 px-3 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono font-bold text-blue-300">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>candidate_pairs.tsv</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />

          <div className="bg-slate-800 px-3 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono text-slate-300">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Matching Model</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />

          <div className="bg-slate-800 px-3 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono font-bold text-indigo-300">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>matching_results.tsv</span>
          </div>
        </div>
      </div>

      {/* Warning / Constraint Message */}
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Critical Constraint:</span>{' '}
          <span>Every final matched entity must exist in the corresponding candidate set.</span>{' '}
          <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-amber-300 ml-1">
            FINAL MATCHES ⊆ FINAL CANDIDATES
          </code>
        </div>
      </div>
    </div>
  );
};
