import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext.js';
import { useHotel } from '../context/HotelContext.js';
import { RoomType } from '../types/index.js';
import { 
  Users, 
  Bed, 
  Maximize2, 
  Check, 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  PhoneCall, 
  Clock, 
  Sparkles 
} from 'lucide-react';

interface RoomDetailPageProps {
  slugOverride?: string;
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({ slugOverride }) => {
  const { pathname, navigate } = useRouter();
  const { formatCurrency, hotelInfo } = useHotel();

  // Extract slug from URL if not overridden
  const slug = slugOverride || pathname.replace('/rooms/', '').trim();

  const [room, setRoom] = useState<RoomType | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoom() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rooms/${slug}`);
        if (!res.ok) {
          setError('Room category not found');
          return;
        }
        const data = await res.json();
        setRoom(data);
        setActiveImage(data.featuredImageUrl);
      } catch (err: any) {
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadRoom();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1559ed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Room Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">
            We could not find the room category you requested. Please browse our active room inventory.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 bg-[#1559ed] text-white px-5 py-2.5 rounded-lg font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Rooms</span>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = Array.from(new Set([room.featuredImageUrl, ...(room.galleryImages || [])]));

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#1559ed] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Accommodations</span>
          </Link>
        </div>

        {/* Room Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1559ed] uppercase tracking-wider mb-1">
              <span>Larry King Hotel Category</span>
              <span>•</span>
              <span className="text-emerald-700">Available to Reserve</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins]">
              {room.name}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              {room.headline || room.description}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-baseline gap-2 shrink-0">
            <span className="text-xs text-slate-500 uppercase font-semibold">Rate:</span>
            <span className="text-3xl font-bold text-[#1559ed] font-[Poppins]">
              {formatCurrency(room.baseRateNgn)}
            </span>
            <span className="text-xs text-slate-500">/ night</span>
          </div>
        </div>

        {/* Images & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Gallery & Amenities (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Featured Image */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-md relative aspect-16/10">
              <img
                src={activeImage}
                alt={`${room.name} photo`}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                <Bed className="w-3.5 h-3.5 text-[#ffc200]" />
                <span>{room.bedType}</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img ? 'border-[#1559ed] shadow-md scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Room thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Room Specs Strip */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Max Guests</p>
                <p className="text-base font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-[#1559ed]" />
                  <span>{room.maxOccupancy} Persons</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Bed Type</p>
                <p className="text-base font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                  <Bed className="w-4 h-4 text-[#1559ed]" />
                  <span>{room.bedType}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Room Size</p>
                <p className="text-base font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                  <Maximize2 className="w-4 h-4 text-[#1559ed]" />
                  <span>{room.roomSizeSqm ? `${room.roomSizeSqm} m²` : 'Spacious'}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Electricity</p>
                <p className="text-base font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>24/7 Steady</span>
                </p>
              </div>
            </div>

            {/* Full Room Description */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xl font-bold text-slate-900 font-[Poppins]">
                Room Overview
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Verified Room Amenities */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 font-[Poppins] mb-6">
                Included Room Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant Booking Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Reserve Online</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-slate-900 font-[Poppins]">
                    {formatCurrency(room.baseRateNgn)}
                  </span>
                  <span className="text-xs text-slate-500">/ night</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#1559ed]" />
                  <span>Direct Booking Advantages:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                  <li>Guaranteed lowest published rate</li>
                  <li>Instant WhatsApp confirmation option</li>
                  <li>Pay online or choose Pay at Hotel</li>
                  <li>Free cancellation up to 24h prior to arrival</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/book?roomType=${room.slug}`}
                  className="w-full bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Proceed to Reservation</span>
                </Link>

                <a
                  href={`tel:${hotelInfo.phone}`}
                  className="w-full border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold py-3 px-4 rounded-xl text-center text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#1559ed]" />
                  <span>Call Front Desk: {hotelInfo.phone}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Check-in:</span>
                  <span className="font-semibold text-slate-700">From 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Check-out:</span>
                  <span className="font-semibold text-slate-700">By 12:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Breakfast:</span>
                  <span className="font-semibold text-slate-700">Complimentary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
