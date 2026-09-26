import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DatasetCard } from '../components/DatasetCard';
import { TRAINING_FILES, TEST_FILES } from '../utils/constants';
import { Database, Info, FileSpreadsheet } from 'lucide-react';

export const DatasetsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Datasets"
        description="Inspect required Tab-Separated Value (TSV) dataset specifications for training and test evaluation workflows."
        badgeText="Expected Format: TSV"
      />

      {/* Format & Specification Notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p className="font-semibold">Tab-Separated Values (.tsv) Requirement</p>
          <p className="mt-0.5 text-blue-800">
            All challenge datasets must be tab-separated files (<code className="font-mono font-bold text-blue-950">.tsv</code>).
            Ground truth is provided strictly for training (<code className="font-mono text-blue-950">train_ground_truth.tsv</code>). The test dataset does not include ground truth.
          </p>
        </div>
      </div>

      {/* SECTION 1: TRAINING DATA */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">TRAINING DATA</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            4 Required TSV Files
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
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">TEST DATA</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            3 Required TSV Files (No Ground Truth)
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
