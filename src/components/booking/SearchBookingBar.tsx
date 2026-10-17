import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext.js';
import { Calendar, Users, Home, Search, AlertCircle } from 'lucide-react';

interface SearchBookingBarProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
  variant?: 'hero' | 'compact';
}

export const SearchBookingBar: React.FC<SearchBookingBarProps> = ({
  initialCheckIn,
  initialCheckOut,
  initialAdults = 1,
  initialChildren = 0,
  initialRooms = 1,
  variant = 'hero'
}) => {
  const { navigate } = useRouter();

  // Helper for date formatting YYYY-MM-DD
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = formatYYYYMMDD(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYYYYMMDD(tomorrow);

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || todayStr);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || tomorrowStr);
  const [adults, setAdults] = useState<number>(initialAdults);
  const [children, setChildren] = useState<number>(initialChildren);
  const [rooms, setRooms] = useState<number>(initialRooms);
  const [error, setError] = useState<string | null>(null);

  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    setError(null);
    if (newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn + 'T00:00:00Z');
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(formatYYYYMMDD(nextDay));
    }
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    setError(null);
    if (newCheckOut <= checkIn) {
      setError('Check-out date must be at least one day after check-in.');
    }
    setCheckOut(newCheckOut);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    if (checkIn < todayStr) {
      setError('Check-in date cannot be in the past.');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out date must be strictly after check-in date.');
      return;
    }

    const query = new URLSearchParams({
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString()
    }).toString();

    navigate(`/availability?${query}`);
  };

  return (
    <div className={`w-full ${variant === 'hero' ? 'bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-slate-100' : 'bg-slate-50 rounded-xl p-4 border border-slate-200'}`}>
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
        {/* Check-in */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1559ed]" />
            <span>Check-in</span>
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => handleCheckInChange(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] focus:border-transparent outline-hidden transition-all"
          />
        </div>

        {/* Check-out */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1559ed]" />
            <span>Check-out</span>
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => handleCheckOutChange(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] focus:border-transparent outline-hidden transition-all"
          />
        </div>

        {/* Guests (Adults & Children) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#1559ed]" />
            <span>Guests</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults</option>
              </select>
            </div>
            <div>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
              >
                <option value={0}>0 Kids</option>
                <option value={1}>1 Child</option>
                <option value={2}>2 Kids</option>
                <option value={3}>3 Kids</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[#1559ed]" />
            <span>Rooms</span>
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
          >
            <option value={1}>1 Room</option>
            <option value={2}>2 Rooms</option>
            <option value={3}>3 Rooms</option>
            <option value={4}>4 Rooms</option>
          </select>
        </div>

        {/* Search CTA */}
        <div>
          <button
            type="submit"
            className="w-full bg-[#1559ed] hover:bg-[#124bca] text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-[#1559ed]/50 h-[42px]"
          >
            <Search className="w-4 h-4" />
            <span>Check Availability</span>
          </button>
        </div>
      </form>
    </div>
  );
};
