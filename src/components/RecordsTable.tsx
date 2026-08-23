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
  Download,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  SquareParking,
  Route,
  AlertTriangle,
  Flag
} from 'lucide-react';

interface RecordsTableProps {
  records: CarRecord[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: RecordCategory;
  onCategoryChange: (cat: RecordCategory) => void;
  onOpenHunter: () => void;
  onExportCSV: () => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onOpenHunter,
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
    { key: 'parking', label: '🅿️ 停車費用', icon: SquareParking },
    { key: 'toll', label: '🛣️ 通行規費', icon: Route },
    { key: 'tax_insurance', label: '🪪 稅務與規費', icon: FileText },
    { key: 'fines', label: '🚨 交通罰單', icon: AlertTriangle },
    { key: 'detailing', label: '🧼 洗車美容', icon: Sparkles },
    { key: 'fault', label: '⚠️ 故障/異常', icon: AlertOctagon },
    { key: 'tuning_obd', label: '⚙️ 改裝/OBD', icon: Tag },
    { key: 'other', label: '🚩 里程紀錄', icon: Flag }
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
      case 'parking':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">🅿️ 停車費用</span>;
      case 'toll':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">🛣️ 通行規費</span>;
      case 'tax_insurance':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">🪪 稅務規費</span>;
      case 'fines':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">🚨 交通罰單</span>;
      case 'detailing':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">🧼 洗車美容</span>;
      case 'fault':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-red-500/20 text-red-400 border border-red-500/30">⚠️ 故障異常</span>;
      case 'tuning_obd':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">⚙️ 改裝設定</span>;
      case 'other':
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-slate-700/40 text-slate-300 border border-slate-600/40">🚩 里程紀錄</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">{category}</span>;
    }
  };

  return (
    <div id="records-table-anchor" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
      {/* Top Header: Read-only Status & Visitor Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
              全週期履歷公開資料庫
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              車主唯讀認證 (防篡改)
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono-code mt-0.5">
            共收錄 {records.length} 筆真實維護工單 · 支援料號/DTC代碼即時檢索與點擊展開詳情
          </p>
        </div>

        {/* Action Button: Public Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            title="下載車主脫敏履歷 CSV 檔案"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載完整脫敏 CSV</span>
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
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedYear === yr
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {yr === 'all' ? '全部' : `${yr}年`}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          const count =
            cat.key === 'all'
              ? records.length
              : records.filter((r) => r.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Filter Result Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono-code px-1">
        <div>
          顯示 <span className="text-white font-bold">{filteredRecords.length}</span> 筆工單紀錄
          {searchQuery && (
            <span className="text-cyan-400 ml-2">
              (包含關鍵字: "{searchQuery}")
            </span>
          )}
        </div>
        <div className="text-slate-300">
          此篩選條件總計：
          <span className="text-white font-bold font-tech text-sm ml-1">
            NT$ {totalFilteredCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-950/90 text-slate-400 font-mono-code uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th
                onClick={() => {
                  setSortField('date');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>日期</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => {
                  setSortField('km');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-3 sm:px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>儀表里程</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 sm:px-4 whitespace-nowrap">類別</th>
              <th className="py-3 px-4 min-w-[200px]">項目說明 / 零件料號</th>
              <th className="py-3 px-4 whitespace-nowrap">施作保修廠</th>
              <th
                onClick={() => {
                  setSortField('cost');
                  setSortAsc(!sortAsc);
                }}
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>實付金額</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">詳情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">查無相符之工單紀錄</p>
                    <p className="text-xs text-slate-500">
                      請嘗試清除搜尋關鍵字或選擇其他分類與年份標籤。
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isExpanded = expandedRowId === rec.id;
                const hasDetailedNotes = !!(rec.notes || (rec.partNumbers && rec.partNumbers.length > 0) || (rec.obdCodes && rec.obdCodes.length > 0) || rec.hasAlignment);

                return (
                  <React.Fragment key={rec.id}>
                    <tr
                      onClick={() => hasDetailedNotes && toggleRow(rec.id)}
                      className={`hover:bg-slate-800/60 transition-colors ${
                        hasDetailedNotes ? 'cursor-pointer' : ''
                      } ${isExpanded ? 'bg-slate-800/80' : ''}`}
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

                      {/* Action: Expand Details Toggle */}
                      <td className="py-3 px-3 text-center text-slate-400 whitespace-nowrap">
                        {hasDetailedNotes ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(rec.id);
                            }}
                            className="p-1 rounded hover:bg-slate-700 transition-all text-slate-400 hover:text-white cursor-pointer"
                            title="展開完整料號與施工細節"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-slate-700">-</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-900/95 border-b border-slate-800">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="space-y-3 bg-slate-950/80 rounded-xl p-4 border border-slate-800">
                            {/* Notes */}
                            {rec.notes && (
                              <div>
                                <div className="text-xs font-semibold text-slate-400 font-mono-code mb-1">
                                  📋 施工細節與保養備註：
                                </div>
                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                                  {rec.notes}
                                </p>
                              </div>
                            )}

                            {/* Part numbers grid */}
                            {rec.partNumbers && rec.partNumbers.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/80">
                                <div className="text-xs font-semibold text-cyan-400 font-mono-code mb-1.5 flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" /> 更換零件 / 原廠料號清單：
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {rec.partNumbers.map((p, idx) => (
                                    <div
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSearchChange(p.split(' ')[0]);
                                      }}
                                      className="text-xs font-mono-code bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/70 text-slate-300 flex items-center justify-between cursor-pointer transition-colors"
                                      title="點擊將此料號帶入搜尋欄"
                                    >
                                      <span>{p}</span>
                                      <Search className="w-3 h-3 text-slate-500" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* OBD Codes */}
                            {rec.obdCodes && rec.obdCodes.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/80">
                                <div className="text-xs font-semibold text-amber-400 font-mono-code mb-1.5 flex items-center gap-1">
                                  <AlertOctagon className="w-3.5 h-3.5" /> 關聯 OBD-II / DTC 故障碼：
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {rec.obdCodes.map((c, idx) => (
                                    <span
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSearchChange(c);
                                      }}
                                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer hover:bg-amber-500/30 transition-colors"
                                      title="點擊將故障碼帶入搜尋欄"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sub-costs Breakdown Tags */}
                            {(rec.maintenanceCost > 0 ||
                              rec.fuelCost > 0 ||
                              (rec.parkingCost && rec.parkingCost > 0) ||
                              (rec.tollCost && rec.tollCost > 0) ||
                              (rec.finesCost && rec.finesCost > 0) ||
                              rec.detailingCost > 0 ||
                              rec.taxCost > 0 ||
                              (rec.otherCost && rec.otherCost > 0)) && (
                              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                                <span className="text-slate-400">💰 費用明細分攤：</span>
                                {rec.maintenanceCost > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60">
                                    維修 NT${rec.maintenanceCost.toLocaleString()}
                                  </span>
                                )}
                                {rec.fuelCost > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                                    燃油 NT${rec.fuelCost.toLocaleString()}
                                  </span>
                                )}
                                {Boolean(rec.parkingCost && rec.parkingCost > 0) && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
                                    停車 NT${rec.parkingCost!.toLocaleString()}
                                  </span>
                                )}
                                {Boolean(rec.tollCost && rec.tollCost > 0) && (
                                  <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60">
                                    通行費 NT${rec.tollCost!.toLocaleString()}
                                  </span>
                                )}
                                {Boolean(rec.finesCost && rec.finesCost > 0) && (
                                  <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/60">
                                    罰單 NT${rec.finesCost!.toLocaleString()}
                                  </span>
                                )}
                                {rec.detailingCost > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
                                    美容 NT${rec.detailingCost.toLocaleString()}
                                  </span>
                                )}
                                {rec.taxCost > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60">
                                    稅費 NT${rec.taxCost.toLocaleString()}
                                  </span>
                                )}
                                {Boolean(rec.otherCost && rec.otherCost > 0) && (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    其他 NT${rec.otherCost!.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Hunter 3D Alignment Callout */}
                            {rec.hasAlignment && (
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-mono">
                                  本次施作包含 Hunter HawkEye Elite 3D 原廠電腦定位底盤數據。
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenHunter();
                                  }}
                                  className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>查看 3D 定位參數表</span>
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
