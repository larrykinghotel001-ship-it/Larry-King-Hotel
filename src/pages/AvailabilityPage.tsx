import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext.js';
import { useHotel } from '../context/HotelContext.js';
import { AvailabilityResponse } from '../types/index.js';
import { SearchBookingBar } from '../components/booking/SearchBookingBar.js';
import { Calendar, Users, Check, ArrowRight, AlertTriangle, ArrowLeft, Bed } from 'lucide-react';

export const AvailabilityPage: React.FC = () => {
  const { queryParams } = useRouter();
  const { formatCurrency, getWhatsAppUrl } = useHotel();

  // Helper date defaults
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = formatYYYYMMDD(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYYYYMMDD(tomorrow);

  const checkIn = queryParams.checkIn || todayStr;
  const checkOut = queryParams.checkOut || tomorrowStr;
  const adults = Number(queryParams.adults) || 1;
  const children = Number(queryParams.children) || 0;
  const rooms = Number(queryParams.rooms) || 1;

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          checkIn,
          checkOut,
          adults: adults.toString(),
          children: children.toString(),
          rooms: rooms.toString()
        }).toString();

        const res = await fetch(`/api/availability?${query}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Failed to search room availability');
          return;
        }

        const data = await res.json();
        setAvailability(data);
      } catch (err: any) {
        setError(err.message || 'Network error while checking room inventory');
      } finally {
        setLoading(false);
      }
    }

    if (checkIn && checkOut) {
      fetchAvailability();
    }
  }, [checkIn, checkOut, adults, children, rooms]);

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1559ed] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Rooms</span>
          </Link>
        </div>

        {/* Search Bar / Date Selector Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1559ed]" />
            <span>Search Parameters</span>
          </h2>
          <SearchBookingBar
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialAdults={adults}
            initialChildren={children}
            initialRooms={rooms}
            variant="compact"
          />
        </div>

        {/* Results Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins]">
            Available Accommodations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Showing room types for <strong>{checkIn}</strong> to <strong>{checkOut}</strong> ({availability?.numberOfNights || 1} Night(s), {adults} Adult(s), {rooms} Room(s))
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1559ed] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Checking real-time room availability...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Availability Error</span>
            </div>
            <p>{error}</p>
          </div>
        )}

        {/* Results List */}
        {!loading && availability && (
          <div className="space-y-6">
            {availability.results.map((result) => {
              const rt = result.roomType;
              const isAvailable = result.isAvailable;

              const checkoutUrl = `/book?roomType=${rt.slug}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`;

              return (
                <div
                  key={rt.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isAvailable ? 'border-slate-200 hover:shadow-md' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                    {/* Room Thumbnail (4 cols) */}
                    <div className="lg:col-span-4 rounded-xl overflow-hidden bg-slate-100 aspect-16/10 relative">
                      <img
                        src={rt.featuredImageUrl}
                        alt={rt.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Bed className="w-3 h-3 text-[#ffc200]" />
                        <span>{rt.bedType}</span>
                      </div>
                    </div>

                    {/* Room Specs & Amenities (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-xs">
                          <span className="font-semibold text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>Max {rt.maxOccupancy} Guests</span>
                          </span>
                          {rt.roomSizeSqm && (
                            <span className="text-slate-400">• {rt.roomSizeSqm} m²</span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 font-[Poppins]">
                          {rt.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {rt.headline || rt.description}
                        </p>

                        {/* Amenities pills */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {rt.amenities.slice(0, 4).map((am, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-md"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{am}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                        {isAvailable ? (
                          <span className="text-emerald-700 font-medium">
                            ✓ Available for your requested stay
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            ✕ Unavailable or exceeds room capacity for selected dates
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action (3 cols) */}
                    <div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Total Stay Price
                        </span>
                        <div className="text-2xl font-bold text-[#1559ed] font-[Poppins]">
                          {formatCurrency(result.totalAmountNgn)}
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(result.nightlyRate)} × {result.numberOfNights} night{result.numberOfNights > 1 ? 's' : ''}
                        </p>
                        <p className="text-[11px] text-emerald-700">Taxes &amp; Breakfast Included</p>
                      </div>

                      <div className="pt-4 space-y-2">
                        {isAvailable ? (
                          <Link
                            to={checkoutUrl}
                            className="w-full bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-bold py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                          >
                            <span>Select &amp; Book</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-slate-200 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-center text-xs cursor-not-allowed"
                          >
                            Sold Out / Capacity Exceeded
                          </button>
                        )}
                        <Link
                          to={`/rooms/${rt.slug}`}
                          className="w-full block text-center text-xs text-slate-500 hover:text-slate-800 py-1"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assistance strip */}
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Need customized reservation assistance?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Contact our front desk directly for bulk group bookings or special event stays.</p>
          </div>
          <a
            href={getWhatsAppUrl('availability')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shrink-0 transition-colors"
          >
            WhatsApp Front Desk
          </a>
        </div>
      </div>
    </div>
  );
};
