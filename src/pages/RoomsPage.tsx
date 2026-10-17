import React, { useState, useEffect } from 'react';
import { RoomType } from '../types/index.js';
import { RoomCard } from '../components/booking/RoomCard.js';
import { SearchBookingBar } from '../components/booking/SearchBookingBar.js';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      {/* Header */}
      <div className="bg-[#192a3d] text-white py-14 sm:py-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#ffc200] block mb-2">Accommodations</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-[Poppins] tracking-tight">
            Our Rooms &amp; Suites
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Choose the ideal space for your stay in Imota, Ikorodu. Every room is outfitted with silent climate control, pristine bedding, and 24/7 power.
          </p>
        </div>
      </div>

      {/* Floating Availability Bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <SearchBookingBar variant="hero" />
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-[Poppins]">All Room Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Published rates in Nigerian Naira (₦) with zero hidden charges</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>24/7 Power in all rooms</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {/* Room Standards Notice */}
        <div className="mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1559ed] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Steady Electricity</h4>
              <p className="text-xs text-slate-500 mt-1">
                Heavy-duty generator automatic switchover system guarantees uninterrupted power for AC, lighting, and electronics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">High Hygiene Standards</h4>
              <p className="text-xs text-slate-500 mt-1">
                Clean, fresh linens, plush pillows, sanitized bathrooms, and complimentary luxury toiletries are provided with every check-in.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Secure Environment</h4>
              <p className="text-xs text-slate-500 mt-1">
                Gated compound with 24/7 uniformed guards, private parking, and discreet customer service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
