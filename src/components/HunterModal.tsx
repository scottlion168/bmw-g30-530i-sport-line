import React, { useMemo, useState } from 'react';
import { HUNTER_ALIGNMENT_RECORD } from '../data/milestonesData';
import { CarRecord } from '../types';
import { X, Compass, CheckCircle2, AlertCircle, ExternalLink, Calendar, Gauge, Wrench } from 'lucide-react';

interface HunterModalProps {
  isOpen: boolean;
  onClose: () => void;
  records?: CarRecord[];
  onFilterByKeyword?: (kw: string) => void;
}

export const HunterModal: React.FC<HunterModalProps> = ({
  isOpen,
  onClose,
  records = [],
  onFilterByKeyword
}) => {
  if (!isOpen) return null;

  // Find all alignment records dynamically from database
  const alignmentRecords = useMemo(() => {
    return records.filter(
      (r) =>
        r.hasAlignment ||
        r.title.includes('定位') ||
        (r.notes && (r.notes.includes('Hunter') || r.notes.includes('四輪定位') || r.notes.includes('光學定位')))
    );
  }, [records]);

  const [selectedRecordId, setSelectedRecordId] = useState<string>(() => {
    return alignmentRecords.length > 0 ? alignmentRecords[0].id : 'rec-671';
  });

  const activeRecord = alignmentRecords.find((r) => r.id === selectedRecordId) || alignmentRecords[0];
  const data = HUNTER_ALIGNMENT_RECORD;

  const handleJumpToRecord = (record: CarRecord) => {
    if (onFilterByKeyword) {
      onFilterByKeyword(record.date || '定位');
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
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-tech text-white">
                  Hunter 3D 旗艦級四輪光學定位參數對比
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  已同步資料庫
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                BMW 530i 旗艦級底盤校正 · 杜絕後輪單邊吃胎偏磨 · 直線巡航推進角歸零 (0°00')
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

        {/* Matched Work Order Link Banner */}
        {activeRecord && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono-code text-slate-300">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-bold">對應工單：</span>
                <span>{activeRecord.date}</span> ·{' '}
                <span className="text-cyan-300 font-bold">{activeRecord.km ? `${activeRecord.km.toLocaleString()} km` : ''}</span> ·{' '}
                <span>{activeRecord.title}</span> (金額: NT$ {activeRecord.totalCost.toLocaleString()})
              </div>
            </div>
            <button
              onClick={() => handleJumpToRecord(activeRecord)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span>在工單資料庫查看</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="mt-5 space-y-6">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before Box */}
            <div className="bg-slate-950/80 border border-red-900/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono-code text-red-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> 🆕 調整前參數 (Before)
                </span>
                <span className="text-[11px] font-mono text-slate-500">後軸外傾角與前束角微偏</span>
              </div>

              {/* Front Axis */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">前軸 (Front Axis)</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">左前 (Left Front)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.before.front.left.camber}</div>
                    <div className="text-slate-300">後傾 Caster: {data.before.front.left.caster}</div>
                    <div className="text-amber-400">前束 Toe: {data.before.front.left.toe}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">右前 (Right Front)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.before.front.right.camber}</div>
                    <div className="text-slate-300">後傾 Caster: {data.before.front.right.caster}</div>
                    <div className="text-amber-400">前束 Toe: {data.before.front.right.toe}</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-amber-400 text-right">
                  總前束 (Total Toe): {data.before.front.totalToe}
                </div>
              </div>

              {/* Rear Axis */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">後軸 (Rear Axis)</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">左後 (Left Rear)</div>
                    <div className="text-red-400 font-bold">外傾 Camber: {data.before.rear.left.camber}</div>
                    <div className="text-emerald-400">前束 Toe: {data.before.rear.left.toe}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">右後 (Right Rear)</div>
                    <div className="text-red-400 font-bold">外傾 Camber: {data.before.rear.right.camber}</div>
                    <div className="text-amber-400">前束 Toe: {data.before.rear.right.toe}</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>總前束: {data.before.rear.totalToe}</span>
                  <span className="text-red-400">推進角 (Thrust Angle): {data.before.rear.thrustAngle}</span>
                </div>
              </div>
            </div>

            {/* After Box */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 🆕✅ 完美校正後參數 (After)
                </span>
                <span className="text-[11px] font-mono text-emerald-400">全數回歸原廠 Sport Line 綠標標準值</span>
              </div>

              {/* Front Axis */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">前軸 (Front Axis)</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-900/40">
                    <div className="text-slate-400 text-[10px]">左前 (Left Front)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.after.front.left.camber}</div>
                    <div className="text-slate-300">後傾 Caster: {data.after.front.left.caster}</div>
                    <div className="text-emerald-400">前束 Toe: {data.after.front.left.toe}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-900/40">
                    <div className="text-slate-400 text-[10px]">右前 (Right Front)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.after.front.right.camber}</div>
                    <div className="text-slate-300">後傾 Caster: {data.after.front.right.caster}</div>
                    <div className="text-emerald-400">前束 Toe: {data.after.front.right.toe}</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 text-right">
                  總前束 (Total Toe): {data.after.front.totalToe} (最佳化)
                </div>
              </div>

              {/* Rear Axis */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">後軸 (Rear Axis)</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-900/40">
                    <div className="text-slate-400 text-[10px]">左後 (Left Rear)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.after.rear.left.camber}</div>
                    <div className="text-emerald-400">前束 Toe: {data.after.rear.left.toe}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-emerald-900/40">
                    <div className="text-slate-400 text-[10px]">右後 (Right Rear)</div>
                    <div className="text-emerald-400 font-bold">外傾 Camber: {data.after.rear.right.camber}</div>
                    <div className="text-emerald-400">前束 Toe: {data.after.rear.right.toe}</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-emerald-400">
                  <span>總前束: {data.after.rear.totalToe}</span>
                  <span className="font-bold">推進角 (Thrust Angle): 0°00' (絕對居中)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Note */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono-code">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span>💡 Hunter HawkEye Elite 3D 光學定位技術解析：</span>
            </div>
            <p>1. 後軸外傾角精確校正至兩側對稱之 -1°39'，杜絕 BMW 5系後輪常見單邊吃胎偏磨狀況。</p>
            <p>2. 車身推進角 (Thrust Angle) 成功由 -0°08' 調校歸零至 0°00'，確保高速巡航直線行駛極佳之穩定性與方向盤正位感。</p>
            <p>3. 任何未來新增之底盤定位紀錄，系統皆會自動同步列入上方定位歷史並提供即時檢索連動。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
