import { useState } from 'react';
import { EvacuationReadiness } from '../../types/cbms';
import { Check, AlertTriangle, Package, Route, FileText, Phone, Building } from 'lucide-react';

interface EvacuationReadinessFormProps {
  initialData?: EvacuationReadiness;
  evacuationCenters: { id: string; name: string; barangay: string }[];
  onChange?: (data: EvacuationReadiness) => void;
  readOnly?: boolean;
}

export function EvacuationReadinessForm({
  initialData,
  evacuationCenters,
  onChange,
  readOnly = false,
}: EvacuationReadinessFormProps) {
  const [readiness, setReadiness] = useState<EvacuationReadiness>(
    initialData || {
      hasEmergencyKit: false,
      knowsEvacuationRoute: false,
      hasEvacuationPlan: false,
      registeredWithBarangay: false,
      hasEmergencyContact: false,
      nearestEvacuationCenter: undefined,
    }
  );

  const handleChange = (field: keyof EvacuationReadiness, value: boolean | string) => {
    const updated = { ...readiness, [field]: value };
    setReadiness(updated);
    onChange?.(updated);
  };

  // Calculate readiness score
  const checklistItems = [
    readiness.hasEmergencyKit,
    readiness.knowsEvacuationRoute,
    readiness.hasEvacuationPlan,
    readiness.registeredWithBarangay,
    readiness.hasEmergencyContact,
    !!readiness.nearestEvacuationCenter,
  ];
  const completedCount = checklistItems.filter(Boolean).length;
  const readinessScore = Math.round((completedCount / checklistItems.length) * 100);

  const getReadinessStatus = () => {
    if (readinessScore >= 80) return { label: 'Ready', color: 'text-green-600 bg-green-100' };
    if (readinessScore >= 50) return { label: 'Partially Ready', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Not Ready', color: 'text-red-600 bg-red-100' };
  };

  const status = getReadinessStatus();

  const ChecklistItem = ({
    icon: Icon,
    label,
    description,
    checked,
    field,
  }: {
    icon: typeof Check;
    label: string;
    description: string;
    checked: boolean;
    field: keyof EvacuationReadiness;
  }) => (
    <label
      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
        checked
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !readOnly && handleChange(field, e.target.checked)}
        disabled={readOnly}
        className="sr-only"
      />
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          checked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
        }`}
      >
        {checked ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${checked ? 'text-green-700' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Evacuation Readiness Score</p>
            <p className="text-3xl font-bold text-[#0a1c33] mt-1" style={{ fontFamily: 'Source Serif 4' }}>
              {readinessScore}%
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              readinessScore >= 80 ? 'bg-green-500' :
              readinessScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${readinessScore}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedCount} of {checklistItems.length} items completed
        </p>
      </div>

      {/* Warning for low readiness */}
      {readinessScore < 50 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Low Evacuation Readiness</p>
            <p className="text-xs text-red-600 mt-1">
              This household needs assistance preparing for emergencies. Consider prioritizing for disaster preparedness program enrollment.
            </p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Preparedness Checklist</h4>

        <ChecklistItem
          icon={Package}
          label="Has Emergency Kit"
          description="Household maintains a go-bag with essentials (water, food, medicines, documents)"
          checked={readiness.hasEmergencyKit}
          field="hasEmergencyKit"
        />

        <ChecklistItem
          icon={Route}
          label="Knows Evacuation Route"
          description="Family members know the safest route to the nearest evacuation center"
          checked={readiness.knowsEvacuationRoute}
          field="knowsEvacuationRoute"
        />

        <ChecklistItem
          icon={FileText}
          label="Has Family Evacuation Plan"
          description="Written plan including meeting points and responsibilities"
          checked={readiness.hasEvacuationPlan}
          field="hasEvacuationPlan"
        />

        <ChecklistItem
          icon={Building}
          label="Registered with Barangay DRRM"
          description="Household is registered in the barangay disaster risk registry"
          checked={readiness.registeredWithBarangay}
          field="registeredWithBarangay"
        />

        <ChecklistItem
          icon={Phone}
          label="Has Emergency Contact"
          description="Designated out-of-area contact person for family communication"
          checked={readiness.hasEmergencyContact}
          field="hasEmergencyContact"
        />
      </div>

      {/* Nearest Evacuation Center */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nearest Evacuation Center
        </label>
        <select
          value={readiness.nearestEvacuationCenter || ''}
          onChange={(e) => handleChange('nearestEvacuationCenter', e.target.value)}
          disabled={readOnly}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63] focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Select nearest evacuation center</option>
          {evacuationCenters.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name} - {center.barangay}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          The designated evacuation center for this household during emergencies
        </p>
      </div>
    </div>
  );
}
