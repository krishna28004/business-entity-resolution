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
      {/* 3. MAIN OVERVIEW HEADER */}
      <PageHeader
        title="Entity Resolution Workspace"
        description="Resolve noisy business records across independent sources."
        badgeText="Enterprise Edition"
      />

      {/* COMPACT WORKSPACE STATUS SECTION */}
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
              Not run
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Model</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] font-medium border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Not connected
            </span>
          </div>
        </div>
      </div>

      {/* 4. DATA SOURCES CARDS */}
      <DataUseCards />

      {/* 5. HOW ENTITY RESOLUTION WORKS DEMO */}
      <HowEntityResolutionWorks />

      {/* 6. ENTITY RESOLUTION DEMO */}
      <EntityResolutionDemo />

      {/* 7. WORKFLOW VISUALIZATION MILESTONES (01-08) */}
      <WorkflowDiagram onNavigate={onNavigate} />

      {/* 8. PIPELINE HEALTH SECTION */}
      <PipelineHealth />

      {/* 9. OUTPUT CONTRACT CARD */}
      <OutputContractCard />

      {/* 20. TECHNICAL CHALLENGE NOTES */}
      <ChallengeNotes />
    </div>
  );
};
