import { useState, useMemo } from 'react';
import { Download, AlertTriangle, Droplets, Mountain, Flame, Building2, Heart, Users, GraduationCap, Stethoscope, Home, Briefcase, UserCheck, ShieldAlert, Baby, Zap, Wifi, ShieldCheck } from 'lucide-react';
import { barangayData, TOTAL_HH, TOTAL_POOR, TOTAL_POP } from '../data/mockData';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleMapWrapper } from './gis/GoogleMapWrapper';
import { Household } from '../types/cbms';


// Sparkline Component
function Sparkline({ color = '#143a63' }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 32" className="w-20 h-8">
      <path
        d="M0,24 L10,20 L20,22 L30,16 L40,18 L50,12 L60,14 L70,8 L80,10"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Dashboard() {
  const { households, riskZones, evacuationCenters, socialPrograms, enrollments } = useData();
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // Disaster risk stats
  const disasterStats = useMemo(() => {
    const highRiskZones = riskZones.filter(z => z.riskLevel === 'High' || z.riskLevel === 'Very High');
    const totalAffectedHH = riskZones.reduce((sum, z) => sum + z.affectedHouseholds, 0);
    const floodAffected = riskZones.filter(z => z.type === 'flood').reduce((sum, z) => sum + z.affectedHouseholds, 0);
    const landslideAffected = riskZones.filter(z => z.type === 'landslide').reduce((sum, z) => sum + z.affectedHouseholds, 0);
    const fireAffected = riskZones.filter(z => z.type === 'fire').reduce((sum, z) => sum + z.affectedHouseholds, 0);
    const totalEvacCapacity = evacuationCenters.filter(c => c.isActive).reduce((sum, c) => sum + c.capacity, 0);

    return {
      highRiskZones: highRiskZones.length,
      totalRiskZones: riskZones.length,
      affectedHouseholds: totalAffectedHH,
      floodAffected,
      landslideAffected,
      fireAffected,
      evacuationCapacity: totalEvacCapacity,
      activeEvacCenters: evacuationCenters.filter(c => c.isActive).length,
    };
  }, [riskZones, evacuationCenters]);

  // Risk by type data for pie chart
  const riskByTypeData = [
    { name: 'Flood', value: disasterStats.floodAffected, color: '#3b82f6' },
    { name: 'Landslide', value: disasterStats.landslideAffected, color: '#ea580c' },
    { name: 'Fire', value: disasterStats.fireAffected, color: '#dc2626' },
  ];

  // Vulnerability data for bar chart
  const vulnerabilityData = [
    { level: 'High', count: households.filter(h => h.disasterVulnerability === 'High').length },
    { level: 'Medium', count: households.filter(h => h.disasterVulnerability === 'Medium').length },
    { level: 'Low', count: households.filter(h => h.disasterVulnerability === 'Low').length },
  ];

  // Beneficiary program data
  const programStats = useMemo(() => {
    const activeEnrollments = enrollments.filter(e => e.status === 'Active' || e.status === 'Approved');

    return socialPrograms.map(program => {
      const programEnrollments = activeEnrollments.filter(e => e.programId === program.id);
      return {
        id: program.id,
        name: program.name.length > 25 ? program.name.substring(0, 25) + '...' : program.name,
        fullName: program.name,
        agency: program.agency,
        enrolled: programEnrollments.length,
        // Simulate some target numbers for display
        target: Math.floor(Math.random() * 500) + 100,
      };
    });
  }, [socialPrograms, enrollments]);

  const totalBeneficiaries = enrollments.filter(e => e.status === 'Active' || e.status === 'Approved').length;
  const totalPrograms = socialPrograms.filter(p => p.isActive).length;

  // Basic Services Stats
  const basicServicesStats = useMemo(() => {
    const total = households.length || 1;
    const withWater = households.filter(h => h.accessToWater).length;
    const withElectricity = households.filter(h => h.accessToElectricity).length;
    const withInternet = households.filter(h => h.accessToInternet).length;
    const withHealthInsurance = households.filter(h => h.healthInsurance).length;

    return {
      water: { count: withWater, percent: Math.round((withWater / total) * 100) },
      electricity: { count: withElectricity, percent: Math.round((withElectricity / total) * 100) },
      internet: { count: withInternet, percent: Math.round((withInternet / total) * 100) },
      healthInsurance: { count: withHealthInsurance, percent: Math.round((withHealthInsurance / total) * 100) },
      total,
    };
  }, [households]);

  // Program icons mapping
  const programIcons: Record<string, React.ElementType> = {
    'sp-1': Users, // 4Ps
    'sp-2': UserCheck, // Senior Citizens
    'sp-3': Heart, // AICS
    'sp-4': Stethoscope, // PhilHealth
    'sp-5': GraduationCap, // Educational
    'sp-6': Briefcase, // Livelihood
    'sp-7': Home, // PWD
    'sp-8': ShieldAlert, // Disaster Risk
    'sp-9': Baby, // Maternal
  };

  // Colors for programs
  const programColors = ['#143a63', '#4a7c59', '#c8a24b', '#b0263c', '#6366f1', '#0891b2', '#be185d', '#ea580c', '#16a34a'];

  const totalHouseholds = TOTAL_HH + households.length;
  const poorHouseholds = households.filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor').length;
  const totalPoor = TOTAL_POOR + poorHouseholds;
  const totalPopulation = TOTAL_POP;
  const povertyRate = ((totalPoor / totalHouseholds) * 100).toFixed(1);

  // Get top 10 poorest barangays
  const topPoorBarangays = [...barangayData]
    .sort((a, b) => (b.poor / b.households) - (a.poor / a.households))
    .slice(0, 10)
    .map(b => ({
      name: b.name.length > 15 ? b.name.substring(0, 15) + '...' : b.name,
      fullName: b.name,
      Poor: b.poor,
      'Non-Poor': b.households - b.poor,
      rate: ((b.poor / b.households) * 100).toFixed(1),
    }));

  const povertyDistribution = [
    { name: 'Non-Poor', value: totalHouseholds - totalPoor },
    { name: 'Poor', value: totalPoor },
  ];

  const COLORS = ['#4a7c59', '#c8a24b'];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <p className="eyebrow mb-1 md:mb-2">Dashboard · 2024 Cycle</p>
        <h1
          className="text-xl md:text-[32px] font-semibold tracking-[-0.01em] text-[#0a1626]"
          style={{ fontFamily: 'Source Serif 4' }}
        >
          City Overview
        </h1>
        <p className="text-xs md:text-[14px] text-[#5b6779] mt-1">
          Last updated <span className="text-[#0a1626] font-medium">Feb 12, 2024</span> · Coverage <span className="text-[#0a1626] font-medium">96.5%</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
          <button className="btn btn-ghost btn-sm text-xs md:text-sm">
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Export</span> PDF
          </button>
          <button className="btn btn-primary btn-sm text-xs md:text-sm">
            Submit to PSA
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {[
          {
            label: 'Households',
            fullLabel: 'Total Households',
            value: totalHouseholds.toLocaleString(),
            subtitle: 'Surveyed',
            color: '#143a63',
          },
          {
            label: 'Population',
            fullLabel: 'Total Population',
            value: totalPopulation.toLocaleString(),
            subtitle: `${barangayData.length} barangays`,
            color: '#4a7c59',
          },
          {
            label: 'Poverty',
            fullLabel: 'Poverty Incidence',
            value: `${povertyRate}%`,
            subtitle: `${totalPoor.toLocaleString()} poor`,
            color: '#b0263c',
          },
          {
            label: 'High Risk',
            fullLabel: 'High Risk Areas',
            value: '12',
            subtitle: '32% of brgy',
            color: '#c8a24b',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
            <p className="text-[10px] md:text-[11px] font-semibold text-[#5b6779] uppercase tracking-[0.08em] truncate">
              <span className="md:hidden">{stat.label}</span>
              <span className="hidden md:inline">{stat.fullLabel}</span>
            </p>
            <div className="flex items-end justify-between mt-1 md:mt-2">
              <p
                className="text-xl md:text-[32px] font-semibold tracking-[-0.02em] leading-none"
                style={{ fontFamily: 'Source Serif 4', color: stat.color, fontVariantNumeric: 'tabular-nums' }}
              >
                {stat.value}
              </p>
              <div className="hidden sm:block">
                <Sparkline color={stat.color} />
              </div>
            </div>
            <p className="text-[10px] md:text-[12px] text-[#5b6779] mt-2 md:mt-3 truncate">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Map + Ranking Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Map */}
        <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
          <p className="eyebrow mb-0.5 md:mb-1">Geographic View</p>
          <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
            Household Locations
          </h3>
          <div className="border border-[#e6e9ee] rounded overflow-hidden">
            <GoogleMapWrapper
              households={households}
              selectedHousehold={selectedHousehold}
              onHouseholdSelect={setSelectedHousehold}
              showHouseholds={true}
              showFloodZones={true}
              showEvacuationCenters={true}
              height={400}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Medium Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Low Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Evacuation Center
            </span>
          </div>
        </div>

        {/* Barangay Ranking */}
        <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
          <p className="eyebrow mb-0.5 md:mb-1">Barangay Ranking</p>
          <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626] mb-0.5 md:mb-1" style={{ fontFamily: 'Source Serif 4' }}>
            Top 10 Priority Barangays
          </h3>
          <p className="text-xs md:text-[13px] text-[#5b6779] mb-3 md:mb-4">Ranked by poverty rate</p>
          <div className="space-y-0 border border-[#e6e9ee] rounded overflow-hidden max-h-[350px] md:max-h-[400px] overflow-y-auto">
            {topPoorBarangays.map((b, i) => {
              const rate = parseFloat(b.rate);
              return (
                <div key={b.fullName} className={`flex items-center gap-2 md:gap-3 py-2 md:py-3 px-2 md:px-4 ${i < 9 ? 'border-b border-[#e6e9ee]' : ''} hover:bg-[#f7f7f3] transition-colors`}>
                  <div
                    className="w-6 h-6 md:w-[28px] md:h-[28px] bg-[#0a1c33] text-[#fbb831] flex items-center justify-center text-[11px] md:text-[13px] font-bold rounded-sm flex-shrink-0"
                    style={{ fontFamily: 'Source Serif 4' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs md:text-[14px] text-[#0a1626] truncate">{b.fullName}</div>
                    <div className="text-[10px] md:text-[11px] text-[#5b6779]">
                      {b.Poor} of {b.Poor + b['Non-Poor']} HH
                    </div>
                  </div>
                  <div
                    className="text-sm md:text-[18px] font-semibold tabular-nums flex-shrink-0"
                    style={{
                      fontFamily: 'Source Serif 4',
                      color: rate > 40 ? '#b0263c' : rate > 30 ? '#b6791a' : '#1f7a4d'
                    }}
                  >
                    {b.rate}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 md:mb-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
          <p className="eyebrow mb-0.5 md:mb-1">Household Distribution</p>
          <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
            Poor vs Non-Poor Households
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPoorBarangays} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" horizontal={true} vertical={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5b6779' }} />
              <YAxis type="category" dataKey="name" width={100} fontSize={11} tick={{ fill: '#0a1626' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e6e9ee',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(10, 22, 38, 0.1)'
                }}
                formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              />
              <Legend />
              <Bar dataKey="Poor" fill="#c8a24b" radius={[0, 4, 4, 0]} stackId="stack" />
              <Bar dataKey="Non-Poor" fill="#4a7c59" radius={[0, 4, 4, 0]} stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
          <p className="eyebrow mb-0.5 md:mb-1">Distribution</p>
          <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
            Overall Poverty
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={povertyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {povertyDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '6px' }}
                formatter={(value: number) => value.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disaster Risk Summary */}
      <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
          <div>
            <p className="eyebrow mb-0.5 md:mb-1">Disaster Risk Monitoring</p>
            <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626]" style={{ fontFamily: 'Source Serif 4' }}>
              Risk Assessment Summary
            </h3>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-amber-50 border border-amber-200 rounded-lg self-start">
            <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
            <span className="text-xs md:text-sm font-medium text-amber-700">
              {disasterStats.highRiskZones} High Risk Zones
            </span>
          </div>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-blue-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {disasterStats.floodAffected.toLocaleString()}
                </p>
                <p className="text-[10px] md:text-xs text-blue-600 truncate">Flood Risk HH</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg border border-orange-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <Mountain className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-orange-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {disasterStats.landslideAffected.toLocaleString()}
                </p>
                <p className="text-[10px] md:text-xs text-orange-600 truncate">Landslide HH</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg border border-red-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-red-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {disasterStats.fireAffected.toLocaleString()}
                </p>
                <p className="text-[10px] md:text-xs text-red-600 truncate">Fire Risk HH</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg border border-green-100 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-green-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {disasterStats.evacuationCapacity.toLocaleString()}
                </p>
                <p className="text-[10px] md:text-xs text-green-600 truncate">Evac Capacity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Risk by Type Pie Chart */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="eyebrow mb-0.5 md:mb-1">Risk Distribution</p>
            <h4 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3" style={{ fontFamily: 'Source Serif 4' }}>
              Affected HH by Risk Type
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={riskByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="eyebrow mb-0.5 md:mb-1">Household Assessment</p>
            <h4 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3" style={{ fontFamily: 'Source Serif 4' }}>
              Vulnerability Levels
            </h4>
            <ResponsiveContainer width="100%" height={220}>
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
      </div>

      {/* Beneficiaries & Social Programs */}
      <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
          <div>
            <p className="eyebrow mb-0.5 md:mb-1">Social Protection</p>
            <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626]" style={{ fontFamily: 'Source Serif 4' }}>
              Beneficiaries & Social Programs
            </h3>
          </div>
          <div className="flex items-center gap-3 self-start">
            <div className="text-center px-3 py-1.5 bg-[#143a63]/10 rounded-lg">
              <p className="text-lg md:text-xl font-bold text-[#143a63]" style={{ fontFamily: 'Source Serif 4' }}>{totalPrograms}</p>
              <p className="text-[10px] text-[#143a63]/70">Programs</p>
            </div>
            <div className="text-center px-3 py-1.5 bg-[#4a7c59]/10 rounded-lg">
              <p className="text-lg md:text-xl font-bold text-[#4a7c59]" style={{ fontFamily: 'Source Serif 4' }}>{totalBeneficiaries}</p>
              <p className="text-[10px] text-[#4a7c59]/70">Enrolled</p>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {socialPrograms.slice(0, 9).map((program, index) => {
            const Icon = programIcons[program.id] || Heart;
            const enrolled = enrollments.filter(e => e.programId === program.id && (e.status === 'Active' || e.status === 'Approved')).length;
            const color = programColors[index % programColors.length];

            return (
              <div
                key={program.id}
                className="p-3 md:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#0a1626] truncate" title={program.name}>
                      {program.name.length > 30 ? program.name.substring(0, 30) + '...' : program.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{program.agency}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'Source Serif 4', color }}>
                      {enrolled}
                    </p>
                    <p className="text-[10px] text-gray-500">Beneficiaries</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    program.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {program.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Program Distribution Chart */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="eyebrow mb-0.5 md:mb-1">Distribution</p>
          <h4 className="text-sm md:text-base font-semibold text-[#0a1626] mb-4" style={{ fontFamily: 'Source Serif 4' }}>
            Beneficiaries by Program
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={programStats.slice(0, 6)}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" horizontal={true} vertical={false} />
              <XAxis type="number" fontSize={11} tick={{ fill: '#5b6779' }} />
              <YAxis type="category" dataKey="name" width={140} fontSize={11} tick={{ fill: '#0a1626' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '6px' }}
                formatter={(value: number, name: string) => [value.toLocaleString(), name === 'enrolled' ? 'Enrolled' : name]}
              />
              <Bar dataKey="enrolled" fill="#143a63" radius={[0, 4, 4, 0]} name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e6e9ee] text-center">
          <p className="text-[12px] text-[#5b6779]">
            Showing {Math.min(9, socialPrograms.length)} of {socialPrograms.length} programs. View all in Beneficiaries.
          </p>
        </div>
      </div>

      {/* Access to Basic Services */}
      <div className="bg-white rounded-md border border-[#e6e9ee] p-3 md:p-5 mt-4 md:mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
          <div>
            <p className="eyebrow mb-0.5 md:mb-1">Infrastructure</p>
            <h3 className="text-base md:text-[18px] font-semibold text-[#0a1626]" style={{ fontFamily: 'Source Serif 4' }}>
              Access to Basic Services
            </h3>
          </div>
          <p className="text-xs text-[#5b6779]">
            Based on <span className="font-medium text-[#0a1626]">{basicServicesStats.total}</span> surveyed households
          </p>
        </div>

        {/* Services Grid with Visual Progress */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Water Access */}
          <div className="relative p-4 md:p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                <Droplets className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-blue-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {basicServicesStats.water.percent}%
                </p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-blue-900">Safe Water</h4>
            <p className="text-[10px] md:text-xs text-blue-600 mt-0.5">{basicServicesStats.water.count.toLocaleString()} households</p>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${basicServicesStats.water.percent}%` }}
              />
            </div>
          </div>

          {/* Electricity Access */}
          <div className="relative p-4 md:p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-amber-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {basicServicesStats.electricity.percent}%
                </p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-amber-900">Electricity</h4>
            <p className="text-[10px] md:text-xs text-amber-600 mt-0.5">{basicServicesStats.electricity.count.toLocaleString()} households</p>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${basicServicesStats.electricity.percent}%` }}
              />
            </div>
          </div>

          {/* Internet Access */}
          <div className="relative p-4 md:p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                <Wifi className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-purple-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {basicServicesStats.internet.percent}%
                </p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-purple-900">Internet</h4>
            <p className="text-[10px] md:text-xs text-purple-600 mt-0.5">{basicServicesStats.internet.count.toLocaleString()} households</p>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${basicServicesStats.internet.percent}%` }}
              />
            </div>
          </div>

          {/* Health Insurance */}
          <div className="relative p-4 md:p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-green-700" style={{ fontFamily: 'Source Serif 4' }}>
                  {basicServicesStats.healthInsurance.percent}%
                </p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-green-900">PhilHealth</h4>
            <p className="text-[10px] md:text-xs text-green-600 mt-0.5">{basicServicesStats.healthInsurance.count.toLocaleString()} households</p>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-green-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${basicServicesStats.healthInsurance.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
