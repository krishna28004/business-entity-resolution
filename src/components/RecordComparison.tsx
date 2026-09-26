import React from 'react';
import { GitCompare } from 'lucide-react';

export const RecordComparison: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-blue-600" />
          <span>Record Comparison Evaluator Placeholder</span>
        </h3>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          Source 1 vs Candidate Pair
        </span>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SOURCE 1 RECORD */}
        <div className="bg-slate-50 rounded border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>SOURCE 1 RECORD</span>
            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Reference
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Entity ID</span>
              <span className="font-mono text-slate-700 italic">Waiting for dataset (S1-xxxxx)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Business Name</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Business Address</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Country</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
          </div>
        </div>

        {/* CANDIDATE RECORD */}
        <div className="bg-slate-50 rounded border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>CANDIDATE RECORD</span>
            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Source 2 / Source 3
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Entity ID</span>
              <span className="font-mono text-slate-700 italic">Waiting for dataset (S2-*/S3-*)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Business Name</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Business Address</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Country</span>
              <span className="text-slate-700 italic">Waiting for dataset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below: Matching Features and Model Status */}
      <div className="bg-slate-900 text-slate-200 rounded p-4 text-xs space-y-3">
        <div className="font-semibold text-white uppercase text-[11px] tracking-wider border-b border-slate-800 pb-2">
          Matching Features & Model Scoring
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1">
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Name Similarity</span>
            <span className="text-xs font-mono text-slate-300">Waiting for model</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Address Similarity</span>
            <span className="text-xs font-mono text-slate-300">Waiting for model</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Country Match</span>
            <span className="text-xs font-mono text-slate-300">Waiting for model</span>
          </div>
          <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Other Features</span>
            <span className="text-xs font-mono text-slate-300">Waiting for model</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div>
            <span className="text-slate-400 text-[11px]">Model Confidence Score: </span>
            <span className="font-mono text-amber-300 font-medium">Waiting for model</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Final Classification Decision: </span>
            <span className="font-mono text-amber-300 font-medium">Waiting for model</span>
          </div>
        </div>
      </div>
    </div>
  );
};
