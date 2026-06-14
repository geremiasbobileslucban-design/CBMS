import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { VulnerableMember } from '../../types/drhmms';
import { sampleVulnerableMembers } from '../../data/mockDisasterData';
import { User, Baby, Heart, Eye, UserCircle, Search, Filter, Download } from 'lucide-react';

interface VulnerableMembersListProps {
  filterType?: VulnerableMember['type'] | 'all';
}

export function VulnerableMembersList({ filterType = 'all' }: VulnerableMembersListProps) {
  const { households } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<VulnerableMember['type'] | 'all'>(filterType);

  // Combine households with vulnerable members data
  const householdsWithVulnerable = households
    .map(h => ({
      ...h,
      vulnerableMembers: sampleVulnerableMembers[h.id] || h.vulnerableMembers || [],
    }))
    .filter(h => h.vulnerableMembers.length > 0);

  // Filter by type and search
  const filteredHouseholds = householdsWithVulnerable.filter(h => {
    const matchesSearch = searchTerm === '' ||
      h.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.vulnerableMembers.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' ||
      h.vulnerableMembers.some(m => m.type === selectedType);

    return matchesSearch && matchesType;
  });

  // Get all vulnerable members for display
  const allVulnerableMembers = filteredHouseholds.flatMap(h =>
    h.vulnerableMembers
      .filter(m => selectedType === 'all' || m.type === selectedType)
      .map(m => ({ ...m, household: h }))
  );

  const getTypeIcon = (type: VulnerableMember['type']) => {
    switch (type) {
      case 'Elderly': return <User className="w-4 h-4" />;
      case 'PWD': return <Eye className="w-4 h-4" />;
      case 'Pregnant': return <Heart className="w-4 h-4" />;
      case 'Infant': return <Baby className="w-4 h-4" />;
      case 'Chronic Illness': return <Heart className="w-4 h-4" />;
      case 'Solo Parent': return <UserCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: VulnerableMember['type']) => {
    switch (type) {
      case 'Elderly': return 'bg-purple-100 text-purple-700';
      case 'PWD': return 'bg-blue-100 text-blue-700';
      case 'Pregnant': return 'bg-pink-100 text-pink-700';
      case 'Infant': return 'bg-green-100 text-green-700';
      case 'Chronic Illness': return 'bg-red-100 text-red-700';
      case 'Solo Parent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Summary stats
  const stats = {
    total: allVulnerableMembers.length,
    elderly: allVulnerableMembers.filter(m => m.type === 'Elderly').length,
    pwd: allVulnerableMembers.filter(m => m.type === 'PWD').length,
    pregnant: allVulnerableMembers.filter(m => m.type === 'Pregnant').length,
    infant: allVulnerableMembers.filter(m => m.type === 'Infant').length,
    chronicIllness: allVulnerableMembers.filter(m => m.type === 'Chronic Illness').length,
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'Age', 'Relationship', 'Special Needs', 'Household Head', 'Barangay'];
    const rows = allVulnerableMembers.map(m => [
      m.name,
      m.type,
      m.age.toString(),
      m.relationship,
      m.specialNeeds || '',
      m.household.headOfFamily,
      m.household.barangay,
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnerable-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-700' },
          { label: 'Elderly', value: stats.elderly, color: 'bg-purple-100 text-purple-700' },
          { label: 'PWD', value: stats.pwd, color: 'bg-blue-100 text-blue-700' },
          { label: 'Pregnant', value: stats.pregnant, color: 'bg-pink-100 text-pink-700' },
          { label: 'Infants', value: stats.infant, color: 'bg-green-100 text-green-700' },
          { label: 'Chronic', value: stats.chronicIllness, color: 'bg-red-100 text-red-700' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-3 text-center`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, household, or barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as VulnerableMember['type'] | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          >
            <option value="all">All Types</option>
            <option value="Elderly">Elderly</option>
            <option value="PWD">PWD</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Infant">Infant</option>
            <option value="Chronic Illness">Chronic Illness</option>
            <option value="Solo Parent">Solo Parent</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 bg-[#143a63] text-white rounded-lg text-sm hover:bg-[#0a1c33] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#0a1c33]">
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Member</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Age</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Household</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Barangay</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Special Needs</th>
              </tr>
            </thead>
            <tbody>
              {allVulnerableMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No vulnerable members found matching your criteria.
                  </td>
                </tr>
              ) : (
                allVulnerableMembers.map((member, index) => (
                  <tr key={`${member.id}-${index}`} className="border-b border-gray-100 hover:bg-[#fbf5e1] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeBadgeColor(member.type)}`}>
                          {getTypeIcon(member.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.relationship}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(member.type)}`}>
                        {getTypeIcon(member.type)}
                        {member.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{member.age} yrs</td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{member.household.headOfFamily}</p>
                      <p className="text-xs text-gray-500">{member.household.householdNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{member.household.barangay}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {member.specialNeeds || <span className="text-gray-400 italic">None noted</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {allVulnerableMembers.length} vulnerable member{allVulnerableMembers.length !== 1 ? 's' : ''} from {filteredHouseholds.length} household{filteredHouseholds.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
