import { YearlyStat } from '../types';

export const SUMMARY_STATS = {
  totalCost: 757578,
  yearlyAvg: 159490,
  monthlyAvg: 13290,
  totalFuelCost: 135311,
  totalMaintenanceCost: 583107,
  totalDetailingCost: 39160,
  startKm: 39350,
  currentKm: 89858,
  totalDrivenKm: 50508,
  costPerKm: 15.00,
  trackingStartDate: '2021-11-23',
  modelName: '2017 BMW 530i Sport Line (美規 G30)',
  engineCode: 'B46 2.0L TwinPower Turbo (SULEV 認證 248 hp / 350 Nm)',
  transmission: 'ZF 8HP50 8-Speed Steptronic'
};

export const YEARLY_STATS: YearlyStat[] = [
  {
    year: 2021,
    isProjected: false,
    dailyKm: 56.1,
    fuelConsumption: 0,
    fuelUnitCost: 0,
    totalKm: 2188,
    fuelCost: 6107,
    maintenanceExpense: 55445,
    detailingCost: 22420,
    taxAndOtherCost: 48330,
    totalCost: 83972
  },
  {
    year: 2022,
    isProjected: false,
    dailyKm: 20.3,
    fuelConsumption: 8.82,
    fuelUnitCost: 3.31,
    totalKm: 7427,
    fuelCost: 24892,
    maintenanceExpense: 83994,
    detailingCost: 2920,
    taxAndOtherCost: 49737,
    totalCost: 111806
  },
  {
    year: 2023,
    isProjected: false,
    dailyKm: 40.0,
    fuelConsumption: 11.67,
    fuelUnitCost: 2.88,
    totalKm: 14604,
    fuelCost: 41202,
    maintenanceExpense: 173503,
    detailingCost: 4050,
    taxAndOtherCost: 39161,
    totalCost: 218755
  },
  {
    year: 2024,
    isProjected: false,
    dailyKm: 33.1,
    fuelConsumption: 12.93,
    fuelUnitCost: 2.54,
    totalKm: 12084,
    fuelCost: 30559,
    maintenanceExpense: 76149,
    detailingCost: 3220,
    taxAndOtherCost: 34373,
    totalCost: 109928
  },
  {
    year: 2025,
    isProjected: false,
    dailyKm: 23.2,
    fuelConsumption: 13.49,
    fuelUnitCost: 2.31,
    totalKm: 8465,
    fuelCost: 19046,
    maintenanceExpense: 63654,
    detailingCost: 2200,
    taxAndOtherCost: 34018,
    totalCost: 84900
  },
  {
    year: 2026,
    isProjected: false,
    dailyKm: 14.9,
    fuelConsumption: 14.09,
    fuelUnitCost: 2.44,
    totalKm: 5435,
    fuelCost: 13504,
    maintenanceExpense: 130362,
    detailingCost: 3050,
    taxAndOtherCost: 34460,
    totalCost: 146916
  }
];
