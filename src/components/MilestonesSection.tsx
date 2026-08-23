import React, { useState, useMemo } from 'react';
import { B46_MILESTONES } from '../data/milestonesData';
import { MilestoneItem, CarRecord } from '../types';
import { AlertTriangle, CheckCircle2, Flame, Wrench, ShieldAlert, ChevronRight, Cpu, Zap, Tag, Clock, HelpCircle, ExternalLink } from 'lucide-react';

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

  // Jump to table helper
  const handleJumpToSearch = (keyword: string) => {
    onFilterByKeyword(keyword);
    const tableEl = document.getElementById('records-table-anchor');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Match milestones against current loaded records
  const dynamicMilestones = useMemo(() => {
    return B46_MILESTONES.map((m) => {
      // Collect search keywords, part numbers, and DTC codes for each milestone
      const searchTerms: string[] = [...m.tags];
      if (m.parts) {
        m.parts.forEach((p) => {
          searchTerms.push(p.partNumber.split(' ')[0]);
          searchTerms.push(p.name);
        });
      }
      if (m.obdCodes) {
        m.obdCodes.forEach((c) => searchTerms.push(c));
      }

      // Add specific milestone keywords
      if (m.id === 'milestone-57k') {
        searchTerms.push('冷卻', '水管', '變速箱', '火星塞', '水箱精', '進氣岐管', '6萬大保養', '熱水管');
      } else if (m.id === 'milestone-71k') {
        searchTerms.push('百葉窗', 'AKKS', '51747497279', '21B043', '21B044', '138207', '散熱器百葉窗', '進氣格柵');
      } else if (m.id === 'milestone-76k') {
        searchTerms.push('TPMS', '胎壓', '36106876957', '48077E', '胎壓感知器', '發射器', '輪胎');
      } else if (m.id === 'milestone-81k') {
        searchTerms.push('電瓶', '電池', 'AGM', 'VARTA', 'Bosch', '副電瓶', '主電瓶', '802A30', '92Ah', '60Ah');
      } else if (m.id === 'milestone-89k') {
        searchTerms.push('機油芯座', '水泵浦', '節溫器', '熱管理', '上水管', '轉接頭', '11428596283', '11518638026');
      }

      // Find ALL matching records in database
      const matchedRecords: CarRecord[] = [];
      if (hasRecords) {
        records.forEach((r) => {
          const titleLower = r.title.toLowerCase();
          const notesLower = (r.notes || '').toLowerCase();
          const partsLower = (r.partNumbers || []).map((p) => p.toLowerCase());
          const obdLower = (r.obdCodes || []).map((c) => c.toLowerCase());
          const tagsLower = ((r as any).tags || []).map((t: string) => t.toLowerCase());

          const isMatch = searchTerms.some((term) => {
            const t = term.toLowerCase();
            return (
              titleLower.includes(t) ||
              notesLower.includes(t) ||
              partsLower.some((p) => p.includes(t)) ||
              obdLower.some((c) => c.includes(t)) ||
              tagsLower.some((tag: string) => tag.includes(t))
            );
          });

          if (isMatch && !matchedRecords.some((mr) => mr.id === r.id)) {
            matchedRecords.push(r);
          }
        });
      }

      // Sort matched records by date
      matchedRecords.sort((a, b) => a.date.localeCompare(b.date));

      const primaryRecord = matchedRecords.length > 0 ? matchedRecords[matchedRecords.length - 1] : undefined;
      const totalMatchedCost = matchedRecords.reduce((sum, r) => sum + r.totalCost, 0);

      return {
        ...m,
        isMatched: matchedRecords.length > 0,
        matchedRecord: primaryRecord,
        allMatchedRecords: matchedRecords,
        displayDate: primaryRecord ? primaryRecord.date : m.date,
        displayKm: primaryRecord && primaryRecord.km ? primaryRecord.km : m.km,
        displayCost: matchedRecords.length > 0 ? totalMatchedCost : m.cost
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
                  已從公開工單資料庫比對出 {activeMilestone.allMatchedRecords?.length || 1} 筆完工紀錄
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

            {/* Matched Records Work Orders List */}
            {activeMilestone.allMatchedRecords && activeMilestone.allMatchedRecords.length > 0 && (
              <div className="bg-slate-950/70 rounded-xl p-3 border border-blue-900/40 space-y-2">
                <div className="text-xs font-bold text-blue-400 font-mono flex items-center justify-between">
                  <span>📋 對應工單紀錄 ({activeMilestone.allMatchedRecords.length} 筆)：</span>
                  <span className="text-[10px] text-slate-400 font-normal">點擊直接跳轉工單</span>
                </div>
                <div className="space-y-1.5">
                  {activeMilestone.allMatchedRecords.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleJumpToSearch(rec.date)}
                      className="bg-slate-900/90 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono-code cursor-pointer transition-colors"
                      title="點擊以在資料庫中檢視此工單"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-cyan-400 font-bold">{rec.date}</span>
                        <span className="text-slate-400">{rec.km ? `${rec.km.toLocaleString()} km` : ''}</span>
                        <span className="text-slate-200 truncate">{rec.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <span className="text-emerald-400 font-bold">NT$ {rec.totalCost.toLocaleString()}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap gap-1.5">
                {activeMilestone.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleJumpToSearch(tag)}
                    className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                    title={`在資料庫中搜尋 #${tag}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => {
                  if (activeMilestone.parts && activeMilestone.parts.length > 0) {
                    handleJumpToSearch(activeMilestone.parts[0].partNumber.split(' ')[0]);
                  } else {
                    handleJumpToSearch(activeMilestone.title.split(' ')[0]);
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
                  涉及關鍵零件與料號 (點擊檢索)：
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                  {activeMilestone.parts.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => handleJumpToSearch(p.partNumber.split(' ')[0])}
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
                  相關 OBD-II / DTC 故障碼 (點擊檢索)：
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeMilestone.obdCodes.map((code) => (
                    <span
                      key={code}
                      onClick={() => handleJumpToSearch(code)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold cursor-pointer hover:bg-amber-500/30"
                      title={`搜尋故障碼 ${code}`}
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
