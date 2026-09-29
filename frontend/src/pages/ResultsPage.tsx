import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { OutputFileCard } from '../components/OutputFileCard';
import { FileCheck2, Layers, ArrowRight, Cpu, AlertTriangle } from 'lucide-react';
import type { PageId } from '../types';

interface ResultsPageProps {
  onNavigate?: (page: PageId) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'candidates'>('matches');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Execution Results"
        description="Inspect generated output TSV files. Maintain strict distinction between Final Matches (matching_results.tsv) and Candidate Pairs (candidate_pairs.tsv)."
        badgeText="Pipeline Stage 06"
      />

      {/* 16. RESULT RELATIONSHIP VISUALIZATION */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
          Artifact Dependency & Relationship
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 text-slate-200 p-4 rounded-lg border border-slate-800 text-xs">
          <div className="bg-slate-800 px-3.5 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono font-bold text-blue-300">
            <Layers className="w-4 h-4 text-blue-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Candidate Set</span>
              <span>candidate_pairs.tsv</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />

          <div className="bg-slate-800 px-3.5 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono text-slate-300">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Matching Model</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />

          <div className="bg-slate-800 px-3.5 py-2 rounded border border-slate-700 flex items-center gap-2 font-mono font-bold text-indigo-300">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Final Matches</span>
              <span>matching_results.tsv</span>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-bold">Key Pipeline Rule:</span>
          <span>Final matches must be a subset of candidates.</span>
          <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-amber-300">
            FINAL MATCHES ⊆ FINAL CANDIDATES
          </code>
        </div>
      </div>

      {/* 15. TWO DISTINCT TABS */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-white text-indigo-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>Final Matches (matching_results.tsv)</span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Candidate Pairs (candidate_pairs.tsv)</span>
          </button>
        </div>

        <div className="p-5">
          {/* TAB 1: FINAL MATCHES */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              <OutputFileCard
                fileName="matching_results.tsv"
                filePath="output/matching_results.tsv"
                columns={['source1_entity_id', 'matched_entity_ids']}
                description="Final entity matches produced by the resolution engine."
                rules={[
                  'Every Source 1 entity in the test set must have exactly one row.',
                  'matched_entity_ids contains comma-separated matching entity IDs.',
                  'Matches can ONLY come from Source 2 (S2-*) and Source 3 (S3-*).',
                  'Source 1 IDs (S1-*) CANNOT be used as matches.',
                  'Duplicate IDs are not allowed in the list.',
                  'A Source 1 entity may have zero, one, or multiple matches.',
                  'If there is no match, matched_entity_ids must be empty.',
                  'CRITICAL: Every matched ID MUST exist in candidate_pairs.tsv for the same Source 1 entity.',
                ]}
              />

              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h3 className="text-xs font-bold text-slate-900 font-mono">
                    matching_results.tsv Table View
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    0 Rows Output
                  </span>
                </div>

                <EmptyState
                  title="No dataset loaded"
                  description="Load entity dataset files to begin this stage."
                  actionText="Go to Datasets"
                  onAction={onNavigate ? () => onNavigate('datasets') : undefined}
                />
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE PAIRS */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              <OutputFileCard
                fileName="candidate_pairs.tsv"
                filePath="output/candidate_pairs.tsv"
                columns={['source1_entity_id', 'candidate_entity_ids']}
                description="Final candidate set passed to the matching model before final matching decisions."
                rules={[
                  'Every Source 1 entity must have exactly one row.',
                  'candidate_entity_ids contains comma-separated candidate IDs.',
                  'Candidate IDs can only come from Source 2 (S2-*) and Source 3 (S3-*).',
                  'No duplicate candidate IDs allowed.',
                  'Candidate list may be empty if no candidates are found.',
                  'This represents the FINAL candidate set produced by blocking stage.',
                  'It is NOT an early/raw blocking output.',
                ]}
              />

              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h3 className="text-xs font-bold text-slate-900 font-mono">
                    candidate_pairs.tsv Table View
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    0 Rows Output
                  </span>
                </div>

                <EmptyState
                  title="No dataset loaded"
                  description="Load entity dataset files to begin this stage."
                  actionText="Go to Datasets"
                  onAction={onNavigate ? () => onNavigate('datasets') : undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
