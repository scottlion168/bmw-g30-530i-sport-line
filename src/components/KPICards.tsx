import React from 'react';
import {
  DollarSign,
  Gauge,
  Fuel,
  Wrench,
  Sparkles,
  TrendingUp,
  Calendar,
  SquareParking,
  Route,
  AlertTriangle,
  FileText,
  Flag
} from 'lucide-react';
import { CarRecord } from '../types';

interface KPICardsProps {
  records?: CarRecord[];
}

export const KPICards: React.FC<KPICardsProps> = ({ records = [] }) => {
  const hasRecords = records && records.length > 0;

  // Compute completely dynamic statistics based strictly on provided records
  let totalCost = 0;
  let totalMaintenanceCost = 0;
  let totalFuelCost = 0;
  let totalParkingCost = 0;
  let totalTollCost = 0;
  let totalTaxCost = 0;
  let totalFinesCost = 0;
  let totalDetailingCost = 0;
  let totalOtherCost = 0;
  let currentKm = 0;
  let startKm = 0;
  let totalMonths = 0;
  let dateRangeLabel = '尚未匯入資料';

  if (hasRecords) {
    totalCost = records.reduce((sum, r) => sum + r.totalCost, 0);

    totalMaintenanceCost = records
      .filter((r) => r.category === 'maintenance' || r.category === 'fault' || r.category === 'tuning_obd')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalFuelCost = records
      .filter((r) => r.category === 'fuel')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalParkingCost = records
      .filter((r) => r.category === 'parking')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalTollCost = records
      .filter((r) => r.category === 'toll')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalTaxCost = records
      .filter((r) => r.category === 'tax_insurance')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalFinesCost = records
      .filter((r) => r.category === 'fines')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalDetailingCost = records
      .filter((r) => r.category === 'detailing')
      .reduce((sum, r) => sum + r.totalCost, 0);

    totalOtherCost = records
      .filter((r) => r.category === 'other')
      .reduce((sum, r) => sum + r.totalCost, 0);

    // Mileage min & max
    const validKms = records.map((r) => r.km).filter((k): k is number => typeof k === 'number' && k > 0);
    if (validKms.length > 0) {
      currentKm = Math.max(...validKms);
      startKm = Math.min(...validKms);
    }

    // Date range
    const validDates = records.map((r) => r.date).filter(Boolean).sort();
    if (validDates.length > 0) {
      const minDate = validDates[0];
      const maxDate = validDates[validDates.length - 1];
      dateRangeLabel = `${minDate.substring(0, 7)} ~ ${maxDate.substring(0, 7)}`;

      const d1 = new Date(minDate);
      const d2 = new Date(maxDate);
      const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()) + 1;
      totalMonths = Math.max(diffMonths, 1);
    }
  }

  const drivenKm = hasRecords && currentKm > startKm ? currentKm - startKm : 0;
  const costPerKm = drivenKm > 0 ? (totalCost / drivenKm).toFixed(2) : '0.00';
  const monthlyAvg = totalMonths > 0 ? Math.round(totalCost / totalMonths) : 0;
  const yearlyAvg = Math.round(monthlyAvg * 12);

  const safeTotal = Math.max(totalCost, 1);
  const maintenancePct = hasRecords ? ((totalMaintenanceCost / safeTotal) * 100).toFixed(1) : '0.0';
  const fuelPct = hasRecords ? ((totalFuelCost / safeTotal) * 100).toFixed(1) : '0.0';
  const parkingPct = hasRecords ? ((totalParkingCost / safeTotal) * 100).toFixed(1) : '0.0';
  const tollPct = hasRecords ? ((totalTollCost / safeTotal) * 100).toFixed(1) : '0.0';
  const taxFinesPct = hasRecords ? (((totalTaxCost + totalFinesCost) / safeTotal) * 100).toFixed(1) : '0.0';
  const detailingPct = hasRecords ? ((totalDetailingCost / safeTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cost */}
        <div className="glass-panel-glow rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono-code">
              總擁車生命週期開銷
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400 font-mono">NT$</span>
              <span className="text-3xl font-tech font-bold text-white tracking-tight">
                {totalCost.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono-code">
              <span>{hasRecords ? `歷程 ${dateRangeLabel}` : '等待匯入工單'}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                {hasRecords ? `${totalMonths} 個月紀錄 (${records.length} 筆)` : '0 筆工單'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Average */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] border-slate-800 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono-code">
              平均每月養車開銷
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400 font-mono">NT$</span>
              <span className="text-3xl font-tech font-bold text-cyan-300 tracking-tight">
                {monthlyAvg.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 月</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono-code">
              <span>年均 NT$ {yearlyAvg.toLocaleString()}</span>
              <span className="text-cyan-400">{hasRecords ? '依實際工單攤提' : '尚無數據'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Per-Km Cost */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] border-slate-800 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono-code">
              每公里均攤成本
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-400 font-mono">NT$</span>
              <span className="text-3xl font-tech font-bold text-purple-300 tracking-tight">
                {costPerKm}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ km</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono-code">
              <span>累計行駛 {drivenKm > 0 ? drivenKm.toLocaleString() : 0} km</span>
              <span className="text-purple-400">全項目總合均攤</span>
            </div>
          </div>
        </div>

        {/* Card 4: Current Mileage */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] border-slate-800 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono-code">
              當前儀表總里程
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-tech font-bold text-emerald-400 tracking-tight">
                {currentKm > 0 ? currentKm.toLocaleString() : '0'}
              </span>
              <span className="text-xs text-slate-400 font-mono">km</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono-code">
              <span>起始登記 {startKm > 0 ? `${startKm.toLocaleString()} km` : '-'}</span>
              <span className="text-emerald-400 font-semibold">{hasRecords ? '正常服役中' : '待更新'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Cost Breakdown Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sub-Card 1: Maintenance */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-blue-400 font-mono">{maintenancePct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">🛠️ 保養維修</div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {totalMaintenanceCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Card 2: Fuel */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-cyan-400 font-mono">{fuelPct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">⛽ 汽油油資</div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {totalFuelCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Card 3: Parking */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <SquareParking className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-400 font-mono">{parkingPct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">🅿️ 停車費用</div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {totalParkingCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Card 4: Toll */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Route className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-teal-400 font-mono">{tollPct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">🛣️ 通行規費</div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {totalTollCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Card 5: Tax & Fines */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-amber-400 font-mono">{taxFinesPct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">
              🪪 稅險 {totalFinesCost > 0 ? `+ 罰 NT$${totalFinesCost.toLocaleString()}` : ''}
            </div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {(totalTaxCost + totalFinesCost).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sub-Card 6: Detailing & Others */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-purple-400 font-mono">{detailingPct}%</span>
          </div>
          <div className="mt-2">
            <div className="text-[11px] text-slate-400 font-mono-code truncate">🧼 洗車美容</div>
            <div className="text-sm font-tech font-bold text-slate-100 mt-0.5">
              NT$ {totalDetailingCost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
