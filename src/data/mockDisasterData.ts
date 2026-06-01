import { RiskZone, EvacuationCenter, SocialProgram, VulnerableMember } from '../types/cbms';

// Risk Zones for San Jose City
export const mockRiskZones: RiskZone[] = [
  {
    id: 'rz-1',
    name: 'Talavera River Flood Plain',
    type: 'flood',
    riskLevel: 'High',
    barangays: ['Caanawan', 'Abar 1st', 'Abar 2nd', 'Calaocan'],
    description: 'Low-lying areas along Talavera River prone to flooding during monsoon season',
    affectedHouseholds: 2468,
  },
  {
    id: 'rz-2',
    name: 'Caraballo Mountain Slopes',
    type: 'landslide',
    riskLevel: 'Very High',
    barangays: ['Dizol', 'Sibut', 'Tondod', 'Manicla'],
    description: 'Mountainous terrain with steep slopes susceptible to landslides',
    affectedHouseholds: 1532,
  },
  {
    id: 'rz-3',
    name: 'Eastern Foothills',
    type: 'landslide',
    riskLevel: 'Medium',
    barangays: ['Kita-Kita', 'Malasin', 'Culaylay'],
    description: 'Hilly areas with moderate landslide risk during heavy rainfall',
    affectedHouseholds: 1211,
  },
  {
    id: 'rz-4',
    name: 'Poblacion Commercial Area',
    type: 'fire',
    riskLevel: 'High',
    barangays: ['A. Pascual (Pob.)', 'Canuto Ramos (Pob.)', 'Pinili (Pob.)', 'Crisanto Sanchez (Pob.)'],
    description: 'Dense commercial area with high fire risk due to congested structures',
    affectedHouseholds: 1567,
  },
  {
    id: 'rz-5',
    name: 'Central Valley Flood Zone',
    type: 'flood',
    riskLevel: 'Medium',
    barangays: ['Santo Niño 1st', 'Santo Niño 2nd', 'Santo Niño 3rd', 'Tayabo'],
    description: 'Agricultural flatlands with moderate flooding during typhoons',
    affectedHouseholds: 2070,
  },
  {
    id: 'rz-6',
    name: 'Western Irrigation Canals',
    type: 'flood',
    riskLevel: 'Medium',
    barangays: ['Santo Tomas', 'Villa Marina', 'San Juan'],
    description: 'Areas near irrigation canals prone to overflow',
    affectedHouseholds: 1145,
  },
];

// Evacuation Centers
export const mockEvacuationCenters: EvacuationCenter[] = [
  {
    id: 'ec-1',
    name: 'San Jose City Central School',
    barangay: 'A. Pascual (Pob.)',
    capacity: 500,
    currentOccupancy: 0,
    type: 'School',
    facilities: ['Restrooms', 'Kitchen', 'Medical Station', 'Power Generator'],
    contactPerson: 'Maria Santos',
    contactNumber: '0917-123-4567',
    location: { latitude: 15.7867, longitude: 120.9933 },
    isActive: true,
  },
  {
    id: 'ec-2',
    name: 'San Jose City Sports Complex',
    barangay: 'Crisanto Sanchez (Pob.)',
    capacity: 1200,
    currentOccupancy: 0,
    type: 'Gymnasium',
    facilities: ['Restrooms', 'Kitchen', 'Medical Station', 'Power Generator', 'Shower Facilities', 'Parking'],
    contactPerson: 'Juan dela Cruz',
    contactNumber: '0918-234-5678',
    location: { latitude: 15.7889, longitude: 120.9951 },
    isActive: true,
  },
  {
    id: 'ec-3',
    name: 'Caanawan Elementary School',
    barangay: 'Caanawan',
    capacity: 350,
    currentOccupancy: 0,
    type: 'School',
    facilities: ['Restrooms', 'Kitchen'],
    contactPerson: 'Pedro Reyes',
    contactNumber: '0919-345-6789',
    location: { latitude: 15.8012, longitude: 120.9756 },
    isActive: true,
  },
  {
    id: 'ec-4',
    name: 'Malasin Community Center',
    barangay: 'Malasin',
    capacity: 200,
    currentOccupancy: 0,
    type: 'Community Center',
    facilities: ['Restrooms', 'Kitchen'],
    contactPerson: 'Ana Garcia',
    contactNumber: '0920-456-7890',
    location: { latitude: 15.7745, longitude: 121.0234 },
    isActive: true,
  },
  {
    id: 'ec-5',
    name: 'San Agustin Parish Church',
    barangay: 'San Agustin',
    capacity: 300,
    currentOccupancy: 0,
    type: 'Church',
    facilities: ['Restrooms', 'Kitchen', 'Medical Station'],
    contactPerson: 'Fr. Miguel Santos',
    contactNumber: '0921-567-8901',
    location: { latitude: 15.7623, longitude: 121.0089 },
    isActive: true,
  },
  {
    id: 'ec-6',
    name: 'Sibut Barangay Hall',
    barangay: 'Sibut',
    capacity: 150,
    currentOccupancy: 0,
    type: 'Community Center',
    facilities: ['Restrooms'],
    contactPerson: 'Roberto Cruz',
    contactNumber: '0922-678-9012',
    location: { latitude: 15.8123, longitude: 121.0345 },
    isActive: true,
  },
  {
    id: 'ec-7',
    name: 'Santo Niño 1st Elementary School',
    barangay: 'Santo Niño 1st',
    capacity: 400,
    currentOccupancy: 0,
    type: 'School',
    facilities: ['Restrooms', 'Kitchen', 'Medical Station'],
    contactPerson: 'Liza Mendoza',
    contactNumber: '0923-789-0123',
    location: { latitude: 15.7534, longitude: 120.9867 },
    isActive: true,
  },
  {
    id: 'ec-8',
    name: 'Tayabo Multi-Purpose Hall',
    barangay: 'Tayabo',
    capacity: 250,
    currentOccupancy: 0,
    type: 'Community Center',
    facilities: ['Restrooms', 'Kitchen', 'Power Generator'],
    contactPerson: 'Eduardo Villanueva',
    contactNumber: '0924-890-1234',
    location: { latitude: 15.7412, longitude: 120.9678 },
    isActive: true,
  },
];

// Social Programs for Beneficiary Targeting
export const mockSocialPrograms: SocialProgram[] = [
  {
    id: 'sp-1',
    name: 'Pantawid Pamilyang Pilipino Program (4Ps)',
    agency: 'DSWD',
    description: 'Conditional cash transfer program for poor households with children 0-18 years old',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor'],
      hasChildren: true,
    },
    benefitsDescription: 'Monthly cash grants for health and education (P500-P1,400/month)',
    isActive: true,
  },
  {
    id: 'sp-2',
    name: 'Social Pension for Indigent Senior Citizens',
    agency: 'DSWD',
    description: 'Monthly stipend for indigent senior citizens 60 years old and above',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor'],
      hasElderly: true,
    },
    benefitsDescription: 'Monthly pension of P500',
    isActive: true,
  },
  {
    id: 'sp-3',
    name: 'Assistance to Individuals in Crisis Situation (AICS)',
    agency: 'DSWD',
    description: 'One-time financial assistance for medical, burial, education, and transportation',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor', 'Non-Poor'],
    },
    benefitsDescription: 'One-time assistance up to P10,000 depending on need',
    isActive: true,
  },
  {
    id: 'sp-4',
    name: 'PhilHealth Indigent Program',
    agency: 'PhilHealth',
    description: 'Free health insurance coverage for indigent families',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor'],
    },
    benefitsDescription: 'Full health insurance coverage including hospitalization',
    isActive: true,
  },
  {
    id: 'sp-5',
    name: 'Educational Assistance Program',
    agency: 'LGU San Jose City',
    description: 'Scholarship and educational assistance for poor students',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor'],
      hasChildren: true,
    },
    benefitsDescription: 'School supplies, tuition assistance, and transportation allowance',
    isActive: true,
  },
  {
    id: 'sp-6',
    name: 'Livelihood Assistance Program',
    agency: 'DOLE',
    description: 'Livelihood support for unemployed or underemployed individuals',
    eligibilityCriteria: {
      povertyLevel: ['Poor', 'Subsistence Poor'],
      maxIncome: 10000,
    },
    benefitsDescription: 'Capital assistance up to P20,000 for micro-enterprise',
    isActive: true,
  },
  {
    id: 'sp-7',
    name: 'PWD Assistance Program',
    agency: 'DSWD',
    description: 'Special assistance for persons with disabilities',
    eligibilityCriteria: {
      hasPWD: true,
    },
    benefitsDescription: 'Monthly allowance, medical assistance, and assistive devices',
    isActive: true,
  },
  {
    id: 'sp-8',
    name: 'Disaster Risk Reduction Program',
    agency: 'LGU San Jose City - MDRRMO',
    description: 'Priority assistance for households in high-risk disaster areas',
    eligibilityCriteria: {
      disasterVulnerability: ['High'],
    },
    benefitsDescription: 'Evacuation priority, relief goods, and relocation assistance',
    isActive: true,
  },
  {
    id: 'sp-9',
    name: 'Maternal and Child Health Program',
    agency: 'DOH',
    description: 'Health services for pregnant women and children',
    eligibilityCriteria: {
      hasPregnant: true,
    },
    benefitsDescription: 'Free prenatal checkups, vitamins, and delivery assistance',
    isActive: true,
  },
];

// Sample Vulnerable Members Data (for existing households)
export const sampleVulnerableMembers: Record<string, VulnerableMember[]> = {
  '3': [
    {
      id: 'vm-1',
      name: 'Elena Reyes',
      relationship: 'Mother',
      age: 72,
      type: 'Elderly',
      specialNeeds: 'Requires mobility assistance',
    },
  ],
  '5': [
    {
      id: 'vm-2',
      name: 'Maria Cruz',
      relationship: 'Daughter',
      age: 8,
      type: 'PWD',
      specialNeeds: 'Visual impairment',
    },
    {
      id: 'vm-3',
      name: 'Jose Cruz',
      relationship: 'Son',
      age: 2,
      type: 'Infant',
    },
  ],
  '7': [
    {
      id: 'vm-4',
      name: 'Rosa Villanueva',
      relationship: 'Wife',
      age: 34,
      type: 'Pregnant',
      specialNeeds: 'High-risk pregnancy',
    },
    {
      id: 'vm-5',
      name: 'Manuel Villanueva',
      relationship: 'Father',
      age: 78,
      type: 'Elderly',
      specialNeeds: 'Heart condition',
    },
  ],
};

// Helper functions
export function getVulnerableHouseholdsCount(): number {
  return Object.keys(sampleVulnerableMembers).length;
}

export function getTotalVulnerableMembers(): number {
  return Object.values(sampleVulnerableMembers).reduce((sum, members) => sum + members.length, 0);
}

export function getVulnerableMembersByType(type: VulnerableMember['type']): number {
  return Object.values(sampleVulnerableMembers)
    .flat()
    .filter(m => m.type === type).length;
}

export function getAffectedHouseholdsByRiskType(type: RiskZone['type']): number {
  return mockRiskZones
    .filter(zone => zone.type === type)
    .reduce((sum, zone) => sum + zone.affectedHouseholds, 0);
}

export function getTotalEvacuationCapacity(): number {
  return mockEvacuationCenters
    .filter(ec => ec.isActive)
    .reduce((sum, ec) => sum + ec.capacity, 0);
}
