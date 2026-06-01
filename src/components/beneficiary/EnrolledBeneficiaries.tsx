import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { BeneficiaryEnrollment } from '../../types/cbms';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  GraduationCap,
  Pause,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';

export function EnrolledBeneficiaries() {
  const {
    enrollments,
    households,
    socialPrograms,
    updateEnrollment,
    deleteEnrollment
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingEnrollment, setEditingEnrollment] = useState<BeneficiaryEnrollment | null>(null);

  // Create lookup maps
  const householdMap = useMemo(() =>
    new Map(households.map(h => [h.id, h])),
    [households]
  );

  const programMap = useMemo(() =>
    new Map(socialPrograms.map(p => [p.id, p])),
    [socialPrograms]
  );

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      const household = householdMap.get(e.householdId);
      const program = programMap.get(e.programId);

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!household?.headOfFamily.toLowerCase().includes(search) &&
            !household?.barangay.toLowerCase().includes(search) &&
            !program?.name.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Program filter
      if (filterProgram !== 'all' && e.programId !== filterProgram) return false;

      // Status filter
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;

      return true;
    });
  }, [enrollments, searchTerm, filterProgram, filterStatus, householdMap, programMap]);

  const getStatusIcon = (status: BeneficiaryEnrollment['status']) => {
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Graduated': return <GraduationCap className="w-4 h-4" />;
      case 'Suspended': return <Pause className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: BeneficiaryEnrollment['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Graduated': return 'bg-purple-100 text-purple-700';
      case 'Suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = (enrollment: BeneficiaryEnrollment, newStatus: BeneficiaryEnrollment['status']) => {
    updateEnrollment(enrollment.id, {
      ...enrollment,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
    toast.success(`Status updated to ${newStatus}`);
    setEditingEnrollment(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this enrollment?')) {
      deleteEnrollment(id);
      toast.success('Enrollment removed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Household', 'Head of Family', 'Barangay', 'Program', 'Agency', 'Status', 'Enrollment Date'];
    const rows = filteredEnrollments.map(e => {
      const household = householdMap.get(e.householdId);
      const program = programMap.get(e.programId);
      return [
        household?.householdNumber || '',
        household?.headOfFamily || '',
        household?.barangay || '',
        program?.name || '',
        program?.agency || '',
        e.status,
        e.enrollmentDate,
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredEnrollments.length} enrollment(s)`);
  };

  // Stats
  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'Active').length,
    pending: enrollments.filter(e => e.status === 'Pending').length,
    graduated: enrollments.filter(e => e.status === 'Graduated').length,
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-[#9a7918] uppercase tracking-wider">Total</p>
          <p className="text-xl md:text-2xl font-bold text-[#0a1c33] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-green-600 uppercase tracking-wider">Active</p>
          <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-yellow-600 uppercase tracking-wider">Pending</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-semibold text-purple-600 uppercase tracking-wider">Graduated</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600 mt-1">{stats.graduated}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by household or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="flex-1 min-w-[120px] px-2 md:px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          >
            <option value="all">All Programs</option>
            {socialPrograms.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 min-w-[100px] px-2 md:px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#143a63]"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#0a1c33]">
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Beneficiary</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Program</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Enrolled</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-[#9a7918] uppercase tracking-wider">Last Updated</th>
                <th className="w-10 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map(enrollment => {
                  const household = householdMap.get(enrollment.householdId);
                  const program = programMap.get(enrollment.programId);

                  return (
                    <tr key={enrollment.id} className="border-b border-gray-100 hover:bg-[#fbf5e1] transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{household?.headOfFamily || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{household?.barangay}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{program?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{program?.agency}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                          {getStatusIcon(enrollment.status)}
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(enrollment.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <button
                            onClick={() => setEditingEnrollment(editingEnrollment?.id === enrollment.id ? null : enrollment)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>

                          {editingEnrollment?.id === enrollment.id && (
                            <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                              <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Change Status</p>
                              {(['Pending', 'Approved', 'Active', 'Graduated', 'Suspended'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(enrollment, status)}
                                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                    enrollment.status === status ? 'text-[#143a63] font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  {getStatusIcon(status)}
                                  {status}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button
                                  onClick={() => handleDelete(enrollment.id)}
                                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredEnrollments.length} of {enrollments.length} enrollments
      </p>
    </div>
  );
}
