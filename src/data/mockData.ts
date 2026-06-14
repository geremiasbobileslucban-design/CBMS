import { Household, BarangayStats } from '../types/drhmms';

// DRHMMS mock data for City of San Jose, Nueva Ecija
// 38 barangays (real names). Numbers are illustrative for a design prototype.

export interface BarangayData {
  id: string;
  name: string;
  cluster: string;
  households: number;
  poor: number;
  pop: number;
  income: number;
  water: number;
  power: number;
}

export const barangayData: BarangayData[] = [
  // ---- Poblacion (8 districts, central) ---------------------------
  { id: 'p1', name: 'A. Pascual (Pob.)', cluster: 'Poblacion', households: 412, poor: 78, pop: 1842, income: 14200, water: 96, power: 99 },
  { id: 'p2', name: 'Canuto Ramos (Pob.)', cluster: 'Poblacion', households: 386, poor: 65, pop: 1721, income: 15800, water: 97, power: 99 },
  { id: 'p3', name: 'Capt. Antonio Castro (Pob.)', cluster: 'Poblacion', households: 401, poor: 72, pop: 1798, income: 14600, water: 95, power: 98 },
  { id: 'p4', name: 'Crisanto Sanchez (Pob.)', cluster: 'Poblacion', households: 355, poor: 54, pop: 1610, income: 16200, water: 98, power: 100 },
  { id: 'p5', name: 'Pinili (Pob.)', cluster: 'Poblacion', households: 368, poor: 61, pop: 1654, income: 15400, water: 96, power: 99 },
  { id: 'p6', name: 'Rafael Rueda Sr. (Pob.)', cluster: 'Poblacion', households: 392, poor: 71, pop: 1748, income: 14800, water: 95, power: 99 },
  { id: 'p7', name: 'Ramon Castro (Pob.)', cluster: 'Poblacion', households: 377, poor: 68, pop: 1689, income: 15100, water: 94, power: 98 },
  { id: 'p8', name: 'Raymundo Eugenio (Pob.)', cluster: 'Poblacion', households: 344, poor: 58, pop: 1542, income: 15600, water: 96, power: 99 },

  // ---- Northwest cluster (along Maharlika hwy toward Lupao) -------
  { id: 'b01', name: 'Abar 1st', cluster: 'Northwest', households: 621, poor: 178, pop: 2890, income: 9400, water: 78, power: 92 },
  { id: 'b02', name: 'Abar 2nd', cluster: 'Northwest', households: 543, poor: 142, pop: 2562, income: 9800, water: 80, power: 93 },
  { id: 'b03', name: 'Caanawan', cluster: 'Northwest', households: 892, poor: 267, pop: 4124, income: 8700, water: 74, power: 88 },
  { id: 'b04', name: 'Calaocan', cluster: 'Northwest', households: 412, poor: 118, pop: 1948, income: 9100, water: 71, power: 86 },
  { id: 'b05', name: 'Camanacsacan', cluster: 'Northwest', households: 387, poor: 142, pop: 1822, income: 7900, water: 65, power: 81 },

  // ---- North cluster (Lupao border) -------------------------------
  { id: 'b06', name: 'Kaliwanagan', cluster: 'North', households: 298, poor: 104, pop: 1387, income: 7600, water: 62, power: 78 },
  { id: 'b07', name: 'Bagong Sikat', cluster: 'North', households: 354, poor: 118, pop: 1612, income: 8200, water: 68, power: 82 },
  { id: 'b08', name: 'Porais', cluster: 'North', households: 271, poor: 108, pop: 1238, income: 7100, water: 58, power: 74 },

  // ---- Northeast cluster (toward Carranglan / Caraballo) ----------
  { id: 'b09', name: 'Culaylay', cluster: 'Northeast', households: 312, poor: 124, pop: 1462, income: 7400, water: 60, power: 76 },
  { id: 'b10', name: 'Dizol', cluster: 'Northeast', households: 268, poor: 118, pop: 1247, income: 6800, water: 54, power: 71 },
  { id: 'b11', name: 'Sibut', cluster: 'Northeast', households: 445, poor: 189, pop: 2034, income: 7200, water: 58, power: 74 },
  { id: 'b12', name: 'Tondod', cluster: 'Northeast', households: 521, poor: 184, pop: 2398, income: 8100, water: 66, power: 81 },

  // ---- East cluster (foothills) -----------------------------------
  { id: 'b13', name: 'Kita-Kita', cluster: 'East', households: 387, poor: 172, pop: 1768, income: 6900, water: 56, power: 73 },
  { id: 'b14', name: 'Manicla', cluster: 'East', households: 298, poor: 148, pop: 1389, income: 6200, water: 48, power: 68 },
  { id: 'b15', name: 'Malasin', cluster: 'East', households: 512, poor: 212, pop: 2387, income: 7100, water: 59, power: 75 },

  // ---- Southeast cluster ------------------------------------------
  { id: 'b16', name: 'Palestina', cluster: 'Southeast', households: 412, poor: 138, pop: 1942, income: 8400, water: 69, power: 84 },
  { id: 'b17', name: 'Parang Mangga', cluster: 'Southeast', households: 298, poor: 124, pop: 1389, income: 7200, water: 62, power: 78 },
  { id: 'b18', name: 'San Agustin', cluster: 'Southeast', households: 467, poor: 156, pop: 2174, income: 8800, water: 72, power: 87 },
  { id: 'b19', name: 'San Mauricio', cluster: 'Southeast', households: 388, poor: 142, pop: 1812, income: 8100, water: 67, power: 82 },

  // ---- South cluster ----------------------------------------------
  { id: 'b20', name: 'Santo Niño 1st', cluster: 'South', households: 584, poor: 178, pop: 2698, income: 9200, water: 78, power: 91 },
  { id: 'b21', name: 'Santo Niño 2nd', cluster: 'South', households: 521, poor: 163, pop: 2412, income: 9100, water: 76, power: 90 },
  { id: 'b22', name: 'Santo Niño 3rd', cluster: 'South', households: 467, poor: 148, pop: 2178, income: 9000, water: 74, power: 89 },
  { id: 'b23', name: 'Sinipit Bubon', cluster: 'South', households: 312, poor: 114, pop: 1467, income: 8200, water: 69, power: 84 },
  { id: 'b24', name: 'Soledad', cluster: 'South', households: 378, poor: 128, pop: 1751, income: 8600, water: 71, power: 86 },
  { id: 'b25', name: 'Tabulac', cluster: 'South', households: 412, poor: 142, pop: 1924, income: 8400, water: 70, power: 85 },

  // ---- Southwest cluster (toward Muñoz) ---------------------------
  { id: 'b26', name: 'Tayabo', cluster: 'Southwest', households: 498, poor: 172, pop: 2312, income: 8300, water: 68, power: 84 },
  { id: 'b27', name: 'San Juan', cluster: 'Southwest', households: 412, poor: 148, pop: 1932, income: 8600, water: 71, power: 86 },
  { id: 'b28', name: 'Villa Floresca', cluster: 'Southwest', households: 354, poor: 128, pop: 1648, income: 8400, water: 69, power: 85 },

  // ---- West cluster -----------------------------------------------
  { id: 'b29', name: 'Santo Tomas', cluster: 'West', households: 421, poor: 142, pop: 1968, income: 8900, water: 73, power: 88 },
  { id: 'b30', name: 'Villa Marina', cluster: 'West', households: 312, poor: 128, pop: 1452, income: 7800, water: 64, power: 81 },
];

// Barangay names for dropdown
export const barangays = barangayData.map(b => b.name);

// City-level KPIs
export const TOTAL_HH = barangayData.reduce((s, b) => s + b.households, 0);
export const TOTAL_POOR = barangayData.reduce((s, b) => s + b.poor, 0);
export const TOTAL_POP = barangayData.reduce((s, b) => s + b.pop, 0);
export const POVERTY_RATE = (TOTAL_POOR / TOTAL_HH) * 100;
export const HIGH_VULN_BARANGAYS = barangayData.filter(b => (b.poor / b.households) > 0.40).length;
export const WATER_AVG = Math.round(barangayData.reduce((s, b) => s + b.water, 0) / barangayData.length);
export const POWER_AVG = Math.round(barangayData.reduce((s, b) => s + b.power, 0) / barangayData.length);

// Convert to BarangayStats format for compatibility
export const mockBarangayStats: BarangayStats[] = barangayData.map(b => ({
  name: b.name,
  totalHouseholds: b.households,
  poorHouseholds: b.poor,
  population: b.pop,
  averageIncome: b.income,
  accessToWaterPercentage: b.water,
  accessToElectricityPercentage: b.power,
}));

// Sample households for registry
export const mockHouseholds: Household[] = [
  {
    id: '1',
    barangay: 'A. Pascual (Pob.)',
    householdNumber: 'HH-2024-001',
    headOfFamily: 'Juan dela Cruz',
    totalMembers: 5,
    monthlyIncome: 8500,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: true,
    educationLevel: 'High School',
    disasterVulnerability: 'Medium',
    povertyLevel: 'Poor',
    dateCollected: '2024-01-15',
  },
  {
    id: '2',
    barangay: 'Crisanto Sanchez (Pob.)',
    householdNumber: 'HH-2024-002',
    headOfFamily: 'Maria Santos',
    totalMembers: 4,
    monthlyIncome: 18000,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: true,
    healthInsurance: true,
    educationLevel: 'College',
    disasterVulnerability: 'Low',
    povertyLevel: 'Non-Poor',
    dateCollected: '2024-01-16',
  },
  {
    id: '3',
    barangay: 'Malasin',
    householdNumber: 'HH-2024-003',
    headOfFamily: 'Pedro Reyes',
    totalMembers: 6,
    monthlyIncome: 6200,
    employmentStatus: 'Self-Employed',
    housingType: 'Mixed',
    accessToWater: false,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: false,
    educationLevel: 'Elementary',
    disasterVulnerability: 'High',
    povertyLevel: 'Subsistence Poor',
    dateCollected: '2024-01-17',
  },
  {
    id: '4',
    barangay: 'Caanawan',
    householdNumber: 'HH-2024-004',
    headOfFamily: 'Anna Garcia',
    totalMembers: 3,
    monthlyIncome: 12000,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: true,
    healthInsurance: true,
    educationLevel: 'College',
    disasterVulnerability: 'Low',
    povertyLevel: 'Non-Poor',
    dateCollected: '2024-01-18',
  },
  {
    id: '5',
    barangay: 'Manicla',
    householdNumber: 'HH-2024-005',
    headOfFamily: 'Roberto Cruz',
    totalMembers: 7,
    monthlyIncome: 5400,
    employmentStatus: 'Unemployed',
    housingType: 'Light Materials',
    accessToWater: false,
    accessToElectricity: false,
    accessToInternet: false,
    healthInsurance: false,
    educationLevel: 'Elementary',
    disasterVulnerability: 'High',
    povertyLevel: 'Subsistence Poor',
    dateCollected: '2024-01-19',
  },
  {
    id: '6',
    barangay: 'Pinili (Pob.)',
    householdNumber: 'HH-2024-006',
    headOfFamily: 'Liza Mendoza',
    totalMembers: 4,
    monthlyIncome: 22400,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: true,
    healthInsurance: true,
    educationLevel: 'College',
    disasterVulnerability: 'Low',
    povertyLevel: 'Non-Poor',
    dateCollected: '2024-01-20',
  },
  {
    id: '7',
    barangay: 'Kita-Kita',
    householdNumber: 'HH-2024-007',
    headOfFamily: 'Eduardo Villanueva',
    totalMembers: 8,
    monthlyIncome: 5200,
    employmentStatus: 'Self-Employed',
    housingType: 'Light Materials',
    accessToWater: false,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: false,
    educationLevel: 'Elementary',
    disasterVulnerability: 'High',
    povertyLevel: 'Subsistence Poor',
    dateCollected: '2024-01-21',
  },
  {
    id: '8',
    barangay: 'Sibut',
    householdNumber: 'HH-2024-008',
    headOfFamily: 'Carmen Aquino',
    totalMembers: 5,
    monthlyIncome: 7800,
    employmentStatus: 'Employed',
    housingType: 'Mixed',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: true,
    educationLevel: 'High School',
    disasterVulnerability: 'Medium',
    povertyLevel: 'Poor',
    dateCollected: '2024-01-22',
  },
  {
    id: '9',
    barangay: 'San Agustin',
    householdNumber: 'HH-2024-009',
    headOfFamily: 'Mark Diaz',
    totalMembers: 4,
    monthlyIncome: 14000,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: true,
    healthInsurance: true,
    educationLevel: 'College',
    disasterVulnerability: 'Low',
    povertyLevel: 'Non-Poor',
    dateCollected: '2024-01-22',
  },
  {
    id: '10',
    barangay: 'Tayabo',
    householdNumber: 'HH-2024-010',
    headOfFamily: 'Sofia Ramos',
    totalMembers: 6,
    monthlyIncome: 7100,
    employmentStatus: 'Self-Employed',
    housingType: 'Mixed',
    accessToWater: false,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: false,
    educationLevel: 'High School',
    disasterVulnerability: 'Medium',
    povertyLevel: 'Poor',
    dateCollected: '2024-01-23',
  },
  {
    id: '11',
    barangay: 'Santo Niño 1st',
    householdNumber: 'HH-2024-011',
    headOfFamily: 'Rosa Bautista',
    totalMembers: 5,
    monthlyIncome: 9400,
    employmentStatus: 'Employed',
    housingType: 'Mixed',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: false,
    healthInsurance: true,
    educationLevel: 'High School',
    disasterVulnerability: 'Low',
    povertyLevel: 'Poor',
    dateCollected: '2024-01-23',
  },
  {
    id: '12',
    barangay: 'Abar 2nd',
    householdNumber: 'HH-2024-012',
    headOfFamily: 'Ferdinand Aguilar',
    totalMembers: 4,
    monthlyIncome: 11200,
    employmentStatus: 'Employed',
    housingType: 'Concrete',
    accessToWater: true,
    accessToElectricity: true,
    accessToInternet: true,
    healthInsurance: true,
    educationLevel: 'College',
    disasterVulnerability: 'Low',
    povertyLevel: 'Non-Poor',
    dateCollected: '2024-01-24',
  },
];

// Map regions for choropleth visualization
export const mapRegions = [
  { id: 'POB', label: 'Poblacion', barangays: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] },
  { id: 'NW', label: 'Caanawan / Abar', barangays: ['b01', 'b02', 'b03', 'b04'] },
  { id: 'NWO', label: 'Camanacsacan', barangays: ['b05'] },
  { id: 'N', label: 'Kaliwanagan / Bagong Sikat', barangays: ['b06', 'b07', 'b08'] },
  { id: 'NE', label: 'Sibut / Tondod', barangays: ['b09', 'b11', 'b12'] },
  { id: 'NEO', label: 'Dizol', barangays: ['b10'] },
  { id: 'EMID', label: 'Malasin / Kita-Kita', barangays: ['b13', 'b15'] },
  { id: 'EOUT', label: 'Manicla', barangays: ['b14'] },
  { id: 'CMID', label: 'San Agustin / Palestina', barangays: ['b16', 'b17', 'b18', 'b19'] },
  { id: 'S', label: 'Sto. Niño 1st / 2nd / 3rd', barangays: ['b20', 'b21', 'b22'] },
  { id: 'SE', label: 'Sinipit / Soledad / Tabulac', barangays: ['b23', 'b24', 'b25'] },
  { id: 'SW', label: 'Tayabo / San Juan / Villa Floresca', barangays: ['b26', 'b27', 'b28'] },
  { id: 'WMID', label: 'Santo Tomas', barangays: ['b29'] },
  { id: 'WS', label: 'Villa Marina', barangays: ['b30'] },
];

// Get cluster stats
export function getClusterStats(regionId: string) {
  const region = mapRegions.find(r => r.id === regionId);
  if (!region) return null;

  const barangayIds = new Set(region.barangays);
  const brgys = barangayData.filter(b => barangayIds.has(b.id));
  const households = brgys.reduce((s, b) => s + b.households, 0);
  const poor = brgys.reduce((s, b) => s + b.poor, 0);
  const pop = brgys.reduce((s, b) => s + b.pop, 0);

  return { households, poor, pop, rate: poor / households };
}
