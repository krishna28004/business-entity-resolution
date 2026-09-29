import React from 'react';
import type { ValidationRule } from '../types';
import { Clock } from 'lucide-react';

interface ValidationCheckProps {
  rule: ValidationRule;
}

export const ValidationCheck: React.FC<ValidationCheckProps> = ({ rule }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-start gap-4">
      <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">{rule.title}</h4>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              {rule.category}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Waiting for outputs
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-1.5 leading-relaxed">{rule.description}</p>

        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] font-mono text-slate-600">
          <span className="text-slate-400 select-none">Expected: </span>
          {rule.expectedBehavior}
        </div>
      </div>
    </div>
  );
};
