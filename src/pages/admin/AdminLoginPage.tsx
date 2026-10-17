import React, { useState } from 'react';
import { useRouter, Link } from '../../context/RouterContext.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, Info } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState('admin@larrykinghotel.com');
  const [password, setPassword] = useState('ChangeThisStrongPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo and crest */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#ffc200] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-950 font-bold font-[Poppins] text-xl shadow-lg border border-amber-300">
            LK
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-white tracking-tight">
            Larry King Hotel &amp; Suite
          </h2>
          <p className="text-xs text-[#ffc200] uppercase font-semibold tracking-widest mt-1">
            Administrator &amp; Staff Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700/30">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter your verified staff email and password</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@larrykinghotel.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1559ed] hover:bg-[#124bca] text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#1559ed]/50 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Management Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Seed credentials reminder */}
          <div className="mt-6 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-[#1559ed]" />
              <span>Initial Setup Credentials:</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Email: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-semibold">admin@larrykinghotel.com</code><br/>
              Password: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-semibold">ChangeThisStrongPassword2026!</code>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
