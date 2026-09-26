import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Sliders, FileText, Type, MapPin, Globe, AlertCircle, Copy, Sparkles } from 'lucide-react';

export const DataPrepPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Data Preparation"
        description="Configure preprocessing rules, field standardization, string normalization, and duplicate detection for input TSV records."
        badgeText="Pipeline Stage 02"
      />

      {/* Grid of Preprocessing Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Business Name Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">Business Name Preprocessing</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Lowercasing, legal entity suffix standardization (Inc., LLC, Ltd., Corp.), punctuation stripping, and tokenization.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>

        {/* Business Address Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Business Address Preprocessing</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Street type standardization (St., Ave., Rd., Blvd.), suite/floor parsing, whitespace compression, and building number extraction.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>

        {/* Country Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900">Country Code Normalization</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            ISO-2 / ISO-3 country code mapping, full country name alias resolution, and geographical blocking group assignments.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>

        {/* Missing Values Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">Missing Values Imputation</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Handling missing address fields, country fallback defaults, and null-token representations.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>

        {/* Duplicate Detection Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Copy className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Exact Duplicate Detection</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Pre-pass identification of identical string matches across Source 1, Source 2, and Source 3 records.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>

        {/* Normalization Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900">Unicode & Character Normalization</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            ASCII transliteration, diacritic removal, non-printable character filtering, and UTF-8 encoding verification.
          </p>
          <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-500 border border-slate-100">
            Rule State: Pending dataset
          </div>
        </div>
      </div>

      {/* REQUIRED Data Preview Section with Empty State */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Normalized Data Preview</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Status: Waiting for dataset
          </span>
        </div>

        <EmptyState
          icon={Sliders}
          title="Waiting for dataset"
          description="Data preparation transform routines will generate preview tables once the TSV datasets are loaded."
        />
      </div>
    </div>
  );
};
