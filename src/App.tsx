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
import { RecordCategory, MilestoneItem, CarRecord } from './types';
import { ALL_RECORDS } from './data/recordsData';
import { getLastUpdatedTime } from './utils/recordManager';
import { ShieldCheck, Car, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Pure static record source from src/data/recordsData.ts
  const [records] = useState<CarRecord[]>(ALL_RECORDS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory>('all');
  const [isHunterOpen, setIsHunterOpen] = useState<boolean>(false);
  const [isOBDOpen, setIsOBDOpen] = useState<boolean>(false);
  const [isHiddenFeaturesOpen, setIsHiddenFeaturesOpen] = useState<boolean>(false);
  const [lastUpdatedTime] = useState<string>(() => getLastUpdatedTime());

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
              <span>車主認證唯讀履歷</span>
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

        {/* 1. KPI Dashboard Stats Cards (Calculated dynamically from static records) */}
        <KPICards records={records} />

        {/* 2. Charts Section (Chart.js Visualization - Calculated dynamically) */}
        <Charts records={records} />

        {/* 3. B46 Key Common Issues & Preventive Maintenance Radar */}
        <MilestonesSection
          records={records}
          onSelectMilestone={handleSelectMilestone}
          onFilterByKeyword={handleFilterByKeyword}
        />

        {/* 4. Filterable, Searchable Read-Only Records Table */}
        <div id="records-table-anchor">
          <RecordsTable
            records={records}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onOpenHunter={() => setIsHunterOpen(true)}
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

      {/* Interactive Read-Only Modals */}
      <HunterModal
        isOpen={isHunterOpen}
        onClose={() => setIsHunterOpen(false)}
        records={records}
        onFilterByKeyword={handleFilterByKeyword}
      />
      <OBDModal
        isOpen={isOBDOpen}
        onClose={() => setIsOBDOpen(false)}
        records={records}
        onSelectCode={handleFilterByKeyword}
      />
      <HiddenFeaturesModal
        isOpen={isHiddenFeaturesOpen}
        onClose={() => setIsHiddenFeaturesOpen(false)}
        records={records}
        onFilterByKeyword={handleFilterByKeyword}
      />
    </div>
  );
}
