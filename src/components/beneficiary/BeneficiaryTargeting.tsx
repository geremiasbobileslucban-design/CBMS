import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { BeneficiaryTable } from './BeneficiaryTable';
import { Household, SocialProgram } from '../../types/cbms';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Users,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

interface TargetingFilters {
  povertyLevel: string[];
  disasterVulnerability: string[];
  hasWater: string;
  hasElectricity: string;
  hasInsurance: string;
  barangay: string;
  maxIncome: number | null;
}

export function BeneficiaryTargeting() {
  const { households, socialPrograms, addEnrollment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<SocialProgram | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const [filters, setFilters] = useState<TargetingFilters>({
    povertyLevel: [],
    disasterVulnerability: [],
    hasWater: 'all',
    hasElectricity: 'all',
    hasInsurance: 'all',
    barangay: 'all',
    maxIncome: null,
  });

  // Get unique barangays
  const barangays = useMemo(() => {
    const unique = new Set(households.map(h => h.barangay));
    return Array.from(unique).sort();
  }, [households]);

  // Filter households
  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!h.headOfFamily.toLowerCase().includes(search) &&
            !h.barangay.toLowerCase().includes(search) &&
            !h.householdNumber.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Poverty level filter
      if (filters.povertyLevel.length > 0 && !filters.povertyLevel.includes(h.povertyLevel)) {
        return false;
      }

      // Disaster vulnerability filter
      if (filters.disasterVulnerability.length > 0 && !filters.disasterVulnerability.includes(h.disasterVulnerability)) {
        return false;
      }

      // Water access filter
      if (filters.hasWater === 'yes' && !h.accessToWater) return false;
      if (filters.hasWater === 'no' && h.accessToWater) return false;

      // Electricity access filter
      if (filters.hasElectricity === 'yes' && !h.accessToElectricity) return false;
      if (filters.hasElectricity === 'no' && h.accessToElectricity) return false;

      // Insurance filter
      if (filters.hasInsurance === 'yes' && !h.healthInsurance) return false;
      if (filters.hasInsurance === 'no' && h.healthInsurance) return false;

      // Barangay filter
      if (filters.barangay !== 'all' && h.barangay !== filters.barangay) return false;

      // Income filter
      if (filters.maxIncome !== null && h.monthlyIncome > filters.maxIncome) return false;

      return true;
    });
  }, [households, searchTerm, filters]);

  // Apply program criteria
  const applyProgramCriteria = (program: SocialProgram) => {
    setSelectedProgram(program);
    const criteria = program.eligibilityCriteria;

    setFilters({
      povertyLevel: criteria.povertyLevel || [],
      disasterVulnerability: criteria.disasterVulnerability || [],
      hasWater: 'all',
      hasElectricity: 'all',
      hasInsurance: 'all',
      barangay: 'all',
      maxIncome: criteria.maxIncome || null,
    });
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(filteredHouseholds.map(h => h.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleEnroll = () => {
    if (!selectedProgram || selectedIds.size === 0) return;

    selectedIds.forEach(householdId => {
      addEnrollment({
        id: `enroll-${Date.now()}-${householdId}`,
        householdId,
        programId: selectedProgram.id,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        lastUpdated: new Date().toISOString(),
      });
    });

    toast.success(`${selectedIds.size} household(s) enrolled in ${selectedProgram.name}`);
    setSelectedIds(new Set());
    setShowEnrollModal(false);
  };

  const exportToCSV = () => {
    const householdsToExport = selectedIds.size > 0
      ? filteredHouseholds.filter(h => selectedIds.has(h.id))
      : filteredHouseholds;

    const headers = ['Household Number', 'Head of Family', 'Barangay', 'Members', 'Income', 'Poverty Level', 'Disaster Risk'];
    const rows = householdsToExport.map(h => [
      h.householdNumber,
      h.headOfFamily,
      h.barangay,
      h.totalMembers.toString(),
      h.monthlyIncome.toString(),
      h.povertyLevel,
      h.disasterVulnerability,
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beneficiary-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${householdsToExport.length} household(s) to CSV`);
  };

  const clearFilters = () => {
    setFilters({
      povertyLevel: [],
      disasterVulnerability: [],
      hasWater: 'all',
      hasElectricity: 'all',
      hasInsurance: 'all',
      barangay: 'all',
      maxIncome: null,
    });
    setSelectedProgram(null);
  };

  const hasActiveFilters = filters.povertyLevel.length > 0 ||
    filters.disasterVulnerability.length > 0 ||
    filters.hasWater !== 'all' ||
    filters.hasElectricity !== 'all' ||
    filters.hasInsurance !== 'all' ||
    filters.barangay !== 'all' ||
    filters.maxIncome !== null;

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Quick Program Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
        <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider mb-2 md:mb-3">Quick Target by Program</p>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {socialPrograms.filter(p => p.isActive).slice(0, 6).map(program => (
            <button
              key={program.id}
              onClick={() => applyProgramCriteria(program)}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium transition-colors ${
                selectedProgram?.id === program.id
                  ? 'bg-[#143a63] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {program.name}
            </button>
          ))}
        </div>
        {selectedProgram && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">{selectedProgram.name}</p>
            <p className="text-xs text-blue-700 mt-1">{selectedProgram.description}</p>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search households..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-[#143a63] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Poverty Level */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Poverty Level
              </label>
              <div className="space-y-1">
                {['Subsistence Poor', 'Poor', 'Non-Poor'].map(level => (
                  <label key={level} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.povertyLevel.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(f => ({ ...f, povertyLevel: [...f.povertyLevel, level] }));
                        } else {
                          setFilters(f => ({ ...f, povertyLevel: f.povertyLevel.filter(l => l !== level) }));
                        }
                      }}
                      className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Disaster Risk */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Disaster Risk
              </label>
              <div className="space-y-1">
                {['High', 'Medium', 'Low'].map(level => (
                  <label key={level} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.disasterVulnerability.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(f => ({ ...f, disasterVulnerability: [...f.disasterVulnerability, level] }));
                        } else {
                          setFilters(f => ({ ...f, disasterVulnerability: f.disasterVulnerability.filter(l => l !== level) }));
                        }
                      }}
                      className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Barangay
              </label>
              <select
                value={filters.barangay}
                onChange={(e) => setFilters(f => ({ ...f, barangay: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
              >
                <option value="all">All</option>
                {barangays.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Max Income */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Max Income
              </label>
              <input
                type="number"
                placeholder="₱"
                value={filters.maxIncome || ''}
                onChange={(e) => setFilters(f => ({ ...f, maxIncome: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
              />
            </div>

            {/* Water Access */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Water Access
              </label>
              <select
                value={filters.hasWater}
                onChange={(e) => setFilters(f => ({ ...f, hasWater: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
              >
                <option value="all">All</option>
                <option value="yes">Has Access</option>
                <option value="no">No Access</option>
              </select>
            </div>

            {/* Insurance */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                Health Insurance
              </label>
              <select
                value={filters.hasInsurance}
                onChange={(e) => setFilters(f => ({ ...f, hasInsurance: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
              >
                <option value="all">All</option>
                <option value="yes">Has Insurance</option>
                <option value="no">No Insurance</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredHouseholds.length}</span> households match
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm text-blue-600">
              <span className="font-semibold">{selectedIds.size}</span> selected
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowEnrollModal(true)}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-[#143a63] text-white text-xs md:text-sm rounded-lg hover:bg-[#0a1c33] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Enroll Selected</span>
              <span className="sm:hidden">Enroll</span>
            </button>
          )}
        </div>
      </div>

      {/* Household Table */}
      <BeneficiaryTable
        households={filteredHouseholds}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        showSelection={true}
      />

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Enroll Beneficiaries</h3>
              <button onClick={() => setShowEnrollModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Enroll <strong>{selectedIds.size}</strong> selected household(s) in a program:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {socialPrograms.filter(p => p.isActive).map(program => (
                  <label
                    key={program.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProgram?.id === program.id
                        ? 'border-[#143a63] bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="program"
                      checked={selectedProgram?.id === program.id}
                      onChange={() => setSelectedProgram(program)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500">{program.agency}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedProgram}
                className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white text-sm rounded-lg hover:bg-[#0a1c33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                Enroll {selectedIds.size} Household(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
