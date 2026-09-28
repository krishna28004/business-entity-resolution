import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Layers, ArrowRight, FileText, Filter, Key, Database } from 'lucide-react';

export const CandidateGenPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Candidate Generation"
        description="Generate the final candidate set that will be passed to the matching model."
        badgeText="Pipeline Stage 03"
      />

      {/* Required Visual Workflow Box */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Candidate Generation Architecture & Output Target
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-mono font-medium text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Source 1 Records</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-medium text-indigo-900 bg-indigo-50 px-3 py-2 rounded border border-indigo-200">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Blocking / Candidate Generation</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-medium text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Final Candidate Set</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />

          <div className="flex items-center gap-2 font-mono font-bold text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-300">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>candidate_pairs.tsv</span>
          </div>
        </div>
      </div>

      {/* Candidate Generation Strategy Placeholders */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Candidate Blocking Strategy Placeholders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900">Name Similarity Blocking</h4>
            </div>
            <p className="text-xs text-slate-500">
              TF-IDF character n-gram indexing, Jaro-Winkler distance thresholding, and token prefix matching.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-900">Address Similarity Blocking</h4>
            </div>
            <p className="text-xs text-slate-500">
              Street name & building number token overlap, spatial indexing, and postal/city grouping.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900">Country Exact Match Blocking</h4>
            </div>
            <p className="text-xs text-slate-500">
              Strict country code partition blocking to prevent cross-border candidate generation.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-900">Token-Based Inverted Indexing</h4>
            </div>
            <p className="text-xs text-slate-500">
              High-recall token indexing across business names to capture word-reordered name variations.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Other Custom Blocking Rules</h4>
            </div>
            <p className="text-xs text-slate-500">
              Phonetic encoding (Double Metaphone / Soundex) and domain-specific heuristics.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-center text-center">
            <span className="text-xs font-mono text-slate-500 font-semibold">Algorithm Execution</span>
            <span className="text-[11px] text-slate-400 mt-1">Standby for dataset supply</span>
          </div>
        </div>
      </div>

      {/* Output File Representation Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono">
              output/candidate_pairs.tsv
            </h3>
            <p className="text-xs text-slate-500">
              Final blocking output file immediately before matching model.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            TSV Output Target
          </span>
        </div>

        <EmptyState
          icon={Layers}
          title="No candidate pairs generated yet."
          description="The candidate generation algorithms will populate output/candidate_pairs.tsv when the dataset is processed."
          actionText="Export candidate_pairs.tsv"
        />
      </div>
    </div>
  );
};
