export type RecordCategory =
  | 'all'
  | 'maintenance'
  | 'fuel'
  | 'tax_insurance'
  | 'detailing'
  | 'fault'
  | 'tuning_obd';

export interface HunterAlignmentCorner {
  camber: string;
  caster?: string;
  toe: string;
  status: 'optimal' | 'warning' | 'normal';
}

export interface HunterAlignmentAxis {
  left: HunterAlignmentCorner;
  right: HunterAlignmentCorner;
  totalToe?: string;
  thrustAngle?: string;
}

export interface HunterAlignmentData {
  before: {
    front: HunterAlignmentAxis;
    rear: HunterAlignmentAxis;
  };
  after: {
    front: HunterAlignmentAxis;
    rear: HunterAlignmentAxis;
  };
}

export interface CarRecord {
  id: string;
  date: string;
  km: number | null;
  category: 'maintenance' | 'fuel' | 'tax_insurance' | 'detailing' | 'fault' | 'tuning_obd';
  categoryLabel: string;
  title: string;
  vendor: string;
  fuelCost: number;
  detailingCost: number;
  maintenanceCost: number;
  taxCost: number;
  contractCost: number;
  totalCost: number;
  notes?: string;
  partNumbers?: string[];
  obdCodes?: string[];
  isMilestone?: boolean;
  milestoneKey?: string;
  hasAlignment?: boolean;
  alignmentData?: HunterAlignmentData;
  rawSortIndex?: number;
}

export interface YearlyStat {
  year: number;
  isProjected: boolean;
  dailyKm: number;
  fuelConsumption?: number; // km/L
  fuelUnitCost?: number; // TWD/L
  totalKm: number;
  fuelCost: number;
  maintenanceExpense: number;
  detailingCost: number;
  taxAndOtherCost: number;
  totalCost: number;
}

export interface MilestoneItem {
  id: string;
  km: number;
  date: string;
  title: string;
  system: 'cooling' | 'aero' | 'electronics' | 'chassis' | 'engine';
  systemLabel: string;
  severity: 'critical' | 'warning' | 'info' | 'upgrade';
  description: string;
  symptoms: string;
  solution: string;
  cost: number;
  parts: { name: string; partNumber: string; brand: string }[];
  obdCodes?: string[];
  tags: string[];
}

export interface OBDDiagnosticCode {
  code: string;
  system: string;
  description: string;
  symptom: string;
  vehicleStatus: string;
  solution: string;
  severity: 'high' | 'medium' | 'low';
  occurrences: string[];
}

export interface RecordFormData {
  id?: string;
  date: string;
  km: string | number;
  category: 'maintenance' | 'fuel' | 'tax_insurance' | 'detailing' | 'fault' | 'tuning_obd';
  title: string;
  vendor: string;
  maintenanceCost: number;
  fuelCost: number;
  detailingCost: number;
  taxCost: number;
  contractCost: number;
  totalCost: number;
  notes: string;
  partNumbers: string[];
  obdCodes: string[];
}

export interface ImportPreviewItem {
  record: CarRecord;
  isDuplicate: boolean;
  duplicateReason?: string;
  existingMatch?: CarRecord;
}

export interface ImportSummary {
  totalParsed: number;
  newCount: number;
  duplicateCount: number;
  items: ImportPreviewItem[];
}

