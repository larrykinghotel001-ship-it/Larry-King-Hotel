import React from 'react';
import { RoomType } from '../../types/index.js';
import { useHotel } from '../../context/HotelContext.js';
import { Link } from '../../context/RouterContext.js';
import { Users, Bed, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface RoomCardProps {
  room: RoomType;
  selectedDates?: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  };
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, selectedDates }) => {
  const { formatCurrency } = useHotel();

  const bookUrl = selectedDates
    ? `/book?roomType=${room.slug}&checkIn=${selectedDates.checkIn}&checkOut=${selectedDates.checkOut}&adults=${selectedDates.adults}&children=${selectedDates.children}&rooms=${selectedDates.rooms}`
    : `/book?roomType=${room.slug}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col group">
      {/* Image Container with Badges */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
        <img
          src={room.featuredImageUrl}
          alt={`${room.name} at Larry King Hotel & Suite`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Nightly Rate Badge */}
        <div className="absolute bottom-4 left-4 text-white">
          <span className="text-xs uppercase font-medium tracking-wider text-[#ffc200] block">Starting from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-[Poppins] tracking-tight text-white drop-shadow-xs">
              {formatCurrency(room.baseRateNgn)}
            </span>
            <span className="text-xs text-slate-200">/ night</span>
          </div>
        </div>

        {/* Bed type badge */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
          <Bed className="w-3.5 h-3.5 text-[#ffc200]" />
          <span>{room.bedType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Up to {room.maxOccupancy} Guests</span>
            </span>
            {room.roomSizeSqm && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                {room.roomSizeSqm} m²
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#1559ed] transition-colors mb-2">
            {room.name}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {room.headline || room.description}
          </p>

          {/* Key Amenities (First 4) */}
          <div className="space-y-1.5 mb-6">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <Link
            to={`/rooms/${room.slug}`}
            className="flex-1 text-center py-2.5 px-3 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium text-xs sm:text-sm rounded-lg transition-colors"
          >
            View Room
          </Link>
          <Link
            to={bookUrl}
            className="flex-1 text-center py-2.5 px-3 bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-semibold text-xs sm:text-sm rounded-lg shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
