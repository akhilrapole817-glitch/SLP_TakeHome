"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function MapChart({ data }: { data: { state: string, count: number }[] }) {
  // Filter out UNKNOWN or empty states and take the top 15 for readability
  const filteredData = data.filter(d => d.state && d.state !== "UNKNOWN").slice(0, 15);

  const chartData = {
    labels: filteredData.map(d => d.state),
    datasets: [
      {
        label: 'Complaints by State',
        data: filteredData.map(d => d.count),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
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
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Geographic Distribution (Top 15 States)</h3>
      <div className="flex-1 min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
