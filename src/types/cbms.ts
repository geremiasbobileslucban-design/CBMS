// GIS/GPS Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// Disaster Risk Types
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Critical';

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
  type: 'Elderly' | 'PWD' | 'Pregnant' | 'Infant' | 'Chronic Illness' | 'Solo Parent';
  specialNeeds?: string;
}

export interface EvacuationReadiness {
  hasEmergencyKit: boolean;
  knowsEvacuationRoute: boolean;
  hasEvacuationPlan: boolean;
  registeredWithBarangay: boolean;
  hasEmergencyContact: boolean;
  nearestEvacuationCenter?: string;
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
  barangay: string;
  householdNumber: string;
  headOfFamily: string;
  totalMembers: number;
  monthlyIncome: number;
  employmentStatus: string;
  housingType: string;
  accessToWater: boolean;
  accessToElectricity: boolean;
  accessToInternet: boolean;
  healthInsurance: boolean;
  educationLevel: string;
  disasterVulnerability: 'Low' | 'Medium' | 'High';
  povertyLevel: 'Non-Poor' | 'Poor' | 'Subsistence Poor';
  dateCollected: string;
  // New fields for enhanced features
  location?: GeoLocation;
  disasterRisk?: DisasterRiskProfile; // Wait, let's keep existing fields
  disasterRiskProfile?: DisasterRiskProfile;
  vulnerableMembers?: VulnerableMember[];
  evacuationReadiness?: EvacuationReadiness;
  programEnrollments?: string[]; // Array of program IDs
  headsOfFamily?: HeadOfFamily[];
  familyMembers?: FamilyMember[];
}

// Offline Sync Types
export interface PendingSyncItem {
  id: string;
  type: 'household' | 'enrollment' | 'update';
  data: Household | BeneficiaryEnrollment;
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
