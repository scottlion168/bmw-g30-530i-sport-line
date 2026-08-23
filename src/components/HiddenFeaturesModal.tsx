import React from 'react';
import { HIDDEN_FEATURES_LIST } from '../data/milestonesData';
import { X, Sparkles, Check, Monitor, Map } from 'lucide-react';

interface HiddenFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HiddenFeaturesModal: React.FC<HiddenFeaturesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
                iDrive 6.0 & OBD 刷隱藏功能 20 項全清單
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                車主調校履歷 · 解鎖原廠旗艦配置 Comfort+ / Sport+ / RDC 溫度 / 11色氣氛燈
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

        {/* System Evolution Timeline */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono-code">iDrive 主機韌體版本</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">TB/MB-007.030.001</div>
            <div className="text-[10px] text-purple-400 font-mono mt-1">2021 穩定版防黑屏</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono-code">原廠導航圖資進程</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">EVO 2021 ➔ 2026 最新</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">全台 3D 建築圖標更新</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono-code">SLI 限速辨識模組</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">硬體開通 正常運作</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">儀表速限即時抬頭提示</div>
          </div>
        </div>

        {/* Hidden Features List */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-mono-code text-slate-400 uppercase font-semibold">
            已開通 / 調校功能明細：
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HIDDEN_FEATURES_LIST.map((feat) => (
              <div
                key={feat.id}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5"
              >
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 font-tech flex items-center justify-between">
                    <span>{feat.id}. {feat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono font-medium ml-2 shrink-0">
                      {feat.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono-code mt-0.5 leading-snug">
                    {feat.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
