import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataUseCards } from '../components/DataUseCards';
import { HowEntityResolutionWorks } from '../components/HowEntityResolutionWorks';
import { EntityResolutionDemo } from '../components/EntityResolutionDemo';
import { WorkflowDiagram } from '../components/WorkflowDiagram';
import { PipelineHealth } from '../components/PipelineHealth';
import { OutputContractCard } from '../components/OutputContractCard';
import { ChallengeNotes } from '../components/ChallengeNotes';
import type { PageId } from '../types';

interface OverviewPageProps {
  onNavigate: (page: PageId) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Entity Resolution Workspace"
        description="Resolve noisy business records across independent sources using candidate generation, pairwise feature engineering, LightGBM classification, and precision post-filtering."
        badgeText="Production Architecture"
      />

      {/* Workspace Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
          Workspace Status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Dataset</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Not loaded
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Pipeline</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Standby
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Model</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* Data Sources Cards */}
      <DataUseCards />

      {/* How Entity Resolution Works */}
      <HowEntityResolutionWorks />

      {/* Entity Resolution Interactive Demo */}
      <EntityResolutionDemo />

      {/* Workflow Visualization Milestones */}
      <WorkflowDiagram onNavigate={onNavigate} />

      {/* Pipeline Health */}
      <PipelineHealth />

      {/* Output Contract Card */}
      <OutputContractCard />

      {/* Architecture Specifications */}
      <ChallengeNotes />
    </div>
  );
};
