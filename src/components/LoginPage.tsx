import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { mockUsers, demoCredentials } from '../data/mockUsers';
import { User } from '../types/auth';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      const user = mockUsers.find(u => u.username === username);

      // Check credentials
      const validCredentials = Object.values(demoCredentials).find(
        cred => cred.username === username && cred.password === password
      );

      if (user && validCredentials) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleDemoLogin = (role: keyof typeof demoCredentials) => {
    const cred = demoCredentials[role];
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Republic Chrome Header */}
      <div className="bg-[#0a1c33] text-white/80 text-center py-1.5 text-[11px] tracking-wide border-b border-[#c8a24b]/30 shrink-0">
        <span className="hidden sm:inline">Republic of the Philippines</span>
        <span className="hidden sm:inline mx-2 text-[#c8a24b]">·</span>
        <span className="font-medium">Philippine Statistics Authority</span>
      </div>

      <div className="flex-1 flex">
      {/* Left Section - Dark Navy Branding Panel */}
      <div
        className="hidden lg:flex lg:w-[55%] text-white p-14 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #061224 0%, #0a1c33 60%, #0e2a4a 100%)' }}
      >
        {/* Faint PSA Seal Watermark */}
        <svg viewBox="0 0 600 600" className="absolute -right-40 -bottom-40 w-[660px] h-[660px] opacity-[0.06]">
          <circle cx="300" cy="300" r="280" fill="none" stroke="#c8a24b" strokeWidth="2"/>
          <circle cx="300" cy="300" r="220" fill="none" stroke="#c8a24b" strokeWidth="1"/>
          <g transform="translate(300 300)" fill="#c8a24b">
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle) => (
              <polygon key={angle} points="0,-180 12,-40 180,0 12,40 0,180 -12,40 -180,0 -12,-40" transform={`rotate(${angle})`}/>
            ))}
          </g>
        </svg>

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3.5 mb-12">
            <svg viewBox="0 0 60 60" className="w-14 h-14">
              <circle cx="30" cy="30" r="28" fill="#0e2a4a"/>
              <circle cx="30" cy="30" r="28" fill="none" stroke="#c8a24b" strokeWidth="1"/>
              <circle cx="30" cy="30" r="22" fill="none" stroke="#c8a24b" strokeWidth="0.6"/>
              <g transform="translate(30 30)" fill="#c8a24b">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <polygon key={angle} points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" transform={`rotate(${angle})`}/>
                ))}
              </g>
              <circle cx="30" cy="30" r="3.5" fill="#c8a24b"/>
            </svg>
            <div>
              <h1 className="text-[22px] font-semibold" style={{ fontFamily: 'Source Serif 4' }}>Philippine Statistics Authority</h1>
              <p className="text-[12px] text-white/70 tracking-[0.04em]">REPUBLIC OF THE PHILIPPINES</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="eyebrow text-[#c8a24b] mb-3.5">LGU Portal · CBMS</p>
              <h2
                className="text-[52px] font-semibold leading-[1.05] tracking-[-0.015em] max-w-[540px]"
                style={{ fontFamily: 'Source Serif 4' }}
              >
                Community-Based Monitoring System
              </h2>
              <p className="text-[16px] leading-relaxed text-[#b8c3d6] max-w-[480px] mt-6">
                Evidence-based household data for local governance and poverty reduction, mandated under Republic Act No. 11315.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-6 mt-12 max-w-[520px]">
              {[
                ['Data Collection', 'Household-level socio-economic surveys'],
                ['Local Analytics', 'Real-time barangay poverty indicators'],
                ['Targeted Support', 'Identify priority beneficiaries'],
                ['Data Privacy', 'RA 10173 compliant, audit-logged'],
              ].map(([title, desc]) => (
                <div key={title} className="pt-4 border-t border-[#c8a24b]/30">
                  <div className="text-[#c8a24b] font-semibold text-[13px] tracking-[0.04em] uppercase">{title}</div>
                  <div className="text-[13px] text-[#b8c3d6] mt-1.5">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-[12px] text-[#8794ab] border-t border-white/[0.08] pt-5 mt-8">
          <p>Republic Act No. 11315 · Community-Based Monitoring System Act</p>
          <p className="mt-1 opacity-70">© 2024 Philippine Statistics Authority · All rights reserved.</p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 bg-[#fbf5e1]">
        <div className="w-full max-w-[420px]">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg viewBox="0 0 60 60" className="w-12 h-12">
                <circle cx="30" cy="30" r="28" fill="#0e2a4a"/>
                <circle cx="30" cy="30" r="28" fill="none" stroke="#c8a24b" strokeWidth="1"/>
                <circle cx="30" cy="30" r="22" fill="none" stroke="#c8a24b" strokeWidth="0.6"/>
                <g transform="translate(30 30)" fill="#c8a24b">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <polygon key={angle} points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" transform={`rotate(${angle})`}/>
                  ))}
                </g>
                <circle cx="30" cy="30" r="3.5" fill="#c8a24b"/>
              </svg>
              <div className="text-left">
                <h1 className="text-xl font-bold text-[#0a1c33]">CBMS Portal</h1>
                <p className="text-[#c8a24b] text-xs">San Jose City LGU</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="eyebrow mb-2">Sign in</p>
            <h2
              className="text-[32px] font-semibold text-[#0a1626] tracking-[-0.01em]"
              style={{ fontFamily: 'Source Serif 4' }}
            >
              Welcome back
            </h2>
            <p className="text-[#5b6779] text-[14px] mt-2">
              Use your assigned PSA / LGU credentials to access the portal.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-[#fbe7eb] border border-[#efc4cc] rounded flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#8a1b30] flex-shrink-0" />
              <p className="text-[13px] text-[#8a1b30]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            <div>
              <label className="block text-[13px] font-medium text-[#2a3a4f] mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-[42px] px-3.5 bg-white border border-[#cfd5de] rounded text-[14px] text-[#0a1626] placeholder:text-[#7c8898] transition-all focus:outline-none focus:border-[#143a63] focus:ring-2 focus:ring-[#143a63]/15"
                placeholder="firstname.lastname"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[13px] font-medium text-[#2a3a4f]">
                  Password
                </label>
                <a href="#" className="text-[12px] text-[#143a63] hover:text-[#c8a24b] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[42px] px-3.5 bg-white border border-[#cfd5de] rounded text-[14px] text-[#0a1626] placeholder:text-[#7c8898] transition-all focus:outline-none focus:border-[#143a63] focus:ring-2 focus:ring-[#143a63]/15"
                placeholder="••••••••"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[#cfd5de] accent-[#0e2a4a]"
              />
              <span className="text-[13px] text-[#5b6779]">Keep me signed in on this device</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] flex items-center justify-center gap-2 bg-[#0e2a4a] text-white rounded hover:bg-[#0a1c33] transition-colors disabled:bg-[#143a63]/50 disabled:cursor-not-allowed text-[15px] font-semibold mt-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to portal'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-7 pt-5 border-t border-dashed border-[#cfd5de]">
            <p className="eyebrow mb-2.5">Demo accounts</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'admin', role: 'PSA Administrator', user: 'admin' },
                { key: 'focal', role: 'LGU Focal Person', user: 'focal.sjc' },
                { key: 'processor', role: 'Data Processor', user: 'processor.sjc' },
                { key: 'enumerator', role: 'Enumerator', user: 'enum.caanawan' },
              ].map((demo) => (
                <button
                  key={demo.key}
                  onClick={() => handleDemoLogin(demo.key as keyof typeof demoCredentials)}
                  className="p-2.5 text-left border border-[#e6e9ee] bg-white rounded transition-all hover:border-[#c8a24b] hover:bg-[#f7f7f3]"
                >
                  <div className="text-[12px] font-semibold text-[#0a1626]">{demo.role}</div>
                  <div className="text-[11px] text-[#5b6779] mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{demo.user}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-[#7c8898] tracking-[0.04em] mt-6 uppercase">
            Protected under RA 10173 (Data Privacy Act)
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
