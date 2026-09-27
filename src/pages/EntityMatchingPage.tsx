import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { RecordComparison } from '../components/RecordComparison';
import { EmptyState } from '../components/EmptyState';
import { GitCompare, ArrowRight, FileText, Cpu, AlertTriangle } from 'lucide-react';
import type { PageId } from '../types';

interface EntityMatchingPageProps {
  onNavigate?: (page: PageId) => void;
}

export const EntityMatchingPage: React.FC<EntityMatchingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Entity Matching"
        description="Evaluate the final candidate set and determine which candidate records refer to the same business."
        badgeText="Pipeline Stage 05"
      />

      {/* Pipeline Architecture Flow Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
          Matching Model Execution Input & Output Flow
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-300">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>candidate_pairs.tsv</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-medium text-indigo-900 bg-indigo-50 px-3 py-2 rounded border border-indigo-200">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Matching Model</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-medium text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
            <GitCompare className="w-4 h-4 text-emerald-600" />
            <span>Match Decisions</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-bold text-indigo-900 bg-indigo-50 px-3 py-2 rounded border border-indigo-300">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>matching_results.tsv</span>
          </div>
        </div>
      </div>

      {/* Record Comparison UI Component */}
      <RecordComparison />

      {/* Empty State Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <EmptyState
          title="No dataset loaded"
          description="Upload the challenge TSV files to begin this stage."
          actionText="Go to Datasets"
          onAction={onNavigate ? () => onNavigate('datasets') : undefined}
        />
      </div>

      {/* Candidate / Match Subset Rule Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Critical Candidate / Match Relationship Rule:</span>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            The matching model evaluates <strong>only</strong> pairs listed in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">candidate_pairs.tsv</code>.
            Every final matched entity ID in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">matching_results.tsv</code> MUST appear in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">candidate_pairs.tsv</code> for the same Source 1 entity (<code className="font-mono font-bold">FINAL MATCHES ⊆ FINAL CANDIDATES</code>).
          </p>
        </div>
      </div>
    </div>
  );
};
