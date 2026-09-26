import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { RecordComparison } from '../components/RecordComparison';
import { GitCompare, ArrowRight, FileText, Cpu } from 'lucide-react';

export const EntityMatchingPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Entity Matching"
        description="Evaluate the final candidate set and determine which candidate records refer to the same business."
        badgeText="Pipeline Stage 05"
      />

      {/* Required Pipeline Flow Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Matching Model Execution Input & Output Flow
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-300">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>candidate_pairs.tsv</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-medium text-indigo-900 bg-indigo-50 px-3 py-2 rounded border border-indigo-200">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Matching Model</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-medium text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
            <GitCompare className="w-4 h-4 text-emerald-600" />
            <span>Match Decisions</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-bold text-indigo-900 bg-white px-3 py-2 rounded border border-indigo-300">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>matching_results.tsv</span>
          </div>
        </div>
      </div>

      {/* Record Comparison UI Component */}
      <RecordComparison />

      {/* Important Subset Rule Reminder */}
      <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
        <p className="font-bold mb-1">Critical Candidate / Match Relationship Rule:</p>
        <p className="text-amber-800 leading-relaxed">
          The matching model evaluates <strong>only</strong> pairs listed in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">candidate_pairs.tsv</code>.
          Every final matched entity ID in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">matching_results.tsv</code> MUST appear in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">candidate_pairs.tsv</code> for the same Source 1 entity (<code className="font-mono font-bold">FINAL MATCHES ⊆ FINAL CANDIDATES</code>).
        </p>
      </div>
    </div>
  );
};
