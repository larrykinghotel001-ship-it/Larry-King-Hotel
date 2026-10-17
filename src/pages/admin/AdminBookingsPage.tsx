import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';
import { useHotel } from '../../context/HotelContext.js';
import { Reservation, PhysicalRoom, ReservationStatus, PaymentStatus } from '../../types/index.js';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Phone, 
  Mail, 
  Bed, 
  CreditCard,
  Download
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const { formatCurrency } = useHotel();

  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ReservationStatus>('pending');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [assignedRoomId, setAssignedRoomId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== 'all') q.set('status', statusFilter);
      if (search.trim()) q.set('search', search.trim());

      const [resRes, roomsRes] = await Promise.all([
        fetch(`/api/admin/bookings?${q.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (resRes.ok) setBookings(await resRes.json());
      if (roomsRes.ok) setRooms(await roomsRes.json());
    } catch (err) {
      console.error('Error fetching admin bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, statusFilter]);

  const handleOpenModal = (res: Reservation) => {
    setSelectedBooking(res);
    setNewStatus(res.reservationStatus);
    setNewPaymentStatus(res.paymentStatus);
    setAssignedRoomId(res.assignedRoomId || '');
    setAdminNotes(res.adminNotes || '');
    setCancellationReason(res.cancellationReason || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          assignedRoomId: assignedRoomId || null,
          adminNotes,
          cancellationReason: newStatus === 'cancelled' ? cancellationReason : undefined
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error('Failed to update booking status', err);
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Reference,Guest Name,Email,Phone,Room Type,Check-In,Check-Out,Nights,Amount,Status,Payment'];
    const rows = bookings.map(b => [
      b.bookingReference,
      `"${b.guest?.firstName} ${b.guest?.lastName}"`,
      b.guest?.email,
      b.guest?.phone,
      `"${b.roomType?.name}"`,
      b.checkInDate,
      b.checkOutDate,
      b.numberOfNights,
      b.totalAmountNgn,
      b.reservationStatus,
      b.paymentStatus
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `larry_king_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Reservations Management">
      <div className="space-y-6">
        {/* Controls: Search, Filter, Export */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={(e) => { e.preventDefault(); fetchBookings(); }}
            className="flex-1 w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reference, guest name, email, or phone..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="bg-[#192a3d] hover:bg-slate-900 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
            >
              <option value="all">All Reservation Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>

            <button
              onClick={exportCSV}
              className="border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
              title="Export report as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Guest Contact</th>
                  <th className="py-3 px-4">Category &amp; Assigned</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading reservations...
                    </td>
                  </tr>
                )}
                {!loading && bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No matching reservations found.
                    </td>
                  </tr>
                )}
                {!loading && bookings.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1559ed]">
                      {res.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{res.guest?.firstName} {res.guest?.lastName}</div>
                      <div className="text-[11px] text-slate-400">{res.guest?.phone}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{res.guest?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{res.roomType?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {res.assignedRoom ? `Room #${res.assignedRoom.roomNumber} (Fl ${res.assignedRoom.floor})` : 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{res.checkInDate} &rarr; {res.checkOutDate}</div>
                      <div className="text-[11px] text-slate-400">{res.numberOfNights} night(s), {res.adults} adult(s)</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(res.totalAmountNgn)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        res.reservationStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        res.reservationStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        res.reservationStatus === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                        res.reservationStatus === 'checked_out' ? 'bg-purple-100 text-purple-800' :
                        res.reservationStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {res.reservationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        res.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {res.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(res)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manage Reservation Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Manage Reservation</span>
                  <h3 className="text-xl font-bold font-mono text-[#1559ed]">{selectedBooking.bookingReference}</h3>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-6">
                {/* Guest info card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Guest Name</span>
                    <p className="font-bold text-slate-900">{selectedBooking.guest?.firstName} {selectedBooking.guest?.lastName}</p>
                    <p className="text-slate-500">{selectedBooking.guest?.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Room &amp; Dates</span>
                    <p className="font-bold text-slate-900">{selectedBooking.roomType?.name}</p>
                    <p className="text-slate-500">{selectedBooking.checkInDate} to {selectedBooking.checkOutDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Amount</span>
                    <p className="font-bold text-[#1559ed]">{formatCurrency(selectedBooking.totalAmountNgn)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Payment Method</span>
                    <p className="font-medium text-slate-700 capitalize">{selectedBooking.paymentMode.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Update Reservation Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ReservationStatus)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Update Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid in Full</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Assign Physical Room
                    </label>
                    <select
                      value={assignedRoomId}
                      onChange={(e) => setAssignedRoomId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-hidden focus:ring-2 focus:ring-[#1559ed]"
                    >
                      <option value="">-- No Room Assigned Yet --</option>
                      {rooms
                        .filter(r => r.roomTypeId === selectedBooking.roomTypeId)
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            Room #{r.roomNumber} (Floor {r.floor}) — Status: {r.status}
                          </option>
                        ))}
                    </select>
                  </div>

                  {newStatus === 'cancelled' && (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-rose-700 block mb-1">
                        Cancellation Reason
                      </label>
                      <input
                        type="text"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="e.g. Guest requested cancellation via telephone"
                        className="w-full bg-rose-50/50 border border-rose-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-hidden"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Internal Staff Notes
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes for reception staff..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-hidden resize-none"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    {updating ? 'Saving Changes...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
