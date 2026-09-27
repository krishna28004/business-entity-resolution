import React from 'react';
import type { PageId } from '../types';
import { FileText } from 'lucide-react';

interface WorkflowDiagramProps {
  onNavigate?: (page: PageId) => void;
}

interface StepInfo {
  num: string;
  title: string;
  pageId: PageId;
  output?: string;
  status: 'Not started' | 'Locked / Waiting';
}

const steps: StepInfo[] = [
  { num: '01', title: 'Dataset', pageId: 'datasets', status: 'Not started' },
  { num: '02', title: 'Preparation', pageId: 'data-prep', status: 'Locked / Waiting' },
  { num: '03', title: 'Candidate Generation', pageId: 'candidate-gen', status: 'Locked / Waiting' },
  { num: '04', title: 'Candidate Set', pageId: 'candidate-pairs', output: 'candidate_pairs.tsv', status: 'Locked / Waiting' },
  { num: '05', title: 'Matching', pageId: 'entity-matching', status: 'Locked / Waiting' },
  { num: '06', title: 'Results', pageId: 'results', output: 'matching_results.tsv', status: 'Locked / Waiting' },
  { num: '07', title: 'Validation', pageId: 'validation', status: 'Locked / Waiting' },
  { num: '08', title: 'Submission', pageId: 'submission', status: 'Locked / Waiting' },
];

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase font-mono">
            Pipeline Stages (01 – 08)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any milestone stage to navigate to its detailed workspace.
          </p>
        </div>
        <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 font-mono font-medium">
          Pipeline State: Standby
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => (
          <button
            key={step.num}
            onClick={() => onNavigate?.(step.pageId)}
            className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 flex flex-col justify-between text-left transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="h-5 w-5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {step.num}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    step.status === 'Not started'
                      ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {step.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {step.title}
              </h4>
            </div>

            {step.output && (
              <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-blue-800 font-semibold flex items-center justify-between">
                <span className="truncate">{step.output}</span>
                <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

