import React, { useState } from 'react';
import { Save, X, ChevronRight, ChevronLeft, Check, User, Home, Shield, Plus, Trash2, Users } from 'lucide-react';
import { toast } from "sonner";
import { barangays } from '../data/mockData';
import { Household, GeoLocation, DisasterRiskProfile, VulnerableMember, EvacuationReadiness, RiskLevel, HeadOfFamily, FamilyMember } from '../types/cbms';
import { useData } from '../context/DataContext';
import { GPSCapture } from './gis';

type Step = 1 | 2 | 3 | 4 | 5;

export function DataCollection() {
  const { addHousehold, evacuationCenters } = useData();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Basic household info
  const [formData, setFormData] = useState({
    barangay: '',
    householdNumber: '',
    housingType: '',
    accessToWater: false,
    accessToElectricity: false,
    accessToInternet: false,
    healthInsurance: false,
    disasterVulnerability: 'Low' as 'Low' | 'Medium' | 'High',
  });

  // Heads of family with economic info (can have multiple in extended families)
  const [headsOfFamily, setHeadsOfFamily] = useState<HeadOfFamily[]>([
    {
      id: `hof-${Date.now()}`,
      name: '',
      age: 0,
      gender: 'Male',
      employmentStatus: '',
      monthlyIncome: 0,
      educationLevel: '',
      occupation: '',
    }
  ]);

  // Family members (dependents) with same details
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Extended disaster risk data
  const [location, setLocation] = useState<GeoLocation | undefined>();
  const [disasterRisk, setDisasterRisk] = useState<DisasterRiskProfile>({
    floodRisk: 'Low',
    landslideRisk: 'Low',
    earthquakeRisk: 'Low',
    fireRisk: 'Low',
    overallRisk: 'Low',
  });
  const [vulnerableMembers, setVulnerableMembers] = useState<VulnerableMember[]>([]);
  const [evacuationReadiness, setEvacuationReadiness] = useState<EvacuationReadiness>({
    hasEmergencyKit: false,
    knowsEvacuationRoute: false,
    hasEmergencyContact: false,
    nearestEvacuationCenter: '',
    estimatedEvacuationTime: 0,
  });

  // Calculate overall disaster risk from individual risks
  const calculateOverallRisk = (risks: DisasterRiskProfile): RiskLevel => {
    const levels: Record<RiskLevel, number> = { Low: 1, Medium: 2, High: 3, 'Very High': 3.5, Critical: 4 };
    const avgScore = (
      levels[risks.floodRisk] +
      levels[risks.landslideRisk] +
      levels[risks.earthquakeRisk] +
      levels[risks.fireRisk]
    ) / 4;
    if (avgScore >= 3.5) return 'Critical';
    if (avgScore >= 2.5) return 'High';
    if (avgScore >= 1.5) return 'Medium';
    return 'Low';
  };

  // Calculate totals
  const totalMembers = headsOfFamily.length + familyMembers.length;
  const totalIncome = headsOfFamily.reduce((sum: number, h: HeadOfFamily) => sum + (h.monthlyIncome || 0), 0) +
                      familyMembers.reduce((sum: number, m: FamilyMember) => sum + (m.monthlyIncome || 0), 0);
  const primaryHead = headsOfFamily[0]?.name || ''; // First head is considered primary

  const steps = [
    { id: 1, label: 'Basic Info', icon: User },
    { id: 2, label: 'Heads of Family', icon: Users },
    { id: 3, label: 'Family Members', icon: Users },
    { id: 4, label: 'Housing', icon: Home },
    { id: 5, label: 'Risk', icon: Shield },
  ];

  const calculatePovertyLevel = (income: number, members: number): 'Non-Poor' | 'Poor' | 'Subsistence Poor' => {
    const perCapitaIncome = income / Math.max(members, 1);
    if (perCapitaIncome < 2000) return 'Subsistence Poor';
    if (perCapitaIncome < 3500) return 'Poor';
    return 'Non-Poor';
  };

  const addHeadOfFamily = () => {
    setHeadsOfFamily([...headsOfFamily, {
      id: `hof-${Date.now()}`,
      name: '',
      age: 0,
      gender: 'Male',
      employmentStatus: '',
      monthlyIncome: 0,
      educationLevel: '',
      occupation: '',
    }]);
  };

  const removeHeadOfFamily = (id: string) => {
    if (headsOfFamily.length <= 1) {
      toast.error("At least one head of family is required");
      return;
    }
    setHeadsOfFamily(headsOfFamily.filter((h: HeadOfFamily) => h.id !== id));
  };

  const updateHeadOfFamily = (id: string, field: keyof HeadOfFamily, value: any) => {
    setHeadsOfFamily(headsOfFamily.map((h: HeadOfFamily) => {
      if (h.id === id) {
        return { ...h, [field]: value };
      }
      return h;
    }));
  };

  // Family Members management
  const addFamilyMember = (headOfFamilyId?: string) => {
    const associatedHeadId = headOfFamilyId || headsOfFamily[0]?.id || '';
    setFamilyMembers([...familyMembers, {
      id: `fm-${Date.now()}`,
      headOfFamilyId: associatedHeadId,
      name: '',
      relationship: '',
      age: 0,
      gender: 'Male',
      employmentStatus: '',
      monthlyIncome: 0,
      educationLevel: '',
      occupation: '',
    }]);
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m: FamilyMember) => m.id !== id));
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFamilyMembers(familyMembers.map((m: FamilyMember) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (headsOfFamily.length === 0 || !headsOfFamily.some((h: HeadOfFamily) => h.name)) {
      toast.error("Please add at least one head of family");
      return;
    }

    const povertyLevel = calculatePovertyLevel(totalIncome, totalMembers);

    // Update overall risk before saving
    const updatedDisasterRisk = {
      ...disasterRisk,
      overallRisk: calculateOverallRisk(disasterRisk),
    };

    // Get primary head of family (first in list)
    const primaryHeadData = headsOfFamily[0];

    const newHousehold: Household = {
      id: `hh-${Date.now()}`,
      barangay: formData.barangay,
      householdNumber: formData.householdNumber,
      headOfFamily: primaryHead,
      totalMembers: totalMembers,
      monthlyIncome: totalIncome,
      employmentStatus: primaryHeadData.employmentStatus,
      housingType: formData.housingType,
      accessToWater: formData.accessToWater,
      accessToElectricity: formData.accessToElectricity,
      accessToInternet: formData.accessToInternet,
      healthInsurance: formData.healthInsurance,
      educationLevel: primaryHeadData.educationLevel,
      disasterVulnerability: formData.disasterVulnerability,
      povertyLevel,
      dateCollected: new Date().toISOString().split('T')[0],
      location,
      disasterRisk: updatedDisasterRisk,
      vulnerableMembers: vulnerableMembers.length > 0 ? vulnerableMembers : undefined,
      evacuationReadiness,
      headsOfFamily: headsOfFamily,
      familyMembers: familyMembers,
    };

    if (confirm("Are you sure you want to save this household data?")) {
      addHousehold(newHousehold);

      toast.success("Household data saved successfully!", {
        description: `${headsOfFamily.length} head(s), ${familyMembers.length} member(s) - ${totalMembers} total recorded.`
      });

      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      barangay: '',
      householdNumber: '',
      housingType: '',
      accessToWater: false,
      accessToElectricity: false,
      accessToInternet: false,
      healthInsurance: false,
      disasterVulnerability: 'Low',
    });
    setHeadsOfFamily([{
      id: `hof-${Date.now()}`,
      name: '',
      age: 0,
      gender: 'Male',
      employmentStatus: '',
      monthlyIncome: 0,
      educationLevel: '',
      occupation: '',
    }]);
    setFamilyMembers([]);
    setLocation(undefined);
    setDisasterRisk({
      floodRisk: 'Low',
      landslideRisk: 'Low',
      earthquakeRisk: 'Low',
      fireRisk: 'Low',
      overallRisk: 'Low',
    });
    setVulnerableMembers([]);
    setEvacuationReadiness({
      hasEmergencyKit: false,
      knowsEvacuationRoute: false,
      hasEmergencyContact: false,
      nearestEvacuationCenter: '',
      estimatedEvacuationTime: 0,
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] placeholder:text-[#143a63]/40 text-sm";
  const inputSmClass = "w-full px-3 py-2 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] placeholder:text-[#143a63]/40 text-sm";
  const labelClass = "block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2";
  const labelSmClass = "block text-[10px] font-medium text-[#143a63]/60 uppercase tracking-wide mb-1";
  const checkboxClass = "flex items-center gap-3 p-4 border border-[#e6e9ee] rounded-lg cursor-pointer hover:bg-[#f7f7f3] transition-colors";

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mb-4 md:mb-6">
        <p className="eyebrow mb-1 md:mb-2">Data Collection · RA 11315</p>
        <h2 className="text-lg md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
          Household Data Collection
        </h2>
        <p className="text-xs md:text-sm text-[#143a63]/60 mt-1">Enter household information per CBMS requirements</p>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-[#143a63] text-white'
                    : 'bg-[#e6e9ee] text-[#143a63]/40'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
                <span className={`text-[10px] md:text-xs mt-1 md:mt-2 font-medium text-center ${
                  currentStep >= step.id ? 'text-[#143a63]' : 'text-[#143a63]/40'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-4 sm:w-8 md:w-16 lg:w-24 h-0.5 md:h-1 mx-1 md:mx-2 rounded flex-shrink-0 ${
                  currentStep > step.id ? 'bg-[#143a63]' : 'bg-[#e6e9ee]'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#e6e9ee] p-4 md:p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-[#0a1c33] pb-3 border-b border-[#e6e9ee]" style={{ fontFamily: 'Source Serif 4' }}>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  Barangay <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Household Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.householdNumber}
                  onChange={(e) => setFormData({ ...formData, householdNumber: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., HH-2024-001"
                />
              </div>
            </div>

            {/* GPS Location Capture */}
            <div className="mt-6 pt-6 border-t border-[#e6e9ee]">
              <label className={labelClass}>GPS Location (Optional)</label>
              <p className="text-xs text-[#143a63]/60 mb-3">
                Capture the household's GPS coordinates for mapping and disaster risk assessment
              </p>
              <GPSCapture
                onLocationCapture={setLocation}
                currentLocation={location}
              />
            </div>
          </div>
        )}

        {/* Step 2: Heads of Family */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ee]">
              <h3 className="text-base font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                Heads of Family
              </h3>
              <button
                type="button"
                onClick={addHeadOfFamily}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Head of Family
              </button>
            </div>

            <p className="text-xs text-[#143a63]/60">
              Add all heads of family (extended families may have multiple). Each head has their own economic information.
            </p>

            {/* Total Household Members */}
            <div className="p-4 bg-[#f0f4f8] border border-[#e6e9ee] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Total Household Members
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={totalMembers}
                    className="w-full px-4 py-3 bg-gray-100 border border-[#e6e9ee] rounded-lg text-[#0a1c33] font-semibold text-sm cursor-not-allowed"
                    placeholder="Total members"
                  />
                  <p className="text-[10px] text-[#143a63]/50 mt-1">Autocalculated list total (Heads + Family Members)</p>
                </div>
                <div className="text-sm">
                  <span className="text-[#143a63]/60">Heads of Family:</span>
                  <span className="ml-2 font-semibold text-[#0a1c33]">{headsOfFamily.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[#143a63]/60">Combined Income:</span>
                  <span className="ml-2 font-semibold text-[#0a1c33]">₱{totalIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Heads of Family List */}
            <div className="space-y-4">
              {headsOfFamily.map((head, index) => (
                <div key={head.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#143a63] text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#0a1c33]">
                        {head.name || 'New Head of Family'}
                        {index === 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-[#c8a24b] text-white text-[10px] rounded">PRIMARY</span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHeadOfFamily(head.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove head of family"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Personal Info Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="col-span-2">
                      <label className={labelSmClass}>Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={head.name}
                        onChange={(e) => updateHeadOfFamily(head.id, 'name', e.target.value)}
                        className={inputSmClass}
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className={labelSmClass}>Age <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="150"
                        value={head.age || ''}
                        onChange={(e) => updateHeadOfFamily(head.id, 'age', parseInt(e.target.value) || 0)}
                        className={inputSmClass}
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className={labelSmClass}>Gender</label>
                      <select
                        value={head.gender}
                        onChange={(e) => updateHeadOfFamily(head.id, 'gender', e.target.value)}
                        className={inputSmClass}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Occupation Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelSmClass}>Occupation</label>
                      <input
                        type="text"
                        value={head.occupation}
                        onChange={(e) => updateHeadOfFamily(head.id, 'occupation', e.target.value)}
                        className={inputSmClass}
                        placeholder="e.g., Farmer, Teacher, etc."
                      />
                    </div>
                    <div>
                      <label className={labelSmClass}>Employment Status</label>
                      <select
                        value={head.employmentStatus}
                        onChange={(e) => updateHeadOfFamily(head.id, 'employmentStatus', e.target.value)}
                        className={inputSmClass}
                      >
                        <option value="">Select Status</option>
                        <option value="Employed">Employed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Retired">Retired</option>
                        <option value="OFW">OFW</option>
                      </select>
                    </div>
                  </div>

                  {/* Economic Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <label className={labelSmClass}>Monthly Income (₱)</label>
                      <input
                        type="number"
                        min="0"
                        value={head.monthlyIncome || ''}
                        onChange={(e) => updateHeadOfFamily(head.id, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                        className={inputSmClass}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelSmClass}>Education Level</label>
                      <select
                        value={head.educationLevel}
                        onChange={(e) => updateHeadOfFamily(head.id, 'educationLevel', e.target.value)}
                        className={inputSmClass}
                      >
                        <option value="">Select Level</option>
                        <option value="No Formal Education">No Formal Education</option>
                        <option value="Elementary">Elementary</option>
                        <option value="High School">High School</option>
                        <option value="Vocational">Vocational</option>
                        <option value="College">College</option>
                        <option value="Post-Graduate">Post-Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Poverty Level Preview */}
            {totalIncome > 0 && totalMembers > 0 && (
              <div className="p-4 bg-[#f7f7f3] rounded-lg border border-[#e6e9ee]">
                <p className="text-xs text-[#143a63]/60 uppercase tracking-wide mb-1">Calculated Poverty Level</p>
                <p className={`font-semibold ${
                  calculatePovertyLevel(totalIncome, totalMembers) === 'Non-Poor'
                    ? 'text-[#4a7c59]'
                    : calculatePovertyLevel(totalIncome, totalMembers) === 'Poor'
                    ? 'text-[#c8a24b]'
                    : 'text-red-600'
                }`}>
                  {calculatePovertyLevel(totalIncome, totalMembers)}
                </p>
                <p className="text-xs text-[#143a63]/60 mt-1">
                  Per capita income: ₱{(totalIncome / totalMembers).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Family Members */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ee]">
              <h3 className="text-base font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                Family Members Relationship Assignment
              </h3>
              <button
                type="button"
                onClick={() => addFamilyMember()}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Family Member
              </button>
            </div>

            <p className="text-xs text-[#143a63]/60">
              Associate each family member with a specific Head of Family so we can clearly identify where each dependent belongs within this household.
            </p>

            {/* Total Household Members */}
            <div className="p-4 bg-[#f0f4f8] border border-[#e6e9ee] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className={labelClass}>
                    Total Household Members
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={totalMembers}
                    className="w-full px-4 py-3 bg-gray-100 border border-[#e6e9ee] rounded-lg text-[#0a1c33] font-semibold text-sm cursor-not-allowed"
                    placeholder="Total members"
                  />
                  <p className="text-[10px] text-[#143a63]/50 mt-1">Autocalculated list total (Heads + Family Members)</p>
                </div>
                <div className="text-sm">
                  <span className="text-[#143a63]/60">Heads of Family:</span>
                  <span className="ml-2 font-semibold text-[#0a1c33]">{headsOfFamily.length}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[#143a63]/60">Family Members:</span>
                  <span className="ml-2 font-semibold text-[#0a1c33]">{familyMembers.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {headsOfFamily.map((head, headIndex) => {
                const membersOfThisHead = familyMembers.filter(m => m.headOfFamilyId === head.id);
                return (
                  <div key={head.id} className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#143a63] text-white flex items-center justify-center text-xs font-bold font-mono">
                          {headIndex + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0a1c33]">
                            Members under Head of Family: <span className="text-[#c8a24b] font-bold">{head.name || `Unnamed Head ${headIndex + 1}`}</span>
                          </h4>
                          <p className="text-[10px] text-[#143a63]/50 uppercase tracking-widest font-semibold mt-0.5">
                            Economic Head · Age: {head.age || 'N/A'} · Gender: {head.gender}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addFamilyMember(head.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#4a7c59] text-white rounded-lg hover:bg-[#3d6b4a] transition-colors text-xs font-medium self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Member under {head.name ? head.name.split(' ')[0] : `Head ${headIndex + 1}`}
                      </button>
                    </div>

                    {membersOfThisHead.length === 0 ? (
                      <div className="p-6 bg-white border border-dashed border-gray-300 rounded-lg text-center">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 font-medium">No family members registered under this head yet</p>
                        <button
                          type="button"
                          onClick={() => addFamilyMember(head.id)}
                          className="text-xs text-[#143a63] font-semibold hover:underline mt-1 inline-block"
                        >
                          Register first member
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {membersOfThisHead.map((member, memberIndex) => (
                          <div key={member.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-[10px] font-bold">
                                  {memberIndex + 1}
                                </span>
                                <span className="text-sm font-semibold text-[#0a1c33]">
                                  {member.name || 'New Family Member'}
                                  {member.relationship && (
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">{member.relationship}</span>
                                  )}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFamilyMember(member.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove family member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Personal Info Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="col-span-2">
                                <label className={labelSmClass}>Full Name <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  required
                                  value={member.name}
                                  onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                                  className={inputSmClass}
                                  placeholder="Full Name"
                                />
                              </div>
                              <div>
                                <label className={labelSmClass}>Relationship to Head <span className="text-red-500">*</span></label>
                                <select
                                  required
                                  value={member.relationship}
                                  onChange={(e) => updateFamilyMember(member.id, 'relationship', e.target.value)}
                                  className={inputSmClass}
                                >
                                  <option value="">Select</option>
                                  <option value="Spouse">Spouse</option>
                                  <option value="Son">Son</option>
                                  <option value="Daughter">Daughter</option>
                                  <option value="Father">Father</option>
                                  <option value="Mother">Mother</option>
                                  <option value="Brother">Brother</option>
                                  <option value="Sister">Sister</option>
                                  <option value="Grandparent">Grandparent</option>
                                  <option value="Grandchild">Grandchild</option>
                                  <option value="In-Law">In-Law</option>
                                  <option value="Other Relative">Other Relative</option>
                                  <option value="Non-Relative">Non-Relative</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelSmClass}>Age</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="150"
                                  value={member.age || ''}
                                  onChange={(e) => updateFamilyMember(member.id, 'age', parseInt(e.target.value) || 0)}
                                  className={inputSmClass}
                                  placeholder="Age"
                                />
                              </div>
                            </div>

                            {/* Gender, Occupation, and Assigned Head Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className={labelSmClass}>Gender</label>
                                <select
                                  value={member.gender}
                                  onChange={(e) => updateFamilyMember(member.id, 'gender', e.target.value)}
                                  className={inputSmClass}
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelSmClass}>Occupation</label>
                                <input
                                  type="text"
                                  value={member.occupation}
                                  onChange={(e) => updateFamilyMember(member.id, 'occupation', e.target.value)}
                                  className={inputSmClass}
                                  placeholder="e.g., Student, None, etc."
                                />
                              </div>
                              <div>
                                <label className={labelSmClass}>Employment Status</label>
                                <select
                                  value={member.employmentStatus}
                                  onChange={(e) => updateFamilyMember(member.id, 'employmentStatus', e.target.value)}
                                  className={inputSmClass}
                                >
                                  <option value="">Select Status</option>
                                  <option value="Employed">Employed</option>
                                  <option value="Self-Employed">Self-Employed</option>
                                  <option value="Unemployed">Unemployed</option>
                                  <option value="Student">Student</option>
                                  <option value="Retired">Retired</option>
                                  <option value="OFW">OFW</option>
                                  <option value="Housewife/Househusband">Housewife/Househusband</option>
                                  <option value="Not Applicable">Not Applicable (Minor)</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelSmClass}>Belongs to Head</label>
                                <select
                                  value={member.headOfFamilyId}
                                  onChange={(e) => updateFamilyMember(member.id, 'headOfFamilyId', e.target.value)}
                                  className={inputSmClass}
                                >
                                  {headsOfFamily.map((h, i) => (
                                    <option key={h.id} value={h.id}>
                                      {h.name || `Head of Family ${i + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Economic Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                              <div>
                                <label className={labelSmClass}>Monthly Income (₱)</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={member.monthlyIncome || ''}
                                  onChange={(e) => updateFamilyMember(member.id, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                                  className={inputSmClass}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className={labelSmClass}>Education Level</label>
                                <select
                                  value={member.educationLevel}
                                  onChange={(e) => updateFamilyMember(member.id, 'educationLevel', e.target.value)}
                                  className={inputSmClass}
                                >
                                  <option value="">Select Level</option>
                                  <option value="No Formal Education">No Formal Education</option>
                                  <option value="Elementary">Elementary</option>
                                  <option value="High School">High School</option>
                                  <option value="Vocational">Vocational</option>
                                  <option value="College">College</option>
                                  <option value="Post-Graduate">Post-Graduate</option>
                                  <option value="Not Applicable">Not Applicable</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Housing and Services */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-[#0a1c33] pb-3 border-b border-[#e6e9ee]" style={{ fontFamily: 'Source Serif 4' }}>
              Housing and Access to Services
            </h3>

            <div>
              <label className={labelClass}>
                Housing Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.housingType}
                onChange={(e) => setFormData({ ...formData, housingType: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Type</option>
                <option value="Concrete">Concrete</option>
                <option value="Mixed">Mixed (Semi-Concrete)</option>
                <option value="Light Materials">Light Materials</option>
                <option value="Makeshift">Makeshift</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Access to Services</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={checkboxClass}>
                  <input
                    type="checkbox"
                    checked={formData.accessToWater}
                    onChange={(e) => setFormData({ ...formData, accessToWater: e.target.checked })}
                    className="w-5 h-5 text-[#143a63] rounded border-[#e6e9ee] focus:ring-2 focus:ring-[#c8a24b]"
                  />
                  <span className="text-sm font-medium text-[#0a1c33]">Access to Safe Water</span>
                </label>

                <label className={checkboxClass}>
                  <input
                    type="checkbox"
                    checked={formData.accessToElectricity}
                    onChange={(e) => setFormData({ ...formData, accessToElectricity: e.target.checked })}
                    className="w-5 h-5 text-[#143a63] rounded border-[#e6e9ee] focus:ring-2 focus:ring-[#c8a24b]"
                  />
                  <span className="text-sm font-medium text-[#0a1c33]">Access to Electricity</span>
                </label>

                <label className={checkboxClass}>
                  <input
                    type="checkbox"
                    checked={formData.accessToInternet}
                    onChange={(e) => setFormData({ ...formData, accessToInternet: e.target.checked })}
                    className="w-5 h-5 text-[#143a63] rounded border-[#e6e9ee] focus:ring-2 focus:ring-[#c8a24b]"
                  />
                  <span className="text-sm font-medium text-[#0a1c33]">Access to Internet</span>
                </label>

                <label className={checkboxClass}>
                  <input
                    type="checkbox"
                    checked={formData.healthInsurance}
                    onChange={(e) => setFormData({ ...formData, healthInsurance: e.target.checked })}
                    className="w-5 h-5 text-[#143a63] rounded border-[#e6e9ee] focus:ring-2 focus:ring-[#c8a24b]"
                  />
                  <span className="text-sm font-medium text-[#0a1c33]">Health Insurance (PhilHealth)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Disaster Risk */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-[#0a1c33] pb-3 border-b border-[#e6e9ee]" style={{ fontFamily: 'Source Serif 4' }}>
              Disaster Risk Assessment
            </h3>

            {/* Risk Levels by Type */}
            <div>
              <label className={labelClass}>Risk Assessment by Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { key: 'floodRisk', label: 'Flood Risk', color: 'blue' },
                  { key: 'landslideRisk', label: 'Landslide Risk', color: 'amber' },
                  { key: 'earthquakeRisk', label: 'Earthquake Risk', color: 'orange' },
                  { key: 'fireRisk', label: 'Fire Risk', color: 'red' },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="p-4 border border-[#e6e9ee] rounded-lg">
                    <p className="text-sm font-medium text-[#0a1c33] mb-2">{label}</p>
                    <div className="flex gap-2">
                      {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDisasterRisk({ ...disasterRisk, [key]: level })}
                          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-all ${
                            disasterRisk[key] === level
                              ? level === 'Critical' ? 'bg-red-600 text-white' :
                                level === 'High' ? 'bg-red-500 text-white' :
                                level === 'Medium' ? 'bg-amber-500 text-white' :
                                'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerable Members */}
            <div className="pt-4 border-t border-[#e6e9ee]">
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass}>Vulnerable Members</label>
                <button
                  type="button"
                  onClick={() => setVulnerableMembers([...vulnerableMembers, {
                    id: `vm-${Date.now()}`,
                    name: '',
                    relationship: '',
                    age: 0,
                    type: 'Elderly',
                  }])}
                  className="flex items-center gap-1 text-xs text-[#143a63] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Vulnerable Member
                </button>
              </div>

              {vulnerableMembers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No vulnerable members added</p>
              ) : (
                <div className="space-y-3">
                  {vulnerableMembers.map((member, index) => (
                    <div key={member.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">Vulnerable Member {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => setVulnerableMembers(vulnerableMembers.filter(m => m.id !== member.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...vulnerableMembers];
                            updated[index].name = e.target.value;
                            setVulnerableMembers(updated);
                          }}
                          className="px-2 py-1.5 text-sm border border-gray-200 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={member.age || ''}
                          onChange={(e) => {
                            const updated = [...vulnerableMembers];
                            updated[index].age = parseInt(e.target.value) || 0;
                            setVulnerableMembers(updated);
                          }}
                          className="px-2 py-1.5 text-sm border border-gray-200 rounded"
                        />
                        <select
                          value={member.type}
                          onChange={(e) => {
                            const updated = [...vulnerableMembers];
                            updated[index].type = e.target.value as VulnerableMember['type'];
                            setVulnerableMembers(updated);
                          }}
                          className="px-2 py-1.5 text-sm border border-gray-200 rounded"
                        >
                          <option value="Elderly">Elderly (60+)</option>
                          <option value="PWD">PWD</option>
                          <option value="Pregnant">Pregnant</option>
                          <option value="Infant">Infant</option>
                          <option value="Chronic Illness">Chronic Illness</option>
                          <option value="Solo Parent">Solo Parent</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={member.relationship}
                          onChange={(e) => {
                            const updated = [...vulnerableMembers];
                            updated[index].relationship = e.target.value;
                            setVulnerableMembers(updated);
                          }}
                          className="px-2 py-1.5 text-sm border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evacuation Readiness */}
            <div className="pt-4 border-t border-[#e6e9ee]">
              <label className={labelClass}>Evacuation Readiness</label>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={checkboxClass}>
                    <input
                      type="checkbox"
                      checked={evacuationReadiness.hasEmergencyKit}
                      onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, hasEmergencyKit: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Has Emergency Kit</span>
                  </label>
                  <label className={checkboxClass}>
                    <input
                      type="checkbox"
                      checked={evacuationReadiness.knowsEvacuationRoute}
                      onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, knowsEvacuationRoute: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Knows Evacuation Route</span>
                  </label>
                  <label className={checkboxClass}>
                    <input
                      type="checkbox"
                      checked={evacuationReadiness.hasEmergencyContact}
                      onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, hasEmergencyContact: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Has Emergency Contact</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nearest Evacuation Center</label>
                    <select
                      value={evacuationReadiness.nearestEvacuationCenter}
                      onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, nearestEvacuationCenter: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select Center</option>
                      {evacuationCenters.filter(c => c.isActive).map(center => (
                        <option key={center.id} value={center.id}>{center.name} - {center.barangay}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Estimated Evacuation Time (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={evacuationReadiness.estimatedEvacuationTime || ''}
                      onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, estimatedEvacuationTime: parseInt(e.target.value) || 0 })}
                      className={inputClass}
                      placeholder="e.g., 15"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-[#f7f7f3] rounded-lg border border-[#e6e9ee]">
              <p className="text-xs text-[#143a63]/60 uppercase tracking-wide mb-3">Data Summary</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#143a63]/60">Barangay:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">{formData.barangay || '-'}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Primary Head:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">{primaryHead || '-'}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Heads of Family:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">{headsOfFamily.length}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Total Members:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">{totalMembers}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Total Income:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">₱{totalIncome.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Overall Risk:</span>
                  <span className={`ml-2 font-medium ${
                    calculateOverallRisk(disasterRisk) === 'Critical' ? 'text-red-600' :
                    calculateOverallRisk(disasterRisk) === 'High' ? 'text-red-500' :
                    calculateOverallRisk(disasterRisk) === 'Medium' ? 'text-amber-600' : 'text-green-600'
                  }`}>{calculateOverallRisk(disasterRisk)}</span>
                </div>
                <div>
                  <span className="text-[#143a63]/60">Vulnerable:</span>
                  <span className="ml-2 text-[#0a1c33] font-medium">{vulnerableMembers.length} member(s)</span>
                </div>
                {location && (
                  <div className="col-span-2">
                    <span className="text-[#143a63]/60">GPS:</span>
                    <span className="ml-2 text-[#0a1c33] font-medium">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 mt-6 border-t border-[#e6e9ee]">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 text-[#143a63] hover:bg-[#f7f7f3] rounded-lg transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-[#e6e9ee] rounded-lg text-[#143a63]/70 hover:bg-[#f7f7f3] transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-[#4a7c59] text-white rounded-lg hover:bg-[#3d6b4a] transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Household
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
