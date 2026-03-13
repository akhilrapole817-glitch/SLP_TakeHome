"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchVehicle } from "../services/api";
import { Search, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"vin" | "mmy">("vin");
  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await searchVehicle(
        searchType === "vin" ? { vin } : { make, model, year }
      );
      router.push(`/dashboard/${result.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to search for vehicle. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 pb-6 border-b border-slate-100 bg-indigo-600">
          <h1 className="text-2xl font-bold text-white mb-2">Vehicle Defect Intelligence Tool</h1>
          <p className="text-indigo-100 text-sm">Quickly assess defect patterns and severity for legal intake.</p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6 gap-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${searchType === "vin" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSearchType("vin")}
              type="button"
            >
              Search by VIN
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${searchType === "mmy" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
              onClick={() => setSearchType("mmy")}
              type="button"
            >
              Search by Make / Model
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {searchType === "vin" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Identification Number (VIN)</label>
                <input
                  type="text"
                  required
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Enter 17-character VIN"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Honda"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Accord"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2021"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all focus:ring-4 focus:ring-indigo-100 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Vehicle Records...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Assess Defect Patterns
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
