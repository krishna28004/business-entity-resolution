import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DatasetCard } from '../components/DatasetCard';
import { TRAINING_FILES, TEST_FILES } from '../utils/constants';
import { Database, FileSpreadsheet, Info, FileCode2 } from 'lucide-react';

export const DatasetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Datasets"
        description="Inspect Tab-Separated Value (TSV) dataset specifications for training and test evaluation workflows."
        badgeText="Expected Format: TSV"
      />

      {/* Dataset Requirements Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-3">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Expected Dataset Format</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider">Format</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                Tab-separated values (.tsv) / .csv
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider mb-1">
                Expected Record Fields
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-semibold">
                  entity_id
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-semibold">
                  business_name
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-semibold">
                  business_address
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-semibold">
                  country
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-center">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Source is identified by the entity ID prefix and dataset catalog.
                For example, <code className="font-mono font-bold text-blue-700">S1-*</code> belongs to Source 1 (Reference),{' '}
                <code className="font-mono font-bold text-indigo-700">S2-*</code> to Source 2, and{' '}
                <code className="font-mono font-bold text-purple-700">S3-*</code> to Source 3 (Secondary Registries).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TRAINING DATA */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">TRAINING DATA</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Training & Ground Truth Files
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRAINING_FILES.map((spec) => (
            <DatasetCard key={spec.id} spec={spec} />
          ))}
        </div>
      </div>

      {/* SECTION 2: TEST DATA */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">EVALUATION DATA</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Evaluation Partitions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEST_FILES.map((spec) => (
            <DatasetCard key={spec.id} spec={spec} />
          ))}
        </div>
      </div>
    </div>
  );
};
