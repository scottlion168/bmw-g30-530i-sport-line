import React, { useState, useMemo } from 'react';
import { B46_MILESTONES } from '../data/milestonesData';
import { MilestoneItem, CarRecord } from '../types';
import { AlertTriangle, CheckCircle2, Flame, Wrench, ShieldAlert, ChevronRight, Cpu, Zap, Tag, Clock, HelpCircle } from 'lucide-react';

interface MilestonesSectionProps {
  records?: CarRecord[];
  onSelectMilestone: (item: MilestoneItem) => void;
  onFilterByKeyword: (kw: string) => void;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  records = [],
  onSelectMilestone,
  onFilterByKeyword
}) => {
  const [selectedId, setSelectedId] = useState<string>(B46_MILESTONES[0].id);
  const hasRecords = records && records.length > 0;

  // Match milestones against current loaded records
  const dynamicMilestones = useMemo(() => {
    return B46_MILESTONES.map((m) => {
      // Define search keywords for each milestone
      let keywords: string[] = [];
      if (m.id === 'milestone-57k') {
        keywords = ['冷卻', '水管', '變速箱', '火星塞', '水箱精', '進氣岐管', '6萬大保養'];
      } else if (m.id === 'milestone-71k') {
        keywords = ['百葉窗', 'akks', '51747497279', '21b043', '21b044', '138207', '散熱器百葉窗', '進氣格柵'];
      } else if (m.id === 'milestone-76k') {
        keywords = ['tpms', '胎壓', '36106876957', '48077e', '胎壓感知器', '發射器'];
      } else if (m.id === 'milestone-81k') {
        keywords = ['電瓶', '電池', 'agm', 'varta', 'bosch', '副電瓶', '主電瓶', '802a30'];
      } else if (m.id === 'milestone-89k') {
        keywords = ['機油芯座', '水泵浦', '節溫器', '熱管理', '上水管', '轉接頭'];
      }

      // Search in records
      let matchedRecord: CarRecord | undefined;
      if (hasRecords) {
        matchedRecord = records.find((r) => {
          const fullText = (r.title + ' ' + (r.notes || '') + ' ' + (r.partNumbers?.join(' ') || '') + ' ' + (r.obdCodes?.join(' ') || '')).toLowerCase();
          return keywords.some((kw) => fullText.includes(kw.toLowerCase()));
        });
      }

      return {
        ...m,
        isMatched: !!matchedRecord,
        matchedRecord,
        displayDate: matchedRecord ? matchedRecord.date : m.date,
        displayKm: matchedRecord && matchedRecord.km ? matchedRecord.km : m.km,
        displayCost: matchedRecord ? matchedRecord.totalCost : m.cost
      };
    });
  }, [records, hasRecords]);

  const activeMilestone = dynamicMilestones.find((m) => m.id === selectedId) || dynamicMilestones[0];
  const matchedCount = dynamicMilestones.filter((m) => m.isMatched).length;

  return (
    <div className="glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-tech flex items-center gap-2">
              B46 (美規 SULEV) 關鍵預防性保養與模組通病雷達
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono font-medium">
                Key Milestones
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono-code">
              掌控 5萬~9萬公里 BMW 模組化底盤與渦輪引擎高熱耗損週期 · 自動對照您的工單紀錄
            </p>
          </div>
        </div>

        <div className="text-xs font-mono-code flex items-center gap-2">
          {hasRecords ? (
            matchedCount === dynamicMilestones.length ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                5項全數在工單中比對吻合 (已完工)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                已在工單中比對到 {matchedCount} / {dynamicMilestones.length} 項
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              尚未匯入工單 · 雷達處於待比對狀態
            </span>
          )}
        </div>
      </div>

      {/* Milestone Step Indicator Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {dynamicMilestones.map((m, idx) => {
          const isSelected = m.id === selectedId;

          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                onSelectMilestone(m);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-tech font-bold text-slate-100 text-sm">
                  {m.displayKm.toLocaleString()} km
                </span>
                <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
              </div>
              <div className="text-xs font-medium text-slate-300 line-clamp-1">
                {m.title.split(' ')[0]}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                {m.isMatched ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-500/40 text-emerald-400 bg-emerald-950/30 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 已在工單
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-700 text-slate-400 bg-slate-900">
                    {hasRecords ? '未比對到' : '待匯入比對'}
                  </span>
                )}
                <span className="font-mono text-slate-300 font-semibold">
                  NT$ {(m.displayCost / 1000).toFixed(0)}k
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Deep Dive Details Card */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          {/* Left Column: Symptoms & Solution */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-tech text-xs font-bold">
                {activeMilestone.displayKm.toLocaleString()} km · {activeMilestone.displayDate}
              </span>
              <span className="text-xs font-mono text-slate-400">
                系統模組：{activeMilestone.systemLabel}
              </span>
              {activeMilestone.isMatched ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  已從目前工單庫確認完工紀錄
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                  {hasRecords ? '未在現存工單比對到此料號/項目' : '等待 CSV 匯入後自動比對'}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white font-tech">
              {activeMilestone.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {activeMilestone.description}
            </p>

            {/* Symptoms & Solution Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
                <div className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  通病徵兆 / 故障情境：
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line font-sans">{activeMilestone.symptoms}</div>
              </div>

              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5 mb-1">
                  <Wrench className="w-3.5 h-3.5" />
                  預防升級 / 根治方案：
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line font-sans">{activeMilestone.solution}</div>
              </div>
            </div>

            {/* Matched Record Notes */}
            {activeMilestone.matchedRecord?.notes && (
              <div className="bg-slate-950/70 rounded-xl p-3 border border-blue-900/40">
                <div className="text-xs font-bold text-blue-400 font-mono flex items-center gap-1.5 mb-1">
                  📋 實際施工備註：
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-line font-sans leading-relaxed">
                  {activeMilestone.matchedRecord.notes}
                </div>
              </div>
            )}

            {/* Tags & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap gap-1.5">
                {activeMilestone.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => onFilterByKeyword(tag)}
                    className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  if (activeMilestone.parts && activeMilestone.parts.length > 0) {
                    onFilterByKeyword(activeMilestone.parts[0].partNumber.split(' ')[0]);
                  } else {
                    onFilterByKeyword(activeMilestone.title.split(' ')[0]);
                  }
                }}
                className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>在工單資料庫搜尋此項目</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Cost & Parts List */}
          <div className="w-full lg:w-72 bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400 font-mono">
                {activeMilestone.isMatched ? '工單實際支出' : '預估維修開銷'}
              </span>
              <span className="text-lg font-tech font-bold text-white">
                NT$ {activeMilestone.displayCost.toLocaleString()}
              </span>
            </div>

            {/* Parts / Hardware List */}
            {activeMilestone.parts && activeMilestone.parts.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  涉及關鍵零件與料號：
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                  {activeMilestone.parts.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => onFilterByKeyword(p.partNumber.split(' ')[0])}
                      className="text-[11px] font-mono-code bg-slate-900/90 hover:bg-slate-800/90 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                      title="點擊以搜尋此料號"
                    >
                      <div className="truncate mr-2">
                        <div className="text-slate-200 truncate">{p.name}</div>
                        <div className="text-[10px] text-cyan-400">{p.partNumber}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{p.brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OBD Codes */}
            {activeMilestone.obdCodes && activeMilestone.obdCodes.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-mono text-amber-400 block mb-1">
                  相關 OBD-II / DTC 故障碼：
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeMilestone.obdCodes.map((code) => (
                    <span
                      key={code}
                      onClick={() => onFilterByKeyword(code)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold cursor-pointer hover:bg-amber-500/30"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
