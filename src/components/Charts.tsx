import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { CarRecord } from '../types';
import { BarChart3, PieChart, Activity, UploadCloud, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  records?: CarRecord[];
}

export const Charts: React.FC<ChartsProps> = ({ records = [] }) => {
  const [activeTab, setActiveTab] = useState<'yearly' | 'efficiency'>('yearly');
  const hasRecords = records && records.length > 0;

  // Dynamic calculations based strictly on records prop
  const dynamicStats = useMemo(() => {
    if (!hasRecords) {
      return {
        yearlyLabels: [],
        maintenanceData: [],
        fuelData: [],
        parkingData: [],
        taxData: [],
        detailingData: [],
        totalMaintenance: 0,
        totalFuel: 0,
        totalParking: 0,
        totalDetailing: 0,
        totalCost: 0,
        efficiencyYears: [],
        efficiencyKmL: [],
        efficiencyKm: []
      };
    }

    // Group records by year
    const yearMap: {
      [year: string]: {
        maintenance: number;
        fuel: number;
        parking: number;
        tax: number;
        detailing: number;
        minKm: number;
        maxKm: number;
      };
    } = {};

    let totalMaintenance = 0;
    let totalFuel = 0;
    let totalParking = 0;
    let totalDetailing = 0;
    let totalCost = 0;

    records.forEach((r) => {
      const year = (r.date || '').substring(0, 4) || '未知年份';
      if (!yearMap[year]) {
        yearMap[year] = { maintenance: 0, fuel: 0, parking: 0, tax: 0, detailing: 0, minKm: Infinity, maxKm: 0 };
      }

      totalCost += r.totalCost;

      if (r.km && r.km > 0) {
        if (r.km < yearMap[year].minKm) yearMap[year].minKm = r.km;
        if (r.km > yearMap[year].maxKm) yearMap[year].maxKm = r.km;
      }

      if (r.category === 'maintenance' || r.category === 'fault' || r.category === 'tuning_obd') {
        yearMap[year].maintenance += r.totalCost;
        totalMaintenance += r.totalCost;
      } else if (r.category === 'fuel') {
        yearMap[year].fuel += r.totalCost;
        totalFuel += r.totalCost;
      } else if (r.category === 'parking') {
        yearMap[year].parking += r.totalCost;
        totalParking += r.totalCost;
      } else if (r.category === 'tax_insurance') {
        yearMap[year].tax += r.totalCost;
        totalMaintenance += r.totalCost;
      } else if (r.category === 'detailing') {
        yearMap[year].detailing += r.totalCost;
        totalDetailing += r.totalCost;
      } else {
        yearMap[year].maintenance += r.totalCost;
        totalMaintenance += r.totalCost;
      }
    });

    const sortedYears = Object.keys(yearMap).sort();
    const yearlyLabels = sortedYears.map((y) => `${y}年`);
    const maintenanceData = sortedYears.map((y) => yearMap[y].maintenance);
    const fuelData = sortedYears.map((y) => yearMap[y].fuel);
    const parkingData = sortedYears.map((y) => yearMap[y].parking);
    const taxData = sortedYears.map((y) => yearMap[y].tax);
    const detailingData = sortedYears.map((y) => yearMap[y].detailing);

    // Fuel efficiency estimations from actual data
    const efficiencyYears: string[] = [];
    const efficiencyKmL: number[] = [];
    const efficiencyKm: number[] = [];

    sortedYears.forEach((y) => {
      const kmDiff = yearMap[y].maxKm > yearMap[y].minKm && yearMap[y].minKm !== Infinity
        ? yearMap[y].maxKm - yearMap[y].minKm
        : 0;
      if (kmDiff > 0 && yearMap[y].fuel > 0) {
        efficiencyYears.push(`${y}年`);
        efficiencyKm.push(kmDiff);
        const approxLiters = yearMap[y].fuel / 32; // ~32 NTD/L for 98
        const kmL = approxLiters > 0 ? parseFloat((kmDiff / approxLiters).toFixed(2)) : 11.5;
        efficiencyKmL.push(kmL);
      }
    });

    return {
      yearlyLabels,
      maintenanceData,
      fuelData,
      parkingData,
      taxData,
      detailingData,
      totalMaintenance,
      totalFuel,
      totalParking,
      totalDetailing,
      totalCost,
      efficiencyYears,
      efficiencyKmL,
      efficiencyKm
    };
  }, [records, hasRecords]);

  // Chart 1: Yearly Expenses Stacked Bar Chart
  const yearlyData = {
    labels: dynamicStats.yearlyLabels,
    datasets: [
      {
        label: '🛠️ 保修與零件',
        data: dynamicStats.maintenanceData,
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0'
      },
      {
        label: '⛽ 燃油費用',
        data: dynamicStats.fuelData,
        backgroundColor: 'rgba(6, 182, 212, 0.85)',
        borderColor: 'rgb(6, 182, 212)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0'
      },
      {
        label: '🅿️ 停車與場租費用',
        data: dynamicStats.parkingData,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0'
      },
      {
        label: '🪪 稅務與保險規費',
        data: dynamicStats.taxData,
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0'
      },
      {
        label: '🧼 洗車與鍍膜美容',
        data: dynamicStats.detailingData,
        backgroundColor: 'rgba(168, 85, 247, 0.85)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'Stack 0'
      }
    ]
  };

  const yearlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Noto Sans TC', size: 12 },
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true,
          borderRadius: 3
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            return ` ${context.dataset.label}: NT$ ${Number(context.raw).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value: any) => `NT$ ${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  // Chart 2: Cumulative Expense Distribution Doughnut
  const doughnutData = {
    labels: ['保養維修與零件', '中油 98 油資', '停車租賃費用', '洗車鍍膜美容'],
    datasets: [
      {
        data: [
          dynamicStats.totalMaintenance,
          dynamicStats.totalFuel,
          dynamicStats.totalParking,
          dynamicStats.totalDetailing
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(6, 182, 212, 0.9)',
          'rgba(99, 102, 241, 0.9)',
          'rgba(168, 85, 247, 0.9)'
        ],
        borderColor: ['#1e293b', '#1e293b', '#1e293b', '#1e293b'],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Noto Sans TC', size: 12 },
          boxWidth: 12,
          useBorderRadius: true,
          borderRadius: 4,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const val = context.raw;
            const pct = dynamicStats.totalCost > 0 ? ((val / dynamicStats.totalCost) * 100).toFixed(1) : '0.0';
            return ` ${context.label}: NT$ ${Number(val).toLocaleString()} (${pct}%)`;
          }
        }
      }
    }
  };

  // Chart 3: Fuel Efficiency & Mileage Line Chart
  const efficiencyData = {
    labels: dynamicStats.efficiencyYears,
    datasets: [
      {
        type: 'line' as const,
        label: '平均油耗 (km / L)',
        data: dynamicStats.efficiencyKmL,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        yAxisID: 'y1',
        tension: 0.35,
        fill: true
      },
      {
        type: 'bar' as const,
        label: '年度行駛里程 (km)',
        data: dynamicStats.efficiencyKm,
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y'
      }
    ]
  };

  const efficiencyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Noto Sans TC', size: 12 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value: any) => `${value} km`
        }
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#38bdf8',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (value: any) => `${value} km/L`
        }
      }
    }
  };

  const totalCostDisplay = (dynamicStats.totalCost / 10000).toFixed(1);
  const safeTotal = Math.max(dynamicStats.totalCost, 1);
  const maintPct = hasRecords ? ((dynamicStats.totalMaintenance / safeTotal) * 100).toFixed(1) : '0.0';
  const fuelPct = hasRecords ? ((dynamicStats.totalFuel / safeTotal) * 100).toFixed(1) : '0.0';
  const parkingPct = hasRecords ? ((dynamicStats.totalParking / safeTotal) * 100).toFixed(1) : '0.0';
  const detailPct = hasRecords ? ((dynamicStats.totalDetailing / safeTotal) * 100).toFixed(1) : '0.0';

  if (!hasRecords) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-200 font-tech">
            歷年養車支出趨勢圖
          </h3>
          <p className="text-xs text-slate-400 font-mono-code max-w-md mt-1">
            目前靜態資料庫尚無紀錄。於 recordsData.ts 加入工單後，系統將自動按年份彙整「保養維修、燃油油資、停車費用、稅務規費、洗車美容」並繪製成堆疊柱狀圖。
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
            <PieChart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-200 font-tech">
            累積花費佔比分佈（待計算）
          </h3>
          <p className="text-xs text-slate-400 font-mono-code max-w-xs mt-1">
            匯入工單後，系統將自動統計保修、油資、停車與美容的百分比圓餅圖。
          </p>
          <div className="text-sm font-tech font-bold text-slate-500 mt-4">
            目前總累計：NT$ 0 元
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main Trend Chart (2 Cols) */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border-slate-800 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-tech">
                {activeTab === 'yearly' ? '歷年養車支出趨勢結構 (自動即時彙整)' : '年度油耗效能 (km/L) 與行駛里程對比'}
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                {activeTab === 'yearly' ? '分項統計：維修保養 / 油資 / 停車租賃 / 規費稅務 / 美容' : 'B46/B48 節能曲線：根據您匯入之油資與里程動態計算'}
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('yearly')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              支出結構
            </button>
            <button
              onClick={() => setActiveTab('efficiency')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'efficiency'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              油耗效能
            </button>
          </div>
        </div>

        <div className="h-72 w-full mt-2">
          {activeTab === 'yearly' ? (
            <Bar data={yearlyData} options={yearlyOptions} />
          ) : (
            <Line data={efficiencyData as any} options={efficiencyOptions} />
          )}
        </div>
      </div>

      {/* Doughnut Breakdown (1 Col) */}
      <div className="glass-panel rounded-2xl p-5 border-slate-800 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-tech">累積花費佔比分佈 (動態同步)</h2>
            <p className="text-xs text-slate-400 font-mono-code">全週期四大主力花費組成</p>
          </div>
        </div>

        <div className="relative h-56 w-full flex items-center justify-center my-2">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-[11px] text-slate-400 font-mono-code uppercase tracking-wider">總投入</span>
            <span className="text-xl font-tech font-bold text-slate-100">{totalCostDisplay} 萬</span>
            <span className="text-[10px] text-slate-400 font-mono">TWD</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono-code pt-3 border-t border-slate-800">
          <div className="bg-blue-950/40 border border-blue-900/50 p-2 rounded-xl">
            <div className="text-blue-400 font-bold">{maintPct}%</div>
            <div className="text-[10px] text-slate-400">保修零件</div>
          </div>
          <div className="bg-cyan-950/40 border border-cyan-900/50 p-2 rounded-xl">
            <div className="text-cyan-400 font-bold">{fuelPct}%</div>
            <div className="text-[10px] text-slate-400">汽油燃油</div>
          </div>
          <div className="bg-indigo-950/40 border border-indigo-900/50 p-2 rounded-xl">
            <div className="text-indigo-400 font-bold">{parkingPct}%</div>
            <div className="text-[10px] text-slate-400">停車場租</div>
          </div>
          <div className="bg-purple-950/40 border border-purple-900/50 p-2 rounded-xl">
            <div className="text-purple-400 font-bold">{detailPct}%</div>
            <div className="text-[10px] text-slate-400">洗車美容</div>
          </div>
        </div>
      </div>
    </div>
  );
};
