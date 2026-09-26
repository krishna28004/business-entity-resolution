import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { WorkflowDiagram } from '../components/WorkflowDiagram';
import { WORKFLOW_STEPS } from '../utils/constants';
import { Database, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';
import type { PageId } from '../types';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

const pageMapping: Record<string, PageId> = {
  '01': 'datasets',
  '02': 'data-prep',
  '03': 'candidate-gen',
  '04': 'candidate-pairs',
  '05': 'entity-matching',
  '06': 'results',
  '07': 'validation',
  '08': 'submission',
};

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div>
      <PageHeader
        title="Entity Resolution Workspace"
        description="Resolve noisy business records across multiple sources using candidate generation, entity matching, and submission validation."
        badgeText="Challenge Specification"
      />

      {/* Initial System Alert Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Environment Ready — Awaiting Datasets</p>
          <p className="mt-0.5">
            The application structure, pipeline specification, and validation engine are initialized.
            The ML model and dataset processing pipeline will execute when official TSV files are provided.
          </p>
        </div>
      </div>

      {/* Workflow Diagram Component */}
      <WorkflowDiagram />

      {/* 8 Step Workflow Grid */}
      <div className="my-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Challenge Workflow Milestones (01 – 08)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {WORKFLOW_STEPS.map((step) => (
            <button
              key={step.stepNumber}
              onClick={() => {
                const target = pageMapping[step.stepNumber];
                if (target) onNavigate(target);
              }}
              className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="h-6 w-6 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">
                    {step.stepNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {step.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{step.subtitle}</p>
              </div>

              {step.outputArtifact && (
                <div className="mt-3 pt-2 border-t border-slate-100 font-mono text-[10px] text-blue-700 font-medium">
                  Output: {step.outputArtifact}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Core Entity Resolution Problem Statement Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Source 1 (Reference)
          </h4>
          <p className="text-xs text-slate-600">
            Deduplicated reference entity dataset (<code className="font-mono text-[11px]">S1-xxxxx</code>). Each record must have exactly one row in output TSV files.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Source 2 & Source 3
          </h4>
          <p className="text-xs text-slate-600">
            Secondary business records (<code className="font-mono text-[11px]">S2-xxxxx</code> & <code className="font-mono text-[11px]">S3-xxxxx</code>). Candidate & matching entity IDs originate exclusively from these sources.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Validation Engine
          </h4>
          <p className="text-xs text-slate-600">
            Strict PDF constraint verifier ensuring subset relationship (<code className="font-mono text-[11px]">MATCHES ⊆ CANDIDATES</code>) and TSV formatting.
          </p>
        </div>
      </div>
    </div>
  );
};
