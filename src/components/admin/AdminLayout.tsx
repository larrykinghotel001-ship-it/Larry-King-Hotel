import React from 'react';
import { useRouter, Link } from '../../context/RouterContext.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Bed, 
  Layers, 
  CalendarOff, 
  Image, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { pathname, navigate } = useRouter();
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-4 border-[#ffc200] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { label: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Reservations & Bookings', href: '/admin/bookings', icon: CalendarCheck },
    { label: 'Physical Rooms', href: '/admin/rooms', icon: Bed },
    { label: 'Room Categories & Rates', href: '/admin/room-types', icon: Layers },
    { label: 'Availability & Block Dates', href: '/admin/availability', icon: CalendarOff },
    { label: 'Photo Gallery', href: '/admin/gallery', icon: Image },
    { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { label: 'Website Content', href: '/admin/content', icon: FileText },
    { label: 'Hotel Settings & Rates', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#192a3d] text-slate-300 border-r border-[#243a53] shrink-0 min-h-screen">
        {/* Brand */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ffc200] text-slate-950 font-bold flex items-center justify-center font-[Poppins] text-sm">
              LK
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight">Larry King Hotel</h2>
              <p className="text-[10px] text-[#ffc200] uppercase tracking-wider font-semibold">Staff Management</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            {admin?.fullName.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{admin?.fullName}</p>
            <p className="text-[10px] text-slate-400 capitalize">{admin?.role}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1559ed] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#192a3d] text-white p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Larry King Hotel Portal</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1 rounded-md text-slate-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-slate-800 text-white p-4 space-y-1 border-b border-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs ${
                  isActive ? 'bg-[#1559ed] text-white font-bold' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-700 flex justify-between">
            <Link to="/" className="text-xs text-slate-400">View Public Site</Link>
            <button onClick={handleLogout} className="text-xs text-rose-400">Sign Out</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-[Poppins]">{title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Larry King Hotel &amp; Suite Administration</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1559ed] font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700 capitalize">{admin?.role}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
