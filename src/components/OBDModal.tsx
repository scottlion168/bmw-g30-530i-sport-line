import React, { useMemo } from 'react';
import { OBD_CODES_LIST } from '../data/milestonesData';
import { CarRecord, OBDDiagnosticCode } from '../types';
import { X, Cpu, AlertTriangle, ShieldCheck, Search, ChevronRight, ExternalLink } from 'lucide-react';

interface OBDModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: CarRecord[];
  onSelectCode?: (code: string) => void;
}

export const OBDModal: React.FC<OBDModalProps> = ({
  isOpen,
  onClose,
  records = [],
  onSelectCode
}) => {
  if (!isOpen) return null;

  // Dynamically compute DTC code occurrences, latest resolution, and discover newly added DTCs from records
  const dynamicDtcList = useMemo(() => {
    // Map existing definitions
    const codeMap = new Map<string, OBDDiagnosticCode & { matchedRecords: CarRecord[]; isResolved: boolean; lastResolvedDate?: string }>();

    OBD_CODES_LIST.forEach((item) => {
      codeMap.set(item.code.toUpperCase(), {
        ...item,
        matchedRecords: [],
        isResolved: true
      });
    });

    // Scan records for all DTC codes
    records.forEach((rec) => {
      // Check rec.obdCodes
      const codesInRec: string[] = [];
      if (rec.obdCodes && rec.obdCodes.length > 0) {
        rec.obdCodes.forEach((c) => codesInRec.push(c.toUpperCase()));
      }

      // Check text for 6-digit hex DTCs (e.g., 21B043, 194006, 48077E, 804365, 802A30, 138207, 190302)
      const textToScan = `${rec.title} ${rec.notes || ''}`;
      const dtcRegex = /\b([0-9A-F]{6})\b/gi;
      let match;
      while ((match = dtcRegex.exec(textToScan)) !== null) {
        const foundCode = match[1].toUpperCase();
        // Filter out non-DTC numbers like part numbers or regular 6 digit numbers unless plausible
        if (codeMap.has(foundCode) || foundCode.startsWith('21B') || foundCode.startsWith('19') || foundCode.startsWith('48') || foundCode.startsWith('80') || foundCode.startsWith('13')) {
          if (!codesInRec.includes(foundCode)) {
            codesInRec.push(foundCode);
          }
        }
      }

      codesInRec.forEach((code) => {
        if (!codeMap.has(code)) {
          // Discover new DTC code automatically from records
          codeMap.set(code, {
            code: code,
            system: rec.categoryLabel || '車載電腦診斷 (DTC)',
            description: `自工單記錄中自動偵測之診斷代碼 (${rec.title})`,
            symptom: rec.notes || '診斷儀器掃描讀取',
            vehicleStatus: `於 ${rec.km ? `${rec.km.toLocaleString()} km` : rec.date} 檢出`,
            solution: rec.notes || rec.title,
            severity: 'medium',
            occurrences: [rec.date],
            matchedRecords: [rec],
            isResolved: true,
            lastResolvedDate: rec.date
          });
        } else {
          const entry = codeMap.get(code)!;
          if (!entry.matchedRecords.some((r) => r.id === rec.id)) {
            entry.matchedRecords.push(rec);
          }
        }
      });
    });

    // Process matched records into occurrences and current status
    const result = Array.from(codeMap.values()).map((item) => {
      const dates = Array.from(new Set([...item.occurrences, ...item.matchedRecords.map((r) => r.date)])).sort();
      const hasRecords = item.matchedRecords.length > 0;
      const latestRecord = hasRecords ? item.matchedRecords[item.matchedRecords.length - 1] : undefined;

      return {
        ...item,
        dynamicOccurrences: dates,
        matchedCount: item.matchedRecords.length,
        latestRecord
      };
    });

    return result;
  }, [records]);

  const handleCodeClick = (code: string) => {
    if (onSelectCode) {
      onSelectCode(code);
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
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-tech text-white">
                  BMW G30 530i (B46 美規 SULEV) 診斷故障代碼庫 (DTC)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  已同步資料庫
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                專屬故障代碼追蹤 · 自動比對工單紀錄 · AKKS百葉窗 / NVLD油箱通風 / RDCi胎壓 / 電源管理
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

        {/* Dynamic Summary Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>收錄 DTC 總數：<strong className="text-white">{dynamicDtcList.length}</strong> 個代碼</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            點擊任一代碼卡片可直接跳轉至【全週期履歷公開資料庫】篩選檢索
          </span>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {dynamicDtcList.map((item) => (
            <div
              key={item.code}
              className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold text-sm">
                    {item.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {item.system}
                  </span>
                  {item.matchedCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      比對到 {item.matchedCount} 筆工單
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 處置狀態：已徹底解決
                  </div>
                  <button
                    onClick={() => handleCodeClick(item.code)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                    title="在工單資料庫搜尋此 DTC 代碼"
                  >
                    <Search className="w-3 h-3" />
                    <span>在資料庫檢索</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="text-sm font-semibold text-slate-100 font-tech">
                  {item.description}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono-code">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-line">
                    <span className="text-slate-400 block text-[11px] font-bold">觸發徵兆與狀況：</span>
                    {item.symptom}
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-line">
                    <span className="text-emerald-400 block text-[11px] font-bold">實車處置方案與料號：</span>
                    {item.solution}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60 gap-2">
                  <span>歷史紀錄週期：{item.dynamicOccurrences.join(', ')}</span>
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
