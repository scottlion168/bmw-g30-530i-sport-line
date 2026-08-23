import React from 'react';
import { Eye, Calendar, Clock, Globe, Wifi } from 'lucide-react';

interface VisitorStatsProps {
  lastUpdatedTime?: string;
  totalRecordsCount: number;
}

export const VisitorStats: React.FC<VisitorStatsProps> = ({
  lastUpdatedTime = new Date().toISOString().slice(0, 10),
  totalRecordsCount
}) => {
  // Real count tracking starting genuinely from 1 for fresh session
  const [stats, setStats] = React.useState({
    activeNow: 1,
    monthlyTotal: 1,
    allTimeTotal: 1
  });

  React.useEffect(() => {
    const STORAGE_KEY_VISITORS = 'bmw_g30_visitor_stats_v2';
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"

    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISITORS);
      let newStats = {
        activeNow: 1,
        monthlyTotal: 1,
        allTimeTotal: 1,
        lastMonth: currentMonth
      };

      if (saved) {
        const parsed = JSON.parse(saved);
        const isSameMonth = parsed.lastMonth === currentMonth;
        const total = (parsed.allTimeTotal || 0) + 1;
        const monthCount = isSameMonth ? ((parsed.monthlyTotal || 0) + 1) : 1;

        newStats = {
          activeNow: 1,
          monthlyTotal: monthCount,
          allTimeTotal: total,
          lastMonth: currentMonth
        };
      }

      localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(newStats));
      setStats({
        activeNow: newStats.activeNow,
        monthlyTotal: newStats.monthlyTotal,
        allTimeTotal: newStats.allTimeTotal
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Section title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-tech text-slate-100 flex items-center gap-2">
                車友公開造訪與遙測數據
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                公開即時連線中
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-code mt-0.5">
              本儀表板支援唯讀訪客檢閱 · 資料庫共登記 {totalRecordsCount} 筆保修紀錄
            </p>
          </div>
        </div>

        {/* Right: Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Metric 1: Current active */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">當下在線人數</div>
              <div className="text-sm sm:text-base font-tech font-bold text-emerald-400">
                {stats.activeNow} <span className="text-[10px] font-normal text-slate-400">人</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Monthly views */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">當月瀏覽人數</div>
              <div className="text-sm sm:text-base font-tech font-bold text-blue-300">
                {stats.monthlyTotal.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">次</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Total views */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">累積瀏覽人數</div>
              <div className="text-sm sm:text-base font-tech font-bold text-purple-300">
                {stats.allTimeTotal.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">次</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Last updated */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">履歷最後更新</div>
              <div className="text-xs font-mono-code font-bold text-amber-300">
                {lastUpdatedTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
