import React, { useState, useEffect } from 'react';
import { CarRecord, RecordFormData, RecordCategory } from '../types';
import { generateRecordSignature, findDuplicateRecord } from '../utils/recordManager';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Wrench,
  Fuel,
  FileText,
  Sparkles,
  AlertOctagon,
  Cpu,
  DollarSign,
  Save,
  HelpCircle
} from 'lucide-react';

interface AddEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: CarRecord | null;
  existingRecords: CarRecord[];
  onSaveRecord: (savedRecord: CarRecord, isEdit: boolean) => void;
  onDeleteRecord?: (id: string) => void;
}

export const AddEditRecordModal: React.FC<AddEditRecordModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  existingRecords,
  onSaveRecord,
  onDeleteRecord
}) => {
  const [formData, setFormData] = useState<RecordFormData>({
    date: new Date().toISOString().slice(0, 10),
    km: '',
    category: 'maintenance',
    title: '',
    vendor: '配合專業保修廠',
    maintenanceCost: 0,
    fuelCost: 0,
    detailingCost: 0,
    taxCost: 0,
    contractCost: 0,
    totalCost: 0,
    notes: '',
    partNumbers: [],
    obdCodes: []
  });

  const [partInput, setPartInput] = useState('');
  const [obdInput, setObdInput] = useState('');
  const [isManualTotal, setIsManualTotal] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<CarRecord | null>(null);

  // Initialize or populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setFormData({
          id: recordToEdit.id,
          date: recordToEdit.date,
          km: recordToEdit.km !== null ? recordToEdit.km : '',
          category: recordToEdit.category,
          title: recordToEdit.title,
          vendor: recordToEdit.vendor || '',
          maintenanceCost: recordToEdit.maintenanceCost || 0,
          fuelCost: recordToEdit.fuelCost || 0,
          detailingCost: recordToEdit.detailingCost || 0,
          taxCost: recordToEdit.taxCost || 0,
          contractCost: recordToEdit.contractCost || 0,
          totalCost: recordToEdit.totalCost || 0,
          notes: recordToEdit.notes || '',
          partNumbers: recordToEdit.partNumbers ? [...recordToEdit.partNumbers] : [],
          obdCodes: recordToEdit.obdCodes ? [...recordToEdit.obdCodes] : []
        });
        setIsManualTotal(true);
      } else {
        // New record default
        setFormData({
          date: new Date().toISOString().slice(0, 10),
          km: '',
          category: 'maintenance',
          title: '',
          vendor: '配合專業保修廠',
          maintenanceCost: 0,
          fuelCost: 0,
          detailingCost: 0,
          taxCost: 0,
          contractCost: 0,
          totalCost: 0,
          notes: '',
          partNumbers: [],
          obdCodes: []
        });
        setIsManualTotal(false);
      }
      setPartInput('');
      setObdInput('');
      setDuplicateWarning(null);
    }
  }, [isOpen, recordToEdit]);

  // Real-time Anti-Duplicate Detection (防呆查重)
  useEffect(() => {
    if (!isOpen || !formData.date || !formData.title.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const match = findDuplicateRecord(
      {
        date: formData.date,
        km: formData.km,
        title: formData.title,
        id: formData.id
      },
      existingRecords
    );
    setDuplicateWarning(match || null);
  }, [formData.date, formData.km, formData.title, formData.id, existingRecords, isOpen]);

  // Auto calculate total cost unless user manually enters a custom sum
  const handleCostChange = (field: 'maintenanceCost' | 'fuelCost' | 'detailingCost' | 'taxCost' | 'contractCost', val: number) => {
    const updated = { ...formData, [field]: val };
    if (!isManualTotal) {
      updated.totalCost =
        (field === 'maintenanceCost' ? val : formData.maintenanceCost) +
        (field === 'fuelCost' ? val : formData.fuelCost) +
        (field === 'detailingCost' ? val : formData.detailingCost) +
        (field === 'taxCost' ? val : formData.taxCost) +
        (field === 'contractCost' ? val : formData.contractCost);
    }
    setFormData(updated);
  };

  const handleAddPart = () => {
    if (!partInput.trim()) return;
    if (!formData.partNumbers.includes(partInput.trim())) {
      setFormData({ ...formData, partNumbers: [...formData.partNumbers, partInput.trim()] });
    }
    setPartInput('');
  };

  const handleRemovePart = (index: number) => {
    setFormData({
      ...formData,
      partNumbers: formData.partNumbers.filter((_, i) => i !== index)
    });
  };

  const handleAddOBD = () => {
    if (!obdInput.trim()) return;
    const clean = obdInput.trim().toUpperCase();
    if (!formData.obdCodes.includes(clean)) {
      setFormData({ ...formData, obdCodes: [...formData.obdCodes, clean] });
    }
    setObdInput('');
  };

  const handleRemoveOBD = (index: number) => {
    setFormData({
      ...formData,
      obdCodes: formData.obdCodes.filter((_, i) => i !== index)
    });
  };

  const handleCategorySelect = (cat: CarRecord['category']) => {
    let vendorDefault = formData.vendor;
    if (cat === 'fuel' && (!vendorDefault || vendorDefault.includes('保修廠'))) {
      vendorDefault = '台灣中油直營門市';
    } else if (cat === 'detailing' && (!vendorDefault || vendorDefault.includes('保修廠'))) {
      vendorDefault = '專業汽車精緻美容';
    } else if (cat === 'tax_insurance' && (!vendorDefault || vendorDefault.includes('保修廠'))) {
      vendorDefault = '監理所 / 產險公會 / 市區停車場';
    }
    setFormData({ ...formData, category: cat, vendor: vendorDefault });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('請填寫工單/項目說明！');
      return;
    }

    const categoryLabels: Record<CarRecord['category'], string> = {
      maintenance: '🛠️ 保養維修',
      fuel: '⛽ 油資紀錄',
      tax_insurance: '🪪 稅務與規費',
      detailing: '🧼 洗車美容',
      fault: '⚠️ 故障/異常',
      tuning_obd: '⚙️ 改裝/OBD'
    };

    const finalRecord: CarRecord = {
      id: formData.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: formData.date,
      km: formData.km !== '' && !isNaN(Number(formData.km)) ? Number(formData.km) : null,
      category: formData.category,
      categoryLabel: categoryLabels[formData.category],
      title: formData.title.trim(),
      vendor: formData.vendor.trim() || '配合專業保修廠',
      maintenanceCost: Number(formData.maintenanceCost) || 0,
      fuelCost: Number(formData.fuelCost) || 0,
      detailingCost: Number(formData.detailingCost) || 0,
      taxCost: Number(formData.taxCost) || 0,
      contractCost: Number(formData.contractCost) || 0,
      totalCost: Number(formData.totalCost) || 0,
      notes: formData.notes.trim() || undefined,
      partNumbers: formData.partNumbers.length > 0 ? formData.partNumbers : undefined,
      obdCodes: formData.obdCodes.length > 0 ? formData.obdCodes : undefined
    };

    onSaveRecord(finalRecord, !!formData.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              {recordToEdit ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tech text-white flex items-center gap-2">
                {recordToEdit ? '編輯養護工單與履歷紀錄' : '手動新增養護 / 油資 / 規費紀錄'}
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                BMW 530i Sport Line (美規 B46) · 即時防呆查重驗證 · 支援零件料號與故障碼標記
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

        {/* Anti-Duplicate Warning (防呆防重複提示條) */}
        {duplicateWarning && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-mono">⚠️ 系統防呆查重提示：</span>
              <p className="mt-0.5 text-slate-300 leading-relaxed font-mono-code">
                檢測到資料庫中已有相似紀錄：
                <span className="text-amber-300 font-bold ml-1">
                  [{duplicateWarning.date} · {duplicateWarning.km ? duplicateWarning.km.toLocaleString() + ' km' : '無里程'} · {duplicateWarning.title}] (NT$ {duplicateWarning.totalCost.toLocaleString()})
                </span>
                。若您是進行更新或確認同一筆項目，請直接儲存覆蓋；若為獨立之新事件，請調整項目名稱或備註以利識別。
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Row 1: Date & Km & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">📅 施作 / 發生日期 *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">🚗 施作里程 (km)</label>
              <input
                type="number"
                placeholder="例如: 89746"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">🏷️ 分類類別 *</label>
              <select
                value={formData.category}
                onChange={(e) => handleCategorySelect(e.target.value as CarRecord['category'])}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
              >
                <option value="maintenance">🛠️ 保養維修 (Maintenance)</option>
                <option value="fuel">⛽ 油資紀錄 (Fuel)</option>
                <option value="tax_insurance">🪪 稅務與規費 (Tax/Toll/Parking)</option>
                <option value="detailing">🧼 洗車美容 (Detailing)</option>
                <option value="fault">⚠️ 故障/異常 (Fault Issue)</option>
                <option value="tuning_obd">⚙️ 改裝/OBD (Tuning/Coding)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Title & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">📝 項目說明 / 工單名稱 *</label>
              <input
                type="text"
                required
                placeholder="例如: B46 水泵浦與節溫器預防性更換"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">🏬 施作店家 / 機構名稱</label>
              <input
                type="text"
                placeholder="例如: 台中雙B專修外廠 (脫敏)"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Row 3: Expense Sub-items & Total */}
          <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> 費用明細分攤與實付金額
              </span>
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManualTotal}
                  onChange={(e) => setIsManualTotal(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                手動自訂總金額
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">維修/零件費用</span>
                <input
                  type="number"
                  min="0"
                  value={formData.maintenanceCost || ''}
                  onChange={(e) => handleCostChange('maintenanceCost', Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">汽油油資金額</span>
                <input
                  type="number"
                  min="0"
                  value={formData.fuelCost || ''}
                  onChange={(e) => handleCostChange('fuelCost', Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">洗車美容費用</span>
                <input
                  type="number"
                  min="0"
                  value={formData.detailingCost || ''}
                  onChange={(e) => handleCostChange('detailingCost', Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">稅務保險/規費</span>
                <input
                  type="number"
                  min="0"
                  value={formData.taxCost || ''}
                  onChange={(e) => handleCostChange('taxCost', Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Total Cost Input / Display */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                本筆工單實付總金額 (TWD):
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">NT$</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalCost}
                  disabled={!isManualTotal}
                  onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                  className={`w-32 bg-slate-900 border ${
                    isManualTotal ? 'border-amber-500/60 text-amber-300' : 'border-slate-800 text-emerald-400'
                  } rounded px-3 py-1.5 text-sm font-mono font-bold text-right`}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Part Numbers Tag Input */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>正廠/改裝零件料號 (選填，支援多標籤)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="輸入料號後按 Enter 或點新增，如: 51747497279, 11428575211"
                value={partInput}
                onChange={(e) => setPartInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPart();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={handleAddPart}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
              >
                加入料號
              </button>
            </div>
            {formData.partNumbers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.partNumbers.map((part, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 font-mono text-xs"
                  >
                    {part}
                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="hover:text-red-400 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 5: OBD Codes Input */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>OBD 診斷故障碼 (選填，如 21B043, 194006)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="輸入故障碼如 21B043"
                value={obdInput}
                onChange={(e) => setObdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOBD();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono uppercase"
              />
              <button
                type="button"
                onClick={handleAddOBD}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
              >
                加入代碼
              </button>
            </div>
            {formData.obdCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.obdCodes.map((code, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono text-xs font-bold"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => handleRemoveOBD(idx)}
                      className="hover:text-red-400 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 6: Notes & Remarks */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">📄 備註說明與施工細節 (選填)</label>
            <textarea
              rows={3}
              placeholder="填寫施工內容、異常徵兆、零件規格或工單備註..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {recordToEdit && onDeleteRecord ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`確定要刪除這筆紀錄嗎？\n[${formData.date}] ${formData.title}`)) {
                    onDeleteRecord(recordToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-mono text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-800/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除此紀錄</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{recordToEdit ? '確認儲存更新' : '立即新增工單'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
