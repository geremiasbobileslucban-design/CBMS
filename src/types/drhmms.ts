// GIS/GPS Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// Disaster Risk Types
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Critical';

export type IncidentType = 'Flood' | 'Landslide' | 'Fire' | 'Road Accident' | 'Structural Damage' | 'Power Outage' | 'Other';
export type IncidentStatus = 'Reported' | 'Under Verification' | 'Ongoing Response' | 'Resolved' | 'Closed';

export interface DisasterRiskProfile {
  floodRisk: RiskLevel;
  landslideRisk: RiskLevel;
  earthquakeRisk: RiskLevel;
  fireRisk: RiskLevel;
  overallRisk: RiskLevel;
}

export interface VulnerableMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  type: 'Elderly' | 'PWD' | 'Pregnant' | 'Infant' | 'Chronic Illness' | 'Solo Parent' | 'Lactating' | 'OSY';
  specialNeeds?: string;
}

export interface EvacuationReadiness {
  hasEmergencyKit: boolean;
  knowsEvacuationRoute: boolean;
  hasEvacuationPlan: boolean;
  registeredWithBarangay: boolean;
  hasEmergencyContact: boolean;
  nearestEvacuationCenter?: string;
  distanceToEvacuationCenter?: number; // in km
}

// Risk Zone for mapping
export interface RiskZone {
  id: string;
  name: string;
  type: 'flood' | 'landslide' | 'fire' | 'earthquake';
  riskLevel: RiskLevel;
  barangays: string[];
  description: string;
  affectedHouseholds: number;
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  incidentDate: string;
  barangay: string;
  municipality: string;
  address: string;
  location?: GeoLocation;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedFamilies: number;
  affectedIndividuals: number;
  casualties: number;
  injuries: number;
  missingPersons: number;
  attachments?: string[];
  reporterName: string;
  contactNumber: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

// Evacuation Center
export interface EvacuationCenter {
  id: string;
  name: string;
  barangay: string;
  capacity: number;
  currentOccupancy: number;
  type: 'School' | 'Gymnasium' | 'Community Center' | 'Church' | 'Other';
  facilities: string[];
  contactPerson: string;
  contactNumber: string;
  location?: GeoLocation;
  isActive: boolean;
}

// Social Programs for Beneficiary Targeting
export interface SocialProgram {
  id: string;
  name: string;
  agency: string;
  description: string;
  eligibilityCriteria: {
    povertyLevel?: ('Poor' | 'Subsistence Poor' | 'Non-Poor')[];
    maxIncome?: number;
    hasElderly?: boolean;
    hasPWD?: boolean;
    hasChildren?: boolean;
    hasPregnant?: boolean;
    disasterVulnerability?: ('Low' | 'Medium' | 'High')[];
  };
  benefitsDescription: string;
  isActive: boolean;
}

// Beneficiary Enrollment
export interface BeneficiaryEnrollment {
  id: string;
  householdId: string;
  programId: string;
  enrollmentDate: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Graduated' | 'Suspended';
  lastUpdated: string;
  notes?: string;
}

// Civil Status options
export type CivilStatus = 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Divorced' | 'Live-in';

// PhilHealth Status options
export type PhilHealthStatus = 'Member' | 'Dependent' | 'Indigent' | 'None';

// Disability Type options
export type DisabilityType = 'Physical' | 'Visual' | 'Hearing' | 'Mental' | 'Psychosocial' | 'Learning' | 'Multiple' | 'None';

// Nutritional Status options
export type NutritionalStatus = 'Normal' | 'Underweight' | 'Severely Underweight' | 'Overweight' | 'Obese' | 'Stunted' | 'Wasted';

// Literacy Status options
export type LiteracyStatus = 'Can read and write' | 'Can read only' | 'Cannot read or write';

// School Type options
export type SchoolType = 'Public' | 'Private' | 'SUC' | 'LUC';

// Water Source options
export type WaterSource = 'Piped Water' | 'Deep Well' | 'Shallow Well' | 'Spring' | 'River/Stream' | 'Rainwater' | 'Bottled/Refilling';

// Income Source options
export type IncomeSource = 'Salary/Wage' | 'Business' | 'Farming' | 'Fishing' | 'Remittance' | 'Pension' | 'Government Aid' | 'Others';

// Unified Household Member (replaces HeadOfFamily and FamilyMember)
export interface HouseholdMember {
  id: string;
  headOfFamilyId?: string; // Links family member to their head of family

  // Basic Information
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  birthDate?: string;
  age: number;
  gender: 'Male' | 'Female';
  civilStatus?: CivilStatus;
  relationship: string; // 'Head' for head of household
  philsysNumber?: string;
  contactNumber?: string;

  // Employment & Income
  employmentStatus: string;
  occupation?: string;
  monthlyIncome: number;
  incomeSource?: IncomeSource;

  // Health Profile
  philHealthStatus?: PhilHealthStatus;
  hasDisability: boolean;
  disabilityType?: DisabilityType;
  isSeniorCitizen?: boolean; // auto-computed from age >= 60
  isSoloParent?: boolean;
  hasChronicIllness?: boolean;
  isPregnant?: boolean;
  isLactating?: boolean;

  // Nutrition (for children 0-5 and pregnant)
  weight?: number; // in kg
  height?: number; // in cm
  bmi?: number; // computed
  nutritionalStatus?: NutritionalStatus;

  // Education Profile
  educationLevel: string;
  literacyStatus?: LiteracyStatus;
  isCurrentlyAttendingSchool?: boolean;
  currentGradeLevel?: string;
  schoolName?: string;
  schoolType?: SchoolType;
  isScholarshipRecipient?: boolean;
  isOutOfSchoolYouth?: boolean; // ages 15-30 not attending
}

// Legacy interfaces for backward compatibility
export interface HeadOfFamily {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  employmentStatus: string;
  monthlyIncome: number;
  educationLevel: string;
  occupation: string;
}

export interface FamilyMember {
  id: string;
  headOfFamilyId: string;
  name: string;
  relationship: string;
  age: number;
  gender: 'Male' | 'Female';
  employmentStatus: string;
  monthlyIncome: number;
  educationLevel: string;
  occupation: string;
}

// Extended Household with new fields
export interface Household {
  id: string;

  // Location Information
  barangay: string;
  pupisSitio?: string; // NEW: Purok/Sitio
  address?: string; // NEW: Complete address
  householdNumber: string;
  location?: GeoLocation;
  contactNumber?: string; // NEW: Household contact

  // Summary fields (computed)
  headOfFamily: string;
  totalMembers: number;
  monthlyIncome: number;

  // Economic Assessment
  foodExpenditure?: number; // NEW
  nonFoodExpenditure?: number; // NEW
  povertyLevel: 'Non-Poor' | 'Poor' | 'Subsistence Poor';

  // Housing
  housingType: string;
  waterSource?: WaterSource; // NEW: replaces accessToWater boolean

  // Basic Services Access
  accessToWater: boolean;
  accessToElectricity: boolean;
  accessToInternet: boolean;
  accessToHealthFacility?: boolean; // NEW
  accessToSanitaryToilet?: boolean; // NEW
  accessToPublicTransportation?: boolean; // NEW
  accessToWasteCollection?: boolean; // NEW
  healthInsurance: boolean;

  // Legacy fields
  employmentStatus: string;
  educationLevel: string;
  disasterVulnerability: 'Low' | 'Medium' | 'High';
  dateCollected: string;

  // Disaster Risk
  disasterRisk?: DisasterRiskProfile;
  disasterRiskProfile?: DisasterRiskProfile;
  vulnerableMembers?: VulnerableMember[];
  evacuationReadiness?: EvacuationReadiness;

  // Program Enrollments
  programEnrollments?: string[];

  // Members - NEW unified member list
  members?: HouseholdMember[];

  // Legacy member fields (for backward compatibility)
  headsOfFamily?: HeadOfFamily[];
  familyMembers?: FamilyMember[];
}

// Offline Sync Types
export interface PendingSyncItem {
  id: string;
  type: 'household' | 'enrollment' | 'incident' | 'update';
  data: Household | BeneficiaryEnrollment | IncidentReport;
  timestamp: string;
  attempts: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: string;
  pendingItems: number;
  isSyncing: boolean;
}

export interface BarangayStats {
  name: string;
  totalHouseholds: number;
  poorHouseholds: number;
  population: number;
  averageIncome: number;
  accessToWaterPercentage: number;
  accessToElectricityPercentage: number;
}

export interface PovertyIndicator {
  category: string;
  poor: number;
  nonPoor: number;
}

// Dropdown Options Export (for form use)
export const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced', 'Live-in'];

export const PHILHEALTH_STATUS_OPTIONS: PhilHealthStatus[] = ['Member', 'Dependent', 'Indigent', 'None'];

export const DISABILITY_TYPE_OPTIONS: DisabilityType[] = ['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Psychosocial', 'Learning', 'Multiple'];

export const NUTRITIONAL_STATUS_OPTIONS: NutritionalStatus[] = ['Normal', 'Underweight', 'Severely Underweight', 'Overweight', 'Obese', 'Stunted', 'Wasted'];

export const LITERACY_STATUS_OPTIONS: LiteracyStatus[] = ['Can read and write', 'Can read only', 'Cannot read or write'];

export const SCHOOL_TYPE_OPTIONS: SchoolType[] = ['Public', 'Private', 'SUC', 'LUC'];

export const WATER_SOURCE_OPTIONS: WaterSource[] = ['Piped Water', 'Deep Well', 'Shallow Well', 'Spring', 'River/Stream', 'Rainwater', 'Bottled/Refilling'];

export const INCOME_SOURCE_OPTIONS: IncomeSource[] = ['Salary/Wage', 'Business', 'Farming', 'Fishing', 'Remittance', 'Pension', 'Government Aid', 'Others'];

export const RELATIONSHIP_OPTIONS = [
  'Head',
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Grandparent',
  'Grandchild',
  'In-Law',
  'Other Relative',
  'Non-Relative',
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  'Employed',
  'Self-Employed',
  'Unemployed',
  'Student',
  'Retired',
  'OFW',
  'Housewife/Househusband',
  'Not Applicable (Minor)',
];

export const EDUCATION_LEVEL_OPTIONS = [
  'No Formal Education',
  'Elementary',
  'High School',
  'Vocational',
  'College',
  'Post-Graduate',
  'Not Applicable',
];

export const GRADE_LEVEL_OPTIONS = [
  'Kinder',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'College 1st Year',
  'College 2nd Year',
  'College 3rd Year',
  'College 4th Year',
  'College 5th Year',
  'Vocational',
  'ALS',
];

export const HOUSING_TYPE_OPTIONS = [
  'Concrete',
  'Mixed (Semi-Concrete)',
  'Light Materials',
  'Makeshift',
];

export const SUFFIX_OPTIONS = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
