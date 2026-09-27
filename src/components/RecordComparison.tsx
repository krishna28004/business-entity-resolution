import React from 'react';
import { GitCompare, Info } from 'lucide-react';

export const RecordComparison: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Entity Comparison Evaluator</h3>
        </div>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          Source 1 vs Candidate Pair
        </span>
      </div>

      {/* Side-by-Side Comparison Workspace with VS badge */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: SOURCE 1 RECORD */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>SOURCE 1 RECORD</span>
              <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                Reference Anchor
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Entity ID</span>
                <span className="font-mono text-slate-700 italic">Waiting for dataset (S1-xxxxx)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Business Name</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Business Address</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Country</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CANDIDATE RECORD */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>CANDIDATE RECORD</span>
              <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Source 2 / Source 3
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Entity ID</span>
                <span className="font-mono text-slate-700 italic">Waiting for dataset (S2-*/S3-*)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Business Name</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Business Address</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Country</span>
                <span className="text-slate-700 italic">Waiting for dataset</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center VS Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-800 text-white font-mono text-xs font-bold items-center justify-center border-2 border-white shadow-md z-10">
          VS
        </div>
      </div>

      {/* BELOW: MATCHING SIGNALS AND MODEL OUTPUTS */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs space-y-4">
        <div className="font-bold text-slate-300 uppercase text-[11px] tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Matching Signals & Model Evaluation</span>
          <span className="text-[10px] font-mono text-slate-400">Feature Vector Input</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono">Name Similarity</span>
            <span className="text-xs font-mono text-slate-300 font-semibold block mt-0.5">
              Waiting for model
            </span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono">Address Similarity</span>
            <span className="text-xs font-mono text-slate-300 font-semibold block mt-0.5">
              Waiting for model
            </span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono">Country</span>
            <span className="text-xs font-mono text-slate-300 font-semibold block mt-0.5">
              Waiting for model
            </span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono">Other Features</span>
            <span className="text-xs font-mono text-slate-300 font-semibold block mt-0.5">
              Waiting for model
            </span>
          </div>
        </div>

        {/* Model Output States */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800 font-mono text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Model Score</span>
            <span className="text-slate-300 font-medium block mt-0.5">Waiting for model</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Decision</span>
            <span className="text-slate-300 font-medium block mt-0.5">Waiting for model</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Confidence</span>
            <span className="text-slate-300 font-medium block mt-0.5">Waiting for model</span>
          </div>
        </div>
      </div>

      {/* Explicit Note */}
      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          Candidate records shown here will come from <code className="font-mono font-bold text-slate-800">candidate_pairs.tsv</code> after candidate generation is implemented.
        </p>
      </div>
    </div>
  );
};
