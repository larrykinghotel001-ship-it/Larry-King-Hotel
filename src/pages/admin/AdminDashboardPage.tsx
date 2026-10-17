import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { useHotel } from '../../context/HotelContext.js';
import { Link } from '../../context/RouterContext.js';
import { Reservation } from '../../types/index.js';
import { 
  CalendarCheck, 
  CreditCard, 
  Bed, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Calendar
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { token } = useAdminAuth();
  const { formatCurrency } = useHotel();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadStats();
    }
  }, [token]);

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1559ed] flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 font-[Poppins]">
              {loading ? '—' : stats?.totalBookings || 0}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">{stats?.confirmedCount || 0} Confirmed</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{stats?.pendingCount || 0} Pending</span>
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-[Poppins]">
              {loading ? '—' : formatCurrency(stats?.totalRevenueNgn || 0)}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Pending: {formatCurrency(stats?.pendingRevenueNgn || 0)}
            </div>
          </div>

          {/* Card 3: Active Rooms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Physical Rooms</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bed className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 font-[Poppins]">
              {loading ? '—' : `${stats?.activeRooms || 0} / ${stats?.totalRooms || 0}`}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-2">
              Available for immediate check-in
            </div>
          </div>

          {/* Card 4: Action Shortcuts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Quick Action
              </span>
              <h4 className="text-sm font-bold text-slate-900">Manage Reservations</h4>
              <p className="text-xs text-slate-500 mt-0.5">Filter, search, or assign guest rooms</p>
            </div>
            <Link
              to="/admin/bookings"
              className="mt-4 bg-[#192a3d] hover:bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Reservations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[Poppins]">Recent Reservations</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest room requests placed on the booking portal</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-[#1559ed] hover:underline flex items-center gap-1"
            >
              <span>View All Bookings &rarr;</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total (₦)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recentReservations?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No reservations registered yet. Test bookings will appear here instantly.
                    </td>
                  </tr>
                )}
                {stats?.recentReservations?.map((res: Reservation) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1559ed]">
                      {res.bookingReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{res.guest?.firstName} {res.guest?.lastName}</div>
                      <div className="text-[11px] text-slate-400">{res.guest?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {res.roomType?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{res.checkInDate} &rarr; {res.checkOutDate}</div>
                      <div className="text-[11px] text-slate-400">{res.numberOfNights} night(s)</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(res.totalAmountNgn)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        res.reservationStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        res.reservationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        res.reservationStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {res.reservationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/bookings"
                        className="text-xs font-semibold text-[#1559ed] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Hotel Status Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>System &amp; Database Health</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Database persistence is active. Room pricing is dynamically guarded against double-bookings and concurrent room exhaustion.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1559ed]" />
              <span>Front Desk Check-in Notice</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard check-in begins at 2:00 PM. Please verify guest identification and record physical room keys upon arrival.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
