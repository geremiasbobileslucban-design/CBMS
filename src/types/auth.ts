export type UserRole = 
  | 'PSA Administrator'
  | 'LGU CBMS Focal Person'
  | 'Data Processor'
  | 'Enumerator'
  | 'Planning Officer';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  lgu: string;
  province: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export const rolePermissions: Record<UserRole, {
  canCollectData: boolean;
  canProcessData: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canAccessAnalytics: boolean;
  canAccessDisasterRisk: boolean;
  canManageBeneficiaries: boolean;
  canViewBeneficiaries: boolean;
  accessLevel: string;
}> = {
  'PSA Administrator': {
    canCollectData: true,
    canProcessData: true,
    canViewReports: true,
    canManageUsers: true,
    canExportData: true,
    canAccessAnalytics: true,
    canAccessDisasterRisk: true,
    canManageBeneficiaries: true,
    canViewBeneficiaries: true,
    accessLevel: 'National',
  },
  'LGU CBMS Focal Person': {
    canCollectData: true,
    canProcessData: true,
    canViewReports: true,
    canManageUsers: true,
    canExportData: true,
    canAccessAnalytics: true,
    canAccessDisasterRisk: true,
    canManageBeneficiaries: true,
    canViewBeneficiaries: true,
    accessLevel: 'LGU',
  },
  'Data Processor': {
    canCollectData: false,
    canProcessData: true,
    canViewReports: true,
    canManageUsers: false,
    canExportData: true,
    canAccessAnalytics: false,
    canAccessDisasterRisk: true,
    canManageBeneficiaries: false,
    canViewBeneficiaries: true,
    accessLevel: 'LGU',
  },
  'Enumerator': {
    canCollectData: true,
    canProcessData: false,
    canViewReports: false,
    canManageUsers: false,
    canExportData: false,
    canAccessAnalytics: false,
    canAccessDisasterRisk: false,
    canManageBeneficiaries: false,
    canViewBeneficiaries: false,
    accessLevel: 'Barangay',
  },
  'Planning Officer': {
    canCollectData: false,
    canProcessData: false,
    canViewReports: true,
    canManageUsers: false,
    canExportData: true,
    canAccessAnalytics: true,
    canAccessDisasterRisk: true,
    canManageBeneficiaries: true,
    canViewBeneficiaries: true,
    accessLevel: 'LGU',
  },
};
