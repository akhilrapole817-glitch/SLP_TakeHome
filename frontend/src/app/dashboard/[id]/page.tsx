"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData, getComplaints, getRecalls } from "@/services/api";
import SeverityCards from "@/components/SeverityCards";
import { DefectPatternChart, TrendChart } from "@/components/Charts";
import { MapChart } from "@/components/MapChart";
import { ComplaintsTable } from "@/components/ComplaintsTable";
import { RecallsTable } from "@/components/RecallsTable";
import { ArrowLeft, Loader2, FileDown } from "lucide-react";

export default function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [recalls, setRecalls] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashData, compData, recData] = await Promise.all([
          getDashboardData(Number(id)),
          getComplaints(Number(id)),
          getRecalls(Number(id))
        ]);
        setDashboardData(dashData);
        setComplaints(compData);
        setRecalls(recData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const [selectedComponent, setSelectedComponent] = useState("");
  
  // Create filtered trend data
  const trendData = selectedComponent
    ? dashboardData?.trends_by_component?.[selectedComponent] || []
    : dashboardData?.trends || [];

  const handleSymptomSearch = async (symptom: string) => {
    try {
      setComplaintsLoading(true);
      const data = await getComplaints(Number(id), symptom);
      setComplaints(data);
    } catch (err) {
      console.error("Failed to search complaints", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-indigo-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Aggregating NHTSA Data...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-600">Vehicle data not found.</p>
        <button onClick={() => router.push('/')} className="text-indigo-600 hover:underline">Return to Search</button>
      </div>
    );
  }

  const vehicle = dashboardData.vehicle;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                {vehicle.vin ? `VIN: ${vehicle.vin}` : 'General Vehicle Query'}
              </p>
            </div>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
            <FileDown className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Safety Severity Indicators</h2>
          <SeverityCards {...dashboardData.severity} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DefectPatternChart data={dashboardData.defect_patterns} />
          <TrendChart 
            data={trendData} 
            componentOptions={dashboardData.defect_patterns.map((d: any) => d.component)}
            selectedComponent={selectedComponent}
            onComponentSelect={setSelectedComponent}
          />
        </section>

        <section>
          <MapChart data={dashboardData.state_distribution} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Manufacturer Recalls</h2>
          <RecallsTable recalls={recalls} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Symptom Search & Complaints</h2>
          <ComplaintsTable 
            complaints={complaints} 
            onSearch={handleSymptomSearch} 
            loading={complaintsLoading} 
          />
        </section>
      </main>
    </div>
  );
}
