import { useState } from 'react';
import { BeneficiaryTargeting } from './BeneficiaryTargeting';
import { EnrolledBeneficiaries } from './EnrolledBeneficiaries';
import { ProgramManagement } from './ProgramManagement';
import { Users, Target, ClipboardList, Building2 } from 'lucide-react';

type TabType = 'targeting' | 'enrolled' | 'programs';

export function Beneficiaries() {
  const [activeTab, setActiveTab] = useState<TabType>('targeting');

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'targeting', label: 'Beneficiary Targeting', shortLabel: 'Targeting', icon: <Target className="w-4 h-4" /> },
    { id: 'enrolled', label: 'Enrolled Beneficiaries', shortLabel: 'Enrolled', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'programs', label: 'Social Programs', shortLabel: 'Programs', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#143a63] to-[#1e5090] flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-[#0a1c33] truncate">Beneficiary Management</h1>
              <p className="text-xs md:text-sm text-gray-500 truncate">Target, enroll, and track program beneficiaries</p>
            </div>
          </div>
        </div>

        {/* Tabs - scrollable on mobile */}
        <div className="px-4 md:px-6 overflow-x-auto scrollbar-hide">
          <nav className="flex gap-4 md:gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#143a63] text-[#143a63]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
                <span className="text-sm font-medium sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
        {activeTab === 'targeting' && <BeneficiaryTargeting />}
        {activeTab === 'enrolled' && <EnrolledBeneficiaries />}
        {activeTab === 'programs' && <ProgramManagement />}
      </div>
    </div>
  );
}
