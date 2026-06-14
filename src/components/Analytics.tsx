import { useState } from 'react';
import { barangayData, TOTAL_HH, TOTAL_POOR, WATER_AVG, POWER_AVG } from '../data/mockData';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';

type TabType = 'overview' | 'barangays' | 'services' | 'vulnerability';

export function Analytics() {
  const { households } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'barangays' as TabType, label: 'Barangays' },
    { id: 'services' as TabType, label: 'Services' },
    { id: 'vulnerability' as TabType, label: 'Vulnerability' },
  ];

  // Service Access Analysis from barangayData
  const serviceAccessData = [
    {
      service: 'Water Access',
      city: WATER_AVG,
      target: 95,
    },
    {
      service: 'Electricity',
      city: POWER_AVG,
      target: 100,
    },
    {
      service: 'Health Ins.',
      city: households.length > 0 ? Math.round((households.filter(h => h.healthInsurance).length / households.length) * 100) : 72,
      target: 100,
    },
    {
      service: 'Internet',
      city: households.length > 0 ? Math.round((households.filter(h => h.accessToInternet).length / households.length) * 100) : 45,
      target: 80,
    },
  ];

  // Income Distribution from collected households
  const incomeRanges = [
    { range: '< ₱5,000', count: households.filter(h => h.monthlyIncome < 5000).length || 2, fill: '#dc2626' },
    { range: '₱5k-₱10k', count: households.filter(h => h.monthlyIncome >= 5000 && h.monthlyIncome < 10000).length || 5, fill: '#c8a24b' },
    { range: '₱10k-₱15k', count: households.filter(h => h.monthlyIncome >= 10000 && h.monthlyIncome < 15000).length || 3, fill: '#4a7c59' },
    { range: '> ₱15,000', count: households.filter(h => h.monthlyIncome >= 15000).length || 2, fill: '#143a63' },
  ];

  // Poverty rate by cluster
  const clusterData = ['Poblacion', 'Northwest', 'North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West']
    .map(cluster => {
      const brgys = barangayData.filter(b => b.cluster === cluster);
      const totalHH = brgys.reduce((s, b) => s + b.households, 0);
      const totalPoor = brgys.reduce((s, b) => s + b.poor, 0);
      return {
        cluster: cluster.length > 10 ? cluster.substring(0, 8) + '...' : cluster,
        fullName: cluster,
        rate: totalHH > 0 ? Math.round((totalPoor / totalHH) * 100) : 0,
        households: totalHH,
      };
    })
    .filter(c => c.households > 0);

  // Top 15 poorest barangays for detailed view
  const topPoorBarangays = [...barangayData]
    .sort((a, b) => (b.poor / b.households) - (a.poor / a.households))
    .slice(0, 15)
    .map(b => ({
      name: b.name.length > 12 ? b.name.substring(0, 12) + '...' : b.name,
      fullName: b.name,
      rate: Math.round((b.poor / b.households) * 100),
      water: b.water,
      power: b.power,
    }));

  // Vulnerability Analysis (simulated based on low water/power access)
  const vulnerabilityData = barangayData.map(b => {
    let risk = 'Low';
    if (b.water < 60 || b.power < 75 || (b.poor / b.households) > 0.4) risk = 'High';
    else if (b.water < 75 || b.power < 85 || (b.poor / b.households) > 0.3) risk = 'Medium';
    return { ...b, risk };
  });

  const vulnerabilitySummary = [
    { level: 'Low', count: vulnerabilityData.filter(b => b.risk === 'Low').length, fill: '#4a7c59' },
    { level: 'Medium', count: vulnerabilityData.filter(b => b.risk === 'Medium').length, fill: '#c8a24b' },
    { level: 'High', count: vulnerabilityData.filter(b => b.risk === 'High').length, fill: '#dc2626' },
  ];

  // Trend data (simulated)
  const trendData = [
    { year: '2019', poverty: 38, water: 62, power: 78 },
    { year: '2020', poverty: 36, water: 65, power: 80 },
    { year: '2021', poverty: 34, water: 68, power: 82 },
    { year: '2022', poverty: 32, water: 70, power: 84 },
    { year: '2023', poverty: 30, water: 72, power: 86 },
    { year: '2024', poverty: Math.round((TOTAL_POOR / TOTAL_HH) * 100), water: WATER_AVG, power: POWER_AVG },
  ];

  const COLORS = ['#4a7c59', '#c8a24b', '#dc2626'];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mb-6">
        <p className="eyebrow mb-2">Analytics · 2024 Cycle</p>
        <h2 className="text-xl md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
          Analytics & Insights
        </h2>
        <p className="text-sm text-[#143a63]/60 mt-1">Comprehensive analysis of DRHMMS data for San Jose City</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 md:mb-6 bg-[#f7f7f3] p-1 rounded-lg overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#143a63] text-white shadow-sm'
                : 'text-[#143a63]/70 hover:text-[#143a63] hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4 md:space-y-6">
          {/* Trend Analysis */}
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              Multi-Year Trend Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                <XAxis dataKey="year" fontSize={11} tick={{ fill: '#143a63' }} />
                <YAxis fontSize={11} tick={{ fill: '#143a63' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }}
                  formatter={(value: number) => `${value}%`}
                />
                <Legend />
                <Area type="monotone" dataKey="poverty" name="Poverty Rate" stroke="#c8a24b" fill="#c8a24b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="water" name="Water Access" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="power" name="Power Access" stroke="#4a7c59" fill="#4a7c59" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cluster Comparison */}
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              Poverty Rate by Cluster
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={clusterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                <XAxis dataKey="cluster" fontSize={10} tick={{ fill: '#143a63' }} angle={-45} textAnchor="end" height={70} />
                <YAxis fontSize={11} tick={{ fill: '#143a63' }} domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}%`, 'Poverty Rate']}
                />
                <Bar dataKey="rate" fill="#c8a24b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Barangays Tab */}
      {activeTab === 'barangays' && (
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              Top 15 Priority Barangays
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topPoorBarangays} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" horizontal={true} vertical={false} />
                <XAxis type="number" fontSize={11} tick={{ fill: '#143a63' }} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={90} fontSize={10} tick={{ fill: '#143a63' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}%`, 'Poverty Rate']}
                />
                <Bar dataKey="rate" fill="#c8a24b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Barangay Details Table */}
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              All Barangays Data
            </h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full min-w-[700px]">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#e6e9ee]">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Barangay</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Cluster</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">HH</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Poor</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Rate</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Water</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase">Power</th>
                  </tr>
                </thead>
                <tbody>
                  {barangayData.map((b) => (
                    <tr key={b.id} className="border-b border-[#e6e9ee] last:border-0 hover:bg-[#f7f7f3]">
                      <td className="py-2 px-3 text-sm text-[#0a1c33] font-medium">{b.name}</td>
                      <td className="py-2 px-3 text-sm text-[#143a63]/70">{b.cluster}</td>
                      <td className="py-2 px-3 text-right text-sm text-[#143a63]">{b.households}</td>
                      <td className="py-2 px-3 text-right text-sm text-[#143a63]">{b.poor}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          (b.poor / b.households) > 0.35 ? 'bg-red-100 text-red-700' :
                          (b.poor / b.households) > 0.25 ? 'bg-[#c8a24b]/20 text-[#8b6914]' :
                          'bg-[#4a7c59]/20 text-[#4a7c59]'
                        }`}>
                          {Math.round((b.poor / b.households) * 100)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-sm text-[#143a63]">{b.water}%</td>
                      <td className="py-2 px-3 text-right text-sm text-[#143a63]">{b.power}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Service Access vs Target */}
            <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Service Access vs Target
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={serviceAccessData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                  <XAxis dataKey="service" fontSize={10} tick={{ fill: '#143a63' }} />
                  <YAxis fontSize={11} tick={{ fill: '#143a63' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="city" name="Current" fill="#143a63" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#4a7c59" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Income Distribution */}
            <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Income Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={incomeRanges}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    nameKey="range"
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {incomeRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vulnerability Tab */}
      {activeTab === 'vulnerability' && (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Vulnerability Summary */}
            <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Risk Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={vulnerabilitySummary}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    nameKey="level"
                    label={({ level, count }) => `${level}: ${count}`}
                    labelLine={false}
                  >
                    {vulnerabilitySummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e6e9ee', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* High Risk List */}
            <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
              <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                High Risk Barangays
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {vulnerabilityData.filter(b => b.risk === 'High').map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-sm text-[#0a1c33]">{b.name}</p>
                      <p className="text-xs text-[#143a63]/60">{b.cluster}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{Math.round((b.poor / b.households) * 100)}%</p>
                      <p className="text-xs text-[#143a63]/60">poverty rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Findings - Always visible */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mt-4 md:mt-6">
        <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
          Key Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-[#143a63]/5 border-l-4 border-[#143a63] rounded-r-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-[#143a63] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-[#0a1c33] text-xs md:text-sm">Priority Areas</h4>
                <p className="text-[10px] md:text-xs text-[#143a63]/70 mt-1">
                  Northeast and East clusters show highest poverty rates.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-[#c8a24b]/10 border-l-4 border-[#c8a24b] rounded-r-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-[#c8a24b] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-[#0a1c33] text-xs md:text-sm">Risk Mitigation</h4>
                <p className="text-[10px] md:text-xs text-[#143a63]/70 mt-1">
                  {vulnerabilityData.filter(b => b.risk === 'High').length} barangays at high risk.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-[#4a7c59]/10 border-l-4 border-[#4a7c59] rounded-r-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#4a7c59] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-[#0a1c33] text-xs md:text-sm">Positive Trends</h4>
                <p className="text-[10px] md:text-xs text-[#143a63]/70 mt-1">
                  Poverty declined from 38% to {Math.round((TOTAL_POOR / TOTAL_HH) * 100)}%.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-semibold text-[#0a1c33] text-xs md:text-sm">Recommendation</h4>
                <p className="text-[10px] md:text-xs text-[#143a63]/70 mt-1">
                  Intensify PhilHealth enrollment in rural clusters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
