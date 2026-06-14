import { useState, useEffect, useMemo } from 'react';
import {
  Shield, Users, Home, AlertTriangle, Heart,
  Droplets, Mountain, Activity, FileText,
  Building2, Stethoscope, Wifi, Zap, Truck,
  GraduationCap, Baby, UserCheck, CircleAlert
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { barangayData, TOTAL_HH, TOTAL_POOR, TOTAL_POP } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleMapWrapper } from './gis/GoogleMapWrapper';
import { Household } from '../types/cbms';

// San Jose specific data for the Mayor dashboard
const SAN_JOSE_DATA = {
  totalPopulation: 124680,
  totalHouseholds: 28412,
  geotaggedHouseholds: 26870,
  geotaggedPercent: 94.6,
  highRiskHouseholds: 4218,
  highRiskPercent: 14.8,
  vulnerablePersons: 18334,
  barangayCount: 35,

  // Poverty data
  foodPoorHouseholds: 5171,
  foodPoorPercent: 18.2,
  belowPovertyLine: 7785,
  belowPovertyPercent: 27.4,
  nearPoorHouseholds: 9688,
  nearPoorPercent: 34.1,
  abovePovertyLine: 5768,
  abovePovertyPercent: 20.3,
  fourPsBeneficiaries: 6204,
  fourPsPercent: 21.8,

  // Disaster risk
  floodProneHH: 2541,
  landslideExposedHH: 847,
  earthquakeExposed: 18400,
  totalPopulationAtRisk: 31402,
  populationAtRiskPercent: 25.2,

  // Vulnerable sectors
  seniorCitizens: 7214,
  personsWithDisability: 3412,
  soloParents: 2088,
  children0to5: 4820,
  malnourishedChildren: 2168,
  outOfSchoolYouth: 1840,

  // Vulnerable at-risk overlap
  seniorsInFloodZones: 1042,
  pwdInHazardAreas: 614,
  childrenNearPoor: 2210,
  soloParentsFoodPoor: 780,
  pregnantInRiskZones: 324,
  osyNoAssistance: 1140,

  // Service coverage
  potableWaterAccess: 83,
  potableWaterHH: 23582,
  electricityCoverage: 91,
  electricityHH: 25855,
  internetConnectivity: 61,
  internetHH: 17331,
  sanitaryToiletAccess: 74,
  sanitaryToiletHH: 21025,
  healthFacilityAccess: 78,
  healthFacilityHH: 22161,
  publicTransportAccess: 58,
  publicTransportHH: 16479,
};

// Top 10 at-risk barangays
const atRiskBarangays = [
  { name: 'Ilog Malino', households: 612, risk: 'high' },
  { name: 'Sto. Tomas', households: 548, risk: 'high' },
  { name: 'Caanawan', households: 480, risk: 'medium' },
  { name: 'Gapan Road', households: 440, risk: 'medium' },
  { name: 'Poblacion', households: 410, risk: 'medium' },
  { name: 'Abar 2nd', households: 380, risk: 'medium' },
  { name: 'Rizal', households: 340, risk: 'low' },
  { name: 'San Isidro', households: 310, risk: 'low' },
  { name: 'Malapit', households: 275, risk: 'low' },
  { name: 'Pag-asa', households: 240, risk: 'low' },
];

// Beneficiary programs
const beneficiaryPrograms = [
  { name: '4Ps (Pantawid Pamilya)', count: 6204, status: 'Active' },
  { name: 'Senior citizen allowance', count: 5890, status: 'Active' },
  { name: 'PWD assistance', count: 2740, status: 'Active' },
  { name: 'Solo parent welfare', count: 1620, status: 'Active' },
  { name: 'Sustainable livelihood', count: 980, status: 'Ongoing' },
  { name: 'Educational scholarship', count: 724, status: 'Ongoing' },
  { name: 'Food / relief assistance', count: 2105, status: 'Critical' },
];

// Evacuation centers
const evacuationCenters = [
  { name: 'San Jose Municipal Gym', capacity: 72, status: 'Active' },
  { name: 'Brgy. Caanawan Elem. School', capacity: 45, status: 'Ready' },
  { name: 'Ilog-Malino Covered Court', capacity: 88, status: 'Near full' },
  { name: 'Poblacion Community Hall', capacity: 30, status: 'Ready' },
  { name: 'Sto. Domingo Brgy. Hall', capacity: 55, status: 'Active' },
];

// Public facilities
const publicFacilities = [
  { name: 'San Jose District Hospital', status: 'Operational', color: 'green' },
  { name: 'Municipal Health Office', status: 'Operational', color: 'green' },
  { name: 'Brgy. Ilog Malino Health Ctr.', status: 'Reduced hours', color: 'amber' },
  { name: 'San Jose Central School', status: 'Open', color: 'green' },
  { name: 'Caanawan Road Bridge', status: 'Flood-monitored', color: 'red' },
  { name: 'LGU San Jose Municipal Hall', status: 'Operational', color: 'green' },
  { name: 'Ilog Malino Water System', status: 'Under monitoring', color: 'amber' },
];

// Barangay density data for heatmap
const barangayDensity = [
  { name: 'Poblacion', density: 920 },
  { name: 'Caanawan', density: 840 },
  { name: 'Ilog Malino', density: 780 },
  { name: 'Sto. Tomas', density: 720 },
  { name: 'Abar 2nd', density: 680 },
  { name: 'Rizal', density: 640 },
  { name: 'San Isidro', density: 610 },
  { name: 'Malapit', density: 580 },
  { name: 'Pag-asa', density: 550 },
  { name: 'Gapan Rd', density: 510 },
  { name: 'Sto. Domingo', density: 490 },
  { name: 'Sta. Rosa', density: 470 },
  { name: 'San Roque', density: 440 },
  { name: 'San Juan', density: 420 },
  { name: 'Abar 1st', density: 400 },
  { name: 'Tagumpay', density: 380 },
  { name: 'Magsaysay', density: 360 },
  { name: 'Mabini', density: 340 },
  { name: 'Del Pilar', density: 320 },
  { name: 'Rizal II', density: 300 },
  { name: 'Bakod', density: 280 },
  { name: 'Bantug', density: 270 },
  { name: 'Calaocan', density: 260 },
  { name: 'Dimasalang', density: 250 },
  { name: 'Dungan', density: 240 },
  { name: 'Estrella', density: 230 },
  { name: 'Imelda', density: 220 },
  { name: 'Lagundi', density: 210 },
  { name: 'Lawang Kupang', density: 200 },
  { name: 'Malasin', density: 190 },
  { name: 'Mangga', density: 180 },
  { name: 'Manicla', density: 170 },
  { name: 'Marikit', density: 160 },
  { name: 'Minabuyoc', density: 150 },
  { name: 'San Pablo', density: 140 },
];

export function MayorDashboard() {
  const { households } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Chart data for at-risk barangays
  const riskChartData = atRiskBarangays.map(b => ({
    name: b.name,
    households: b.households,
    fill: b.risk === 'high' ? '#E24B4A' : b.risk === 'medium' ? '#EF9F27' : '#378ADD'
  }));

  // Vulnerable sector data for pie chart
  const vulnerableSectorData = [
    { name: 'Senior citizens', value: SAN_JOSE_DATA.seniorCitizens, color: '#378ADD' },
    { name: 'PWD', value: SAN_JOSE_DATA.personsWithDisability, color: '#534AB7' },
    { name: 'Solo parents', value: SAN_JOSE_DATA.soloParents, color: '#D85A30' },
    { name: 'Children 0-5', value: SAN_JOSE_DATA.children0to5, color: '#1D9E75' },
    { name: 'OSY', value: SAN_JOSE_DATA.outOfSchoolYouth, color: '#BA7517' },
  ];

  // Get density color
  const getDensityColor = (density: number) => {
    const maxDensity = 920;
    const ratio = density / maxDensity;
    const colors = ['#E1F5EE', '#9FE1CB', '#5DCAA5', '#1D9E75', '#0F6E56', '#085041'];
    const idx = Math.min(5, Math.floor(ratio * 6));
    return colors[idx];
  };

  const getDensityTextColor = (density: number) => {
    const maxDensity = 920;
    const ratio = density / maxDensity;
    return ratio >= 0.5 ? '#E1F5EE' : '#085041';
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Mayor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-dashed border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#085041] flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-[#9FE1CB]" />
          </div>
          <div>
            <h1 className="text-[15px] font-medium text-gray-900 leading-tight">
              San Jose Disaster Risk and Hazard Mapping Monitoring System
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">
              San Jose, Nueva Ecija · LGU Executive Dashboard · Office of the Mayor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[12px] text-gray-500">
            {formatDate(currentTime)} &nbsp;{formatTime(currentTime)}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E1F5EE] border border-[#5DCAA5] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            <span className="text-[11px] font-medium text-[#0F6E56]">Live</span>
          </div>
        </div>
      </div>

      {/* Section 1: Population & Household Overview */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          1 — Population & household overview
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Users className="w-3.5 h-3.5" />
              Total population
            </div>
            <p className="text-[22px] font-medium text-gray-900 leading-none">
              {SAN_JOSE_DATA.totalPopulation.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.barangayCount} barangays · +1.4% YoY
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Home className="w-3.5 h-3.5" />
              Total households
            </div>
            <p className="text-[22px] font-medium text-gray-900 leading-none">
              {SAN_JOSE_DATA.totalHouseholds.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Geotagged: {SAN_JOSE_DATA.geotaggedHouseholds.toLocaleString()} ({SAN_JOSE_DATA.geotaggedPercent}%)
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              High-risk households
            </div>
            <p className="text-[22px] font-medium text-[#A32D2D] leading-none">
              {SAN_JOSE_DATA.highRiskHouseholds.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.highRiskPercent}% of all households
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Heart className="w-3.5 h-3.5" />
              Vulnerable persons
            </div>
            <p className="text-[22px] font-medium text-[#854F0B] leading-none">
              {SAN_JOSE_DATA.vulnerablePersons.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Senior, PWD, solo parent
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Barangay Comparison Analytics */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          2 — Barangay comparison analytics
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
            <span>At-risk households per barangay — top 10</span>
          </div>
          <div className="flex flex-wrap gap-3 mb-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#E24B4A]" />
              High risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF9F27]" />
              Medium risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#378ADD]" />
              Lower risk
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={10}
                tick={{ fill: '#374151' }}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={10} tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [value.toLocaleString() + ' HH', 'At-risk']}
              />
              <Bar
                dataKey="households"
                radius={[3, 3, 0, 0]}
                fill="#378ADD"
              >
                {riskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3: Poverty Incidence Summary */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          3 — Poverty incidence summary
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              Food poor households
            </div>
            <p className="text-[22px] font-medium text-[#A32D2D] leading-none">
              {SAN_JOSE_DATA.foodPoorHouseholds.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.foodPoorPercent}% incidence
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              Below poverty line
            </div>
            <p className="text-[22px] font-medium text-[#854F0B] leading-none">
              {SAN_JOSE_DATA.belowPovertyLine.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.belowPovertyPercent}% of households
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              4Ps beneficiaries
            </div>
            <p className="text-[22px] font-medium text-[#185FA5] leading-none">
              {SAN_JOSE_DATA.fourPsBeneficiaries.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.fourPsPercent}% coverage
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-[13px] font-medium text-gray-900 mb-3">
            Poverty bracket distribution
          </div>

          {[
            { label: 'Food poor', percent: SAN_JOSE_DATA.foodPoorPercent, count: SAN_JOSE_DATA.foodPoorHouseholds, color: '#E24B4A', textColor: '#A32D2D' },
            { label: 'Below poverty line', percent: SAN_JOSE_DATA.belowPovertyPercent, count: SAN_JOSE_DATA.belowPovertyLine, color: '#EF9F27', textColor: '#854F0B' },
            { label: 'Near-poor / low income', percent: SAN_JOSE_DATA.nearPoorPercent, count: SAN_JOSE_DATA.nearPoorHouseholds, color: '#639922', textColor: '#3B6D11' },
            { label: 'Above poverty line', percent: SAN_JOSE_DATA.abovePovertyPercent, count: SAN_JOSE_DATA.abovePovertyLine, color: '#378ADD', textColor: '#185FA5' },
          ].map((item) => (
            <div key={item.label} className="mb-2">
              <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                <span>{item.label}</span>
                <span style={{ color: item.textColor }} className="font-medium">
                  {item.percent}% · {item.count.toLocaleString()} HH
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Disaster Risk Summary */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          4 — Disaster risk summary
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Droplets className="w-3.5 h-3.5" />
              Flood-prone HH
            </div>
            <p className="text-[22px] font-medium text-[#A32D2D] leading-none">
              {SAN_JOSE_DATA.floodProneHH.toLocaleString()}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 border border-red-200 rounded-full">
              High
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Mountain className="w-3.5 h-3.5" />
              Landslide-exposed HH
            </div>
            <p className="text-[22px] font-medium text-[#854F0B] leading-none">
              {SAN_JOSE_DATA.landslideExposedHH.toLocaleString()}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
              Medium
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Activity className="w-3.5 h-3.5" />
              Earthquake-exposed
            </div>
            <p className="text-[22px] font-medium text-[#854F0B] leading-none">
              {SAN_JOSE_DATA.earthquakeExposed.toLocaleString()}+
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
              Moderate
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Total population at risk
            </div>
            <p className="text-[22px] font-medium text-[#A32D2D] leading-none">
              {SAN_JOSE_DATA.totalPopulationAtRisk.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {SAN_JOSE_DATA.populationAtRiskPercent}% of population
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Vulnerable Sector Summary */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          5 — Vulnerable sector summary
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Sector headcount */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              <UserCheck className="w-4 h-4 text-gray-500" />
              Sector headcount
            </div>
            <div className="space-y-0">
              {[
                { label: 'Senior citizens', value: SAN_JOSE_DATA.seniorCitizens, color: '#185FA5' },
                { label: 'Persons w/ disability', value: SAN_JOSE_DATA.personsWithDisability, color: '#185FA5' },
                { label: 'Solo parents', value: SAN_JOSE_DATA.soloParents, color: '#185FA5' },
                { label: 'Children (0–5 yrs)', value: SAN_JOSE_DATA.children0to5, color: '#854F0B' },
                { label: 'Malnourished children', value: SAN_JOSE_DATA.malnourishedChildren, color: '#A32D2D' },
                { label: 'Out-of-school youth', value: SAN_JOSE_DATA.outOfSchoolYouth, color: '#854F0B' },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`flex justify-between items-center py-2 text-[12px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium" style={{ color: item.color }}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              Sector share of population
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={vulnerableSectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {vulnerableSectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), '']}
                  contentStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {vulnerableSectorData.map((item) => (
                <span key={item.name} className="flex items-center gap-1 text-[9px] text-gray-500">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* At-risk overlap */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              <CircleAlert className="w-4 h-4 text-gray-500" />
              Vulnerable at-risk overlap
            </div>
            <div className="space-y-0">
              {[
                { label: 'Seniors in flood zones', value: SAN_JOSE_DATA.seniorsInFloodZones, status: 'critical' },
                { label: 'PWD in hazard areas', value: SAN_JOSE_DATA.pwdInHazardAreas, status: 'critical' },
                { label: 'Children near-poor', value: SAN_JOSE_DATA.childrenNearPoor, status: 'warning' },
                { label: 'Solo parents food-poor', value: SAN_JOSE_DATA.soloParentsFoodPoor, status: 'warning' },
                { label: 'Pregnant in risk zones', value: SAN_JOSE_DATA.pregnantInRiskZones, status: 'warning' },
                { label: 'OSY with no assistance', value: SAN_JOSE_DATA.osyNoAssistance, status: 'critical' },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`flex justify-between items-center py-2 text-[12px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-gray-700">{item.label}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    item.status === 'critical'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: GIS Map & Heatmap */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          6 — Real-time GIS map & population density heatmap
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Hazard Map */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              City hazard map — San Jose, NE
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <GoogleMapWrapper
                households={households}
                selectedHousehold={selectedHousehold}
                onHouseholdSelect={setSelectedHousehold}
                showHouseholds={true}
                showFloodZones={true}
                showEvacuationCenters={true}
                height={220}
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High Risk
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Medium Risk
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Low Risk
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Evacuation Center
              </span>
            </div>
          </div>

          {/* Population Density Heatmap */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-1">
              Population density heatmap — by barangay
            </div>
            <p className="text-[10px] text-gray-500 mb-3">
              Each cell = 1 barangay · darker = higher density
            </p>
            <div className="grid grid-cols-7 gap-1">
              {barangayDensity.map((b) => (
                <div
                  key={b.name}
                  className="h-6 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  style={{
                    backgroundColor: getDensityColor(b.density),
                    color: getDensityTextColor(b.density)
                  }}
                  title={`${b.name}: ${b.density.toLocaleString()} persons/km²`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500">
              <span>Low</span>
              <div className="flex gap-0.5">
                {['#E1F5EE', '#9FE1CB', '#5DCAA5', '#1D9E75', '#0F6E56', '#085041'].map((color) => (
                  <div key={color} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Program Beneficiary Summary */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          7 — Program beneficiary summary
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              Beneficiaries per program
            </div>
            <div className="space-y-0">
              {beneficiaryPrograms.map((program, i, arr) => (
                <div
                  key={program.name}
                  className={`flex justify-between items-center py-2 text-[11px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-gray-700">{program.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#185FA5]">
                      {program.count.toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${
                      program.status === 'Active'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : program.status === 'Ongoing'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {program.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              Beneficiary distribution by barangay
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Poblacion', count: 1840 },
                  { name: 'Caanawan', count: 1560 },
                  { name: 'Ilog Malino', count: 1420 },
                  { name: 'Sto. Tomas', count: 1310 },
                  { name: 'Abar 2nd', count: 980 },
                  { name: 'Rizal', count: 870 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tick={{ fill: '#374151' }}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis fontSize={10} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Beneficiaries']}
                />
                <Bar dataKey="count" fill="#378ADD" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 8: Infrastructure Status */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          8 — Infrastructure status summary
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Evacuation Centers */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              <Building2 className="w-4 h-4 text-gray-500" />
              Evacuation centers
            </div>
            <div className="space-y-0">
              {evacuationCenters.map((center, i, arr) => (
                <div
                  key={center.name}
                  className={`flex justify-between items-center py-2 text-[11px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-gray-700">{center.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${center.capacity}%`,
                          backgroundColor: center.capacity >= 80 ? '#E24B4A' : center.capacity >= 50 ? '#EF9F27' : '#639922'
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-medium w-8"
                      style={{
                        color: center.capacity >= 80 ? '#A32D2D' : center.capacity >= 50 ? '#854F0B' : '#3B6D11'
                      }}
                    >
                      {center.capacity}%
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${
                      center.status === 'Ready'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : center.status === 'Active'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {center.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Facilities */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-3">
              <Stethoscope className="w-4 h-4 text-gray-500" />
              Public facilities status
            </div>
            <div className="space-y-0">
              {publicFacilities.map((facility, i, arr) => (
                <div
                  key={facility.name}
                  className={`flex justify-between items-center py-2 text-[11px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: facility.color === 'green' ? '#1D9E75' : facility.color === 'amber' ? '#EF9F27' : '#E24B4A'
                      }}
                    />
                    {facility.name}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${
                    facility.color === 'green'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : facility.color === 'amber'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {facility.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 9: Service Gap Indicators */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
          9 — Service gap indicators
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-gray-900 mb-4">
            Household coverage — basic services
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-3">
            {[
              { icon: Droplets, label: 'Potable water access', percent: SAN_JOSE_DATA.potableWaterAccess, count: SAN_JOSE_DATA.potableWaterHH, color: '#1D9E75', iconColor: '#378ADD' },
              { icon: Zap, label: 'Electricity coverage', percent: SAN_JOSE_DATA.electricityCoverage, count: SAN_JOSE_DATA.electricityHH, color: '#639922', iconColor: '#EF9F27' },
              { icon: Wifi, label: 'Internet connectivity', percent: SAN_JOSE_DATA.internetConnectivity, count: SAN_JOSE_DATA.internetHH, color: '#EF9F27', iconColor: '#5DCAA5' },
              { icon: Home, label: 'Sanitary toilet access', percent: SAN_JOSE_DATA.sanitaryToiletAccess, count: SAN_JOSE_DATA.sanitaryToiletHH, color: '#BA7517', iconColor: '#888780' },
              { icon: Stethoscope, label: 'Health facility access', percent: SAN_JOSE_DATA.healthFacilityAccess, count: SAN_JOSE_DATA.healthFacilityHH, color: '#378ADD', iconColor: '#E24B4A' },
              { icon: Truck, label: 'Public transport access', percent: SAN_JOSE_DATA.publicTransportAccess, count: SAN_JOSE_DATA.publicTransportHH, color: '#E24B4A', iconColor: '#888780' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span className="flex items-center gap-1.5">
                    <item.icon className="w-3 h-3" style={{ color: item.iconColor }} />
                    {item.label}
                  </span>
                  <span style={{ color: item.color }} className="font-medium">
                    {item.percent}% · {item.count.toLocaleString()} HH
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
            <CircleAlert className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500">
              Service gaps are highest in Ilog Malino, Caanawan, and Gapan Road barangays. Internet and transport coverage require priority attention.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
        <p className="text-[10px] text-gray-500">
          DRMS Live Database · MDRRMO & MSWD San Jose, NE · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <button className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          Export executive report
        </button>
      </div>
    </div>
  );
}
