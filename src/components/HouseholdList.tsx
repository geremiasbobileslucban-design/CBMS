import { useState } from 'react';
import { Search, Filter, Download, Trash2, Eye, FileSpreadsheet, FileText, Users, X, Map, List } from 'lucide-react';
import { toast } from "sonner";
import { barangays } from '../data/mockData';
import { useData } from '../context/DataContext';
import { Household } from '../types/cbms';
import { GoogleMapWrapper } from './gis/GoogleMapWrapper';
import { GOOGLE_MAPS_CONFIG } from '../config/maps';

export function HouseholdList() {
  const { households, deleteHousehold } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('');
  const [filterPoverty, setFilterPoverty] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const filteredHouseholds = households.filter((household) => {
    const matchesSearch =
      household.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
      household.householdNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBarangay = !filterBarangay || household.barangay === filterBarangay;
    const matchesPoverty = !filterPoverty || household.povertyLevel === filterPoverty;

    return matchesSearch && matchesBarangay && matchesPoverty;
  });

  const exportToCSV = () => {
    if (filteredHouseholds.length === 0) {
      toast.error("No data to export", {
        description: "Please ensure there are households to export."
      });
      return;
    }

    // CSV Headers
    const headers = [
      'Household Number',
      'Barangay',
      'Head of Family',
      'Total Members',
      'Monthly Income',
      'Employment Status',
      'Housing Type',
      'Education Level',
      'Water Access',
      'Electricity Access',
      'Internet Access',
      'Health Insurance',
      'Disaster Vulnerability',
      'Poverty Level',
      'Date Collected'
    ];

    // CSV Data
    const csvData = filteredHouseholds.map(h => [
      h.householdNumber,
      h.barangay,
      h.headOfFamily,
      h.totalMembers,
      h.monthlyIncome,
      h.employmentStatus,
      h.housingType,
      h.educationLevel,
      h.accessToWater ? 'Yes' : 'No',
      h.accessToElectricity ? 'Yes' : 'No',
      h.accessToInternet ? 'Yes' : 'No',
      h.healthInsurance ? 'Yes' : 'No',
      h.disasterVulnerability,
      h.povertyLevel,
      h.dateCollected
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `CBMS_Households_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data exported successfully", {
      description: `${filteredHouseholds.length} household records exported to CSV.`
    });
  };

  const exportToPDF = () => {
    if (filteredHouseholds.length === 0) {
      toast.error("No data to export", {
        description: "Please ensure there are households to export."
      });
      return;
    }

    // Create PDF-style HTML content with civic theme
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CBMS Household Data Report - San Jose City</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f7f7f3; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
          h1 { color: #0a1c33; text-align: center; font-size: 24px; margin-bottom: 5px; }
          h2 { color: #143a63; text-align: center; font-size: 18px; font-weight: normal; margin-top: 0; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #c8a24b; }
          .republic-bar { background: #0a1c33; color: white; text-align: center; padding: 8px; font-size: 11px; margin: -30px -30px 20px -30px; border-radius: 8px 8px 0 0; }
          .republic-bar span { color: #c8a24b; }
          .meta { color: #143a63; font-size: 13px; margin-top: 15px; }
          .meta p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background-color: #143a63; color: white; padding: 10px 8px; text-align: left; font-weight: 600; }
          td { padding: 8px; border-bottom: 1px solid #e6e9ee; color: #0a1c33; }
          tr:hover { background-color: #f7f7f3; }
          .poverty-poor { background-color: #f7f7f3; color: #8b6914; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .poverty-subsistence { background-color: #fecaca; color: #991b1b; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .poverty-nonpoor { background-color: #cfe6da; color: #4a7c59; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .risk-high { background-color: #fecaca; color: #991b1b; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .risk-medium { background-color: #f7f7f3; color: #8b6914; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .risk-low { background-color: #cfe6da; color: #4a7c59; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e6e9ee; font-size: 11px; color: #143a63; text-align: center; }
          .footer p { margin: 3px 0; }
          .summary { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
          .summary-item { background: #f7f7f3; padding: 15px 25px; border-radius: 8px; text-align: center; }
          .summary-item .value { font-size: 24px; font-weight: bold; color: #143a63; }
          .summary-item .label { font-size: 11px; color: #143a63; opacity: 0.7; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="republic-bar">
            Republic of the Philippines · <span>Philippine Statistics Authority</span> · <span>CBMS</span>
          </div>

          <div class="header">
            <h1>Community-Based Monitoring System</h1>
            <h2>Household Data Report - San Jose City, Nueva Ecija</h2>
            <div class="meta">
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Records:</strong> ${filteredHouseholds.length} households</p>
              ${filterBarangay ? `<p><strong>Barangay Filter:</strong> ${filterBarangay}</p>` : ''}
              ${filterPoverty ? `<p><strong>Poverty Level Filter:</strong> ${filterPoverty}</p>` : ''}
            </div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="value">${filteredHouseholds.length}</div>
              <div class="label">Total Households</div>
            </div>
            <div class="summary-item">
              <div class="value">${filteredHouseholds.filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor').length}</div>
              <div class="label">Poor Households</div>
            </div>
            <div class="summary-item">
              <div class="value">${filteredHouseholds.filter(h => h.disasterVulnerability === 'High').length}</div>
              <div class="label">High Risk</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>HH Number</th>
                <th>Head of Family</th>
                <th>Barangay</th>
                <th>Members</th>
                <th>Income</th>
                <th>Poverty Level</th>
                <th>Employment</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              ${filteredHouseholds.map(h => `
                <tr>
                  <td style="font-family: monospace;">${h.householdNumber}</td>
                  <td>${h.headOfFamily}</td>
                  <td>${h.barangay}</td>
                  <td style="text-align: center;">${h.totalMembers}</td>
                  <td style="text-align: right;">₱${h.monthlyIncome.toLocaleString()}</td>
                  <td>
                    <span class="poverty-${h.povertyLevel === 'Poor' ? 'poor' : h.povertyLevel === 'Subsistence Poor' ? 'subsistence' : 'nonpoor'}">
                      ${h.povertyLevel}
                    </span>
                  </td>
                  <td>${h.employmentStatus}</td>
                  <td>
                    <span class="risk-${h.disasterVulnerability.toLowerCase()}">
                      ${h.disasterVulnerability}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Philippine Statistics Authority</strong> - San Jose City Local Government Unit</p>
            <p>Community-Based Monitoring System (CBMS) under RA 11315</p>
            <p style="color: #c8a24b;">This report contains confidential information protected under RA 10173 (Data Privacy Act)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `CBMS_Households_Report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report generated successfully", {
      description: `HTML report created. Open in browser and use Print > Save as PDF.`
    });
  };

  const handleDelete = (id: string, householdNumber: string) => {
    if (confirm(`Are you sure you want to delete household ${householdNumber}?`)) {
      deleteHousehold(id);
      toast.success("Household deleted", {
        description: `Household ${householdNumber} has been removed from the database.`
      });
    }
  };

  const handleViewDetails = (household: Household) => {
    setSelectedHousehold(household);
    setShowViewModal(true);
  };

  // Summary stats
  const poorCount = filteredHouseholds.filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor').length;
  const highRiskCount = filteredHouseholds.filter(h => h.disasterVulnerability === 'High').length;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Page Title */}
      <div className="mb-6">
        <p className="eyebrow mb-2">Database · {filteredHouseholds.length} Records</p>
        <h2 className="text-xl md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
          Household Database
        </h2>
        <p className="text-sm text-[#143a63]/60 mt-1">Browse, search, and manage collected household data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-4">
          <p className="text-[10px] md:text-xs text-[#143a63]/60 uppercase tracking-wide">Records</p>
          <p className="text-lg md:text-2xl font-bold text-[#143a63] mt-0.5 md:mt-1">{filteredHouseholds.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-4">
          <p className="text-[10px] md:text-xs text-[#143a63]/60 uppercase tracking-wide">Poor</p>
          <p className="text-lg md:text-2xl font-bold text-[#c8a24b] mt-0.5 md:mt-1">{poorCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-4">
          <p className="text-[10px] md:text-xs text-[#143a63]/60 uppercase tracking-wide">High Risk</p>
          <p className="text-lg md:text-2xl font-bold text-[#8b4513] mt-0.5 md:mt-1">{highRiskCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-4">
          <p className="text-[10px] md:text-xs text-[#143a63]/60 uppercase tracking-wide">Non-Poor</p>
          <p className="text-lg md:text-2xl font-bold text-[#4a7c59] mt-0.5 md:mt-1">{filteredHouseholds.length - poorCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#143a63]/40" />
              <input
                type="text"
                placeholder="Search by name or household number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] placeholder:text-[#143a63]/40 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
              Barangay
            </label>
            <select
              value={filterBarangay}
              onChange={(e) => setFilterBarangay(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] text-sm"
            >
              <option value="">All Barangays</option>
              {barangays.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
              Poverty Level
            </label>
            <select
              value={filterPoverty}
              onChange={(e) => setFilterPoverty(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] text-sm"
            >
              <option value="">All Levels</option>
              <option value="Non-Poor">Non-Poor</option>
              <option value="Poor">Poor</option>
              <option value="Subsistence Poor">Subsistence Poor</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e6e9ee] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#143a63]/60">
              Showing <span className="font-medium text-[#0a1c33]">{filteredHouseholds.length}</span> of <span className="font-medium text-[#0a1c33]">{households.length}</span> households
            </p>
            {GOOGLE_MAPS_CONFIG.apiKey && (
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-[#143a63] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-[#143a63] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  Map
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#4a7c59] text-white rounded-lg hover:bg-[#3d6649] transition-colors text-sm justify-center font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm justify-center font-medium"
            >
              <FileText className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && GOOGLE_MAPS_CONFIG.apiKey && (
        <div className="bg-white rounded-lg border border-[#e6e9ee] overflow-hidden mb-4">
          <GoogleMapWrapper
            households={filteredHouseholds}
            selectedHousehold={selectedHousehold}
            onHouseholdSelect={(household) => {
              setSelectedHousehold(household);
              setShowViewModal(true);
            }}
            showHouseholds={true}
            showFloodZones={true}
            showEvacuationCenters={true}
            height={500}
          />
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Click on any household marker to view details.
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk
                <span className="w-2 h-2 rounded-full bg-yellow-500 ml-2"></span> Medium
                <span className="w-2 h-2 rounded-full bg-green-500 ml-2"></span> Low
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Household Table */}
      {viewMode === 'table' && (
      <div className="bg-white rounded-lg border border-[#e6e9ee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e6e9ee] bg-[#f7f7f3]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">HH Number</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Head of Family</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Barangay</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Members</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Income</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Poverty Level</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Risk</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.map((household) => (
                <tr key={household.id} className="border-b border-[#e6e9ee] last:border-0 hover:bg-[#f7f7f3] transition-colors">
                  <td className="py-3 px-4 text-sm text-[#143a63]" style={{ fontFamily: 'JetBrains Mono' }}>
                    {household.householdNumber}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#0a1c33]">{household.headOfFamily}</td>
                  <td className="py-3 px-4 text-sm text-[#143a63]/70">{household.barangay}</td>
                  <td className="py-3 px-4 text-center text-sm text-[#143a63]">{household.totalMembers}</td>
                  <td className="py-3 px-4 text-right text-sm text-[#143a63]" style={{ fontFamily: 'JetBrains Mono' }}>
                    ₱{household.monthlyIncome.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        household.povertyLevel === 'Non-Poor'
                          ? 'bg-[#cfe6da] text-[#4a7c59]'
                          : household.povertyLevel === 'Poor'
                          ? 'bg-[#f7f7f3] text-[#8b6914]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {household.povertyLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        household.disasterVulnerability === 'Low'
                          ? 'bg-[#cfe6da] text-[#4a7c59]'
                          : household.disasterVulnerability === 'Medium'
                          ? 'bg-[#f7f7f3] text-[#8b6914]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {household.disasterVulnerability}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleViewDetails(household)}
                        className="p-2 text-[#143a63] hover:bg-[#143a63]/10 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(household.id, household.householdNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete household"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredHouseholds.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[#143a63]/20 mx-auto mb-3" />
              <p className="text-[#143a63]/60">No households found matching your criteria.</p>
              <p className="text-sm text-[#143a63]/40 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedHousehold && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#e6e9ee] shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0a1c33] text-white p-5 flex justify-between items-center rounded-t-xl">
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Source Serif 4' }}>
                  Household Details
                </h3>
                <p className="text-[#c8a24b] text-sm mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>
                  {selectedHousehold.householdNumber}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-[#0a1c33] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#143a63] rounded-full"></div>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f3] p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Barangay</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.barangay}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Head of Family</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.headOfFamily}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Total Members</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.totalMembers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Date Collected</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.dateCollected}</p>
                  </div>
                </div>
              </div>

              {/* Economic Information */}
              <div>
                <h4 className="text-sm font-semibold text-[#0a1c33] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#c8a24b] rounded-full"></div>
                  Economic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f3] p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Monthly Income</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>
                      ₱{selectedHousehold.monthlyIncome.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Employment Status</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.employmentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Poverty Level</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium mt-0.5 ${
                        selectedHousehold.povertyLevel === 'Non-Poor'
                          ? 'bg-[#cfe6da] text-[#4a7c59]'
                          : selectedHousehold.povertyLevel === 'Poor'
                          ? 'bg-[#f7f7f3] text-[#8b6914]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedHousehold.povertyLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Education Level</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.educationLevel}</p>
                  </div>
                </div>
              </div>

              {/* Housing & Services */}
              <div>
                <h4 className="text-sm font-semibold text-[#0a1c33] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4a7c59] rounded-full"></div>
                  Housing & Basic Services
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f3] p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Housing Type</p>
                    <p className="font-medium text-[#0a1c33] mt-0.5">{selectedHousehold.housingType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#143a63]/60 uppercase tracking-wide">Disaster Vulnerability</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium mt-0.5 ${
                        selectedHousehold.disasterVulnerability === 'Low'
                          ? 'bg-[#cfe6da] text-[#4a7c59]'
                          : selectedHousehold.disasterVulnerability === 'Medium'
                          ? 'bg-[#f7f7f3] text-[#8b6914]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedHousehold.disasterVulnerability}
                    </span>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className={`p-3 rounded-lg text-center ${selectedHousehold.accessToWater ? 'bg-[#cfe6da]' : 'bg-red-50'}`}>
                    <p className={`text-xs font-medium ${selectedHousehold.accessToWater ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      Water Access
                    </p>
                    <p className={`text-lg font-bold mt-1 ${selectedHousehold.accessToWater ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      {selectedHousehold.accessToWater ? '✓' : '✗'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedHousehold.accessToElectricity ? 'bg-[#cfe6da]' : 'bg-red-50'}`}>
                    <p className={`text-xs font-medium ${selectedHousehold.accessToElectricity ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      Electricity
                    </p>
                    <p className={`text-lg font-bold mt-1 ${selectedHousehold.accessToElectricity ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      {selectedHousehold.accessToElectricity ? '✓' : '✗'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedHousehold.accessToInternet ? 'bg-[#cfe6da]' : 'bg-red-50'}`}>
                    <p className={`text-xs font-medium ${selectedHousehold.accessToInternet ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      Internet
                    </p>
                    <p className={`text-lg font-bold mt-1 ${selectedHousehold.accessToInternet ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      {selectedHousehold.accessToInternet ? '✓' : '✗'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${selectedHousehold.healthInsurance ? 'bg-[#cfe6da]' : 'bg-red-50'}`}>
                    <p className={`text-xs font-medium ${selectedHousehold.healthInsurance ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      Health Insurance
                    </p>
                    <p className={`text-lg font-bold mt-1 ${selectedHousehold.healthInsurance ? 'text-[#4a7c59]' : 'text-red-600'}`}>
                      {selectedHousehold.healthInsurance ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heads of Family & Members */}
              <div>
                <h4 className="text-sm font-semibold text-[#0a1c33] mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#143a63] rounded-full"></div>
                  Heads of Family & Members
                </h4>
                {selectedHousehold.headsOfFamily && selectedHousehold.headsOfFamily.length > 0 ? (
                  <div className="space-y-4">
                    {selectedHousehold.headsOfFamily.map((head, hIdx) => {
                      const associatedMembers = selectedHousehold.familyMembers?.filter(m => m.headOfFamilyId === head.id) || [];
                      return (
                        <div key={head.id || hIdx} className="border border-[#e6e9ee] rounded-lg overflow-hidden">
                          <div className="bg-[#143a63]/5 p-3 border-b border-[#e6e9ee] flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-[#143a63] uppercase tracking-wide">
                                Head of Family {hIdx + 1}: {head.name}
                              </p>
                              <p className="text-xs text-[#143a63]/70 mt-0.5">
                                Age: {head.age} · Gender: {head.gender} · {head.occupation || 'No Occupation'} ({head.employmentStatus || 'Unemployed'})
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-[#c8a24b] font-mono">
                                Income: ₱{(head.monthlyIncome || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="p-3 bg-white space-y-2">
                            <p className="text-[11px] font-bold text-[#143a63]/60 uppercase tracking-wide">
                              Dependents / Members ({associatedMembers.length})
                            </p>
                            {associatedMembers.length === 0 ? (
                              <p className="text-xs text-[#143a63]/40 italic py-1">No dependents registered under this head.</p>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {associatedMembers.map((member, mIdx) => (
                                  <div key={member.id || mIdx} className="py-2 text-xs flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold text-[#0a1c33]">
                                        {member.name}
                                        {member.relationship && (
                                          <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px]">
                                            {member.relationship}
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-gray-500 mt-0.5">
                                        Age: {member.age || 'N/A'} · Gender: {member.gender} · {member.occupation || 'No Occupation'} ({member.employmentStatus || 'N/A'})
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {member.monthlyIncome > 0 && (
                                        <p className="font-mono text-gray-600">
                                          ₱{member.monthlyIncome.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#f7f7f3] p-4 rounded-lg text-center">
                    <p className="text-xs font-semibold text-[#0a1c33]">{selectedHousehold.headOfFamily} (Primary Head)</p>
                    <p className="text-xs text-[#143a63]/60 mt-1">This household has no extended family members records (Legacy Data).</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[#e6e9ee] p-4 flex justify-end gap-2 rounded-b-xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
