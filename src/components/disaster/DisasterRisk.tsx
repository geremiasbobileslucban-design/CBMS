import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DisasterRiskMap } from './DisasterRiskMap';
import { RiskZoneModal } from './RiskZoneModal';
import { VulnerableMembersList } from './VulnerableMembersList';
import { EvacuationCenterList } from './EvacuationCenterList';
import { RiskZone } from '../../types/drhmms';
import {
  AlertTriangle,
  Map,
  Users,
  Building2,
  Droplets,
  Mountain,
  Flame,
  BarChart3,
  Download,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type TabId = 'overview' | 'map' | 'vulnerable' | 'evacuation';

export function DisasterRisk() {
  const { riskZones, addRiskZone, updateRiskZone, deleteRiskZone, evacuationCenters, households } = useData();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedRiskType, setSelectedRiskType] = useState<'all' | 'flood' | 'landslide' | 'fire' | 'earthquake'>('all');
  const [showEvacCenters, setShowEvacCenters] = useState(true);
  const [showHouseholds, setShowHouseholds] = useState(false);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<RiskZone | null>(null);

  // Get unique barangays from households
  const barangayOptions = [...new Set(households.map(h => h.barangay))].sort();

  const handleSaveZone = (zone: RiskZone) => {
    if (editingZone) {
      updateRiskZone(zone.id, zone);
    } else {
      addRiskZone(zone);
    }
    setEditingZone(null);
  };

  const handleEditZone = (zone: RiskZone) => {
    setEditingZone(zone);
    setIsModalOpen(true);
  };

  const handleDeleteZone = (zone: RiskZone) => {
    if (confirm(`Are you sure you want to delete "${zone.name}"?`)) {
      deleteRiskZone(zone.id);
    }
  };

  const handleAddNew = () => {
    setEditingZone(null);
    setIsModalOpen(true);
  };

  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', shortLabel: 'Overview', icon: BarChart3 },
    { id: 'map' as TabId, label: 'Risk Map', shortLabel: 'Map', icon: Map },
    { id: 'vulnerable' as TabId, label: 'Vulnerable Registry', shortLabel: 'Vulnerable', icon: Users },
    { id: 'evacuation' as TabId, label: 'Evacuation Centers', shortLabel: 'Evacuation', icon: Building2 },
  ];

  // Calculate statistics
  const riskStats = {
    totalAffectedHouseholds: riskZones.reduce((sum, z) => sum + z.affectedHouseholds, 0),
    floodAffected: riskZones.filter(z => z.type === 'flood').reduce((sum, z) => sum + z.affectedHouseholds, 0),
    landslideAffected: riskZones.filter(z => z.type === 'landslide').reduce((sum, z) => sum + z.affectedHouseholds, 0),
    fireAffected: riskZones.filter(z => z.type === 'fire').reduce((sum, z) => sum + z.affectedHouseholds, 0),
    highRiskZones: riskZones.filter(z => z.riskLevel === 'High' || z.riskLevel === 'Very High').length,
    totalEvacCapacity: evacuationCenters.reduce((sum, ec) => sum + ec.capacity, 0),
    highVulnHouseholds: households.filter(h => h.disasterVulnerability === 'High').length,
  };

  const riskByTypeData = [
    { name: 'Flood', value: riskStats.floodAffected, color: '#3b82f6' },
    { name: 'Landslide', value: riskStats.landslideAffected, color: '#ea580c' },
    { name: 'Fire', value: riskStats.fireAffected, color: '#dc2626' },
  ];

  const vulnerabilityData = [
    { level: 'High', count: households.filter(h => h.disasterVulnerability === 'High').length },
    { level: 'Medium', count: households.filter(h => h.disasterVulnerability === 'Medium').length },
    { level: 'Low', count: households.filter(h => h.disasterVulnerability === 'Low').length },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 md:mb-2">Disaster Risk Management</p>
          <h2 className="text-lg md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
            Climate & Disaster Risk Monitoring
          </h2>
          <p className="text-xs md:text-sm text-[#143a63]/60 mt-1">
            Monitor risks, vulnerable populations, and evacuation readiness
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm font-medium self-start"
        >
          <Plus className="w-4 h-4" />
          Add Risk Zone
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4 md:mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#143a63] text-[#143a63]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Alert Banner */}
          {riskStats.highRiskZones > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  {riskStats.highRiskZones} High/Very High Risk Zones Identified
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {riskStats.totalAffectedHouseholds.toLocaleString()} households are located in disaster-prone areas.
                  Prioritize these areas for disaster preparedness programs.
                </p>
              </div>
            </div>
          )}

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                    {riskStats.floodAffected.toLocaleString()}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">Flood HH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Mountain className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                    {riskStats.landslideAffected.toLocaleString()}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">Landslide HH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                    {riskStats.fireAffected.toLocaleString()}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">Fire HH</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                    {riskStats.totalEvacCapacity.toLocaleString()}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">Evac Cap.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Risk by Type Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <p className="eyebrow mb-0.5 md:mb-1">Risk Distribution</p>
              <h3 className="text-base md:text-lg font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Affected HH by Risk Type
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={riskByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {riskByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Vulnerability Bar Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
              <p className="eyebrow mb-0.5 md:mb-1">Household Assessment</p>
              <h3 className="text-base md:text-lg font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Vulnerability Levels
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={vulnerabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="level" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {vulnerabilityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.level === 'High' ? '#dc2626' :
                          entry.level === 'Medium' ? '#f59e0b' : '#22c55e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Zones Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
              <div>
                <p className="eyebrow mb-0.5 md:mb-1">Identified Risk Zones</p>
                <h3 className="text-base md:text-lg font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                  Priority Areas
                </h3>
              </div>
              <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-[#143a63] hover:bg-gray-100 rounded-lg transition-colors self-start">
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#0a1c33]">
                    <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Zone</th>
                    <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Risk Level</th>
                    <th className="text-right py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Affected HH</th>
                    <th className="text-left py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider hidden md:table-cell">Description</th>
                    <th className="text-center py-3 px-3 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riskZones.map(zone => (
                    <tr key={zone.id} className="border-b border-gray-100 hover:bg-[#fbf5e1] transition-colors">
                      <td className="py-3 px-3 font-medium text-sm text-gray-900">{zone.name}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          zone.type === 'flood' ? 'bg-blue-100 text-blue-700' :
                          zone.type === 'landslide' ? 'bg-orange-100 text-orange-700' :
                          zone.type === 'fire' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {zone.type === 'flood' && <Droplets className="w-3 h-3" />}
                          {zone.type === 'landslide' && <Mountain className="w-3 h-3" />}
                          {zone.type === 'fire' && <Flame className="w-3 h-3" />}
                          {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          zone.riskLevel === 'Very High' ? 'bg-red-600 text-white' :
                          zone.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          zone.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {zone.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-sm font-medium text-gray-900">
                        {zone.affectedHouseholds.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600 max-w-xs truncate hidden md:table-cell">
                        {zone.description}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditZone(zone)}
                            className="p-1.5 text-gray-500 hover:text-[#143a63] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(zone)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Risk Map Tab */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Map Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Risk Type</label>
                <select
                  value={selectedRiskType}
                  onChange={(e) => setSelectedRiskType(e.target.value as typeof selectedRiskType)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                >
                  <option value="all">All Types</option>
                  <option value="flood">Flood Zones</option>
                  <option value="landslide">Landslide Zones</option>
                  <option value="fire">Fire Risk Areas</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEvacCenters}
                    onChange={(e) => setShowEvacCenters(e.target.checked)}
                    className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                  />
                  Show Evacuation Centers
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHouseholds}
                    onChange={(e) => setShowHouseholds(e.target.checked)}
                    className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                  />
                  Show Households
                </label>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <DisasterRiskMap
              selectedRiskType={selectedRiskType}
              showEvacuationCenters={showEvacCenters}
              showHouseholds={showHouseholds}
              onZoneSelect={setSelectedZone}
            />
          </div>

          {/* Selected Zone Info */}
          {selectedZone && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900">{selectedZone.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedZone.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm">
                  <strong>{selectedZone.affectedHouseholds.toLocaleString()}</strong> affected households
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedZone.riskLevel === 'Very High' || selectedZone.riskLevel === 'High'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedZone.riskLevel} Risk
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vulnerable Registry Tab */}
      {activeTab === 'vulnerable' && (
        <VulnerableMembersList />
      )}

      {/* Evacuation Centers Tab */}
      {activeTab === 'evacuation' && (
        <EvacuationCenterList />
      )}

      {/* Risk Zone Modal */}
      <RiskZoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSaveZone}
        zone={editingZone}
        barangayOptions={barangayOptions}
      />
    </div>
  );
}
