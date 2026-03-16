"use client";

import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface Recall {
  id: number;
  nhtsa_campaign_number: string;
  component: string;
  description: string;
  consequence: string;
  remedy: string;
  manufacturer: string;
  issue_date: string;
}

export function RecallsTable({ recalls }: { recalls: Recall[] }) {
  if (!recalls || recalls.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-indigo-500" /> Manufacturer Recalls
        </h3>
        <p className="text-slate-500">No recalls reported for this vehicle.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
           <AlertCircle className="w-5 h-5 text-indigo-500" /> Manufacturer Recalls
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {recalls.map((r, idx) => (
          <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Left Column: Metadata */}
              <div className="md:col-span-1 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Affected Component</span>
                  <h4 className="font-bold text-slate-800 text-sm">{r.component}</h4>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Recall ID</span>
                  <span className="text-sm font-medium px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md inline-block">
                    {r.nhtsa_campaign_number}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date Issued</span>
                  <span className="text-sm text-slate-700">
                    {r.issue_date ? format(new Date(r.issue_date), 'MMM d, yyyy') : 'Unknown'}
                  </span>
                </div>
              </div>
              
              {/* Right Column: Details */}
              <div className="md:col-span-3 space-y-4 text-sm mt-4 md:mt-0">
                <div>
                  <span className="font-semibold text-slate-800 block mb-1">Issue Overview</span>
                  <p className="text-slate-600 leading-relaxed">{r.description || 'N/A'}</p>
                </div>
                {r.consequence && (
                   <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                     <span className="font-semibold text-red-800 block mb-1">Safety Risk</span>
                     <p className="text-red-700">{r.consequence}</p>
                   </div>
                )}
                {r.remedy && (
                   <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                     <span className="font-semibold text-emerald-800 block mb-1">Manufacturer Remedy</span>
                     <p className="text-emerald-700">{r.remedy}</p>
                   </div>
                )}
              </div>
              
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Manufacturer: {r.manufacturer || 'Unknown Manufacturer'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
