import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { SocialProgram } from '../../types/cbms';
import {
  Search,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function ProgramManagement() {
  const { socialPrograms, enrollments, households } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // Get unique agencies
  const agencies = useMemo(() => {
    const agencySet = new Set(socialPrograms.map(p => p.agency));
    return Array.from(agencySet).sort();
  }, [socialPrograms]);

  // Calculate program stats
  const programStats = useMemo(() => {
    const stats: Record<string, { enrolled: number; active: number; pending: number; graduated: number }> = {};

    socialPrograms.forEach(program => {
      const programEnrollments = enrollments.filter(e => e.programId === program.id);
      stats[program.id] = {
        enrolled: programEnrollments.length,
        active: programEnrollments.filter(e => e.status === 'Active').length,
        pending: programEnrollments.filter(e => e.status === 'Pending').length,
        graduated: programEnrollments.filter(e => e.status === 'Graduated').length,
      };
    });

    return stats;
  }, [socialPrograms, enrollments]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return socialPrograms.filter(program => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!program.name.toLowerCase().includes(search) &&
            !program.agency.toLowerCase().includes(search) &&
            !program.description.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Agency filter
      if (filterAgency !== 'all' && program.agency !== filterAgency) return false;

      // Status filter
      if (filterStatus === 'active' && !program.isActive) return false;
      if (filterStatus === 'inactive' && program.isActive) return false;

      return true;
    });
  }, [socialPrograms, searchTerm, filterAgency, filterStatus]);

  // Calculate eligible households for a program
  const getEligibleCount = (program: SocialProgram) => {
    return households.filter(h => {
      const criteria = program.eligibilityCriteria;

      // Poverty level check
      if (criteria.povertyLevel && !criteria.povertyLevel.includes(h.povertyLevel)) {
        return false;
      }

      // Income threshold check
      if (criteria.maxIncome && h.monthlyIncome > criteria.maxIncome) {
        return false;
      }

      // Vulnerability check
      if (criteria.vulnerabilityTypes && criteria.vulnerabilityTypes.length > 0) {
        const hasVulnerable = h.vulnerableMembers?.some(m =>
          criteria.vulnerabilityTypes!.includes(m.type)
        );
        if (!hasVulnerable) return false;
      }

      return true;
    }).length;
  };

  // Summary stats
  const summaryStats = {
    totalPrograms: socialPrograms.length,
    activePrograms: socialPrograms.filter(p => p.isActive).length,
    totalEnrollments: enrollments.length,
    uniqueBeneficiaries: new Set(enrollments.map(e => e.householdId)).size,
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Programs</p>
          <p className="text-xl md:text-2xl font-bold text-[#0a1c33] mt-1">{summaryStats.totalPrograms}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-green-600 uppercase tracking-wider">Active</p>
          <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">{summaryStats.activePrograms}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-blue-600 uppercase tracking-wider">Enrolled</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">{summaryStats.totalEnrollments}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-purple-600 uppercase tracking-wider">Beneficiaries</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{summaryStats.uniqueBeneficiaries}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="flex-1 min-w-[120px] px-2 md:px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          >
            <option value="all">All Agencies</option>
            {agencies.map(agency => (
              <option key={agency} value={agency}>{agency}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 min-w-[100px] px-2 md:px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-3">
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No programs found matching your criteria.
          </div>
        ) : (
          filteredPrograms.map(program => {
            const stats = programStats[program.id];
            const eligibleCount = getEligibleCount(program);
            const isExpanded = expandedProgram === program.id;

            return (
              <div
                key={program.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Program Header */}
                <div
                  className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedProgram(isExpanded ? null : program.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 md:gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        program.isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Building2 className={`w-4 h-4 md:w-5 md:h-5 ${
                          program.isActive ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">{program.name}</h3>
                          {program.isActive ? (
                            <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] md:text-xs font-medium flex-shrink-0">
                              <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] md:text-xs font-medium flex-shrink-0">
                              <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 truncate">{program.agency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-base md:text-lg font-bold text-[#143a63]">{stats.active}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Active</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                    <span className="text-gray-500">
                      <span className="font-medium text-gray-700">{stats.enrolled}</span> enrolled
                    </span>
                    <span className="text-gray-500">
                      <span className="font-medium text-yellow-600">{stats.pending}</span> pending
                    </span>
                    <span className="text-gray-500">
                      <span className="font-medium text-purple-600">{stats.graduated}</span> grad
                    </span>
                    <span className="text-gray-500">
                      <span className="font-medium text-blue-600">{eligibleCount}</span> eligible
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{program.description}</p>

                        <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Benefits</h4>
                        <p className="text-sm text-gray-600">{program.benefitsDescription}</p>
                      </div>

                      {/* Eligibility Criteria */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Eligibility Criteria</h4>
                        <div className="space-y-2">
                          {program.eligibilityCriteria.povertyLevel && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-gray-500 w-24">Poverty Level:</span>
                              <div className="flex flex-wrap gap-1">
                                {program.eligibilityCriteria.povertyLevel.map(level => (
                                  <span key={level} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                    {level}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {program.eligibilityCriteria.maxIncome && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 w-24">Max Income:</span>
                              <span className="text-sm text-gray-700">
                                ₱{program.eligibilityCriteria.maxIncome.toLocaleString()}/month
                              </span>
                            </div>
                          )}

                          {program.eligibilityCriteria.vulnerabilityTypes && program.eligibilityCriteria.vulnerabilityTypes.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-gray-500 w-24">Vulnerability:</span>
                              <div className="flex flex-wrap gap-1">
                                {program.eligibilityCriteria.vulnerabilityTypes.map(type => (
                                  <span key={type} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {program.eligibilityCriteria.disasterRisk && program.eligibilityCriteria.disasterRisk.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-gray-500 w-24">Disaster Risk:</span>
                              <div className="flex flex-wrap gap-1">
                                {program.eligibilityCriteria.disasterRisk.map(risk => (
                                  <span key={risk} className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                    {risk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enrollment Progress */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Enrollment Progress</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${eligibleCount > 0 ? (stats.active / eligibleCount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[80px] text-right">
                          {stats.active} / {eligibleCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {eligibleCount > 0
                          ? `${Math.round((stats.active / eligibleCount) * 100)}% of eligible households enrolled`
                          : 'No eligible households'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredPrograms.length} of {socialPrograms.length} programs
      </p>
    </div>
  );
}
