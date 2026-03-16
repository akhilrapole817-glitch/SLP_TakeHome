"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";

interface Complaint {
  id: number;
  vin: string;
  component: string;
  description: string;
  state: string;
  crash: boolean;
  fire: boolean;
  injury: boolean;
  complaint_date: string;
}

export function ComplaintsTable({ complaints, onSearch, loading }: { complaints: Complaint[], onSearch: (symptom: string) => void, loading: boolean }) {
  const [symptom, setSymptom] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(symptom);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center sm:flex-row flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">Reported Consumer Complaints</h3>
        <form onSubmit={handleSearch} className="flex relative items-center max-w-md w-full">
          <input
            type="text"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Search symptoms (e.g. transmission slipping)..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <button type="submit" className="hidden" />
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Component</th>
              <th className="p-4 font-medium w-96">Description</th>
              <th className="p-4 font-medium">State</th>
              <th className="p-4 font-medium">Indicators</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading complaints...</td></tr>
            ) : complaints.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No complaints found.</td></tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600 whitespace-nowrap">
                    {c.complaint_date ? format(new Date(c.complaint_date), 'MMM d, yyyy') : 'Unknown'}
                  </td>
                  <td className="p-4 font-medium text-slate-800">{c.component}</td>
                  <td className="p-4 text-slate-600">
                    <div className="max-h-24 overflow-y-auto pr-2 text-xs leading-relaxed">
                      {c.description}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{c.state || 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {c.crash && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium">Crash</span>}
                      {c.fire && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium">Fire</span>}
                      {c.injury && <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-md font-medium">Injury</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
