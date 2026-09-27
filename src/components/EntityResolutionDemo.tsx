import React, { useState } from 'react';
import { GitCompare, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface FictionalRecord {
  id: string;
  source: string;
  businessName: string;
  businessAddress: string;
  country: string;
  nameSimilarity: string;
  addressSimilarity: string;
  countrySimilarity: string;
}

const source1Record = {
  id: 'S1-10042',
  source: 'Source 1 (Reference)',
  businessName: 'Acme Global Logistics Inc.',
  businessAddress: '100 Corporate Pkwy, Suite 400, New York, NY',
  country: 'USA',
};

const candidateRecords: FictionalRecord[] = [
  {
    id: 'S2-09412',
    source: 'Candidate A (Source 2)',
    businessName: 'Acme Global Logistics',
    businessAddress: '100 Corporate Parkway Ste 400, New York, NY',
    country: 'US',
    nameSimilarity: 'Strong similarity',
    addressSimilarity: 'Partial similarity',
    countrySimilarity: 'Strong similarity',
  },
  {
    id: 'S3-89015',
    source: 'Candidate B (Source 3)',
    businessName: 'Acme Freight Solutions Corp',
    businessAddress: '500 Industrial Blvd, Chicago, IL',
    country: 'USA',
    nameSimilarity: 'Different',
    addressSimilarity: 'Different',
    countrySimilarity: 'Strong similarity',
  },
];

export const EntityResolutionDemo: React.FC = () => {
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState<number>(0);
  const currentCand = candidateRecords[selectedCandidateIdx];

  const getSignalBadge = (statusText: string) => {
    if (statusText === 'Strong similarity') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Strong similarity
        </span>
      );
    }
    if (statusText === 'Partial similarity') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Partial similarity
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Different
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 my-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            Entity Resolution Demo
          </h3>
          <span className="text-[10px] font-semibold font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
            Interactive Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Candidate:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
            {candidateRecords.map((cand, idx) => (
              <button
                key={cand.id}
                onClick={() => setSelectedCandidateIdx(idx)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                  selectedCandidateIdx === idx
                    ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {idx === 0 ? 'Candidate A (S2)' : 'Candidate B (S3)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Demo Data Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 mb-4 text-xs text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          <strong>Demo data shown for interface preview only.</strong> No challenge dataset is being processed.
        </span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Source 1 Record */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900 font-mono">
              {source1Record.source}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
              {source1Record.id}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Business Name</span>
              <span className="font-semibold text-slate-900">{source1Record.businessName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Business Address</span>
              <span className="text-slate-700">{source1Record.businessAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Country</span>
              <span className="text-slate-700 font-mono">{source1Record.country}</span>
            </div>
          </div>
        </div>

        {/* Selected Candidate Record */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900 font-mono">
              {currentCand.source}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
              {currentCand.id}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Business Name</span>
              <span className="font-semibold text-slate-900">{currentCand.businessName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Business Address</span>
              <span className="text-slate-700">{currentCand.businessAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Country</span>
              <span className="text-slate-700 font-mono">{currentCand.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conceptual Matching Signals */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center justify-between font-mono">
          <span>Conceptual Matching Signals</span>
          <span className="text-[10px] text-slate-400 font-normal">Interface Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
              Name Signal
            </span>
            {getSignalBadge(currentCand.nameSimilarity)}
          </div>

          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
              Address Signal
            </span>
            {getSignalBadge(currentCand.addressSimilarity)}
          </div>

          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider mb-1">
              Country Signal
            </span>
            {getSignalBadge(currentCand.countrySimilarity)}
          </div>
        </div>
      </div>
    </div>
  );
};

