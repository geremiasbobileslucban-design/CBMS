import { Household } from '../../types/drhmms';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BeneficiaryTableProps {
  households: Household[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  showSelection?: boolean;
  showEnrollment?: boolean;
  enrolledPrograms?: Record<string, string[]>;
}

export function BeneficiaryTable({
  households,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  showSelection = false,
  showEnrollment = false,
  enrolledPrograms = {},
}: BeneficiaryTableProps) {
  const allSelected = households.length > 0 && households.every(h => selectedIds.has(h.id));
  const someSelected = households.some(h => selectedIds.has(h.id));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#0a1c33]">
              {showSelection && (
                <th className="w-10 py-3 px-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                  />
                </th>
              )}
              <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Household</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Barangay</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Members</th>
              <th className="text-right py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Income</th>
              <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Risk</th>
              {showEnrollment && (
                <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Programs</th>
              )}
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ? (
              <tr>
                <td colSpan={showSelection ? 8 : 7} className="py-8 text-center text-gray-500">
                  No households found matching your criteria.
                </td>
              </tr>
            ) : (
              households.map((household) => {
                const programs = enrolledPrograms[household.id] || [];

                return (
                  <tr
                    key={household.id}
                    className={`border-b border-gray-100 hover:bg-[#fbf5e1] transition-colors ${
                      selectedIds.has(household.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {showSelection && (
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(household.id)}
                          onChange={(e) => onSelect?.(household.id, e.target.checked)}
                          className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                        />
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{household.headOfFamily}</p>
                        <p className="text-xs text-gray-500">{household.householdNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700">{household.barangay}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        household.povertyLevel === 'Non-Poor'
                          ? 'bg-green-100 text-green-700'
                          : household.povertyLevel === 'Poor'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {household.povertyLevel === 'Non-Poor' && <CheckCircle className="w-3 h-3" />}
                        {household.povertyLevel === 'Poor' && <AlertCircle className="w-3 h-3" />}
                        {household.povertyLevel === 'Subsistence Poor' && <XCircle className="w-3 h-3" />}
                        {household.povertyLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-gray-700">
                      {household.totalMembers}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-gray-700" style={{ fontFamily: 'JetBrains Mono' }}>
                      ₱{household.monthlyIncome.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        household.disasterVulnerability === 'High'
                          ? 'bg-red-100 text-red-700'
                          : household.disasterVulnerability === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {household.disasterVulnerability}
                      </span>
                    </td>
                    {showEnrollment && (
                      <td className="py-3 px-3">
                        {programs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {programs.slice(0, 2).map((prog, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {prog}
                              </span>
                            ))}
                            {programs.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                +{programs.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
