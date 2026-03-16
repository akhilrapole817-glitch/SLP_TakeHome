"use client";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

export function DefectPatternChart({ data }: { data: { component: string, count: number }[] }) {
  const topData = data.slice(0, 7);
  const chartData = {
    labels: topData.map(d => {
      let name = d.component.split(',')[0].trim();
      return name.length > 25 ? name.substring(0, 25).trim() + '...' : name;
    }),
    datasets: [
      {
        label: 'Complaint Volume',
        data: topData.map(d => d.count),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
      y: { ticks: { autoSkip: false } }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Most Reported Defect Components</h3>
      <div className="flex-1 min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export function TrendChart({ data, componentOptions = [], selectedComponent = "", onComponentSelect }: { 
  data: { year: string, count: number }[],
  componentOptions?: string[],
  selectedComponent?: string,
  onComponentSelect?: (comp: string) => void
}) {
  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Complaints',
        data: data.map(d => d.count),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Complaint Volume Over Time</h3>
        {componentOptions.length > 0 && onComponentSelect && (
          <select 
            value={selectedComponent}
            onChange={(e) => onComponentSelect(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 text-slate-700 max-w-[200px]"
          >
            <option value="">All Components</option>
            {componentOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
