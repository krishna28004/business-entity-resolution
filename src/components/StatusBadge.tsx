import React from 'react';

interface StatusBadgeProps {
  status: 'not_loaded' | 'not_run' | 'not_connected' | 'not_uploaded' | 'pending' | 'tsv' | 'subset_rule';
  customText?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customText, size = 'sm' }) => {
  const getStyles = () => {
    switch (status) {
      case 'not_loaded':
      case 'not_run':
      case 'not_connected':
      case 'not_uploaded':
      case 'pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'tsv':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-mono';
      case 'subset_rule':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-mono';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getText = () => {
    if (customText) return customText;
    switch (status) {
      case 'not_loaded':
        return 'Not Loaded';
      case 'not_run':
        return 'Not Run';
      case 'not_connected':
        return 'Not Connected';
      case 'not_uploaded':
        return 'Not Uploaded';
      case 'pending':
        return 'Validation Pending';
      case 'tsv':
        return 'TSV Format';
      case 'subset_rule':
        return 'MATCHES ⊆ CANDIDATES';
      default:
        return status;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-medium ${getStyles()} ${sizeClasses}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {getText()}
    </span>
  );
};
