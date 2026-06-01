import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Household,
  RiskZone,
  EvacuationCenter,
  SocialProgram,
  BeneficiaryEnrollment,
  PendingSyncItem,
  SyncStatus as SyncStatusType
} from '../types/cbms';
import { User } from '../types/auth';
import { mockHouseholds as initialHouseholds } from '../data/mockData';
import { mockUsers as initialUsers } from '../data/mockUsers';
import {
  mockRiskZones,
  mockEvacuationCenters,
  mockSocialPrograms
} from '../data/mockDisasterData';

// Offline storage keys
const STORAGE_KEYS = {
  HOUSEHOLDS: 'cbms_households',
  ENROLLMENTS: 'cbms_enrollments',
  PENDING_SYNC: 'cbms_pending_sync',
  RISK_ZONES: 'cbms_risk_zones',
};

interface DataContextType {
  // Household data
  households: Household[];
  addHousehold: (household: Household) => void;
  updateHousehold: (id: string, household: Household) => void;
  deleteHousehold: (id: string) => void;

  // User data
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: User) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;

  // Disaster risk data
  riskZones: RiskZone[];
  addRiskZone: (zone: RiskZone) => void;
  updateRiskZone: (id: string, zone: RiskZone) => void;
  deleteRiskZone: (id: string) => void;
  evacuationCenters: EvacuationCenter[];
  updateEvacuationCenter: (id: string, center: EvacuationCenter) => void;

  // Beneficiary data
  socialPrograms: SocialProgram[];
  enrollments: BeneficiaryEnrollment[];
  addEnrollment: (enrollment: BeneficiaryEnrollment) => void;
  updateEnrollment: (id: string, enrollment: BeneficiaryEnrollment) => void;
  deleteEnrollment: (id: string) => void;
  getEnrollmentsByHousehold: (householdId: string) => BeneficiaryEnrollment[];
  getEnrollmentsByProgram: (programId: string) => BeneficiaryEnrollment[];

  // Offline sync
  syncStatus: SyncStatusType;
  pendingSyncItems: PendingSyncItem[];
  syncData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to load from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to save to localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or use defaults
  const [households, setHouseholds] = useState<Household[]>(() =>
    loadFromStorage(STORAGE_KEYS.HOUSEHOLDS, initialHouseholds)
  );
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Disaster risk data
  const [riskZones, setRiskZones] = useState<RiskZone[]>(() =>
    loadFromStorage(STORAGE_KEYS.RISK_ZONES, mockRiskZones)
  );
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>(mockEvacuationCenters);

  // Beneficiary data
  const [socialPrograms] = useState<SocialProgram[]>(mockSocialPrograms);
  const [enrollments, setEnrollments] = useState<BeneficiaryEnrollment[]>(() =>
    loadFromStorage(STORAGE_KEYS.ENROLLMENTS, [])
  );

  // Offline sync state
  const [pendingSyncItems, setPendingSyncItems] = useState<PendingSyncItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENDING_SYNC, [])
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist households to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HOUSEHOLDS, households);
  }, [households]);

  // Persist enrollments to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);
  }, [enrollments]);

  // Persist risk zones to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RISK_ZONES, riskZones);
  }, [riskZones]);

  // Persist pending sync items
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PENDING_SYNC, pendingSyncItems);
  }, [pendingSyncItems]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingSyncItems.length > 0) {
      syncData();
    }
  }, [isOnline]);

  // Household operations
  const addHousehold = (household: Household) => {
    setHouseholds(prev => [household, ...prev]);

    if (!isOnline) {
      addPendingSync({
        id: `sync-${Date.now()}`,
        type: 'household',
        data: household,
        timestamp: new Date().toISOString(),
        attempts: 0,
      });
    }
  };

  const updateHousehold = (id: string, household: Household) => {
    setHouseholds(prev => prev.map(h => h.id === id ? household : h));

    if (!isOnline) {
      addPendingSync({
        id: `sync-${Date.now()}`,
        type: 'update',
        data: household,
        timestamp: new Date().toISOString(),
        attempts: 0,
      });
    }
  };

  const deleteHousehold = (id: string) => {
    setHouseholds(prev => prev.filter(h => h.id !== id));
  };

  // User operations
  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev]);
  };

  const updateUser = (id: string, user: User) => {
    setUsers(prev => prev.map(u => u.id === id ? user : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
  };

  // Risk zone operations
  const addRiskZone = (zone: RiskZone) => {
    setRiskZones(prev => [zone, ...prev]);
  };

  const updateRiskZone = (id: string, zone: RiskZone) => {
    setRiskZones(prev => prev.map(z => z.id === id ? zone : z));
  };

  const deleteRiskZone = (id: string) => {
    setRiskZones(prev => prev.filter(z => z.id !== id));
  };

  // Evacuation center operations
  const updateEvacuationCenter = (id: string, center: EvacuationCenter) => {
    setEvacuationCenters(prev => prev.map(ec => ec.id === id ? center : ec));
  };

  // Enrollment operations
  const addEnrollment = (enrollment: BeneficiaryEnrollment) => {
    setEnrollments(prev => [enrollment, ...prev]);

    if (!isOnline) {
      addPendingSync({
        id: `sync-${Date.now()}`,
        type: 'enrollment',
        data: enrollment,
        timestamp: new Date().toISOString(),
        attempts: 0,
      });
    }
  };

  const updateEnrollment = (id: string, enrollment: BeneficiaryEnrollment) => {
    setEnrollments(prev => prev.map(e => e.id === id ? enrollment : e));
  };

  const deleteEnrollment = (id: string) => {
    setEnrollments(prev => prev.filter(e => e.id !== id));
  };

  const getEnrollmentsByHousehold = (householdId: string) => {
    return enrollments.filter(e => e.householdId === householdId);
  };

  const getEnrollmentsByProgram = (programId: string) => {
    return enrollments.filter(e => e.programId === programId);
  };

  // Sync operations
  const addPendingSync = (item: PendingSyncItem) => {
    setPendingSyncItems(prev => [...prev, item]);
  };

  const syncData = async () => {
    if (!isOnline || pendingSyncItems.length === 0) return;

    setIsSyncing(true);

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would send data to the server
    // For now, just clear the pending items
    setPendingSyncItems([]);
    setLastSyncTime(new Date().toISOString());
    setIsSyncing(false);
  };

  const syncStatus: SyncStatusType = {
    isOnline,
    lastSyncTime,
    pendingItems: pendingSyncItems.length,
    isSyncing,
  };

  return (
    <DataContext.Provider
      value={{
        households,
        addHousehold,
        updateHousehold,
        deleteHousehold,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        riskZones,
        addRiskZone,
        updateRiskZone,
        deleteRiskZone,
        evacuationCenters,
        updateEvacuationCenter,
        socialPrograms,
        enrollments,
        addEnrollment,
        updateEnrollment,
        deleteEnrollment,
        getEnrollmentsByHousehold,
        getEnrollmentsByProgram,
        syncStatus,
        pendingSyncItems,
        syncData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
