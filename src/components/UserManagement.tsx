import { useState } from 'react';
import { UserPlus, Search, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { User, UserRole, rolePermissions } from '../types/auth';
import { UserModal } from './UserModal';
import { useData } from '../context/DataContext';

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, toggleUserActive } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const roles: UserRole[] = [
    'PSA Administrator',
    'LGU CBMS Focal Person',
    'Data Processor',
    'Enumerator',
    'Planning Officer',
    'Mayor',
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filterRole || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = (user: User) => {
    if (selectedUser) {
      updateUser(user.id, user);
      toast.success("User updated successfully", {
        description: `${user.fullName}'s information has been updated.`
      });
    } else {
      addUser(user);
      toast.success("User added successfully", {
        description: `${user.fullName} has been added to the system.`
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'PSA Administrator':
        return 'bg-[#143a63]/10 text-[#143a63]';
      case 'LGU CBMS Focal Person':
        return 'bg-[#c8a24b]/15 text-[#8b6914]';
      case 'Data Processor':
        return 'bg-[#4a7c59]/15 text-[#4a7c59]';
      case 'Enumerator':
        return 'bg-[#8b4513]/10 text-[#8b4513]';
      case 'Planning Officer':
        return 'bg-[#143a63]/5 text-[#143a63]/80';
      case 'Mayor':
        return 'bg-[#7c3aed]/15 text-[#7c3aed]';
      default:
        return 'bg-[#e6e9ee] text-[#143a63]/70';
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Administration · Access Control</p>
          <h2 className="text-xl md:text-2xl font-semibold text-[#0a1c33]" style={{ fontFamily: 'Source Serif 4' }}>
            User Management
          </h2>
          <p className="text-sm text-[#143a63]/60 mt-1">Manage system users and role-based access control</p>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#143a63]/40" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] text-sm text-[#0a1c33] placeholder:text-[#143a63]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] text-sm text-[#0a1c33]"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e6e9ee]">
          <p className="text-xs text-[#143a63]/60">
            Showing <span className="font-medium text-[#0a1c33]">{filteredUsers.length}</span> of {users.length} users
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#f7f7f3] border-b border-[#e6e9ee]">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">LGU/Assignment</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Last Login</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#e6e9ee] last:border-0 hover:bg-[#f7f7f3] transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-[#0a1c33] text-sm">{user.fullName}</p>
                      <p className="text-xs text-[#143a63]/60">{user.email}</p>
                      <p className="text-xs text-[#143a63]/40" style={{ fontFamily: 'JetBrains Mono' }}>@{user.username}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#0a1c33]">{user.lgu}</p>
                    <p className="text-xs text-[#143a63]/60">{user.province}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#cfe6da] text-[#4a7c59] rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#0a1c33]" style={{ fontFamily: 'JetBrains Mono' }}>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </p>
                    {user.lastLogin && (
                      <p className="text-xs text-[#143a63]/60" style={{ fontFamily: 'JetBrains Mono' }}>
                        {new Date(user.lastLogin).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-[#143a63] hover:bg-[#143a63]/10 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserActive(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-[#c8a24b] hover:bg-[#c8a24b]/10'
                            : 'text-[#4a7c59] hover:bg-[#4a7c59]/10'
                        }`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Reference */}
      <div className="bg-white rounded-lg border border-[#e6e9ee] p-3 md:p-5 mt-4">
        <h3 className="text-sm md:text-base font-semibold text-[#0a1c33] mb-3 md:mb-4 flex items-center gap-2" style={{ fontFamily: 'Source Serif 4' }}>
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#143a63]" />
          Role Permissions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#e6e9ee]">
                <th className="text-left py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Role</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Collect</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Process</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Reports</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Analytics</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Export</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Users</th>
                <th className="text-center py-3 px-3 text-xs font-semibold text-[#143a63]/60 uppercase tracking-wide">Level</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const permissions = rolePermissions[role];
                return (
                  <tr key={role} className="border-b border-[#e6e9ee] last:border-0 hover:bg-[#f7f7f3] transition-colors">
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                        {role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canCollectData ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canProcessData ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canViewReports ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canAccessAnalytics ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canExportData ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {permissions.canManageUsers ? (
                        <CheckCircle className="w-4 h-4 text-[#4a7c59] mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#e6e9ee] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-1 bg-[#143a63]/5 text-[#143a63] rounded text-xs font-medium">
                        {permissions.accessLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}