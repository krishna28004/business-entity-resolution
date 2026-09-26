import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badgeText,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {badgeText && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {badgeText}
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-slate-500 max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
};
