import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { MayorDashboard } from './components/MayorDashboard';
import { DataCollection } from './components/DataCollection';
import { Analytics } from './components/Analytics';
import { Reports } from './components/Reports';
import { HouseholdList } from './components/HouseholdList';
import { UserManagement } from './components/UserManagement';
import { DisasterRisk } from './components/disaster';
import { Beneficiaries } from './components/beneficiary';
import { SyncStatus } from './components/SyncStatus';
import { LayoutDashboard, Database, BarChart3, FileText, Users, UserCog, LogOut, Menu, X, AlertTriangle, Heart } from 'lucide-react';
import { User } from './types/auth';
import { rolePermissions } from './types/auth';

type View = 'dashboard' | 'collection' | 'households' | 'analytics' | 'reports' | 'users' | 'disaster' | 'beneficiaries';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setUser(null);
      setCurrentView('dashboard');
    }
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const permissions = rolePermissions[user.role];

  const navigation = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'collection' as View, label: 'Data Collection', icon: Database, show: permissions.canCollectData },
    { id: 'households' as View, label: 'Database', icon: Users, show: permissions.canViewReports },
    { id: 'disaster' as View, label: 'Disaster Risk Monitoring', icon: AlertTriangle, show: permissions.canAccessDisasterRisk },
    { id: 'beneficiaries' as View, label: 'Beneficiaries', icon: Heart, show: permissions.canViewBeneficiaries },
    { id: 'analytics' as View, label: 'Analytics', icon: BarChart3, show: permissions.canAccessAnalytics },
    { id: 'reports' as View, label: 'Reports', icon: FileText, show: permissions.canViewReports },
    { id: 'users' as View, label: 'User Management', icon: UserCog, show: permissions.canManageUsers },
  ].filter(item => item.show);

  return (
    <div className="h-screen bg-[#fbf5e1] flex flex-col overflow-hidden">
      {/* Republic Chrome Header */}
      <div className="bg-[#0a1c33] text-white/80 text-center py-1.5 text-[11px] tracking-wide border-b border-[#c8a24b]/30 flex-shrink-0">
        <span className="hidden sm:inline">Republic of the Philippines</span>
        <span className="hidden sm:inline mx-2 text-[#c8a24b]">·</span>
        <span className="font-medium">Philippine Statistics Authority</span>
        <span className="mx-2 text-[#c8a24b]">·</span>
        <span className="text-[#c8a24b]">CBMS</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[248px] bg-[#0a1c33] flex-col flex-shrink-0 h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="px-[22px] py-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img src="/san-jose-logo.png" alt="San Jose City" className="w-10 h-10 rounded-full bg-white" />
            <div>
              <h1 className="text-white font-bold text-[16px] tracking-[0.02em]">CBMS</h1>
              <p className="text-white/70 text-[11px] tracking-[0.02em] mt-0.5">San Jose City · LGU Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3.5">
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 py-[11px] rounded transition-all text-[14px] ${
                      isActive
                        ? 'bg-[#143a63] text-white font-semibold pl-[11px] pr-[14px] border-l-[3px] border-[#c8a24b]'
                        : 'text-[#a8b9d1] hover:text-white pl-[14px] pr-[14px] border-l-[3px] border-transparent'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sync Status & Footer */}
        <div className="px-5 py-4 border-t border-white/[0.08] text-[12px] text-[#7c8ba6] leading-relaxed">
          <SyncStatus variant="compact" />
          <div className="mt-1.5">2024 Cycle · Q1</div>
          <div className="mt-2 opacity-60">Compliant with RA 10173</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a1c33] border-b-[3px] border-[#c8a24b]">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <img src="/san-jose-logo.png" alt="San Jose City" className="w-9 h-9 rounded-full bg-white" />
            <div>
              <h1 className="text-white font-bold text-sm tracking-[0.02em]">CBMS</h1>
              <p className="text-white/70 text-[10px] tracking-[0.02em]">San Jose City</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:bg-[#143a63] rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0a1c33] shadow-2xl overflow-y-auto flex flex-col">
            {/* Logo Section */}
            <div className="px-5 py-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <img src="/san-jose-logo.png" alt="San Jose City" className="w-11 h-11 rounded-full bg-white" />
                <div>
                  <h1 className="text-white font-bold text-[16px] tracking-[0.02em]">CBMS</h1>
                  <p className="text-white/70 text-[11px] tracking-[0.02em] mt-0.5">San Jose City · LGU Portal</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3.5">
              <ul className="space-y-0.5">
                {navigation.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 py-[11px] rounded transition-all text-[14px] ${
                          isActive
                            ? 'bg-[#143a63] text-white font-semibold pl-[11px] pr-[14px] border-l-[3px] border-[#c8a24b]'
                            : 'text-[#a8b9d1] hover:text-white pl-[14px] pr-[14px] border-l-[3px] border-transparent'
                        }`}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#143a63] text-white flex items-center justify-center font-semibold text-[13px]">
                  {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{user.fullName}</p>
                  <p className="text-[#c8a24b] text-xs">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#143a63] hover:bg-[#0e2a4a] text-white/90 hover:text-white rounded transition-colors text-[13px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Sync Status */}
            <div className="px-5 py-4 border-t border-white/[0.08] text-[12px] text-[#7c8ba6] leading-relaxed">
              <SyncStatus variant="compact" />
              <div className="mt-1.5">2024 Cycle · Q1</div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="hidden lg:flex h-[60px] bg-white border-b border-[#e6e9ee] px-8 items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3.5 flex-1">
            <div className="flex items-center gap-2 text-[13px] text-[#5b6779]">
              <span>LGU Portal</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <path d="M9 6l6 6-6 6"/>
              </svg>
              <span className="text-[#0a1626] font-semibold">{navigation.find(n => n.id === currentView)?.label || 'Dashboard'}</span>
            </div>

            {/* Search Bar */}
            <div className="relative ml-6 flex-1 max-w-[420px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c8898]">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                placeholder="Search households, barangays, users…"
                className="w-full h-[34px] pl-9 pr-3 border border-[#cfd5de] rounded text-[13px] bg-white placeholder:text-[#7c8898] focus:outline-none focus:border-[#143a63]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="w-[34px] h-[34px] rounded flex items-center justify-center text-[#5b6779] hover:text-[#0a1626] relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
                <path d="M6 8a6 6 0 0112 0v5l2 3H4l2-3V8z"/>
                <path d="M10 19a2 2 0 004 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[#b0263c]" />
            </button>

            <div className="w-px h-6 bg-[#e6e9ee]" />

            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-full bg-[#0e2a4a] text-white flex items-center justify-center font-semibold text-[13px]">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="text-[13px] leading-tight">
                <div className="font-semibold text-[#0a1626]">{user.fullName}</div>
                <div className="text-[#5b6779] text-[11px]">{user.role}</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Log out"
              className="w-[34px] h-[34px] rounded flex items-center justify-center text-[#5b6779] hover:text-[#0a1626]"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pt-20 lg:pt-6 overflow-y-auto overflow-x-hidden">
          {currentView === 'dashboard' && (user.role === 'Mayor' ? <MayorDashboard /> : <Dashboard />)}
          {currentView === 'collection' && permissions.canCollectData && <DataCollection />}
          {currentView === 'households' && permissions.canViewReports && <HouseholdList />}
          {currentView === 'disaster' && permissions.canAccessDisasterRisk && <DisasterRisk />}
          {currentView === 'beneficiaries' && permissions.canViewBeneficiaries && <Beneficiaries />}
          {currentView === 'analytics' && permissions.canAccessAnalytics && <Analytics />}
          {currentView === 'reports' && permissions.canViewReports && <Reports />}
          {currentView === 'users' && permissions.canManageUsers && <UserManagement />}
        </main>
      </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
      <Toaster />
    </DataProvider>
  );
}
