import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { User, UserRole } from '../types/auth';

interface UserModalProps {
  user: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
}

export function UserModal({ user, onSave, onClose }: UserModalProps) {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    username: '',
    email: '',
    fullName: '',
    role: 'Enumerator',
    lgu: '',
    province: '',
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  const roles: UserRole[] = [
    'PSA Administrator',
    'LGU CBMS Focal Person',
    'Data Processor',
    'Enumerator',
    'Planning Officer',
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lgu: user.lgu,
        province: user.province,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEdit = !!user;
    const message = isEdit 
      ? `Are you sure you want to update ${formData.fullName}?`
      : `Are you sure you want to add ${formData.fullName} as a new user?`;

    if (window.confirm(message)) {
      const newUser: User = {
        id: user?.id || `user-${Date.now()}`,
        ...formData,
      };

      onSave(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e6e9ee]">
        <div className="sticky top-0 bg-[#0a1c33] px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Source Serif 4' }}>
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-[#fbf5e1]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33] placeholder:text-[#143a63]/40"
                placeholder="Juan Dela Cruz"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33] placeholder:text-[#143a63]/40"
                placeholder="user.name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33] placeholder:text-[#143a63]/40"
                placeholder="user@example.com"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33]"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33] placeholder:text-[#143a63]/40"
                placeholder="e.g., Nueva Ecija"
              />
            </div>

            {/* LGU/Assignment */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#143a63]/60 uppercase tracking-wide mb-2">
                LGU/Assignment <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lgu}
                onChange={(e) => setFormData({ ...formData, lgu: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#e6e9ee] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8a24b] bg-white text-[#0a1c33] placeholder:text-[#143a63]/40"
                placeholder="e.g., San Jose City or Abar 1st, San Jose City"
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 p-4 border border-[#e6e9ee] rounded-lg cursor-pointer hover:bg-white bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#143a63] rounded border-[#e6e9ee] focus:ring-2 focus:ring-[#c8a24b]"
                />
                <span className="text-sm font-medium text-[#0a1c33]">Active User</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-[#e6e9ee]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#e6e9ee] rounded-lg text-[#143a63] hover:bg-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#143a63] text-white rounded-lg hover:bg-[#0a1c33] transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
