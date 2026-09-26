import React from 'react';
import { AlertCircle, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = AlertCircle,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center my-4">
      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md">{description}</p>
      {actionText && (
        <button
          onClick={onAction}
          disabled
          className="mt-4 px-3.5 py-1.5 rounded text-xs font-medium bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300 opacity-80"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
