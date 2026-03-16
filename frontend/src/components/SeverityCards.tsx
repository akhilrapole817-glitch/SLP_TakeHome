"use client";

import { AlertTriangle, Flame, Stethoscope, FileWarning } from "lucide-react";

interface SeverityCardsProps {
  total_crashes: number;
  total_fires: number;
  total_injuries: number;
  total_complaints: number;
}

export default function SeverityCards({ total_crashes, total_fires, total_injuries, total_complaints }: SeverityCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <FileWarning className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Reported Complaints</p>
          <p className="text-2xl font-bold text-slate-800">{total_complaints.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Crashes</p>
          <p className="text-2xl font-bold text-slate-800">{total_crashes.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Fires</p>
          <p className="text-2xl font-bold text-slate-800">{total_fires.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
        <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Injuries</p>
          <p className="text-2xl font-bold text-slate-800">{total_injuries.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
