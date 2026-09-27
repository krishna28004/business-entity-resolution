import React from 'react';
import { FolderTree, Archive, FileText, Code2, Folder } from 'lucide-react';

export const SubmissionPackageTree: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Final Submission Package Structure Preview
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          PDF Layout Contract
        </span>
      </div>

      <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs leading-relaxed space-y-1 overflow-x-auto border border-slate-800 shadow-inner">
        <div className="text-amber-400 font-bold flex items-center gap-2 pb-1 border-b border-slate-800">
          <Archive className="w-4 h-4" />
          <span>&lt;team_name&gt;_submission.zip</span>
        </div>

        <div className="pl-3 pt-2 text-slate-400 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-semibold">output/</span>
        </div>
        <div className="pl-8 text-blue-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>matching_results.tsv</span>
        </div>
        <div className="pl-8 text-blue-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>candidate_pairs.tsv</span>
        </div>

        <div className="pl-3 pt-2 text-slate-400 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-semibold">code/</span>
        </div>
        <div className="pl-8 text-slate-400 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-slate-300 font-semibold">business_entity_resolution/</span>
        </div>
        <div className="pl-13 text-slate-400 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">src/</span>
        </div>
        <div className="pl-13 text-emerald-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>README.md</span>
        </div>
        <div className="pl-13 text-emerald-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>requirements.txt</span>
        </div>

        <div className="pl-3 pt-2 text-purple-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Documentation_template.md</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
        The submission package must follow this exact tree structure. Ground truth labels and raw test files should not be placed inside the submission zip.
      </p>
    </div>
  );
};
