import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { EvacuationCenter } from '../../types/cbms';
import {
  Building2,
  Users,
  Phone,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  Droplets,
  Zap,
  Stethoscope,
  Car,
  Edit2,
  X,
  Save
} from 'lucide-react';

export function EvacuationCenterList() {
  const { evacuationCenters, updateEvacuationCenter } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingCenter, setEditingCenter] = useState<EvacuationCenter | null>(null);

  const filteredCenters = evacuationCenters.filter(center => {
    const matchesSearch = searchTerm === '' ||
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.barangay.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || center.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalCapacity = evacuationCenters.reduce((sum, ec) => sum + ec.capacity, 0);
  const totalOccupancy = evacuationCenters.reduce((sum, ec) => sum + ec.currentOccupancy, 0);
  const activeCenters = evacuationCenters.filter(ec => ec.isActive).length;

  const getFacilityIcon = (facility: string) => {
    if (facility.toLowerCase().includes('restroom')) return <Droplets className="w-3 h-3" />;
    if (facility.toLowerCase().includes('power') || facility.toLowerCase().includes('generator')) return <Zap className="w-3 h-3" />;
    if (facility.toLowerCase().includes('medical')) return <Stethoscope className="w-3 h-3" />;
    if (facility.toLowerCase().includes('parking')) return <Car className="w-3 h-3" />;
    return <CheckCircle className="w-3 h-3" />;
  };

  const getOccupancyColor = (center: EvacuationCenter) => {
    const rate = center.currentOccupancy / center.capacity;
    if (rate >= 0.9) return 'bg-red-100 text-red-700';
    if (rate >= 0.7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const handleSaveEdit = () => {
    if (editingCenter) {
      updateEvacuationCenter(editingCenter.id, editingCenter);
      setEditingCenter(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Total Centers</p>
          <p className="text-2xl font-bold text-[#0a1c33] mt-1" style={{ fontFamily: 'Source Serif 4' }}>
            {evacuationCenters.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">{activeCenters} active</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Total Capacity</p>
          <p className="text-2xl font-bold text-[#0a1c33] mt-1" style={{ fontFamily: 'Source Serif 4' }}>
            {totalCapacity.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">persons</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Current Occupancy</p>
          <p className="text-2xl font-bold text-[#0a1c33] mt-1" style={{ fontFamily: 'Source Serif 4' }}>
            {totalOccupancy.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{((totalOccupancy / totalCapacity) * 100).toFixed(1)}% utilized</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Available Space</p>
          <p className="text-2xl font-bold text-green-600 mt-1" style={{ fontFamily: 'Source Serif 4' }}>
            {(totalCapacity - totalOccupancy).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">persons</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
        >
          <option value="all">All Types</option>
          <option value="School">School</option>
          <option value="Gymnasium">Gymnasium</option>
          <option value="Community Center">Community Center</option>
          <option value="Church">Church</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCenters.map(center => (
          <div
            key={center.id}
            className={`bg-white rounded-lg border ${center.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'} overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${center.isActive ? 'bg-[#143a63] text-white' : 'bg-gray-300 text-gray-500'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">{center.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {center.barangay}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {center.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                  <button
                    onClick={() => setEditingCenter(center)}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Capacity</span>
                  <span className={`font-medium px-2 py-0.5 rounded ${getOccupancyColor(center)}`}>
                    {center.currentOccupancy} / {center.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      center.currentOccupancy / center.capacity >= 0.9 ? 'bg-red-500' :
                      center.currentOccupancy / center.capacity >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((center.currentOccupancy / center.capacity) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {center.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {center.contactNumber}
                    </span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {center.facilities.map((facility, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs"
                    >
                      {getFacilityIcon(facility)}
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No evacuation centers found matching your criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Edit Evacuation Center</h3>
              <button onClick={() => setEditingCenter(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Name</label>
                <input
                  type="text"
                  value={editingCenter.name}
                  onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editingCenter.capacity}
                    onChange={(e) => setEditingCenter({ ...editingCenter, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Current Occupancy</label>
                  <input
                    type="number"
                    value={editingCenter.currentOccupancy}
                    onChange={(e) => setEditingCenter({ ...editingCenter, currentOccupancy: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editingCenter.contactPerson}
                  onChange={(e) => setEditingCenter({ ...editingCenter, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editingCenter.contactNumber}
                  onChange={(e) => setEditingCenter({ ...editingCenter, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingCenter.isActive}
                  onChange={(e) => setEditingCenter({ ...editingCenter, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#143a63] focus:ring-[#143a63]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active (available for evacuation)</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
              <button
                onClick={() => setEditingCenter(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white text-sm rounded-lg hover:bg-[#0a1c33] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
