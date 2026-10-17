import React from 'react';
import { Link } from '../../context/RouterContext.js';
import { useHotel } from '../../context/HotelContext.js';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { hotelInfo, getWhatsAppUrl } = useHotel();
  const logoUrl = 'https://larrykinghotel.com/wp-content/uploads/2026/04/cropped-WhatsApp_Image_2026-02-23_at_12.51.08-removebg-preview.png';

  return (
    <footer className="bg-[#141d27] text-slate-300 pt-16 pb-12 border-t-4 border-[#ffc200]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 shrink-0 bg-slate-900 rounded-lg p-1.5 border border-[#ffc200]/40 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Larry King Hotel & Suite"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Larry King</h3>
                <p className="text-xs uppercase font-semibold text-[#ffc200] tracking-wider">Hotel & Suite</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Experience refined comfort, attentive Nigerian hospitality, and a tranquil escape at Larry King Hotel & Suite in Imota, Ikorodu. Offering luxury rooms, steady 24/7 power, sparkling swimming pool, and an executive event hall.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={getWhatsAppUrl('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md inline-flex items-center gap-1.5 transition-colors"
              >
                <span>WhatsApp Front Desk</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#ffc200]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>About Larry King Hotel</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Accommodations & Suites</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Photo Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location & Contact</span>
                </Link>
              </li>
              <li>
                <Link to="/booking-lookup" className="hover:text-[#ffc200] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Find My Reservation</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Room Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#ffc200]">
              Our Rooms
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/rooms/standard" className="hover:text-[#ffc200] transition-colors flex items-center justify-between">
                  <span>Standard Room</span>
                  <span className="text-xs text-[#ffc200]">₦20,000 / night</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms/deluxe" className="hover:text-[#ffc200] transition-colors flex items-center justify-between">
                  <span>Deluxe Room</span>
                  <span className="text-xs text-[#ffc200]">₦25,000 / night</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms/executive" className="hover:text-[#ffc200] transition-colors flex items-center justify-between">
                  <span>Executive Room</span>
                  <span className="text-xs text-[#ffc200]">₦30,000 / night</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms/suite" className="hover:text-[#ffc200] transition-colors flex items-center justify-between">
                  <span>Executive Suite</span>
                  <span className="text-xs text-[#ffc200]">₦40,000 / night</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/book" className="text-xs font-semibold uppercase tracking-wider text-[#ffc200] hover:underline flex items-center gap-1">
                  <span>Check Live Availability &rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#ffc200]">
              Hotel Information
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ffc200] shrink-0 mt-1" />
                <span className="text-xs leading-relaxed text-slate-400">
                  {hotelInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ffc200] shrink-0" />
                <a href={`tel:${hotelInfo.phone}`} className="hover:text-[#ffc200] transition-colors text-xs">
                  {hotelInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ffc200] shrink-0" />
                <div className="text-xs space-y-0.5">
                  <div><a href={`mailto:${hotelInfo.bookingEmail}`} className="hover:text-[#ffc200]">{hotelInfo.bookingEmail}</a></div>
                  <div><a href={`mailto:${hotelInfo.infoEmail}`} className="hover:text-[#ffc200]">{hotelInfo.infoEmail}</a></div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#ffc200] shrink-0" />
                <span className="text-xs text-slate-400">
                  Check-in: 2:00 PM | Check-out: 12:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line & Legal */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} {hotelInfo.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/booking-terms" className="hover:text-slate-300 transition-colors">
              Booking Terms & Cancellation
            </Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-[#ffc200] transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
