import React from 'react';
import { Link } from '../context/RouterContext.js';
import { Home, Calendar, Phone, ArrowLeft } from 'lucide-react';
import { useHotel } from '../context/HotelContext.js';

export const NotFoundPage: React.FC = () => {
  const { hotelInfo } = useHotel();

  return (
    <div className="bg-[#FAFBFC] min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-[#1559ed] flex items-center justify-center mx-auto text-3xl font-extrabold font-[Poppins]">
          404
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-[Poppins]">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us help guide you to where you need to be.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            to="/"
            className="w-full bg-[#1559ed] hover:bg-[#124bca] text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/rooms"
            className="w-full bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Explore Rooms &amp; Suites</span>
          </Link>

          <a
            href={`tel:${hotelInfo.phone}`}
            className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#1559ed]" />
            <span>Call Reception: {hotelInfo.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
