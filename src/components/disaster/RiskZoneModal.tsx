import { useState, useEffect } from 'react';
import { X, AlertTriangle, Droplets, Mountain, Flame, Zap } from 'lucide-react';
import { RiskZone, RiskLevel } from '../../types/drhmms';

interface RiskZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zone: RiskZone) => void;
  zone?: RiskZone | null;
  barangayOptions: string[];
}

const riskTypes = [
  { value: 'flood', label: 'Flood', icon: Droplets, color: 'text-blue-600' },
  { value: 'landslide', label: 'Landslide', icon: Mountain, color: 'text-orange-600' },
  { value: 'fire', label: 'Fire', icon: Flame, color: 'text-red-600' },
  { value: 'earthquake', label: 'Earthquake', icon: Zap, color: 'text-purple-600' },
] as const;

const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High', 'Very High'];

export function RiskZoneModal({ isOpen, onClose, onSave, zone, barangayOptions }: RiskZoneModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'flood' as RiskZone['type'],
    riskLevel: 'Medium' as RiskLevel,
    barangays: [] as string[],
    description: '',
    affectedHouseholds: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        type: zone.type,
        riskLevel: zone.riskLevel,
        barangays: zone.barangays,
        description: zone.description,
        affectedHouseholds: zone.affectedHouseholds,
      });
    } else {
      setFormData({
        name: '',
        type: 'flood',
        riskLevel: 'Medium',
        barangays: [],
        description: '',
        affectedHouseholds: 0,
      });
    }
    setErrors({});
  }, [zone, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Zone name is required';
    if (formData.barangays.length === 0) newErrors.barangays = 'Select at least one barangay';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.affectedHouseholds < 0) newErrors.affectedHouseholds = 'Must be 0 or greater';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newZone: RiskZone = {
      id: zone?.id || `rz-${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      riskLevel: formData.riskLevel,
      barangays: formData.barangays,
      description: formData.description.trim(),
      affectedHouseholds: formData.affectedHouseholds,
    };

    onSave(newZone);
    onClose();
  };

  const toggleBarangay = (barangay: string) => {
    setFormData(prev => ({
      ...prev,
      barangays: prev.barangays.includes(barangay)
        ? prev.barangays.filter(b => b !== barangay)
        : [...prev.barangays, barangay],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                {zone ? 'Edit Risk Zone' : 'Add Risk Zone'}
              </h2>
              <p className="text-sm text-gray-500">
                {zone ? 'Update risk zone details' : 'Define a new disaster risk area'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
          {/* Zone Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Talavera River Flood Plain"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143a63] ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Risk Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {riskTypes.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    formData.type === value
                      ? 'border-[#143a63] bg-[#143a63]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {riskLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, riskLevel: level }))}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.riskLevel === level
                      ? level === 'Very High' ? 'border-red-600 bg-red-600 text-white' :
                        level === 'High' ? 'border-red-500 bg-red-100 text-red-700' :
                        level === 'Medium' ? 'border-yellow-500 bg-yellow-100 text-yellow-700' :
                        'border-green-500 bg-green-100 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Affected Barangays */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Affected Barangays <span className="text-red-500">*</span>
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
              <div className="flex flex-wrap gap-2">
                {barangayOptions.map(barangay => (
                  <button
                    key={barangay}
                    type="button"
                    onClick={() => toggleBarangay(barangay)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.barangays.includes(barangay)
                        ? 'bg-[#143a63] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {barangay}
                  </button>
                ))}
              </div>
            </div>
            {errors.barangays && <p className="text-red-500 text-xs mt-1">{errors.barangays}</p>}
            {formData.barangays.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.barangays.length} barangay(s) selected
              </p>
            )}
          </div>

          {/* Affected Households */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Affected Households
            </label>
            <input
              type="number"
              min="0"
              value={formData.affectedHouseholds}
              onChange={(e) => setFormData(prev => ({ ...prev, affectedHouseholds: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143a63] ${
                errors.affectedHouseholds ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.affectedHouseholds && <p className="text-red-500 text-xs mt-1">{errors.affectedHouseholds}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the risk zone, hazards, and any relevant details..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143a63] resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#143a63] hover:bg-[#0a1c33] rounded-lg transition-colors"
            >
              {zone ? 'Save Changes' : 'Add Risk Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
