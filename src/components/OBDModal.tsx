import React from 'react';
import { OBD_CODES_LIST } from '../data/milestonesData';
import { X, Cpu, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

interface OBDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode?: (code: string) => void;
}

export const OBDModal: React.FC<OBDModalProps> = ({ isOpen, onClose, onSelectCode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
                BMW G30 530i (B46 美規 SULEV) 診斷故障代碼庫 (DTC)
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                車載專屬故障歷史追蹤 · AKKS百葉窗 / NVLD油箱通風 (美規專屬) / RDCi胎壓 / 電源管理
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-4">
          {OBD_CODES_LIST.map((item) => (
            <div
              key={item.code}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold text-sm">
                    {item.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {item.system}
                  </span>
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 處置狀態：已徹底解決
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="text-sm font-semibold text-slate-100 font-tech">
                  {item.description}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono-code">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-slate-400 block text-[11px] font-bold">觸發徵兆與狀況：</span>
                    {item.symptom}
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-emerald-400 block text-[11px] font-bold">實車處置方案與料號：</span>
                    {item.solution}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>歷史紀錄週期：{item.occurrences.join(', ')}</span>
                  <span className="text-cyan-400">{item.vehicleStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
