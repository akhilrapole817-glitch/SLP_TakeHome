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
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800">{r.component}</h4>
              <span className="text-sm font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                Recall #{r.nhtsa_campaign_number}
              </span>
            </div>
            
            <div className="space-y-4 text-sm mt-4">
              <div>
                <span className="font-medium text-slate-700 block mb-1">Issue Description</span>
                <p className="text-slate-600">{r.description || 'N/A'}</p>
              </div>
              {r.consequence && (
                 <div>
                   <span className="font-medium text-red-700 block mb-1">Safety Consequence</span>
                   <p className="text-red-600">{r.consequence}</p>
                 </div>
              )}
              {r.remedy && (
                 <div>
                   <span className="font-medium text-green-700 block mb-1">Remedy</span>
                   <p className="text-green-700">{r.remedy}</p>
                 </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-slate-400 flex items-center">
              <span>Manufacturer: {r.manufacturer || 'Unknown'}</span>
              <span className="mx-2">•</span>
              <span>Issued: {r.issue_date ? format(new Date(r.issue_date), 'MMMM d, yyyy') : 'Unknown'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
