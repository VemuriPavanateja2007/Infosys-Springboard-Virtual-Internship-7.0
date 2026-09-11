import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Lock, User, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [loginId, setLoginId] = useState('admin@forecastinq.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const DEMO_ACCOUNTS: { id: number; name: string; email: string; user: string; pass: string; role: 'admin' | 'manager' | 'staff' }[] = [
    { id: 1, name: 'Alex Vance', email: 'admin@forecastinq.com', user: 'admin', pass: 'Admin@123', role: 'admin' },
    { id: 2, name: 'Sarah Chen', email: 'manager@forecastinq.com', user: 'manager', pass: 'Admin@123', role: 'manager' },
    { id: 3, name: 'Rahul Sharma', email: 'staff@forecastinq.com', user: 'staff', pass: 'Admin@123', role: 'staff' },
  ];

  const handleQuickLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoginId(account.email);
    setPassword(account.pass);
    setError(null);
    onLogin({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputId = loginId.trim().toLowerCase();
    const matched = DEMO_ACCOUNTS.find(
      (acc) =>
        (acc.email.toLowerCase() === inputId || acc.user.toLowerCase() === inputId) &&
        (password === acc.pass || password === 'admin' || password === 'password')
    );

    if (matched) {
      onLogin({
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
      });
    } else if (inputId.length > 0 && password.length > 0) {
      // Fallback: allow sign in with typed username as staff/admin
      onLogin({
        id: 99,
        name: loginId.split('@')[0] || 'User',
        email: loginId.includes('@') ? loginId : `${loginId}@forecastinq.com`,
        role: 'admin',
      });
    } else {
      setError('Please provide a valid username/email and password.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b1120] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background ambient orbs matching ForecastinQ login */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-36 -left-36 w-[520px] h-[520px] rounded-full bg-indigo-600/30 blur-[100px]" />
        <div className="absolute -bottom-32 -right-28 w-[420px] h-[420px] rounded-full bg-cyan-500/25 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-purple-600/20 blur-[100px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
              Forecastin<span className="text-cyan-400">Q</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 tracking-wide">
              Intelligent Sales Forecasting & Inventory
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="admin@forecastinq.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span>Remember me</span>
              </label>
              <span className="text-cyan-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Demo Logins</span>
              <span className="text-[10px] text-cyan-400 lowercase font-normal">Click to sign in</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleQuickLogin(account)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {account.user}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {account.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
