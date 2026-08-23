import React from 'react';
import { Shield, Sparkles, Activity, Cpu, Compass } from 'lucide-react';
import { SUMMARY_STATS } from '../data/yearlyData';

interface NavbarProps {
  onOpenHunter: () => void;
  onOpenOBD: () => void;
  onOpenHiddenFeatures: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHunter,
  onOpenOBD,
  onOpenHiddenFeatures
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* BMW M Tri-color Top Accent Line */}
      <div className="h-1 w-full bmw-m-stripe"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Vehicle Profile */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-slate-900 border border-blue-500/40 text-blue-400 font-tech font-bold text-lg shadow-inner">
            G30
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-tech text-lg sm:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                BMW 530i <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-medium">Sport Line (美規)</span>
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                B46 SULEV 2.0T / ZF 8HP50
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-code">
              全週期養護成本 & 技術履歷儀表板 · 總里程 {SUMMARY_STATS.currentKm.toLocaleString()} km
            </p>
          </div>
        </div>

        {/* Quick Action Navigation / Hardcore Tech Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenHunter}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
            title="查看 Hunter 3D 四輪定位參數"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Hunter 3D 定位</span>
          </button>

          <button
            onClick={onOpenOBD}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 text-amber-400 border border-amber-500/30 hover:bg-amber-950/40 hover:border-amber-400 transition-all shadow-sm cursor-pointer"
            title="查看 B46 OBD 故障代碼庫"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>OBD 故障碼</span>
          </button>

          <button
            onClick={onOpenHiddenFeatures}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 text-purple-400 border border-purple-500/30 hover:bg-purple-950/40 hover:border-purple-400 transition-all shadow-sm cursor-pointer"
            title="查看 20 項刷隱藏功能"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>刷隱藏 20項</span>
          </button>
        </div>
      </div>
    </header>
  );
};
