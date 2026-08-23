import React, { useMemo } from 'react';
import { HIDDEN_FEATURES_LIST } from '../data/milestonesData';
import { CarRecord } from '../types';
import { X, Sparkles, Check, Monitor, Map, Search, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

interface HiddenFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: CarRecord[];
  onFilterByKeyword?: (kw: string) => void;
}

export const HiddenFeaturesModal: React.FC<HiddenFeaturesModalProps> = ({
  isOpen,
  onClose,
  records = [],
  onFilterByKeyword
}) => {
  if (!isOpen) return null;

  // Dynamically find all coding & tuning records from database
  const codingRecords = useMemo(() => {
    return records.filter(
      (r) =>
        r.category === 'tuning_obd' ||
        r.title.includes('刷隱藏') ||
        r.title.includes('導航') ||
        r.title.includes('iDrive') ||
        r.title.includes('編程') ||
        r.title.includes('圖資') ||
        (r.notes && (r.notes.includes('刷隱藏') || r.notes.includes('BimmerCode') || r.notes.includes('Comfort Plus') || r.notes.includes('SLI')))
    );
  }, [records]);

  const handleFeatureClick = (keyword: string) => {
    if (onFilterByKeyword) {
      onFilterByKeyword(keyword);
    }
    onClose();
    const tableEl = document.getElementById('records-table-anchor');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-tech text-white">
                  iDrive 6.0 & OBD 刷隱藏功能 20 項全清單
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  已同步資料庫
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                車主調校履歷 · 解鎖原廠旗艦配置 Comfort+ / Sport+ / RDC 溫度 / 11色氣氛燈 · 完整連動工單
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

        {/* Coding Work Orders in DB Banner */}
        {codingRecords.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-purple-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                公開資料庫中對應之編程與圖資升級工單 ({codingRecords.length} 筆)：
              </span>
              <button
                onClick={() => handleFeatureClick('刷隱藏')}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <span>檢索全部編程紀錄</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {codingRecords.map((cr) => (
                <div
                  key={cr.id}
                  onClick={() => handleFeatureClick(cr.date)}
                  className="bg-slate-950/80 hover:bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono-code flex items-center justify-between cursor-pointer transition-colors"
                  title="點擊以在工單庫檢視此工單"
                >
                  <div className="truncate mr-2">
                    <span className="text-cyan-400 font-bold mr-1.5">{cr.date}</span>
                    <span className="text-slate-200">{cr.title}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] shrink-0">
                    {cr.km ? `${cr.km.toLocaleString()} km` : `NT$${cr.totalCost}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden Features List */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
            <span className="uppercase font-semibold">已開通 / 調校功能明細 (點擊任一項目可在資料庫檢索)：</span>
            <span className="text-purple-400">共 20 項全數開通正常</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HIDDEN_FEATURES_LIST.map((feat) => (
              <div
                key={feat.id}
                onClick={() => handleFeatureClick(feat.name.split(' ')[0])}
                className="bg-slate-950/80 hover:bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-purple-500/40 flex items-start gap-2.5 transition-all cursor-pointer group"
                title={`點擊在工單庫中搜尋「${feat.name}」相關紀錄`}
              >
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-100 font-tech flex items-center justify-between">
                    <span className="group-hover:text-purple-300 transition-colors">{feat.id}. {feat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono font-medium ml-2 shrink-0">
                      {feat.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono-code mt-0.5 leading-snug whitespace-pre-line">
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
