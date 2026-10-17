import React from 'react';
import { useHotel } from '../context/HotelContext.js';
import { Link } from '../context/RouterContext.js';
import { 
  Zap, 
  ShieldCheck, 
  Waves, 
  Building, 
  Check, 
  Calendar, 
  Phone, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { hotelInfo, getWhatsAppUrl } = useHotel();

  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#192a3d] text-white py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-[#ffc200] block mb-2">Our Story &amp; Hospitality</span>
          <h1 className="text-3xl sm:text-5xl font-bold font-[Poppins] tracking-tight">
            About Larry King Hotel &amp; Suite
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Where Comfort Meets Exceptional Hospitality in Imota, Ikorodu, Lagos State.
          </p>
        </div>
        <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1559ed] bg-blue-50 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hospitality Excellence</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 font-[Poppins]">
              A Refined Retreat in the Heart of Imota
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Larry King Hotel &amp; Suite was established with a singular mission: to provide corporate executives, vacationers, diaspora returnees, and local families with a clean, peaceful, and dependable hotel experience in Imota, Ikorodu.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We recognized that modern guests value reliability above all else. That is why we invested heavily in dual synchronized heavy-duty generator infrastructure to eliminate power disruptions, crystal-clear treated swimming pool filtration, and comprehensive private security with trained guards on a 24-hour rotation.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Whether you are in town for an important business consultation, hosting a 500-guest wedding reception in our grand event hall, or seeking a quiet weekend escape by the pool, Larry King Hotel &amp; Suite welcomes you with open arms.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md aspect-4/5">
              <img
                src="https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-02-07-at-17.58.52.jpeg"
                alt="Hotel front view"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-square">
                <img
                  src="https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-12-25-at-09.39.07.jpeg"
                  alt="Swimming pool view"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-[#192a3d] text-white p-5 rounded-2xl">
                <span className="text-2xl font-bold text-[#ffc200]">100%</span>
                <p className="text-xs text-slate-300 mt-1 uppercase font-semibold">Reliable Power Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars of Service */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed]">Why Guests Choose Us</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins] mt-2">
              Our Core Hospitality Pillars
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Steady 24/7 Power</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enjoy continuous electricity with zero downtime. Our automatic switchover generators keep lights, air conditioning, Wi-Fi, and cold refrigeration running 24 hours daily.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Guaranteed Security</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rest with absolute peace of mind. Our perimeter is completely gated, manned 24/7 by uniformed security guards, and supported by controlled visitor access.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">True Value &amp; Hygiene</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Crisp, freshly laundered linens, immaculate en-suite bathrooms, daily sanitization, and warm staff ready to accommodate your special requests.
              </p>
            </div>
          </div>
        </div>

        {/* Event Hall & Special Gatherings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-16/10">
            <img
              src="https://larrykinghotel.com/wp-content/uploads/2026/04/download-2.jpeg"
              alt="500-seater event hall at Larry King Hotel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed]">Event &amp; Banquet Facilities</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins]">
              500-Seater Grand Event Hall
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Planning a wedding reception, anniversary banquet, birthday celebration, religious seminar, or corporate conference? Our multi-purpose hall comfortably accommodates up to 500 seated guests with full air-conditioning, backup generator electricity, changing rooms, and guest parking.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <a
                href={getWhatsAppUrl('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-5 py-3 rounded-lg inline-flex items-center gap-2 shadow-sm"
              >
                <span>Enquire About Hall Bookings</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hotel Policies Card */}
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200">
          <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1559ed]" />
            <span>Key Hotel Policies &amp; Check-In Guidelines</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Check-In Time</p>
              <p className="mt-1">From 2:00 PM (14:00). Early check-in subject to room availability.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Check-Out Time</p>
              <p className="mt-1">By 12:00 PM noon. Late checkout can be coordinated with the front desk.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Payment Modes</p>
              <p className="mt-1">Cash, POS, Direct Bank Transfer, and online payment via Paystack.</p>
            </div>
          </div>
        </div>

        {/* Reservation CTA */}
        <div className="text-center bg-[#192a3d] text-white rounded-3xl p-10 sm:p-14 shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold font-[Poppins] mb-3">
            Experience Our Hospitality Firsthand
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
            Book online today with guaranteed room hold and transparent rates starting at ₦20,000 / night.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/book"
              className="bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-bold px-7 py-3 rounded-xl text-sm shadow-sm"
            >
              Book a Room Online
            </Link>
            <Link
              to="/rooms"
              className="border border-slate-500 hover:border-slate-300 text-white font-semibold px-6 py-3 rounded-xl text-sm"
            >
              View Room Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
