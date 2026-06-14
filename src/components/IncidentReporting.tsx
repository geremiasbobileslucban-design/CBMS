import { ChangeEvent, useMemo, useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { useData } from '../context/DataContext';
import { GoogleMapWrapper } from './gis/GoogleMapWrapper';
import { GPSCapture } from './gis/GPSCapture';
import { BARANGAY_CENTERS } from '../config/maps';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Download,
  BellRing,
  CalendarDays,
  ShieldCheck,
  FileText,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { GeoLocation, IncidentReport, IncidentStatus, IncidentType } from '../types/drhmms';

const INCIDENT_TYPES: IncidentType[] = [
  'Flood',
  'Landslide',
  'Fire',
  'Road Accident',
  'Structural Damage',
  'Power Outage',
  'Other',
];

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const STATUS_OPTIONS: IncidentStatus[] = ['Reported', 'Under Verification', 'Ongoing Response', 'Resolved', 'Closed'];

const DEFAULT_FORM_STATE = {
  type: 'Flood' as IncidentType,
  title: '',
  description: '',
  incidentDate: new Date().toISOString().slice(0, 16),
  barangay: '',
  municipality: 'San Jose City',
  address: '',
  location: null as GeoLocation | null,
  severity: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
  affectedFamilies: '',
  affectedIndividuals: '',
  casualties: '',
  injuries: '',
  missingPersons: '',
  reporterName: '',
  contactNumber: '',
};

const STATUS_BADGE: Record<IncidentStatus, string> = {
  Reported: 'bg-blue-100 text-blue-700',
  'Under Verification': 'bg-amber-100 text-amber-700',
  'Ongoing Response': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-slate-100 text-slate-700',
};

const SEVERITY_BADGE: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getMapPosition(report: IncidentReport) {
  if (report.location?.latitude && report.location?.longitude) {
    return { lat: report.location.latitude, lng: report.location.longitude };
  }

  return BARANGAY_CENTERS[report.barangay] ?? { lat: 15.7917, lng: 120.9892 };
}

export function IncidentReporting() {
  const { incidentReports, addIncidentReport, updateIncidentReport, households } = useData();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'map' | 'history'>('monitoring');
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [formState, setFormState] = useState<typeof DEFAULT_FORM_STATE>(DEFAULT_FORM_STATE);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    barangay: '',
    type: '',
    severity: '',
    status: '',
    fromDate: '',
    toDate: '',
    keyword: '',
  });

  const barangayOptions = useMemo(
    () => [...new Set(households.map(h => h.barangay))].sort(),
    [households]
  );

  const filteredReports = useMemo(() => {
    return incidentReports.filter(report => {
      const matchesBarangay = !filters.barangay || report.barangay === filters.barangay;
      const matchesType = !filters.type || report.type === filters.type;
      const matchesSeverity = !filters.severity || report.severity === filters.severity;
      const matchesStatus = !filters.status || report.status === filters.status;
      const matchesKeyword = !filters.keyword ||
        [report.title, report.description, report.barangay, report.reporterName, report.address]
          .some(field => field.toLowerCase().includes(filters.keyword.toLowerCase()));
      const incidentTime = new Date(report.incidentDate);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const matchesFrom = !fromDate || incidentTime >= fromDate;
      const matchesTo = !toDate || incidentTime <= toDate;
      return matchesBarangay && matchesType && matchesSeverity && matchesStatus && matchesKeyword && matchesFrom && matchesTo;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filters, incidentReports]);

  const incidentCounts = useMemo(() => ({
    reported: incidentReports.filter(report => report.status === 'Reported').length,
    ongoing: incidentReports.filter(report => report.status === 'Ongoing Response').length,
    critical: incidentReports.filter(report => report.severity === 'Critical').length,
    total: incidentReports.length,
  }), [incidentReports]);

  const handleInput = (field: string, value: string | number | GeoLocation | null) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    setAttachments(Array.from(files).map(file => file.name));
  };

  const createIncident = () => {
    if (!formState.title.trim() || !formState.barangay.trim() || !formState.address.trim()) {
      alert('Please complete the required fields: title, barangay, and address.');
      return;
    }

    const newIncident: IncidentReport = {
      id: `incident-${Date.now()}`,
      type: formState.type,
      title: formState.title.trim(),
      description: formState.description.trim(),
      incidentDate: formState.incidentDate,
      barangay: formState.barangay,
      municipality: formState.municipality,
      address: formState.address.trim(),
      location: formState.location ?? undefined,
      severity: formState.severity,
      affectedFamilies: formState.affectedFamilies ? Number(formState.affectedFamilies) : 0,
      affectedIndividuals: formState.affectedIndividuals ? Number(formState.affectedIndividuals) : 0,
      casualties: formState.casualties ? Number(formState.casualties) : 0,
      injuries: formState.injuries ? Number(formState.injuries) : 0,
      missingPersons: formState.missingPersons ? Number(formState.missingPersons) : 0,
      attachments,
      reporterName: formState.reporterName.trim(),
      contactNumber: formState.contactNumber.trim(),
      status: 'Reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addIncidentReport(newIncident);
    setFormState(DEFAULT_FORM_STATE);
    setAttachments([]);
    setShowForm(false);
    setActiveTab('monitoring');
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Type',
      'Title',
      'Date & Time',
      'Barangay',
      'Municipality',
      'Severity',
      'Status',
      'Affected Families',
      'Affected Individuals',
      'Casualties',
      'Injuries',
      'Missing Persons',
      'Reporter',
      'Contact',
      'Address',
    ];

    const rows = filteredReports.map(report => [
      report.id,
      report.type,
      report.title,
      report.incidentDate,
      report.barangay,
      report.municipality,
      report.severity,
      report.status,
      report.affectedFamilies,
      report.affectedIndividuals,
      report.casualties,
      report.injuries,
      report.missingPersons,
      report.reporterName,
      report.contactNumber,
      report.address,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'incident-reports.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (report: IncidentReport, nextStatus: IncidentStatus) => {
    updateIncidentReport(report.id, { ...report, status: nextStatus, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-1 md:mb-2">Incident Reporting</p>
          <h2 className="text-lg md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
            Barangay Incident Monitoring
          </h2>
          <p className="text-xs md:text-sm text-[#143a63]/60 mt-1">
            Submit and monitor incident reports from barangay-level personnel in real time.
          </p>
        </div>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#143a63] text-white rounded-lg hover:bg-[#0e2a4a] transition-colors text-sm font-medium"
        >
          <BellRing className="w-4 h-4" />
          {showForm ? 'Close Report Form' : 'Report Incident'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Incident Type
                  <select
                    value={formState.type}
                    onChange={(e) => handleInput('type', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  >
                    {INCIDENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  Severity Level
                  <select
                    value={formState.severity}
                    onChange={(e) => handleInput('severity', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  >
                    {SEVERITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                Incident Title
                <input
                  value={formState.title}
                  onChange={(e) => handleInput('title', e.target.value)}
                  placeholder="Enter a brief title"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                Brief Description
                <textarea
                  value={formState.description}
                  onChange={(e) => handleInput('description', e.target.value)}
                  placeholder="Describe the incident"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Date & Time of Incident
                  <input
                    type="datetime-local"
                    value={formState.incidentDate}
                    onChange={(e) => handleInput('incidentDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  Barangay
                  <select
                    value={formState.barangay}
                    onChange={(e) => handleInput('barangay', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  >
                    <option value="">Select barangay</option>
                    {barangayOptions.map(barangay => (
                      <option key={barangay} value={barangay}>{barangay}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                Exact Location / Address
                <input
                  value={formState.address}
                  onChange={(e) => handleInput('address', e.target.value)}
                  placeholder="Street, block, landmark"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                />
              </label>

              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <p className="font-medium">GPS Location</p>
                  {formState.location ? (
                    <span className="text-xs text-slate-500">Captured automatically</span>
                  ) : (
                    <span className="text-xs text-slate-500">Use device GPS to capture location</span>
                  )}
                </div>
                <GPSCapture
                  value={formState.location}
                  onChange={(loc) => handleInput('location', loc)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Reporter Name
                  <input
                    value={formState.reporterName}
                    onChange={(e) => handleInput('reporterName', e.target.value)}
                    placeholder="Reporter full name"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Contact Number
                  <input
                    value={formState.contactNumber}
                    onChange={(e) => handleInput('contactNumber', e.target.value)}
                    placeholder="Mobile or landline"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Affected Families
                  <input
                    type="number"
                    min={0}
                    value={formState.affectedFamilies}
                    onChange={(e) => handleInput('affectedFamilies', e.target.value)}
                    placeholder="Leave blank if not applicable"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Affected Individuals
                  <input
                    type="number"
                    min={0}
                    value={formState.affectedIndividuals}
                    onChange={(e) => handleInput('affectedIndividuals', e.target.value)}
                    placeholder="Leave blank if not applicable"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Injuries
                  <input
                    type="number"
                    min={0}
                    value={formState.injuries}
                    onChange={(e) => handleInput('injuries', e.target.value)}
                    placeholder="Leave blank if not applicable"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Missing Persons
                  <input
                    type="number"
                    min={0}
                    value={formState.missingPersons}
                    onChange={(e) => handleInput('missingPersons', e.target.value)}
                    placeholder="Leave blank if not applicable"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Casualties
                  <input
                    type="number"
                    min={0}
                    value={formState.casualties}
                    onChange={(e) => handleInput('casualties', e.target.value)}
                    placeholder="Leave blank if not applicable"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Attach Photos/Videos
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-700"
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">Uploaded files</p>
                  <ul className="mt-2 space-y-1">
                    {attachments.map((name, index) => (
                      <li key={index} className="truncate">• {name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Reports submitted by barangay personnel are saved locally and can be synced when online.
            </div>
            <button
              onClick={createIncident}
              className="inline-flex items-center gap-2 rounded-lg bg-[#143a63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0e2a4a] transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Incident
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm mb-3">
            <BellRing className="w-4 h-4 text-[#143a63]" />
            New Reports
          </div>
          <p className="text-3xl font-bold text-[#0a1c33]">{incidentCounts.reported}</p>
          <p className="text-sm text-slate-500 mt-2">Awaiting verification and response</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm mb-3">
            <ShieldCheck className="w-4 h-4 text-[#0a1c33]" />
            Critical Alerts
          </div>
          <p className="text-3xl font-bold text-[#0a1c33]">{incidentCounts.critical}</p>
          <p className="text-sm text-slate-500 mt-2">Priority incidents needing urgent action</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm mb-3">
            <MapPin className="w-4 h-4 text-[#f59e0b]" />
            Total Incidents
          </div>
          <p className="text-3xl font-bold text-[#0a1c33]">{incidentCounts.total}</p>
          <p className="text-sm text-slate-500 mt-2">Reports filed from barangay locations</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-gray-200 p-3 mb-4 text-sm">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`rounded-full px-4 py-2 transition ${activeTab === 'monitoring' ? 'bg-[#143a63] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
        >
          Monitoring
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`rounded-full px-4 py-2 transition ${activeTab === 'map' ? 'bg-[#143a63] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
        >
          Map View
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`rounded-full px-4 py-2 transition ${activeTab === 'history' ? 'bg-[#143a63] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
        >
          History & Reports
        </button>
      </div>

      {(activeTab === 'monitoring' || activeTab === 'history') && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <label className="space-y-2 text-sm text-slate-700">
            Filter by Barangay
            <select
              value={filters.barangay}
              onChange={(e) => setFilters(prev => ({ ...prev, barangay: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">All barangays</option>
              {barangayOptions.map(barangay => <option key={barangay} value={barangay}>{barangay}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Filter by Incident Type
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">All types</option>
              {INCIDENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Filter by Status
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Incident Monitoring</p>
                  <p className="text-xs text-slate-500 mt-1">View the most recent incident reports and response status.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#143a63] px-3 py-2 text-sm font-medium text-white hover:bg-[#0e2a4a]"
                  >
                    <FileText className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                  <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-[#f59e0b]" />
                  <p className="text-sm font-medium">No incidents match the selected filters.</p>
                  <p className="text-sm mt-2">Adjust the filters or create a new incident report.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="grid grid-cols-12 gap-3 border-b border-gray-100 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <div className="col-span-3">Incident</div>
                    <div className="hidden md:block col-span-2">Barangay</div>
                    <div className="hidden lg:block col-span-2">Date</div>
                    <div className="col-span-2">Severity</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1" />
                  </div>
                  {filteredReports.map(report => (
                    <div key={report.id} className="grid grid-cols-12 gap-3 items-center border-b border-gray-100 px-4 py-4 hover:bg-slate-50">
                      <div className="col-span-3">
                        <p className="font-semibold text-slate-900">{report.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{report.type}</p>
                      </div>
                      <div className="hidden md:block col-span-2 text-sm text-slate-700">{report.barangay}</div>
                      <div className="hidden lg:block col-span-2 text-sm text-slate-700">{new Date(report.incidentDate).toLocaleString()}</div>
                      <div className="col-span-2 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${SEVERITY_BADGE[report.severity]}`}>
                          {report.severity}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[report.status]}`}>
                          {report.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedIncident(report)}
                        className="col-span-1 inline-flex items-center justify-end text-[#143a63] hover:text-[#0e2a4a]"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Incident Filters</p>
                <div className="space-y-3 text-sm text-slate-700">
                  <label className="space-y-2">
                    Search keyword
                    <input
                      value={filters.keyword}
                      onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                      placeholder="Title, address, reporter"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                    />
                  </label>
                  <label className="space-y-2">
                    From date
                    <input
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                    />
                  </label>
                  <label className="space-y-2">
                    To date
                    <input
                      type="date"
                      value={filters.toDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Incident Details</p>
                {selectedIncident ? (
                  <div className="space-y-3 text-sm text-slate-700">
                    <p><span className="font-semibold">Title:</span> {selectedIncident.title}</p>
                    <p><span className="font-semibold">Type:</span> {selectedIncident.type}</p>
                    <p><span className="font-semibold">Location:</span> {selectedIncident.barangay}, {selectedIncident.address}</p>
                    <p><span className="font-semibold">Reported:</span> {formatTimestamp(selectedIncident.createdAt)}</p>
                    <div className="space-y-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        Update status
                        <select
                          value={selectedIncident.status}
                          onChange={(e) => updateStatus(selectedIncident, e.target.value as IncidentStatus)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
                        >
                          {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Select a report row to view details and change status.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Incident Map</p>
                <p className="text-xs text-slate-500 mt-1">Color-coded markers show incident severity by location.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Critical
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ minHeight: 520 }}>
            <GoogleMapWrapper height={520}>
              {filteredReports.filter(report => report.incidentDate).map(report => (
                <Marker
                  key={report.id}
                  position={getMapPosition(report)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: report.severity === 'Critical'
                      ? '#b91c1c'
                      : report.severity === 'High'
                        ? '#ea580c'
                        : report.severity === 'Medium'
                          ? '#f59e0b'
                          : '#22c55e',
                    fillOpacity: 0.9,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                    scale: selectedIncident?.id === report.id ? 12 : 8,
                  }}
                  onClick={() => setSelectedIncident(report)}
                >
                  {selectedIncident?.id === report.id && (
                    <InfoWindow
                      position={getMapPosition(report)}
                      onCloseClick={() => setSelectedIncident(null)}
                    >
                      <div className="max-w-xs text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">{report.title}</p>
                        <p>{report.barangay}</p>
                        <p className="mt-1 text-xs text-slate-500">{report.severity} • {report.status}</p>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
            </GoogleMapWrapper>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Incident History</p>
                  <p className="text-xs text-slate-500 mt-1">Review past reports and export incident summaries.</p>
                </div>
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Download className="w-4 h-4" /> Download Excel
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total reports</p>
                  <p className="mt-3 text-3xl font-semibold text-[#0a1c33]">{incidentCounts.total}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">In progress</p>
                  <p className="mt-3 text-3xl font-semibold text-[#0a1c33]">{incidentCounts.ongoing}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Export-ready summary</p>
            <p className="text-sm text-slate-500 mt-2">Generate a quick summary of the incident reporting activity for barangay-level monitoring.</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">New reports</p>
                <p className="mt-1 text-lg text-[#0a1c33]">{incidentCounts.reported}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium">Critical incidents</p>
                <p className="mt-1 text-lg text-[#0a1c33]">{incidentCounts.critical}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#143a63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0e2a4a]"
              >
                <FileText className="w-4 h-4" /> Print Incident Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
