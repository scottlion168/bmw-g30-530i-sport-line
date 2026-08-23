import React, { useState, useMemo } from 'react';
import { CarRecord, RecordCategory } from '../types';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Wrench,
  Fuel,
  FileText,
  Sparkles,
  AlertOctagon,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
  Tag,
  Calendar,
  X,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Database,
  Trash
} from 'lucide-react';

interface RecordsTableProps {
  records: CarRecord[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: RecordCategory;
  onCategoryChange: (cat: RecordCategory) => void;
  onOpenHunter: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (record: CarRecord) => void;
  onOpenBatchImport: () => void;
  onDeleteRecord: (id: string) => void;
  onResetDefault: () => void;
  onClearAll: () => void;
  onExportCSV: () => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onOpenHunter,
  onOpenAddModal,
  onOpenEditModal,
  onOpenBatchImport,
  onDeleteRecord,
  onResetDefault,
  onClearAll,
  onExportCSV
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'cost' | 'km'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Categories config
  const categories: { key: RecordCategory; label: string; icon: any }[] = [
    { key: 'all', label: '全部項目', icon: SlidersHorizontal },
    { key: 'maintenance', label: '🛠️ 保養維修', icon: Wrench },
    { key: 'fuel', label: '⛽ 油資紀錄', icon: Fuel },
    { key: 'tax_insurance', label: '🪪 稅務與規費', icon: FileText },
    { key: 'detailing', label: '🧼 洗車美容', icon: Sparkles },
    { key: 'fault', label: '⚠️ 故障/異常', icon: AlertOctagon },
    { key: 'tuning_obd', label: '⚙️ 改裝/OBD', icon: Tag }
  ];

  // Filtering & Sorting
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Category filter
        if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
          return false;
        }
        // Year filter
        if (selectedYear !== 'all') {
          const year = rec.date.substring(0, 4);
          if (year !== selectedYear) return false;
        }
        // Keyword search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = rec.title.toLowerCase().includes(q);
          const matchVendor = rec.vendor.toLowerCase().includes(q);
          const matchNotes = rec.notes ? rec.notes.toLowerCase().includes(q) : false;
          const matchParts = rec.partNumbers ? rec.partNumbers.some((p) => p.toLowerCase().includes(q)) : false;
          const matchOBD = rec.obdCodes ? rec.obdCodes.some((code) => code.toLowerCase().includes(q)) : false;
          const matchDate = rec.date.includes(q);
          const matchKm = rec.km ? rec.km.toString().includes(q) : false;

          return matchTitle || matchVendor || matchNotes || matchParts || matchOBD || matchDate || matchKm;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
        }
        if (sortField === 'cost') {
          return sortAsc ? a.totalCost - b.totalCost : b.totalCost - a.totalCost;
        }
        if (sortField === 'km') {
          const kmA = a.km || 0;
          const kmB = b.km || 0;
          return sortAsc ? kmA - kmB : kmB - kmA;
        }
        return 0;
      });
  }, [records, selectedCategory, selectedYear, searchQuery, sortField, sortAsc]);

  const totalFilteredCost = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.totalCost, 0);
  }, [filteredRecords]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'maintenance':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">🛠️ 保養維修</span>;
      case 'fuel':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">⛽ 燃油加油</span>;
      case 'tax_insurance':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">🪪 稅務規費</span>;
      case 'detailing':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">🧼 洗車美容</span>;
      case 'fault':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-red-500/20 text-red-400 border border-red-500/30">⚠️ 故障異常</span>;
      case 'tuning_obd':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">⚙️ 改裝設定</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
      {/* Top Header & Data Operations Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
              全週期履歷互動資料庫
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              共 {records.length} 筆工單 (已持久化存儲)
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono-code mt-0.5">
            即時搜尋料號/DTC故障碼/項目 · 支援點擊展開零件清單 · 內建防呆查重驗證
          </p>
        </div>

        {/* Action Buttons: Add, Batch Import, Clear, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新增單筆</span>
          </button>

          <button
            onClick={onOpenBatchImport}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="貼上 Excel / CSV 批次匯入並自動防呆查重"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>批次匯入 (防呆)</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="匯出目前資料庫至 CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">匯出</span>
          </button>

          <button
            onClick={() => {
              if (confirm('確定要【清空目前所有工單資料】嗎？\n清空後您可以立即使用「批次匯入」貼上您專屬的 CSV 數據！')) {
                onClearAll();
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
            title="清空目前所有 CSV 工單資料以重新匯入"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>清空資料庫</span>
          </button>

          <button
            onClick={() => {
              if (confirm('確定要還原為【官方脫敏展示資料集】嗎？')) {
                onResetDefault();
              }
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="載入官方脫敏範例資料"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋料號(51747497279)、故障碼(21B043)、水泵浦、電瓶、中油、店家..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono-code transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Year Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-slate-500 font-mono shrink-0 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5" /> 年份:
          </span>
          {['all', '2026', '2025', '2024', '2023', '2022', '2021'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg shrink-0 transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {yr === 'all' ? '全部' : `${yr}年`}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stats Summary Line for Current Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-2">
          <span>篩選結果：</span>
          <span className="text-slate-200 font-bold">{filteredRecords.length} 筆</span>
          <span>(佔全車總工單 {((filteredRecords.length / Math.max(records.length, 1)) * 100).toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>篩選項目金額加總：</span>
          <span className="text-emerald-400 font-bold text-sm">
            NT$ {totalFilteredCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-xs">
              <th
                onClick={() => {
                  if (sortField === 'date') setSortAsc(!sortAsc);
                  else {
                    setSortField('date');
                    setSortAsc(false);
                  }
                }}
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-200 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>日期</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => {
                  if (sortField === 'km') setSortAsc(!sortAsc);
                  else {
                    setSortField('km');
                    setSortAsc(false);
                  }
                }}
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-200 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>里程 (km)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 whitespace-nowrap">分類</th>
              <th className="py-3 px-4 min-w-[200px]">項目說明 / 零件備註</th>
              <th className="py-3 px-4 whitespace-nowrap">施作店家</th>
              <th
                onClick={() => {
                  if (sortField === 'cost') setSortAsc(!sortAsc);
                  else {
                    setSortField('cost');
                    setSortAsc(false);
                  }
                }}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 select-none whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>實付金額</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                  <div className="space-y-3">
                    <p className="text-slate-300 font-semibold">目前資料庫為空或查無相符紀錄</p>
                    <p className="text-xs text-slate-500">
                      您可以點擊右上角「<span className="text-emerald-400 font-bold">批次匯入 (防呆)</span>」貼上您的 CSV 數據，或點擊「<span className="text-blue-400">新增單筆</span>」開始記錄。
                    </p>
                    <button
                      onClick={onOpenBatchImport}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>立即開啟批次匯入 (貼上 CSV)</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isExpanded = expandedRowId === rec.id;
                const hasDetailedNotes = !!(rec.notes || rec.partNumbers || rec.obdCodes || rec.hasAlignment);

                return (
                  <React.Fragment key={rec.id}>
                    <tr
                      onClick={() => hasDetailedNotes && toggleRow(rec.id)}
                      className={`hover:bg-slate-900/80 transition-colors ${
                        hasDetailedNotes ? 'cursor-pointer' : ''
                      } ${isExpanded ? 'bg-slate-900/90' : ''}`}
                    >
                      {/* Date */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-mono-code text-slate-300 text-xs">
                        {rec.date}
                      </td>

                      {/* Mileage */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-mono-code text-cyan-400 font-medium text-xs">
                        {rec.km ? `${rec.km.toLocaleString()} km` : <span className="text-slate-600">-</span>}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {getCategoryBadge(rec.category)}
                      </td>

                      {/* Title & tags */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-100 flex flex-wrap items-center gap-1.5">
                          <span>{rec.title}</span>
                          {rec.isMilestone && (
                            <span className="px-1.5 py-0.2 text-[10px] rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                              通病節點
                            </span>
                          )}
                          {rec.hasAlignment && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenHunter();
                              }}
                              className="px-1.5 py-0.2 text-[10px] rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono flex items-center gap-0.5 hover:bg-cyan-500/30"
                            >
                              <Compass className="w-2.5 h-2.5" /> 3D定位參數
                            </span>
                          )}
                        </div>
                        {rec.partNumbers && rec.partNumbers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.partNumbers.slice(0, 2).map((p, pIdx) => (
                              <span key={pIdx} className="text-[10px] font-mono-code text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60">
                                {p.split(' ')[0]}
                              </span>
                            ))}
                            {rec.partNumbers.length > 2 && (
                              <span className="text-[10px] font-mono-code text-slate-400">+{rec.partNumbers.length - 2} 項</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 text-xs">
                        {rec.vendor}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono-code">
                        {rec.totalCost > 0 ? (
                          <span className="font-bold text-slate-100">
                            NT$ {rec.totalCost.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">NT$ 0</span>
                        )}
                      </td>

                      {/* Actions (Edit / Delete / Expand) */}
                      <td className="py-3 px-3 text-center text-slate-400 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditModal(rec);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
                            title="編輯工單紀錄"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`確定要刪除這筆紀錄嗎？\n[${rec.date}] ${rec.title}`)) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                            title="刪除此紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {hasDetailedNotes && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(rec.id);
                              }}
                              className="p-1 rounded hover:bg-slate-700 transition-all text-slate-400 hover:text-white cursor-pointer"
                              title="展開詳情"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-900/95 border-b border-slate-800">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="space-y-3 bg-slate-950/80 rounded-xl p-4 border border-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <span className="text-xs font-mono-code font-bold text-blue-400 flex items-center gap-1.5">
                                🔧 施工技術細節 & 零件料號備註
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">
                                  日期：{rec.date} · 施工里程：{rec.km ? `${rec.km.toLocaleString()} km` : '無里程登記'}
                                </span>
                                <button
                                  onClick={() => onOpenEditModal(rec)}
                                  className="text-[11px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/40 font-mono flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Edit3 className="w-3 h-3" /> 編輯此筆
                                </button>
                              </div>
                            </div>

                            {rec.notes && (
                              <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                                {rec.notes}
                              </div>
                            )}

                            {/* Part Numbers Chips */}
                            {rec.partNumbers && rec.partNumbers.length > 0 && (
                              <div>
                                <span className="text-[11px] font-mono-code text-slate-400 block mb-1.5">
                                  📦 涉及原廠/品牌零件規格清單：
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {rec.partNumbers.map((part, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 text-cyan-300 border border-cyan-800/40 font-mono-code"
                                    >
                                      {part}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* OBD Diagnostic codes if any */}
                            {rec.obdCodes && rec.obdCodes.length > 0 && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-mono-code text-amber-400">
                                  ⚠️ OBD 故障碼代碼：
                                </span>
                                {rec.obdCodes.map((code) => (
                                  <span
                                    key={code}
                                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold"
                                  >
                                    {code}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Hunter Alignment shortcut */}
                            {rec.hasAlignment && (
                              <div className="pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenHunter();
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-900/50 transition-all text-xs font-mono-code cursor-pointer"
                                >
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>點擊開啟 Hunter 3D 四輪定位前/後對比參數看板</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
