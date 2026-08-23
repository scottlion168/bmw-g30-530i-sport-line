import React, { useState } from 'react';
import { CarRecord, ImportSummary, ImportPreviewItem } from '../types';
import { parseCSVText, applyBatchImport } from '../utils/recordManager';
import {
  X,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecords: CarRecord[];
  onImportComplete: (updatedRecords: CarRecord[], addedCount: number, overwrittenCount: number, skippedCount: number) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  currentRecords,
  onImportComplete
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [parsedSummary, setParsedSummary] = useState<ImportSummary | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'overwrite'>('skip');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'duplicate'>('all');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const sampleCSVTemplate = `日期,里程,分類,項目說明,店家,金額,備註
2026-08-22,89746,保養維修,B46 節溫器與水泵浦預防性大修,台中雙B專修外廠,64050,更換水泵浦/機油芯座/節溫器
2026-08-15,89420,油資紀錄,98無鉛汽油 52.4L,台灣中油直營門市,1650,行駛里程 620km 油耗 11.8 km/L
2026-08-01,88950,洗車美容,全車精緻泡沫洗車+手工棕櫚蠟,汽車美容專門店,1200,車漆與輪圈深層清潔`;

  const handleParse = () => {
    if (!rawText.trim()) {
      alert('請先在輸入框貼上 CSV 文本或上傳檔案！');
      return;
    }
    const summary = parseCSVText(rawText, currentRecords);
    setParsedSummary(summary);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      const summary = parseCSVText(content, currentRecords);
      setParsedSummary(summary);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedSummary || parsedSummary.items.length === 0) return;

    const result = applyBatchImport(parsedSummary.items, duplicateMode, currentRecords);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.2 } });
    onImportComplete(result.updatedRecords, result.addedCount, result.overwrittenCount, result.skippedCount);
    onClose();
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(sampleCSVTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const filteredPreviewItems = parsedSummary
    ? parsedSummary.items.filter((item) => {
        if (activeTab === 'new') return !item.isDuplicate;
        if (activeTab === 'duplicate') return item.isDuplicate;
        return true;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
                批次匯入養護資料 (含防呆查重辨識)
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                支援 CSV 格式與 Excel / Google Sheets 複製貼上 · 自動辨識重複項目杜絕資料錯亂
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

        {/* Step 1: Input or File Upload */}
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <span>貼上文字 或 上傳 CSV / TXT 檔案：</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyTemplate}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate ? '已複製範本' : '複製 CSV 格式範本'}</span>
              </button>
              <label className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center gap-1 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>上傳 CSV 檔案</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`直接在此貼上 Excel 表格欄位或 CSV 文字...\n例如:\n2026-08-22\t89746\t保養維修\tB46 節溫器與水泵浦更換\t專修廠\t64050\t更換原廠件`}
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 font-mono-code leading-relaxed placeholder-slate-600"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleParse}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>開始解析與查重檢測 (Parse & Verify)</span>
            </button>
          </div>
        </div>

        {/* Step 2: Parsed Result & De-duplication Controller */}
        {parsedSummary && (
          <div className="mt-6 border-t border-slate-800 pt-5 space-y-4">
            {/* Deduplication Strategy Box */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold font-tech text-white">
                    智慧防呆查重辨識結果：
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    共掃描 {parsedSummary.totalParsed} 筆
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                    🆕 全新待新增：{parsedSummary.newCount} 筆
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold">
                    🔁 辨識出重複：{parsedSummary.duplicateCount} 筆
                  </span>
                </div>
              </div>

              {/* Deduplication Mode Radio */}
              {parsedSummary.duplicateCount > 0 && (
                <div className="mt-2 pt-3 border-t border-slate-800/80">
                  <div className="text-xs font-mono text-slate-300 mb-2 font-semibold">
                    🛡️ 當遇到重複之紀錄時的處理方式（防呆設定）：
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                    <label
                      onClick={() => setDuplicateMode('skip')}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        duplicateMode === 'skip'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'skip'}
                        onChange={() => setDuplicateMode('skip')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>智慧跳過重複項目（推薦防呆）</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          絕不重複累加已有紀錄，僅新增資料庫所缺少的 {parsedSummary.newCount} 筆全新資料。
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setDuplicateMode('overwrite')}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        duplicateMode === 'overwrite'
                          ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'overwrite'}
                        onChange={() => setDuplicateMode('overwrite')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4 text-blue-400" />
                          <span>以新資料覆蓋現有重複項目</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          若匯入的新資料含有更新的備註或金額，將自動刷新已有舊資料。
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Preview List Filter Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    activeTab === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  全部預覽 ({parsedSummary.totalParsed})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    activeTab === 'new'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  全新項目 ({parsedSummary.newCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('duplicate')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                    activeTab === 'duplicate'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  重複項目 ({parsedSummary.duplicateCount})
                </button>
              </div>
            </div>

            {/* Preview Scrollable Table */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs">
              {filteredPreviewItems.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono">
                  目前分頁無相符項目
                </div>
              ) : (
                filteredPreviewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 flex flex-wrap items-center justify-between gap-2 ${
                      item.isDuplicate ? 'bg-amber-950/10' : 'bg-slate-950/40'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-bold">{item.record.date}</span>
                        <span className="font-mono text-slate-400">
                          {item.record.km ? `${item.record.km.toLocaleString()} km` : '-'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                          {item.record.categoryLabel}
                        </span>
                        {item.isDuplicate ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 重複項目
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 🆕 全新資料
                          </span>
                        )}
                      </div>
                      <div className="text-slate-100 font-semibold">{item.record.title}</div>
                      {item.record.notes && (
                        <div className="text-[11px] text-slate-300 font-sans whitespace-pre-line mt-0.5">
                          {item.record.notes}
                        </div>
                      )}
                      {item.isDuplicate && (
                        <div className="text-[11px] text-amber-400/90 font-mono-code">
                          {item.duplicateReason}
                        </div>
                      )}
                    </div>

                    <div className="text-right font-mono font-bold text-emerald-400">
                      NT$ {item.record.totalCost.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                即將匯入：
                <span className="text-emerald-400 font-bold ml-1">
                  {duplicateMode === 'skip' ? parsedSummary.newCount : parsedSummary.totalParsed} 筆
                </span>
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    確認執行匯入 ({duplicateMode === 'skip' ? `新增 ${parsedSummary.newCount} 筆` : `匯入 ${parsedSummary.totalParsed} 筆`})
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
