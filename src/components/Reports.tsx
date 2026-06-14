import { useState } from 'react';
import { FileText, Download, Calendar, MapPin, FileSpreadsheet, ChevronRight, Clock } from 'lucide-react';
import { toast } from "sonner";
import { mockBarangayStats, barangays } from '../data/mockData';
import { useData } from '../context/DataContext';

export function Reports() {
  const { households } = useData();
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [reportPeriod, setReportPeriod] = useState('Q1 2024');

  const reportTypes = [
    {
      id: 'poverty-profile',
      name: 'Poverty Profile Report',
      description: 'Comprehensive poverty analysis by barangay and municipality',
      icon: FileText,
    },
    {
      id: 'service-gap',
      name: 'Service Gap Analysis',
      description: 'Identifies gaps in basic services delivery',
      icon: FileText,
    },
    {
      id: 'beneficiary-list',
      name: 'Priority Beneficiaries List',
      description: 'List of households for social protection programs',
      icon: FileText,
    },
    {
      id: 'disaster-vulnerability',
      name: 'Disaster Vulnerability Report',
      description: 'Assessment of households at risk for disaster preparedness',
      icon: FileText,
    },
    {
      id: 'statistical-summary',
      name: 'Statistical Summary',
      description: 'PSA-mandated statistical indicators and metrics',
      icon: FileText,
    },
  ];

  const generateReportData = () => {
    // Filter households based on selected barangay
    const filteredHouseholds = selectedBarangay === 'All'
      ? households
      : households.filter(h => h.barangay === selectedBarangay);

    const poorCount = filteredHouseholds.filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor').length;
    const totalHouseholds = selectedBarangay === 'All'
      ? mockBarangayStats.reduce((sum, b) => sum + b.totalHouseholds, 0) + filteredHouseholds.length
      : mockBarangayStats.find(b => b.name === selectedBarangay)?.totalHouseholds || filteredHouseholds.length;

    const totalPoor = selectedBarangay === 'All'
      ? mockBarangayStats.reduce((sum, b) => sum + b.poorHouseholds, 0) + poorCount
      : mockBarangayStats.find(b => b.name === selectedBarangay)?.poorHouseholds || poorCount;

    return {
      filteredHouseholds,
      totalHouseholds,
      totalPoor,
      povertyRate: ((totalPoor / totalHouseholds) * 100).toFixed(2),
      waterAccess: filteredHouseholds.filter(h => h.accessToWater).length,
      electricityAccess: filteredHouseholds.filter(h => h.accessToElectricity).length,
      internetAccess: filteredHouseholds.filter(h => h.accessToInternet).length,
      healthInsurance: filteredHouseholds.filter(h => h.healthInsurance).length,
      highRisk: filteredHouseholds.filter(h => h.disasterVulnerability === 'High').length,
    };
  };

  const generatePovertyProfileReport = () => {
    const data = generateReportData();
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: #f7f7f3; }
          .container { background: white; padding: 40px; border-radius: 8px; }
          .republic-bar { background: #0a1c33; color: white; text-align: center; padding: 10px; font-size: 11px; margin: -40px -40px 30px -40px; border-radius: 8px 8px 0 0; }
          .republic-bar span { color: #c8a24b; }
          .header { text-align: center; border-bottom: 3px solid #c8a24b; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #0a1c33; margin: 0; font-size: 28px; }
          .header h2 { color: #143a63; margin: 10px 0 0 0; font-size: 20px; font-weight: normal; }
          .meta { background: #f7f7f3; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #c8a24b; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .meta-label { color: #143a63; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .meta-value { color: #0a1c33; font-weight: 500; }
          .section { margin-bottom: 40px; }
          .section-title { color: #0a1c33; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e6e9ee; padding-bottom: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #ffffff; border: 1px solid #e6e9ee; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #143a63; margin-bottom: 5px; }
          .stat-value.gold { color: #c8a24b; }
          .stat-value.green { color: #4a7c59; }
          .stat-label { color: #143a63; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #143a63; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          td { padding: 10px; border-bottom: 1px solid #e6e9ee; color: #0a1c33; }
          tr:hover { background-color: #f7f7f3; }
          .poverty-indicator { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          .poverty-poor { background-color: #f7f7f3; color: #8b6914; }
          .poverty-subsistence { background-color: #fecaca; color: #991b1b; }
          .poverty-nonpoor { background-color: #cfe6da; color: #4a7c59; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e6e9ee; text-align: center; color: #143a63; font-size: 11px; }
          .footer p { margin: 5px 0; }
          .footer .highlight { color: #c8a24b; }
          .signature-section { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature-box { text-align: center; }
          .signature-line { border-top: 2px solid #0a1c33; margin-top: 50px; padding-top: 5px; font-weight: 600; color: #0a1c33; }
          .print-button { background: #143a63; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; margin-bottom: 20px; font-weight: 500; }
          .print-button:hover { background: #0a1c33; }
        </style>
      </head>
      <body>
        <div class="container">
          <button onclick="window.print()" class="print-button no-print">Print / Save as PDF</button>

          <div class="republic-bar">
            Republic of the Philippines · <span>Philippine Statistics Authority</span> · <span>DRHMMS</span>
          </div>

          <div class="header">
            <h1>Disaster Risk and Hazard Mapping Monitoring System</h1>
            <h2>${reportName}</h2>
            <p style="margin: 10px 0 0 0; color: #143a63;">San Jose City, Nueva Ecija</p>
          </div>

          <div class="meta">
            <div class="meta-row">
              <span class="meta-label">Report Period:</span>
              <span class="meta-value">${reportPeriod}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Geographic Coverage:</span>
              <span class="meta-value">${selectedBarangay}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date Generated:</span>
              <span class="meta-value">${new Date().toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Generated By:</span>
              <span class="meta-value">DRHMMS System v1.0</span>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Executive Summary</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${data.totalHouseholds.toLocaleString()}</div>
                <div class="stat-label">Total Households</div>
              </div>
              <div class="stat-card">
                <div class="stat-value gold">${data.totalPoor.toLocaleString()}</div>
                <div class="stat-label">Poor Households</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.povertyRate}%</div>
                <div class="stat-label">Poverty Rate</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Basic Services Coverage</h3>
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Households with Access</th>
                  <th>Coverage Rate</th>
                  <th>Gap</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Safe Water Supply</td>
                  <td>${data.waterAccess.toLocaleString()}</td>
                  <td>${data.filteredHouseholds.length > 0 ? ((data.waterAccess / data.filteredHouseholds.length) * 100).toFixed(2) : 0}%</td>
                  <td>${(data.filteredHouseholds.length - data.waterAccess).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Electricity</td>
                  <td>${data.electricityAccess.toLocaleString()}</td>
                  <td>${data.filteredHouseholds.length > 0 ? ((data.electricityAccess / data.filteredHouseholds.length) * 100).toFixed(2) : 0}%</td>
                  <td>${(data.filteredHouseholds.length - data.electricityAccess).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Internet Connectivity</td>
                  <td>${data.internetAccess.toLocaleString()}</td>
                  <td>${data.filteredHouseholds.length > 0 ? ((data.internetAccess / data.filteredHouseholds.length) * 100).toFixed(2) : 0}%</td>
                  <td>${(data.filteredHouseholds.length - data.internetAccess).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Health Insurance</td>
                  <td>${data.healthInsurance.toLocaleString()}</td>
                  <td>${data.filteredHouseholds.length > 0 ? ((data.healthInsurance / data.filteredHouseholds.length) * 100).toFixed(2) : 0}%</td>
                  <td>${(data.filteredHouseholds.length - data.healthInsurance).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3 class="section-title">Disaster Risk Assessment</h3>
            <p><strong>High Risk Households:</strong> ${data.highRisk.toLocaleString()} (${data.filteredHouseholds.length > 0 ? ((data.highRisk / data.filteredHouseholds.length) * 100).toFixed(2) : 0}%)</p>
            <p>These households require priority attention for disaster preparedness and risk mitigation programs.</p>
          </div>

          ${selectedReport === 'beneficiary-list' ? `
          <div class="section">
            <h3 class="section-title">Priority Beneficiaries List</h3>
            <p><strong>Total Poor Households:</strong> ${data.totalPoor.toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Household Number</th>
                  <th>Head of Family</th>
                  <th>Barangay</th>
                  <th>Members</th>
                  <th>Monthly Income</th>
                  <th>Poverty Level</th>
                </tr>
              </thead>
              <tbody>
                ${data.filteredHouseholds
                  .filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor')
                  .slice(0, 50)
                  .map(h => `
                    <tr>
                      <td style="font-family: monospace;">${h.householdNumber}</td>
                      <td>${h.headOfFamily}</td>
                      <td>${h.barangay}</td>
                      <td>${h.totalMembers}</td>
                      <td>₱${h.monthlyIncome.toLocaleString()}</td>
                      <td><span class="poverty-indicator poverty-${h.povertyLevel === 'Poor' ? 'poor' : 'subsistence'}">${h.povertyLevel}</span></td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
            ${data.filteredHouseholds.filter(h => h.povertyLevel === 'Poor' || h.povertyLevel === 'Subsistence Poor').length > 50 ? '<p style="margin-top: 10px; color: #143a63; font-style: italic;">Note: Showing first 50 households. Export full data for complete list.</p>' : ''}
          </div>
          ` : ''}

          <div class="section">
            <h3 class="section-title">Recommendations</h3>
            <ol style="line-height: 1.8; color: #0a1c33;">
              <li>Prioritize social protection programs for the ${data.totalPoor.toLocaleString()} identified poor households.</li>
              <li>Address service gaps, particularly in ${data.waterAccess < data.electricityAccess ? 'water supply' : 'electricity'} provision.</li>
              <li>Implement disaster preparedness programs for ${data.highRisk.toLocaleString()} high-risk households.</li>
              <li>Coordinate with relevant agencies for livelihood and employment programs.</li>
              <li>Conduct regular monitoring and data validation to ensure accuracy.</li>
            </ol>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">DRHMMS Focal Person</div>
              <p style="font-size: 11px; color: #143a63; margin-top: 5px;">Signature over Printed Name</p>
            </div>
            <div class="signature-box">
              <div class="signature-line">Local Chief Executive</div>
              <p style="font-size: 11px; color: #143a63; margin-top: 5px;">Signature over Printed Name</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Philippine Statistics Authority</strong> - Disaster Risk and Hazard Mapping Monitoring System</p>
            <p class="highlight">This report contains confidential information protected under RA 10173 (Data Privacy Act of 2012)</p>
            <p>In compliance with Republic Act No. 11315 (DRHMMS Act)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `DRHMMS_${selectedReport}_${selectedBarangay}_${reportPeriod.replace(' ', '_')}.html`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report generated successfully", {
      description: `${reportName} has been downloaded. Open in browser and use Print > Save as PDF.`
    });
  };

  const generateCSVReport = () => {
    const data = generateReportData();

    const headers = [
      'Report Type',
      'Period',
      'Barangay',
      'Total Households',
      'Poor Households',
      'Poverty Rate (%)',
      'Water Access',
      'Electricity Access',
      'Internet Access',
      'Health Insurance',
      'High Risk Households'
    ];

    const csvData = [[
      reportTypes.find(r => r.id === selectedReport)?.name || 'N/A',
      reportPeriod,
      selectedBarangay,
      data.totalHouseholds,
      data.totalPoor,
      data.povertyRate,
      data.waterAccess,
      data.electricityAccess,
      data.internetAccess,
      data.healthInsurance,
      data.highRisk
    ]];

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `DRHMMS_Report_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV data exported", {
      description: "Report data has been exported to CSV format."
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Page Title */}
      <div className="mb-6">
        <p className="eyebrow mb-2">Reports · PSA Compliance</p>
        <h2 className="text-xl md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
          Reports Generation
        </h2>
        <p className="text-sm text-[#143a63]/60 mt-1">Generate official DRHMMS reports for planning and compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              Report Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Barangay
                </label>
                <select
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] text-sm"
                >
                  <option value="All">All Barangays</option>
                  {barangays.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Reporting Period
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] focus:border-transparent text-[#0a1c33] text-sm"
                >
                  <option value="Q1 2024">Q1 2024</option>
                  <option value="Q2 2024">Q2 2024</option>
                  <option value="Q3 2024">Q3 2024</option>
                  <option value="Q4 2024">Q4 2024</option>
                  <option value="Annual 2024">Annual 2024</option>
                </select>
              </div>

              <button
                onClick={generatePovertyProfileReport}
                disabled={!selectedReport}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  selectedReport
                    ? 'bg-[#143a63] text-white hover:bg-[#0a1c33]'
                    : 'bg-[#e6e9ee] text-[#143a63]/40 cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                Generate Report (HTML)
              </button>

              <button
                onClick={generateCSVReport}
                disabled={!selectedReport}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  selectedReport
                    ? 'bg-[#4a7c59] text-white hover:bg-[#3d6649]'
                    : 'bg-[#e6e9ee] text-[#143a63]/40 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Data (CSV)
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mt-4 md:mt-6">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
              Recent Reports
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-[#f7f7f3] border border-[#e6e9ee] rounded-lg hover:border-[#c8a24b] cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0a1c33]">Poverty Profile - Q4 2023</p>
                    <p className="text-xs text-[#143a63]/60 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Dec 15, 2023
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#143a63]/40" />
                </div>
              </div>
              <div className="p-3 bg-[#f7f7f3] border border-[#e6e9ee] rounded-lg hover:border-[#c8a24b] cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0a1c33]">Service Gap Analysis</p>
                    <p className="text-xs text-[#143a63]/60 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Nov 28, 2023
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#143a63]/40" />
                </div>
              </div>
              <div className="p-3 bg-[#f7f7f3] border border-[#e6e9ee] rounded-lg hover:border-[#c8a24b] cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0a1c33]">Annual Statistical Summary</p>
                    <p className="text-xs text-[#143a63]/60 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Jan 5, 2024
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#143a63]/40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5">
            <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-1" style={{ fontFamily: 'Source Serif 4' }}>
              Available Reports
            </h3>
            <p className="text-xs md:text-sm text-[#143a63]/60 mb-3 md:mb-5">
              Select a report type to generate. PSA compliant.
            </p>

            <div className="space-y-2 md:space-y-3">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'border-[#c8a24b] bg-[#f7f7f3]/50'
                      : 'border-[#e6e9ee] hover:border-[#c8a24b]/50'
                  }`}
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                      selectedReport === report.id ? 'bg-[#143a63]' : 'bg-[#f7f7f3]'
                    }`}>
                      <report.icon className={`w-4 h-4 md:w-5 md:h-5 ${
                        selectedReport === report.id ? 'text-white' : 'text-[#143a63]'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#0a1c33] text-xs md:text-sm">{report.name}</h4>
                      <p className="text-[10px] md:text-sm text-[#143a63]/60 mt-0.5 md:mt-1 line-clamp-2">{report.description}</p>
                    </div>
                    {selectedReport === report.id && (
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#c8a24b] flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          {selectedReport && (
            <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mt-4 md:mt-6">
              <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4" style={{ fontFamily: 'Source Serif 4' }}>
                Report Preview
              </h3>
              <div className="border border-[#e6e9ee] rounded-lg p-5 bg-[#f7f7f3]">
                <div className="text-center mb-5 pb-4 border-b border-[#e6e9ee]">
                  <h4 className="text-lg font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
                    {reportTypes.find(r => r.id === selectedReport)?.name}
                  </h4>
                  <p className="text-sm text-[#143a63]/60 mt-2">
                    {selectedBarangay} · {reportPeriod}
                  </p>
                  <p className="text-xs text-[#c8a24b] mt-1 font-medium">
                    San Jose City, Nueva Ecija
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#e6e9ee]">
                    <span className="text-[#143a63]/60">Total Households Surveyed:</span>
                    <span className="font-semibold text-[#0a1c33]" style={{ fontFamily: 'JetBrains Mono' }}>
                      {selectedBarangay === 'All'
                        ? mockBarangayStats.reduce((sum, b) => sum + b.totalHouseholds, 0).toLocaleString()
                        : (mockBarangayStats.find(b => b.name === selectedBarangay)?.totalHouseholds || 0).toLocaleString()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e6e9ee]">
                    <span className="text-[#143a63]/60">Poor Households Identified:</span>
                    <span className="font-semibold text-[#c8a24b]" style={{ fontFamily: 'JetBrains Mono' }}>
                      {selectedBarangay === 'All'
                        ? mockBarangayStats.reduce((sum, b) => sum + b.poorHouseholds, 0).toLocaleString()
                        : (mockBarangayStats.find(b => b.name === selectedBarangay)?.poorHouseholds || 0).toLocaleString()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#e6e9ee]">
                    <span className="text-[#143a63]/60">Data Collection Status:</span>
                    <span className="font-semibold text-[#4a7c59]">Complete</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#143a63]/60">Generated By:</span>
                    <span className="font-semibold text-[#0a1c33]">DRHMMS System v1.0</span>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-[#f7f7f3] border border-[#c8a24b]/30 rounded-lg">
                  <p className="text-xs text-[#8b6914]">
                    <strong>Note:</strong> This is a preview. The actual report will include detailed
                    tables, charts, and comprehensive analysis suitable for printing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
