import React, { useState, useMemo } from 'react';
import {
  Save, ChevronRight, ChevronLeft, Check, User, Home, Shield, Plus, Trash2,
  Users, MapPin, Phone, Briefcase, Heart, GraduationCap, ChevronDown, ChevronUp,
  AlertTriangle, Building2, Droplets, Zap, Wifi, Truck, Stethoscope
} from 'lucide-react';
import { toast } from "sonner";
import { barangays } from '../data/mockData';
import {
  Household, GeoLocation, DisasterRiskProfile, VulnerableMember, EvacuationReadiness,
  RiskLevel, HouseholdMember,
  CIVIL_STATUS_OPTIONS, PHILHEALTH_STATUS_OPTIONS, DISABILITY_TYPE_OPTIONS,
  NUTRITIONAL_STATUS_OPTIONS, LITERACY_STATUS_OPTIONS, SCHOOL_TYPE_OPTIONS,
  WATER_SOURCE_OPTIONS, INCOME_SOURCE_OPTIONS, RELATIONSHIP_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS, EDUCATION_LEVEL_OPTIONS, GRADE_LEVEL_OPTIONS,
  HOUSING_TYPE_OPTIONS, SUFFIX_OPTIONS, WaterSource, IncomeSource
} from '../types/cbms';
import { useData } from '../context/DataContext';
import { GPSCapture } from './gis';

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type MemberTab = 'basic' | 'employment' | 'health' | 'education';

// Helper to create empty member
const createEmptyMember = (isHead: boolean = false, headOfFamilyId?: string): HouseholdMember => ({
  id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  headOfFamilyId: isHead ? undefined : headOfFamilyId,
  lastName: '',
  firstName: '',
  middleName: '',
  suffix: '',
  birthDate: '',
  age: 0,
  gender: 'Male',
  civilStatus: 'Single',
  relationship: isHead ? 'Head' : '',
  philsysNumber: '',
  contactNumber: '',
  employmentStatus: isHead ? '' : 'Not Applicable (Minor)',
  occupation: '',
  monthlyIncome: 0,
  incomeSource: undefined,
  philHealthStatus: 'None',
  hasDisability: false,
  disabilityType: 'None',
  isSeniorCitizen: false,
  isSoloParent: false,
  hasChronicIllness: false,
  isPregnant: false,
  isLactating: false,
  weight: undefined,
  height: undefined,
  bmi: undefined,
  nutritionalStatus: undefined,
  educationLevel: '',
  literacyStatus: 'Can read and write',
  isCurrentlyAttendingSchool: false,
  currentGradeLevel: '',
  schoolName: '',
  schoolType: undefined,
  isScholarshipRecipient: false,
  isOutOfSchoolYouth: false,
});

export function DataCollection() {
  const { addHousehold, evacuationCenters } = useData();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [activeMemberTab, setActiveMemberTab] = useState<MemberTab>('basic');

  // Step 1: Household Information
  const [householdInfo, setHouseholdInfo] = useState({
    barangay: '',
    purokSitio: '',
    address: '',
    householdNumber: '',
    contactNumber: '',
  });
  const [location, setLocation] = useState<GeoLocation | undefined>();

  // Step 2: Household Members
  const [members, setMembers] = useState<HouseholdMember[]>([createEmptyMember(true)]);

  // Step 3: Economic & Services
  const [economicData, setEconomicData] = useState({
    housingType: '',
    waterSource: '' as WaterSource | '',
    foodExpenditure: 0,
    nonFoodExpenditure: 0,
  });
  const [services, setServices] = useState({
    accessToWater: false,
    accessToElectricity: false,
    accessToInternet: false,
    accessToHealthFacility: false,
    accessToSanitaryToilet: false,
    accessToPublicTransportation: false,
    accessToWasteCollection: false,
    healthInsurance: false,
  });

  // Step 4: Disaster Risk
  const [disasterRisk, setDisasterRisk] = useState<DisasterRiskProfile>({
    floodRisk: 'Low',
    landslideRisk: 'Low',
    earthquakeRisk: 'Low',
    fireRisk: 'Low',
    overallRisk: 'Low',
  });
  const [evacuationReadiness, setEvacuationReadiness] = useState<EvacuationReadiness>({
    hasEmergencyKit: false,
    knowsEvacuationRoute: false,
    hasEvacuationPlan: false,
    registeredWithBarangay: false,
    hasEmergencyContact: false,
    nearestEvacuationCenter: '',
    distanceToEvacuationCenter: undefined,
  });

  // Steps configuration
  const steps = [
    { id: 1, label: 'Household', icon: MapPin },
    { id: 2, label: 'Head of Family', icon: User },
    { id: 3, label: 'Family Members', icon: Users },
    { id: 4, label: 'Economic', icon: Briefcase },
    { id: 5, label: 'Risk', icon: Shield },
    { id: 6, label: 'Review', icon: Check },
  ];

  // Computed values
  const totalMembers = members.length;
  const totalIncome = members.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);
  const headOfFamily = members.find(m => m.relationship === 'Head');
  const headName = headOfFamily ? `${headOfFamily.firstName} ${headOfFamily.lastName}`.trim() : '';

  const povertyLevel = useMemo(() => {
    const perCapitaIncome = totalIncome / Math.max(totalMembers, 1);
    if (perCapitaIncome < 2000) return 'Subsistence Poor';
    if (perCapitaIncome < 3500) return 'Poor';
    return 'Non-Poor';
  }, [totalIncome, totalMembers]);

  // Calculate vulnerable members from member data
  const vulnerableMembers = useMemo((): VulnerableMember[] => {
    const vulnerable: VulnerableMember[] = [];
    members.forEach(m => {
      const name = `${m.firstName} ${m.lastName}`.trim();
      if (m.age >= 60) {
        vulnerable.push({ id: m.id, name, relationship: m.relationship, age: m.age, type: 'Elderly' });
      }
      if (m.hasDisability && m.disabilityType !== 'None') {
        vulnerable.push({ id: `${m.id}-pwd`, name, relationship: m.relationship, age: m.age, type: 'PWD' });
      }
      if (m.isPregnant) {
        vulnerable.push({ id: `${m.id}-preg`, name, relationship: m.relationship, age: m.age, type: 'Pregnant' });
      }
      if (m.isLactating) {
        vulnerable.push({ id: `${m.id}-lact`, name, relationship: m.relationship, age: m.age, type: 'Lactating' });
      }
      if (m.age <= 5) {
        vulnerable.push({ id: `${m.id}-infant`, name, relationship: m.relationship, age: m.age, type: 'Infant' });
      }
      if (m.isSoloParent) {
        vulnerable.push({ id: `${m.id}-solo`, name, relationship: m.relationship, age: m.age, type: 'Solo Parent' });
      }
      if (m.hasChronicIllness) {
        vulnerable.push({ id: `${m.id}-chronic`, name, relationship: m.relationship, age: m.age, type: 'Chronic Illness' });
      }
      if (m.isOutOfSchoolYouth) {
        vulnerable.push({ id: `${m.id}-osy`, name, relationship: m.relationship, age: m.age, type: 'OSY' });
      }
    });
    return vulnerable;
  }, [members]);

  // Calculate overall disaster risk
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

  // Get heads of family for dropdown
  const headsOfFamily = members.filter(m => m.relationship === 'Head');

  // Member management
  const addHeadOfFamily = () => {
    const newHead = createEmptyMember(true);
    setMembers([...members, newHead]);
    setExpandedMemberId(newHead.id);
    setActiveMemberTab('basic');
  };

  const addMember = () => {
    // Default to first head if exists
    const defaultHeadId = headsOfFamily.length > 0 ? headsOfFamily[0].id : undefined;
    const newMember = createEmptyMember(false, defaultHeadId);
    setMembers([...members, newMember]);
    setExpandedMemberId(newMember.id);
    setActiveMemberTab('basic');
  };

  const removeMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member?.relationship === 'Head') {
      if (members.filter(m => m.relationship === 'Head').length <= 1) {
        toast.error("At least one household head is required");
        return;
      }
      // Check if this head has linked family members
      const linkedMembers = members.filter(m => m.headOfFamilyId === id);
      if (linkedMembers.length > 0) {
        toast.error(`Cannot remove: ${linkedMembers.length} family member(s) are linked to this head`);
        return;
      }
    }
    setMembers(members.filter(m => m.id !== id));
    if (expandedMemberId === id) {
      setExpandedMemberId(null);
    }
  };

  const updateMember = (id: string, field: keyof HouseholdMember, value: any) => {
    setMembers(members.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };

        // Auto-compute age from birthDate
        if (field === 'birthDate' && value) {
          const birth = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          updated.age = Math.max(0, age);
          updated.isSeniorCitizen = age >= 60;
        }

        // Auto-compute BMI
        if ((field === 'weight' || field === 'height') && updated.weight && updated.height) {
          const heightM = updated.height / 100;
          updated.bmi = Math.round((updated.weight / (heightM * heightM)) * 10) / 10;
        }

        // Auto-set OSY status
        if (field === 'isCurrentlyAttendingSchool' || field === 'age') {
          if (updated.age >= 15 && updated.age <= 30 && !updated.isCurrentlyAttendingSchool) {
            updated.isOutOfSchoolYouth = true;
          } else {
            updated.isOutOfSchoolYouth = false;
          }
        }

        return updated;
      }
      return m;
    }));
  };

  // Navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(6, currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1) as Step);
  };

  // Helper to validate member's basic info and employment
  const validateMemberBasicInfo = (member: HouseholdMember, isHead: boolean): string | null => {
    if (!member.lastName) return `${isHead ? 'Head' : 'Member'}: Last Name is required`;
    if (!member.firstName) return `${isHead ? 'Head' : 'Member'}: First Name is required`;
    if (!member.birthDate && !member.age) return `${member.firstName}: Birth Date or Age is required`;
    if (!member.gender) return `${member.firstName}: Sex is required`;
    if (!member.civilStatus) return `${member.firstName}: Civil Status is required`;
    if (!isHead && !member.relationship) return `${member.firstName}: Relationship is required`;
    if (!isHead && headsOfFamily.length > 0 && !member.headOfFamilyId) {
      return `${member.firstName}: Must be linked to a Head of Family`;
    }
    return null;
  };

  const validateMemberEmployment = (member: HouseholdMember): string | null => {
    if (!member.employmentStatus) return `${member.firstName}: Employment Status is required`;
    // If employed or self-employed, occupation is required
    if ((member.employmentStatus === 'Employed' || member.employmentStatus === 'Self-Employed') && !member.occupation) {
      return `${member.firstName}: Occupation is required for employed members`;
    }
    return null;
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!householdInfo.barangay) {
          toast.error("Please select a barangay");
          return false;
        }
        if (!householdInfo.householdNumber) {
          toast.error("Please enter household number");
          return false;
        }
        return true;
      case 2:
        const heads = members.filter(m => m.relationship === 'Head');
        if (heads.length === 0) {
          toast.error("At least one household head is required");
          return false;
        }
        // Validate each head's basic info
        for (const head of heads) {
          const basicError = validateMemberBasicInfo(head, true);
          if (basicError) {
            toast.error(basicError);
            setExpandedMemberId(head.id);
            setActiveMemberTab('basic');
            return false;
          }
          const employmentError = validateMemberEmployment(head);
          if (employmentError) {
            toast.error(employmentError);
            setExpandedMemberId(head.id);
            setActiveMemberTab('employment');
            return false;
          }
        }
        return true;
      case 3:
        const familyMembers = members.filter(m => m.relationship !== 'Head');
        // Validate each family member's basic info and employment
        for (const member of familyMembers) {
          const basicError = validateMemberBasicInfo(member, false);
          if (basicError) {
            toast.error(basicError);
            setExpandedMemberId(member.id);
            setActiveMemberTab('basic');
            return false;
          }
          const employmentError = validateMemberEmployment(member);
          if (employmentError) {
            toast.error(employmentError);
            setExpandedMemberId(member.id);
            setActiveMemberTab('employment');
            return false;
          }
        }
        return true;
      case 4:
        if (!economicData.housingType) {
          toast.error("Please select housing type");
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  // Form submission
  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    const updatedRisk = {
      ...disasterRisk,
      overallRisk: calculateOverallRisk(disasterRisk),
    };

    // Map members to legacy format for backward compatibility
    const headsOfFamily = members
      .filter(m => m.relationship === 'Head')
      .map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.middleName || ''} ${m.lastName} ${m.suffix || ''}`.trim().replace(/\s+/g, ' '),
        age: m.age,
        gender: m.gender,
        employmentStatus: m.employmentStatus,
        monthlyIncome: m.monthlyIncome,
        educationLevel: m.educationLevel,
        occupation: m.occupation || '',
      }));

    const familyMembers = members
      .filter(m => m.relationship !== 'Head')
      .map(m => ({
        id: m.id,
        headOfFamilyId: headsOfFamily[0]?.id || '',
        name: `${m.firstName} ${m.middleName || ''} ${m.lastName} ${m.suffix || ''}`.trim().replace(/\s+/g, ' '),
        relationship: m.relationship,
        age: m.age,
        gender: m.gender,
        employmentStatus: m.employmentStatus,
        monthlyIncome: m.monthlyIncome,
        educationLevel: m.educationLevel,
        occupation: m.occupation || '',
      }));

    const disasterVulnerability = updatedRisk.overallRisk === 'Critical' || updatedRisk.overallRisk === 'Very High' || updatedRisk.overallRisk === 'High'
      ? 'High' as const
      : updatedRisk.overallRisk === 'Medium'
      ? 'Medium' as const
      : 'Low' as const;

    const newHousehold: Household = {
      id: `HH-${Date.now()}`,
      barangay: householdInfo.barangay,
      pupisSitio: householdInfo.purokSitio,
      address: householdInfo.address,
      householdNumber: householdInfo.householdNumber,
      contactNumber: householdInfo.contactNumber,
      location,
      headOfFamily: headName,
      totalMembers,
      monthlyIncome: totalIncome,
      foodExpenditure: economicData.foodExpenditure,
      nonFoodExpenditure: economicData.nonFoodExpenditure,
      povertyLevel,
      housingType: economicData.housingType,
      waterSource: economicData.waterSource as any,
      ...services,
      employmentStatus: headOfFamily?.employmentStatus || '',
      educationLevel: headOfFamily?.educationLevel || '',
      disasterVulnerability,
      dateCollected: new Date().toISOString(),
      disasterRiskProfile: updatedRisk,
      vulnerableMembers,
      evacuationReadiness,
      members,
      headsOfFamily,
      familyMembers,
    };

    addHousehold(newHousehold);
    toast.success("Household data collected successfully!", {
      description: `Household ${householdInfo.householdNumber} has been saved.`
    });

    // Reset form
    setCurrentStep(1);
    setHouseholdInfo({ barangay: '', purokSitio: '', address: '', householdNumber: '', contactNumber: '' });
    setLocation(undefined);
    setMembers([createEmptyMember(true)]);
    setEconomicData({ housingType: '', waterSource: '', foodExpenditure: 0, nonFoodExpenditure: 0 });
    setServices({
      accessToWater: false, accessToElectricity: false, accessToInternet: false,
      accessToHealthFacility: false, accessToSanitaryToilet: false,
      accessToPublicTransportation: false, accessToWasteCollection: false, healthInsurance: false,
    });
    setDisasterRisk({ floodRisk: 'Low', landslideRisk: 'Low', earthquakeRisk: 'Low', fireRisk: 'Low', overallRisk: 'Low' });
    setEvacuationReadiness({
      hasEmergencyKit: false, knowsEvacuationRoute: false, hasEvacuationPlan: false,
      registeredWithBarangay: false, hasEmergencyContact: false, nearestEvacuationCenter: '', distanceToEvacuationCenter: undefined,
    });
    setExpandedMemberId(null);
  };

  // Render Step 1: Household Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0a1c33]" />
          Household Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barangay <span className="text-red-500">*</span>
            </label>
            <select
              value={householdInfo.barangay}
              onChange={(e) => setHouseholdInfo({ ...householdInfo, barangay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
            >
              <option value="">Select barangay</option>
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Household Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={householdInfo.householdNumber}
              onChange={(e) => setHouseholdInfo({ ...householdInfo, householdNumber: e.target.value })}
              placeholder="e.g., HH-2024-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purok/Sitio
            </label>
            <input
              type="text"
              value={householdInfo.purokSitio}
              onChange={(e) => setHouseholdInfo({ ...householdInfo, purokSitio: e.target.value })}
              placeholder="Enter purok or sitio"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              value={householdInfo.contactNumber}
              onChange={(e) => setHouseholdInfo({ ...householdInfo, contactNumber: e.target.value })}
              placeholder="e.g., 09171234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complete Address
            </label>
            <input
              type="text"
              value={householdInfo.address}
              onChange={(e) => setHouseholdInfo({ ...householdInfo, address: e.target.value })}
              placeholder="House/Lot No., Street, Zone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          GPS Location
        </h3>
        <GPSCapture
          value={location}
          onChange={setLocation}
        />
      </div>
    </div>
  );

  // Render Member Card with Tabs
  const renderMemberCard = (member: HouseholdMember, index: number) => {
    const isExpanded = expandedMemberId === member.id;
    const memberName = `${member.firstName || 'New'} ${member.lastName || 'Member'}`.trim();
    const isHead = member.relationship === 'Head';
    const linkedHead = !isHead && member.headOfFamilyId
      ? headsOfFamily.find(h => h.id === member.headOfFamilyId)
      : null;
    const linkedHeadName = linkedHead
      ? `${linkedHead.firstName || ''} ${linkedHead.lastName || ''}`.trim() || 'Unnamed Head'
      : null;

    return (
      <div key={member.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-[#0a1c33]/5 border-b border-gray-200' : ''}`}
          onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHead ? 'bg-[#0a1c33]/10 text-[#0a1c33]' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {memberName}
                {isHead && <span className="ml-2 text-xs bg-[#0a1c33]/10 text-[#0a1c33] px-2 py-0.5 rounded-full">Head</span>}
              </p>
              <p className="text-sm text-gray-500">
                {member.relationship || 'Not specified'} · {member.age || '?'} yrs · {member.gender}
                {linkedHeadName && <span className="ml-1 text-[#143a63]">· under {linkedHeadName}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); removeMember(member.id); }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {/* Expanded Content with Tabs */}
        {isExpanded && (
          <div className="p-4">
            {/* Tabs - Navy Blue Style */}
            <div className="flex bg-[#143a63] rounded-lg p-1 mb-4">
              {[
                { id: 'basic', label: 'Basic Info', icon: User },
                { id: 'employment', label: 'Employment', icon: Briefcase },
                { id: 'health', label: 'Health', icon: Heart },
                { id: 'education', label: 'Education', icon: GraduationCap },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMemberTab(tab.id as MemberTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
                    activeMemberTab === tab.id
                      ? 'bg-white text-[#0a1c33] shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeMemberTab === 'basic' && (
                <>
                  {/* Head of Family Selection for non-heads */}
                  {!isHead && headsOfFamily.length > 0 && (
                    <div className="p-3 bg-[#143a63]/5 border border-[#143a63]/20 rounded-lg">
                      <label className="block text-xs font-medium text-[#143a63] mb-1">Linked to Head of Family *</label>
                      <select
                        value={member.headOfFamilyId || ''}
                        onChange={(e) => updateMember(member.id, 'headOfFamilyId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#143a63]/30 rounded-lg focus:ring-2 focus:ring-[#143a63] bg-white"
                      >
                        <option value="">Select head of family</option>
                        {headsOfFamily.map(head => (
                          <option key={head.id} value={head.id}>
                            {`${head.firstName || ''} ${head.lastName || ''}`.trim() || 'Unnamed Head'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={member.lastName}
                        onChange={(e) => updateMember(member.id, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={member.firstName}
                        onChange={(e) => updateMember(member.id, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={member.middleName || ''}
                        onChange={(e) => updateMember(member.id, 'middleName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Suffix</label>
                      <select
                        value={member.suffix || ''}
                        onChange={(e) => updateMember(member.id, 'suffix', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      >
                        {SUFFIX_OPTIONS.map(s => <option key={s} value={s}>{s || 'None'}</option>)}
                      </select>
                    </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Birth Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={member.birthDate || ''}
                      onChange={(e) => updateMember(member.id, 'birthDate', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
                    <input
                      type="number"
                      value={member.age || ''}
                      onChange={(e) => updateMember(member.id, 'age', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      placeholder="Auto from DOB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sex <span className="text-red-500">*</span></label>
                    <select
                      value={member.gender}
                      onChange={(e) => updateMember(member.id, 'gender', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Civil Status <span className="text-red-500">*</span></label>
                    <select
                      value={member.civilStatus || ''}
                      onChange={(e) => updateMember(member.id, 'civilStatus', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    >
                      <option value="">Select</option>
                      {CIVIL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Relationship {!isHead && <span className="text-red-500">*</span>}</label>
                    <select
                      value={member.relationship}
                      onChange={(e) => updateMember(member.id, 'relationship', e.target.value)}
                      disabled={isHead}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63] disabled:bg-gray-100"
                    >
                      <option value="">Select</option>
                      {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">PhilSys Number</label>
                    <input
                      type="text"
                      value={member.philsysNumber || ''}
                      onChange={(e) => updateMember(member.id, 'philsysNumber', e.target.value)}
                      placeholder="National ID"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={member.contactNumber || ''}
                      onChange={(e) => updateMember(member.id, 'contactNumber', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    />
                  </div>
                  </div>
                </>
              )}

              {activeMemberTab === 'employment' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Employment Status <span className="text-red-500">*</span></label>
                    <select
                      value={member.employmentStatus}
                      onChange={(e) => updateMember(member.id, 'employmentStatus', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    >
                      <option value="">Select</option>
                      {EMPLOYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Occupation {(member.employmentStatus === 'Employed' || member.employmentStatus === 'Self-Employed') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={member.occupation || ''}
                      onChange={(e) => updateMember(member.id, 'occupation', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Income (₱)</label>
                    <input
                      type="number"
                      value={member.monthlyIncome || ''}
                      onChange={(e) => updateMember(member.id, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Income Source</label>
                    <select
                      value={member.incomeSource || ''}
                      onChange={(e) => updateMember(member.id, 'incomeSource', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                    >
                      <option value="">Select</option>
                      {INCOME_SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeMemberTab === 'health' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">PhilHealth Status</label>
                      <select
                        value={member.philHealthStatus || ''}
                        onChange={(e) => updateMember(member.id, 'philHealthStatus', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      >
                        {PHILHEALTH_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Disability Type</label>
                      <select
                        value={member.disabilityType || 'None'}
                        onChange={(e) => {
                          updateMember(member.id, 'disabilityType', e.target.value);
                          updateMember(member.id, 'hasDisability', e.target.value !== 'None');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      >
                        {DISABILITY_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {[
                      { field: 'isSoloParent', label: 'Solo Parent' },
                      { field: 'hasChronicIllness', label: 'Chronic Illness' },
                      ...(member.gender === 'Female' && member.age >= 15 && member.age <= 49 ? [
                        { field: 'isPregnant', label: 'Pregnant' },
                        { field: 'isLactating', label: 'Lactating' },
                      ] : []),
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={member[field as keyof HouseholdMember] as boolean || false}
                          onChange={(e) => updateMember(member.id, field as keyof HouseholdMember, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0a1c33] focus:ring-[#143a63]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  {/* Nutrition for children 0-5 or pregnant */}
                  {(member.age <= 5 || member.isPregnant) && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-3">Nutrition Assessment</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={member.weight || ''}
                            onChange={(e) => updateMember(member.id, 'weight', parseFloat(e.target.value) || undefined)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={member.height || ''}
                            onChange={(e) => updateMember(member.id, 'height', parseFloat(e.target.value) || undefined)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">BMI</label>
                          <input
                            type="text"
                            value={member.bmi || '-'}
                            disabled
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Nutritional Status</label>
                          <select
                            value={member.nutritionalStatus || ''}
                            onChange={(e) => updateMember(member.id, 'nutritionalStatus', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                          >
                            <option value="">Select</option>
                            {NUTRITIONAL_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMemberTab === 'education' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Educational Attainment</label>
                      <select
                        value={member.educationLevel}
                        onChange={(e) => updateMember(member.id, 'educationLevel', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      >
                        <option value="">Select</option>
                        {EDUCATION_LEVEL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Literacy Status</label>
                      <select
                        value={member.literacyStatus || ''}
                        onChange={(e) => updateMember(member.id, 'literacyStatus', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                      >
                        {LITERACY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={member.isCurrentlyAttendingSchool || false}
                      onChange={(e) => updateMember(member.id, 'isCurrentlyAttendingSchool', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0a1c33] focus:ring-[#143a63]"
                    />
                    Currently Attending School
                  </label>

                  {member.isCurrentlyAttendingSchool && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#0a1c33]/5 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Grade Level</label>
                        <select
                          value={member.currentGradeLevel || ''}
                          onChange={(e) => updateMember(member.id, 'currentGradeLevel', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                        >
                          <option value="">Select</option>
                          {GRADE_LEVEL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">School Name</label>
                        <input
                          type="text"
                          value={member.schoolName || ''}
                          onChange={(e) => updateMember(member.id, 'schoolName', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">School Type</label>
                        <select
                          value={member.schoolType || ''}
                          onChange={(e) => updateMember(member.id, 'schoolType', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
                        >
                          <option value="">Select</option>
                          {SCHOOL_TYPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={member.isScholarshipRecipient || false}
                            onChange={(e) => updateMember(member.id, 'isScholarshipRecipient', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0a1c33] focus:ring-[#143a63]"
                          />
                          Scholarship Recipient
                        </label>
                      </div>
                    </div>
                  )}

                  {member.age >= 15 && member.age <= 30 && !member.isCurrentlyAttendingSchool && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <label className="flex items-center gap-2 text-sm text-amber-800">
                        <input
                          type="checkbox"
                          checked={member.isOutOfSchoolYouth || false}
                          onChange={(e) => updateMember(member.id, 'isOutOfSchoolYouth', e.target.checked)}
                          className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        Out-of-School Youth (OSY)
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Step 2: Head of Family
  const renderStep2 = () => {
    const heads = members.filter(m => m.relationship === 'Head');
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#0a1c33]" />
            Head of Family ({heads.length})
          </h3>
          <button
            onClick={addHeadOfFamily}
            className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0e2a4a] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Head of Family
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Enter the information for each head of family. A household can have multiple heads (e.g., extended families). Family members will be linked to their respective head.
        </p>

        <div className="space-y-3">
          {heads.map((member, index) => renderMemberCard(member, index))}
        </div>
      </div>
    );
  };

  // Render Step 3: Family Members
  const renderStep3 = () => {
    const familyMembers = members.filter(m => m.relationship !== 'Head');
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0a1c33]" />
            Family Members ({familyMembers.length})
          </h3>
          <button
            onClick={addMember}
            className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0e2a4a] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Add and manage family members. Click on a member to expand and use the tabs to fill in their details.
        </p>

        {familyMembers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No family members added yet</p>
            <button
              onClick={addMember}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0e2a4a] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Member
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map((member, index) => renderMemberCard(member, index))}
          </div>
        )}
      </div>
    );
  };

  // Render Step 4: Economic & Services
  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Housing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-[#0a1c33]" />
          Housing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Housing Type <span className="text-red-500">*</span>
            </label>
            <select
              value={economicData.housingType}
              onChange={(e) => setEconomicData({ ...economicData, housingType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">Select housing type</option>
              {HOUSING_TYPE_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Water Source</label>
            <select
              value={economicData.waterSource}
              onChange={(e) => setEconomicData({ ...economicData, waterSource: e.target.value as WaterSource })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">Select water source</option>
              {WATER_SOURCE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Income Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-600" />
          Income Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0a1c33]/5 rounded-lg">
            <p className="text-sm text-[#0a1c33] font-medium">Total Monthly Income</p>
            <p className="text-2xl font-bold text-[#0a1c33]">₱{totalIncome.toLocaleString()}</p>
            <p className="text-xs text-[#143a63] mt-1">From {totalMembers} members</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Expenditure (₱/month)</label>
            <input
              type="number"
              value={economicData.foodExpenditure || ''}
              onChange={(e) => setEconomicData({ ...economicData, foodExpenditure: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Non-Food Expenditure (₱/month)</label>
            <input
              type="number"
              value={economicData.nonFoodExpenditure || ''}
              onChange={(e) => setEconomicData({ ...economicData, nonFoodExpenditure: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            />
          </div>
          <div className={`p-4 rounded-lg ${
            povertyLevel === 'Subsistence Poor' ? 'bg-red-50' :
            povertyLevel === 'Poor' ? 'bg-amber-50' : 'bg-green-50'
          }`}>
            <p className="text-sm font-medium text-gray-600">Poverty Level</p>
            <p className={`text-xl font-bold ${
              povertyLevel === 'Subsistence Poor' ? 'text-red-700' :
              povertyLevel === 'Poor' ? 'text-amber-700' : 'text-green-700'
            }`}>{povertyLevel}</p>
            <p className="text-xs text-gray-500 mt-1">
              ₱{Math.round(totalIncome / Math.max(totalMembers, 1)).toLocaleString()}/capita
            </p>
          </div>
        </div>
      </div>

      {/* Basic Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Access to Basic Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'accessToWater', label: 'Potable Water', icon: Droplets, color: 'blue' },
            { key: 'accessToElectricity', label: 'Electricity', icon: Zap, color: 'amber' },
            { key: 'accessToInternet', label: 'Internet', icon: Wifi, color: 'purple' },
            { key: 'accessToHealthFacility', label: 'Health Facility', icon: Stethoscope, color: 'red' },
            { key: 'accessToSanitaryToilet', label: 'Sanitary Toilet', icon: Home, color: 'teal' },
            { key: 'accessToPublicTransportation', label: 'Public Transport', icon: Truck, color: 'gray' },
            { key: 'accessToWasteCollection', label: 'Waste Collection', icon: Trash2, color: 'green' },
            { key: 'healthInsurance', label: 'Health Insurance', icon: Heart, color: 'pink' },
          ].map(({ key, label, icon: Icon, color }) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                services[key as keyof typeof services]
                  ? `bg-${color}-50 border-${color}-300`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={services[key as keyof typeof services]}
                onChange={(e) => setServices({ ...services, [key]: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                services[key as keyof typeof services] ? `bg-${color}-100` : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${services[key as keyof typeof services] ? `text-${color}-600` : 'text-gray-400'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${services[key as keyof typeof services] ? 'text-gray-900' : 'text-gray-600'}`}>
                  {label}
                </p>
                <p className={`text-xs ${services[key as keyof typeof services] ? 'text-green-600' : 'text-gray-400'}`}>
                  {services[key as keyof typeof services] ? 'Yes' : 'No'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Step 5: Disaster Risk
  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Risk Levels */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Disaster Risk Assessment
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'floodRisk', label: 'Flood Risk', icon: Droplets, color: 'blue' },
            { key: 'landslideRisk', label: 'Landslide Risk', icon: AlertTriangle, color: 'orange' },
            { key: 'earthquakeRisk', label: 'Earthquake Risk', icon: AlertTriangle, color: 'red' },
            { key: 'fireRisk', label: 'Fire Risk', icon: AlertTriangle, color: 'rose' },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={disasterRisk[key as keyof DisasterRiskProfile]}
                onChange={(e) => setDisasterRisk({ ...disasterRisk, [key]: e.target.value as RiskLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Evacuation Readiness */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          Evacuation Readiness
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Evacuation Center</label>
            <select
              value={evacuationReadiness.nearestEvacuationCenter || ''}
              onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, nearestEvacuationCenter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">Select evacuation center</option>
              {evacuationCenters.filter(c => c.isActive).map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.barangay})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={evacuationReadiness.distanceToEvacuationCenter || ''}
              onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, distanceToEvacuationCenter: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#143a63]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'hasEmergencyKit', label: 'Has Emergency Kit (Go-Bag)' },
            { key: 'knowsEvacuationRoute', label: 'Knows Evacuation Route' },
            { key: 'hasEmergencyContact', label: 'Has Emergency Contact' },
            { key: 'hasEvacuationPlan', label: 'Has Evacuation Plan' },
            { key: 'registeredWithBarangay', label: 'Registered with Barangay DRRM' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={evacuationReadiness[key as keyof EvacuationReadiness] as boolean}
                onChange={(e) => setEvacuationReadiness({ ...evacuationReadiness, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Vulnerable Members Summary */}
      {vulnerableMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Vulnerable Members ({vulnerableMembers.length})
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vulnerableMembers.map(v => (
                <div key={v.id} className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    v.type === 'Elderly' ? 'bg-purple-100 text-purple-700' :
                    v.type === 'PWD' ? 'bg-[#0a1c33]/10 text-[#0a1c33]' :
                    v.type === 'Pregnant' ? 'bg-pink-100 text-pink-700' :
                    v.type === 'Infant' ? 'bg-yellow-100 text-yellow-700' :
                    v.type === 'OSY' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {v.type}
                  </span>
                  <span className="text-gray-700">{v.name}</span>
                  <span className="text-gray-400">({v.relationship}, {v.age} yrs)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Step 6: Review & Submit
  const renderStep6 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Check className="w-5 h-5 text-green-600" />
        Review & Submit
      </h3>

      {/* Household Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Household Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Barangay:</span> <span className="font-medium">{householdInfo.barangay}</span></div>
          <div><span className="text-gray-500">HH Number:</span> <span className="font-medium">{householdInfo.householdNumber}</span></div>
          <div><span className="text-gray-500">Purok/Sitio:</span> <span className="font-medium">{householdInfo.purokSitio || '-'}</span></div>
          <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{householdInfo.contactNumber || '-'}</span></div>
        </div>
      </div>

      {/* Members Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Members ({totalMembers})</h4>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="font-medium">{m.firstName} {m.lastName}</span>
                {m.relationship === 'Head' && <span className="ml-2 text-xs bg-[#0a1c33]/10 text-[#0a1c33] px-2 py-0.5 rounded">Head</span>}
              </div>
              <div className="text-gray-500">
                {m.age} yrs · {m.gender} · ₱{(m.monthlyIncome || 0).toLocaleString()}/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Economic Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Total Income:</span> <span className="font-medium">₱{totalIncome.toLocaleString()}/mo</span></div>
          <div><span className="text-gray-500">Poverty Level:</span> <span className={`font-medium ${
            povertyLevel === 'Subsistence Poor' ? 'text-red-600' : povertyLevel === 'Poor' ? 'text-amber-600' : 'text-green-600'
          }`}>{povertyLevel}</span></div>
          <div><span className="text-gray-500">Housing:</span> <span className="font-medium">{economicData.housingType || '-'}</span></div>
          <div><span className="text-gray-500">Water:</span> <span className="font-medium">{economicData.waterSource || '-'}</span></div>
        </div>
      </div>

      {/* Services Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Basic Services Access</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(services).map(([key, value]) => (
            <span
              key={key}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {key.replace('accessTo', '').replace(/([A-Z])/g, ' $1').trim()}: {value ? 'Yes' : 'No'}
            </span>
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Disaster Risk</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Flood:</span> <span className="font-medium">{disasterRisk.floodRisk}</span></div>
          <div><span className="text-gray-500">Landslide:</span> <span className="font-medium">{disasterRisk.landslideRisk}</span></div>
          <div><span className="text-gray-500">Earthquake:</span> <span className="font-medium">{disasterRisk.earthquakeRisk}</span></div>
          <div><span className="text-gray-500">Fire:</span> <span className="font-medium">{disasterRisk.fireRisk}</span></div>
        </div>
        {vulnerableMembers.length > 0 && (
          <p className="mt-2 text-sm text-red-600">
            {vulnerableMembers.length} vulnerable member(s) identified
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Collection</h1>
        <p className="text-gray-600 mt-1">Collect household information following CBMS guidelines</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.id
                      ? 'bg-[#143a63] text-white'
                      : currentStep > step.id
                      ? 'bg-[#c8a24b] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep === step.id ? 'text-[#0a1c33]' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-[#c8a24b]' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < 6 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#143a63] text-white rounded-lg hover:bg-[#0e2a4a] transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Household
          </button>
        )}
      </div>
    </div>
  );
}
