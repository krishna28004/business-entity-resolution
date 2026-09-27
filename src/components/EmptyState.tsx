import React from 'react';
import { Database, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Database,
  title = 'No dataset loaded',
  description = 'Upload the challenge TSV files to begin this stage.',
  actionText,
  onAction,
}) => {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center flex flex-col items-center justify-center my-4">
      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3 border border-slate-200">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">{description}</p>
      {actionText && (
        <button
          onClick={onAction}
          disabled={!onAction}
          className={`mt-4 px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
            onAction
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-2xs'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
