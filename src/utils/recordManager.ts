import { CarRecord, RecordFormData, ImportSummary, ImportPreviewItem, RecordCategory } from '../types';
import { ALL_RECORDS as DEFAULT_RECORDS } from '../data/recordsData';

const STORAGE_KEY = 'bmw_g30_records_v1';
const LAST_UPDATED_KEY = 'bmw_g30_last_updated_v1';

// Helper to normalize strings for comparison
export function normalizeStr(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '').replace(/[（(][^）)]*[）)]/g, '').trim();
}

// Generate unique fingerprint signature for de-duplication
export function generateRecordSignature(r: { date: string; km: number | null | string; title: string; vendor?: string }): string {
  const cleanDate = (r.date || '').trim();
  const cleanKm = r.km !== null && r.km !== undefined && r.km !== '' ? Math.round(Number(r.km)) : 0;
  const cleanTitle = normalizeStr(r.title || '');
  return `${cleanDate}__${cleanKm}__${cleanTitle}`;
}

// Category mappings from labels or keywords
export function detectCategory(catStr: string, titleStr: string): { category: CarRecord['category']; label: string } {
  const combined = (catStr + ' ' + titleStr).toLowerCase();
  
  if (combined.includes('油資') || combined.includes('98') || combined.includes('加油') || combined.includes('中油') || combined.includes('fuel')) {
    return { category: 'fuel', label: '⛽ 油資紀錄' };
  }
  if (combined.includes('洗車') || combined.includes('美容') || combined.includes('鍍膜') || combined.includes('除瀝青') || combined.includes('detailing')) {
    return { category: 'detailing', label: '🧼 洗車美容' };
  }
  if (combined.includes('稅') || combined.includes('保險') || combined.includes('停車') || combined.includes('規費') || combined.includes('過戶') || combined.includes('驗車') || combined.includes('罰單') || combined.includes('月租')) {
    return { category: 'tax_insurance', label: '🪪 稅務與規費' };
  }
  if (combined.includes('故障') || combined.includes('異常') || combined.includes('拖吊') || combined.includes('破裂') || combined.includes('警告') || combined.includes('漏水') || combined.includes('卡住') || combined.includes('fault')) {
    return { category: 'fault', label: '⚠️ 故障/異常' };
  }
  if (combined.includes('obd') || combined.includes('刷隱藏') || combined.includes('編程') || combined.includes('改裝') || combined.includes('氛圍燈') || combined.includes('carplay') || combined.includes('導航更新')) {
    return { category: 'tuning_obd', label: '⚙️ 改裝/OBD' };
  }
  return { category: 'maintenance', label: '🛠️ 保養維修' };
}

// Load records from LocalStorage or default to built-in dataset
export function loadRecords(): CarRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed; // Returns saved records (even if empty [])
      }
    }
  } catch (err) {
    console.warn('Failed to read from localStorage, using default records', err);
  }
  return DEFAULT_RECORDS; // Default to static dataset in recordsData.ts
}

// Save records to LocalStorage and update timestamp
export function saveRecordsToStorage(records: CarRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    localStorage.setItem(LAST_UPDATED_KEY, nowStr);
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// Get last updated time string (Calculates from latest record date or build timestamp)
export function getLastUpdatedTime(records: CarRecord[] = DEFAULT_RECORDS): string {
  try {
    // 1. If records exist, find the newest record date
    if (records && records.length > 0) {
      const validDates = records
        .map((r) => r.date)
        .filter((d) => Boolean(d) && d.match(/^\d{4}-\d{2}-\d{2}/))
        .sort();
      
      if (validDates.length > 0) {
        const latestRecordDate = validDates[validDates.length - 1];
        return latestRecordDate; // e.g. "2025-05-18"
      }
    }
  } catch (err) {
    console.warn('Error calculating latest record date:', err);
  }

  // 2. Fallback to build timestamp or current date
  try {
    if (typeof __BUILD_TIMESTAMP__ !== 'undefined' && __BUILD_TIMESTAMP__) {
      return __BUILD_TIMESTAMP__;
    }
  } catch {}

  return new Date().toISOString().slice(0, 10);
}

// Reset database to built-in clean dataset
export function resetDatabaseToDefault(): CarRecord[] {
  try {
    saveRecordsToStorage(DEFAULT_RECORDS);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_RECORDS;
}

// Clear all database records completely
export function clearAllRecords(): CarRecord[] {
  try {
    saveRecordsToStorage([]);
  } catch (e) {
    console.error(e);
  }
  return [];
}

// Single Record duplicate checker
export function findDuplicateRecord(formData: { date: string; km: string | number; title: string; id?: string }, existingRecords: CarRecord[]): CarRecord | undefined {
  const targetSig = generateRecordSignature({
    date: formData.date,
    km: formData.km,
    title: formData.title
  });

  return existingRecords.find((r) => {
    if (formData.id && r.id === formData.id) return false; // Ignore self during edit
    const existingSig = generateRecordSignature(r);
    return existingSig === targetSig;
  });
}

// Smart CSV / Tab-separated Parser with De-duplication Preview
export function parseCSVText(rawText: string, currentRecords: CarRecord[]): ImportSummary {
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { totalParsed: 0, newCount: 0, duplicateCount: 0, items: [] };
  }

  // Create signature set of current records for fast lookup
  const existingMap = new Map<string, CarRecord>();
  currentRecords.forEach((r) => {
    existingMap.set(generateRecordSignature(r), r);
  });

  const previewItems: ImportPreviewItem[] = [];

  // Determine delimiter: comma or tab or semicolon
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Check if first line is a header
  let startIndex = 0;
  const lowerFirst = firstLine.toLowerCase();
  if (
    lowerFirst.includes('日期') ||
    lowerFirst.includes('date') ||
    lowerFirst.includes('里程') ||
    lowerFirst.includes('km') ||
    lowerFirst.includes('金額') ||
    lowerFirst.includes('項目')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle CSV quoted splits
    let cells: string[] = [];
    if (delimiter === '\t') {
      cells = rawLine.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    } else {
      // Regex for CSV with quotes
      const matches = rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches && matches.length > 1) {
        cells = matches.map((m) => m.replace(/^"|"$/g, '').trim());
      } else {
        cells = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      }
    }

    if (cells.length < 2) continue;

    let date = cells[0] || new Date().toISOString().slice(0, 10);
    let km: number | null = null;
    let categoryStr = '';
    let title = '';
    let vendor = '';
    let cost = 0;
    let notes = '';

    // Standardize date
    date = date.replace(/\//g, '-').trim();
    if (date.length === 8 && /^\d{8}$/.test(date)) {
      date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }

    // Try parsing km from cell 1 or 2
    if (/^\d+$/.test(cells[1].replace(/,/g, ''))) {
      km = parseInt(cells[1].replace(/,/g, ''), 10);
      categoryStr = cells[2] || '';
      title = cells[3] || cells[2] || '維護保養';
      vendor = cells[4] || '專業保修廠';
      cost = parseFloat((cells[5] || '0').replace(/[^0-9.-]/g, '')) || 0;
      notes = cells[6] || '';
    } else {
      // maybe no km column
      title = cells[1] || '維護保養';
      cost = parseFloat((cells[2] || '0').replace(/[^0-9.-]/g, '')) || 0;
      notes = cells[3] || '';
    }

    const catObj = detectCategory(categoryStr, title + ' ' + notes);
    
    // Extract part numbers / OBD codes if found in notes
    const partNumbers: string[] = [];
    const obdCodes: string[] = [];

    const obdMatches = (notes + ' ' + title).match(/\b([0-9A-F]{6})\b/g);
    if (obdMatches) {
      obdMatches.forEach((code) => {
        if (!obdCodes.includes(code)) obdCodes.push(code);
      });
    }

    const rec: CarRecord = {
      id: `rec-imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      date,
      km,
      category: catObj.category,
      categoryLabel: catObj.label,
      title: title || '保養紀錄',
      vendor: vendor || '自營/專業保修廠',
      fuelCost: catObj.category === 'fuel' ? cost : 0,
      detailingCost: catObj.category === 'detailing' ? cost : 0,
      maintenanceCost: (catObj.category === 'maintenance' || catObj.category === 'fault') ? cost : 0,
      taxCost: catObj.category === 'tax_insurance' ? cost : 0,
      contractCost: 0,
      totalCost: cost,
      notes: notes || undefined,
      partNumbers: partNumbers.length > 0 ? partNumbers : undefined,
      obdCodes: obdCodes.length > 0 ? obdCodes : undefined
    };

    const sig = generateRecordSignature(rec);
    const existingMatch = existingMap.get(sig);

    if (existingMatch) {
      previewItems.push({
        record: rec,
        isDuplicate: true,
        duplicateReason: `與既有紀錄 [${existingMatch.date} · ${existingMatch.km ? existingMatch.km.toLocaleString() + 'km' : '無里程'} · ${existingMatch.title}] 特徵完全相符`,
        existingMatch
      });
    } else {
      previewItems.push({
        record: rec,
        isDuplicate: false
      });
    }
  }

  const duplicateCount = previewItems.filter((item) => item.isDuplicate).length;
  const newCount = previewItems.length - duplicateCount;

  return {
    totalParsed: previewItems.length,
    newCount,
    duplicateCount,
    items: previewItems
  };
}

// Execute batch import with user's deduplication choice
export function applyBatchImport(
  items: ImportPreviewItem[],
  handleDuplicateMode: 'skip' | 'overwrite',
  currentRecords: CarRecord[]
): { updatedRecords: CarRecord[]; addedCount: number; overwrittenCount: number; skippedCount: number } {
  let addedCount = 0;
  let overwrittenCount = 0;
  let skippedCount = 0;

  // Create mutable working copy
  let workingList = [...currentRecords];

  items.forEach((item) => {
    if (item.isDuplicate && item.existingMatch) {
      if (handleDuplicateMode === 'overwrite') {
        // Find existing index and replace with imported record preserving ID
        const index = workingList.findIndex((r) => r.id === item.existingMatch!.id);
        if (index !== -1) {
          workingList[index] = {
            ...item.record,
            id: item.existingMatch.id
          };
          overwrittenCount++;
        }
      } else {
        // Skip duplicate
        skippedCount++;
      }
    } else {
      // Brand new record
      workingList.unshift(item.record);
      addedCount++;
    }
  });

  // Re-sort by date descending
  workingList.sort((a, b) => b.date.localeCompare(a.date));

  // Save to localStorage
  saveRecordsToStorage(workingList);

  return {
    updatedRecords: workingList,
    addedCount,
    overwrittenCount,
    skippedCount
  };
}
