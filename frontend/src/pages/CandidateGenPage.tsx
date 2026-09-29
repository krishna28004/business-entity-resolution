import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Layers, ArrowRight, FileText, Filter, Key, Database, Eye } from 'lucide-react';
import type { PageId } from '../types';

interface CandidateGenPageProps {
  onNavigate?: (page: PageId) => void;
}

export const CandidateGenPage: React.FC<CandidateGenPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Generation"
        description="Candidate generation reduces the search space before final entity matching."
        badgeText="Pipeline Stage 03"
      />

      {/* Pipeline Visual Flow Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
          Candidate Generation Workflow
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-2 font-semibold text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Source 1</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-semibold text-indigo-900 bg-indigo-50 px-3 py-2 rounded border border-indigo-200">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Blocking / Candidate Generation</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-semibold text-amber-900 bg-amber-50 px-3 py-2 rounded border border-amber-200">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Final Candidate Set</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-bold text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-300">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>candidate_pairs.tsv</span>
          </div>
        </div>
      </div>

      {/* Candidate Generation Strategy Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Candidate Generation Strategy
          </h3>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Configurable Strategy Areas
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Candidate generation reduces the search space before final entity matching. Configure blocking rules and similarity criteria below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Business Name */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900">Business Name</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              TF-IDF n-grams, Jaro-Winkler thresholding, legal suffix stripping, prefix indexing.
            </p>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
              Strategy: Pending dataset
            </span>
          </div>

          {/* Address */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900">Address</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Street name & building number token overlap, spatial indexing, postal code grouping.
            </p>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
              Strategy: Pending dataset
            </span>
          </div>

          {/* Country */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900">Country</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Strict country code partition blocking to prevent cross-border false candidates.
            </p>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
              Strategy: Pending dataset
            </span>
          </div>

          {/* Token Similarity */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-900">Token Similarity</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              High-recall token inverted index across business names for word-reordered variations.
            </p>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
              Strategy: Pending dataset
            </span>
          </div>

          {/* Other Blocking Rules */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Other Blocking Rules</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
              Phonetic encoding (Double Metaphone / Soundex) and domain-specific heuristics.
            </p>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
              Strategy: Pending dataset
            </span>
          </div>

          {/* Execution Status */}
          <div className="bg-slate-100 border border-slate-200 rounded p-3.5 flex flex-col justify-center text-center">
            <span className="text-xs font-mono font-bold text-slate-700">Algorithm Execution</span>
            <span className="text-[11px] text-slate-500 mt-1">Standby for dataset supply</span>
          </div>
        </div>
      </div>

      {/* Candidate Output Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Candidate Output</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900 block mt-0.5">
              candidate_pairs.tsv
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-[11px] font-mono text-slate-600">
              Columns:{' '}
              <span className="font-bold text-slate-800">
                source1_entity_id, candidate_entity_ids
              </span>
            </div>
            <button
              disabled
              className="px-3 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview candidate_pairs.tsv
            </button>
          </div>
        </div>

        <EmptyState
          title="No dataset loaded"
          description="Load entity dataset files to begin this stage."
          actionText="Go to Datasets"
          onAction={onNavigate ? () => onNavigate('datasets') : undefined}
        />
      </div>
    </div>
  );
};
