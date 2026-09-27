import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Type, MapPin, Globe, AlertCircle, Copy, Sparkles, FileText, Eye } from 'lucide-react';
import type { PageId } from '../types';

interface DataPrepPageProps {
  onNavigate?: (page: PageId) => void;
}

export const DataPrepPage: React.FC<DataPrepPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Preparation"
        description="Configure preprocessing rules, field standardization, string normalization, and duplicate detection for input TSV records."
        badgeText="Pipeline Stage 02"
        actions={
          <button
            disabled
            className="px-3.5 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Changes
          </button>
        }
      />

      {/* Grid of Data Preparation Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Normalization */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Name Normalization</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Lowercasing, legal entity suffix standardization (Inc., LLC, Ltd., Corp.), punctuation stripping, and tokenization.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>

        {/* Address Normalization */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Address Normalization</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Street type standardization (St., Ave., Rd., Blvd.), suite/floor parsing, whitespace compression, and building number extraction.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>

        {/* Country Handling */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900">Country Handling</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              ISO-2 / ISO-3 country code mapping, full country name alias resolution, and geographical blocking group assignments.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>

        {/* Missing Values */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-900">Missing Values</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Handling missing address fields, country fallback defaults, and null-token representations.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Duplicate Detection</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Pre-pass identification of identical string matches across Source 1, Source 2, and Source 3 records.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>

        {/* Unicode & Character Normalization */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">Unicode & Character Normalization</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              ASCII transliteration, diacritic removal, non-printable character filtering, and UTF-8 encoding verification.
            </p>
          </div>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-200 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-slate-600">Waiting for dataset</span>
          </div>
        </div>
      </div>

      {/* Data Preview Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Data Preview</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Status: Waiting for dataset
          </span>
        </div>

        <EmptyState
          title="No dataset loaded"
          description="Upload the challenge TSV files to begin this stage."
          actionText="Go to Datasets"
          onAction={onNavigate ? () => onNavigate('datasets') : undefined}
        />
      </div>
    </div>
  );
};
