import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

export const WorkflowDiagram: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Pipeline Execution Architecture</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict sequential resolution flow from raw TSV datasets to candidate pairs, matching model, and submission package.
          </p>
        </div>
        <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-mono font-medium flex items-center gap-1.5">
          <span>Constraint Rule:</span>
          <span className="font-bold">FINAL MATCHES ⊆ FINAL CANDIDATES</span>
        </div>
      </div>

      {/* Main Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6">
        {/* Step 1 */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
              01
            </span>
            <span className="text-xs font-semibold text-slate-800">Datasets</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">Source 1, Source 2, Source 3 TSV files</p>
          <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
            S1-xxxxx, S2-xxxxx, S3-xxxxx
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
              02
            </span>
            <span className="text-xs font-semibold text-slate-800">Data Preparation</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">Cleaning, address & country normalization</p>
          <div className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
            Normalized String Tokens
          </div>
        </div>

        {/* Step 3 & Output 1 */}
        <div className="bg-blue-50/70 border border-blue-200 rounded p-3.5 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
              03
            </span>
            <span className="text-xs font-semibold text-blue-900">Candidate Gen</span>
          </div>
          <p className="text-[11px] text-blue-800 mb-2">Blocking & Similarity candidate set creation</p>
          <div className="text-[11px] font-mono font-bold text-blue-900 bg-white p-1.5 rounded border border-blue-300 flex items-center justify-between">
            <span>candidate_pairs.tsv</span>
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Step 4 & Output 2 */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded p-3.5 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
              04
            </span>
            <span className="text-xs font-semibold text-indigo-900">Entity Matching</span>
          </div>
          <p className="text-[11px] text-indigo-800 mb-2">Model evaluation on candidate pairs</p>
          <div className="text-[11px] font-mono font-bold text-indigo-900 bg-white p-1.5 rounded border border-indigo-300 flex items-center justify-between">
            <span>matching_results.tsv</span>
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Explicit Candidate / Matching Relationship Box */}
      <div className="bg-slate-900 text-slate-200 rounded-md p-4 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold mb-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Strict Challenge Architectural Rule</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The pipeline evaluate matches strictly from the candidate set:
          <span className="font-mono text-amber-300 bg-slate-800 px-2 py-0.5 rounded mx-1">
            Candidate Generation → candidate_pairs.tsv → Matching Model → matching_results.tsv
          </span>
        </p>
        <p className="text-slate-400 text-[11px] mt-1.5">
          Matches CANNOT bypass candidate generation. Every matched entity ID in <code className="text-slate-200">matching_results.tsv</code> MUST be present in <code className="text-slate-200">candidate_pairs.tsv</code> for the corresponding Source 1 record.
        </p>
      </div>
    </div>
  );
};
