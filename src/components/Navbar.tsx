import React from 'react';
import { Shield, Sparkles, Activity, Cpu, Compass } from 'lucide-react';
import { SUMMARY_STATS } from '../data/yearlyData';

interface NavbarProps {
  currentKm?: number;
  onOpenHunter: () => void;
  onOpenOBD: () => void;
  onOpenHiddenFeatures: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentKm,
  onOpenHunter,
  onOpenOBD,
  onOpenHiddenFeatures
}) => {
  const displayKm = currentKm && currentKm > 0 ? currentKm : SUMMARY_STATS.currentKm;
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* BMW M Tri-color Top Accent Line */}
      <div className="h-1 w-full bmw-m-stripe"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        {/* Brand & Vehicle Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-slate-900 border border-blue-500/40 text-blue-400 font-tech font-bold text-base sm:text-lg shadow-inner shrink-0">
            G30
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="font-tech text-base sm:text-lg lg:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-1.5 truncate">
                BMW 530i <span className="text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-medium">Sport Line (美規)</span>
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                B46 SULEV 2.0T / ZF 8HP50
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono-code truncate">
              全週期養護成本 & 技術履歷 · 總里程 {displayKm.toLocaleString()} km
            </p>
          </div>
        </div>

        {/* Quick Action Navigation / Hardcore Tech Links - Fully visible on both mobile portrait and desktop */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={onOpenHunter}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="查看 Hunter 3D 四輪定位參數"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">3D 定位</span>
          </button>

          <button
            onClick={onOpenOBD}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/50 hover:border-amber-400 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="查看 B46 OBD 故障代碼庫"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">OBD 故障碼</span>
          </button>

          <button
            onClick={onOpenHiddenFeatures}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:bg-purple-900/50 hover:border-purple-400 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="查看 20 項刷隱藏功能"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">刷隱藏 <span className="hidden xs:inline">20項</span></span>
          </button>
        </div>
      </div>
    </header>
  );
};
