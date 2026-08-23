import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { MilestonesSection } from './components/MilestonesSection';
import { RecordsTable } from './components/RecordsTable';
import { VisitorStats } from './components/VisitorStats';
import { HunterModal } from './components/HunterModal';
import { OBDModal } from './components/OBDModal';
import { HiddenFeaturesModal } from './components/HiddenFeaturesModal';
import { AddEditRecordModal } from './components/AddEditRecordModal';
import { BatchImportModal } from './components/BatchImportModal';
import { RecordCategory, MilestoneItem, CarRecord } from './types';
import { loadRecords, saveRecordsToStorage, resetDatabaseToDefault, clearAllRecords, getLastUpdatedTime } from './utils/recordManager';
import { SUMMARY_STATS } from './data/yearlyData';
import confetti from 'canvas-confetti';
import { ShieldCheck, Cpu, Database, Wrench, Fuel, Car, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<CarRecord[]>(() => loadRecords());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory>('all');
  const [isHunterOpen, setIsHunterOpen] = useState<boolean>(false);
  const [isOBDOpen, setIsOBDOpen] = useState<boolean>(false);
  const [isHiddenFeaturesOpen, setIsHiddenFeaturesOpen] = useState<boolean>(false);
  
  // Data management modals
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [recordToEdit, setRecordToEdit] = useState<CarRecord | null>(null);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => getLastUpdatedTime());

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateTimestamp = () => {
    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    setLastUpdatedTime(nowStr);
  };

  // Save (Add or Edit) Record Handler
  const handleSaveRecord = (savedRecord: CarRecord, isEdit: boolean) => {
    let updated: CarRecord[];
    if (isEdit) {
      updated = records.map((r) => (r.id === savedRecord.id ? savedRecord : r));
      showToast(`已成功更新工單：[${savedRecord.date}] ${savedRecord.title}`, 'success');
    } else {
      updated = [savedRecord, ...records];
      showToast(`已新增 1 筆工單：[${savedRecord.date}] ${savedRecord.title}`, 'success');
    }
    setRecords(updated);
    saveRecordsToStorage(updated);
    updateTimestamp();
  };

  // Delete Record Handler
  const handleDeleteRecord = (id: string) => {
    const target = records.find((r) => r.id === id);
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveRecordsToStorage(updated);
    updateTimestamp();
    showToast(`已刪除工單：${target ? `[${target.date}] ${target.title}` : id}`, 'info');
  };

  // Batch Import Completion Handler
  const handleBatchImportComplete = (
    updatedRecords: CarRecord[],
    addedCount: number,
    overwrittenCount: number,
    skippedCount: number
  ) => {
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    updateTimestamp();
    showToast(
      `批次作業完成！新增 ${addedCount} 筆，覆蓋 ${overwrittenCount} 筆，智慧防呆跳過 ${skippedCount} 筆重複資料。`,
      'success'
    );
  };

  // Reset to Default Dataset
  const handleResetDefault = () => {
    const defaults = resetDatabaseToDefault();
    setRecords(defaults);
    updateTimestamp();
    showToast('已還原為官方預設脫敏數據集！', 'info');
  };

  // Clear all records completely
  const handleClearAll = () => {
    const cleared = clearAllRecords();
    setRecords(cleared);
    updateTimestamp();
    showToast('已清空所有工單資料！您現在可以點擊「批次匯入」貼上專屬 CSV 數據。', 'warn');
  };

  // CSV Exporter for desensitized dynamic dataset
  const handleExportCSV = () => {
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.1 } });
      const headers = ['日期', '里程(km)', '分類', '項目說明', '保修店家(脫敏)', '費用(TWD)', '備註與零件料號'];
      const rows = records.map((r) => [
        r.date,
        r.km || '',
        r.categoryLabel,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.vendor.replace(/"/g, '""')}"`,
        r.totalCost,
        `"${((r.notes || '') + ' ' + (r.partNumbers?.join('; ') || '')).trim().replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `BMW_G30_530i_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('已成功匯出完整 CSV 檔案！', 'success');
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  const handleSelectMilestone = (item: MilestoneItem) => {
    if (item.parts && item.parts.length > 0) {
      setSearchQuery(item.parts[0].partNumber.split(' ')[0]);
    } else {
      setSearchQuery(item.title.split(' ')[0]);
    }
    const tableEl = document.getElementById('records-table-anchor');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterByKeyword = (kw: string) => {
    setSearchQuery(kw);
    const tableEl = document.getElementById('records-table-anchor');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openAddModal = () => {
    setRecordToEdit(null);
    setIsAddEditOpen(true);
  };

  const openEditModal = (record: CarRecord) => {
    setRecordToEdit(record);
    setIsAddEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 carbon-pattern flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-mono backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : toastMessage.type === 'warn'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : 'bg-slate-900/90 border-blue-500 text-blue-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenHunter={() => setIsHunterOpen(true)}
        onOpenOBD={() => setIsOBDOpen(true)}
        onOpenHiddenFeatures={() => setIsHiddenFeaturesOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Vehicle Spec Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shrink-0">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-tech text-xl font-bold text-white tracking-wide">
                  2017 BMW 530i Sport Line (美規 G30)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                  車況良好 · 妥善率 S 級
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono">
                  美規 SULEV (PZEV) 排放
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono-code mt-0.5">
                B46 2.0L TwinPower Turbo (248 hp / 350 Nm) · ZF 8HP50 8-Speed Steptronic
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>隱私脫敏保護中</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div>前後配 19吋 (245/40 & 275/35)</div>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div>標準機油量 5.25L</div>
          </div>
        </div>

        {/* Real-time Visitor & Telemetry Analytics Section */}
        <VisitorStats
          lastUpdatedTime={lastUpdatedTime}
          totalRecordsCount={records.length}
        />

        {/* 1. KPI Dashboard Stats Cards (Calculated dynamically from records) */}
        <KPICards records={records} />

        {/* 2. Charts Section (Chart.js Visualization - Completely Dynamic) */}
        <Charts
          records={records}
          onOpenBatchImport={() => setIsBatchImportOpen(true)}
        />

        {/* 3. B46 Key Common Issues & Preventive Maintenance Radar */}
        <MilestonesSection
          records={records}
          onSelectMilestone={handleSelectMilestone}
          onFilterByKeyword={handleFilterByKeyword}
        />

        {/* 4. Filterable, Searchable & Editable Records Table */}
        <div id="records-table-anchor">
          <RecordsTable
            records={records}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onOpenHunter={() => setIsHunterOpen(true)}
            onOpenAddModal={openAddModal}
            onOpenEditModal={openEditModal}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
            onDeleteRecord={handleDeleteRecord}
            onResetDefault={handleResetDefault}
            onClearAll={handleClearAll}
            onExportCSV={handleExportCSV}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/90 py-8 text-center text-xs text-slate-400 font-mono-code">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div className="h-1 w-8 bmw-m-stripe rounded"></div>
            <span className="text-slate-300 font-bold font-tech">BMW G30 530i Sport Line Maintenance & Telemetry Dashboard</span>
            <div className="h-1 w-8 bmw-m-stripe rounded"></div>
          </div>
          <p>
            資料已實施隱私去識別化（店家代稱、車牌代換、罰單案號脫敏），所有維修日期、里程數、零件料號與 DTC 故障代碼 100% 完整保留。
          </p>
        </div>
      </footer>

      {/* Interactive Modals */}
      <HunterModal isOpen={isHunterOpen} onClose={() => setIsHunterOpen(false)} />
      <OBDModal isOpen={isOBDOpen} onClose={() => setIsOBDOpen(false)} />
      <HiddenFeaturesModal isOpen={isHiddenFeaturesOpen} onClose={() => setIsHiddenFeaturesOpen(false)} />
      
      {/* Add / Edit Record Modal with Anti-Duplicate Detection */}
      <AddEditRecordModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setRecordToEdit(null);
        }}
        initialData={recordToEdit}
        existingRecords={records}
        onSave={handleSaveRecord}
      />

      {/* Batch Import Modal with Deduplication Strategy */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        currentRecords={records}
        onImportComplete={handleBatchImportComplete}
      />
    </div>
  );
}
