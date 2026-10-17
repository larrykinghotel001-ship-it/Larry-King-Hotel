import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext.js';
import { Reservation } from '../types/index.js';
import { Search, AlertCircle, ShieldCheck, Calendar, Users, MessageCircle, ArrowRight } from 'lucide-react';

export const BookingLookupPage: React.FC = () => {
  const { hotelInfo, formatCurrency } = useHotel();
  const [reference, setReference] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReservation(null);

    const cleanRef = reference.trim().toUpperCase();
    const cleanId = identifier.trim();

    if (!cleanRef || !cleanId) {
      setError('Please provide both your Booking Reference (e.g. LKH-8F492E) and Guest Email or Phone Number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/lookup/${encodeURIComponent(cleanRef)}?verify=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No matching reservation found with the provided details.');
        setLoading(false);
        return;
      }

      setReservation(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with reservation server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed] block mb-1">
            Guest Self-Service
          </span>
          <h1 className="text-3xl font-bold text-slate-900 font-[Poppins]">
            Find My Reservation
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Retrieve your booking status, review stay dates, check payment status, or communicate with the front desk.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                  Booking Reference
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. LKH-8F492E"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-mono uppercase focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1">
                  Guest Verification (Email, Phone, or Last Name)
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. babatunde@example.com or phone"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#1559ed] hover:bg-[#124bca] text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm text-sm transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#1559ed]/50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching Reservation...' : 'Find Reservation'}</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>To protect guest privacy, reservations can only be retrieved with the associated email or phone number.</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Lookup Unsuccessful</p>
              <p className="text-xs sm:text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Found Reservation Display */}
        {reservation && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Booking Reference</span>
                <h3 className="text-xl font-bold font-mono text-[#1559ed]">
                  {reservation.bookingReference}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-semibold uppercase">
                  Status: {reservation.reservationStatus}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                  reservation.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {reservation.paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Room Type</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{reservation.roomType?.name}</p>
                <p className="text-slate-500">{reservation.numberOfRooms} room(s)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Dates</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{reservation.checkInDate}</p>
                <p className="text-slate-500">to {reservation.checkOutDate} ({reservation.numberOfNights} nights)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Guest Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{reservation.guest?.firstName} {reservation.guest?.lastName}</p>
                <p className="text-slate-500">{reservation.adults} Adult(s)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Total Rate</p>
                <p className="font-bold text-[#1559ed] text-sm mt-0.5">{formatCurrency(reservation.totalAmountNgn)}</p>
                <p className="text-slate-500">{reservation.paymentMode.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${hotelInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Larry King Hotel front desk, I am looking up reservation ${reservation.bookingReference}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message Hotel on WhatsApp</span>
              </a>
              <a
                href={`tel:${hotelInfo.phone}`}
                className="border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm text-center transition-colors"
              >
                Call Front Desk: {hotelInfo.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
