import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../context/RouterContext.js';
import { useHotel } from '../../context/HotelContext.js';
import { Phone, Calendar, Menu, X, MapPin, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { pathname } = useRouter();
  const { hotelInfo } = useHotel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Rooms & Suites', href: '/rooms' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
    { label: 'Find Reservation', href: '/booking-lookup' },
  ];

  const logoUrl = 'https://larrykinghotel.com/wp-content/uploads/2026/04/cropped-WhatsApp_Image_2026-02-23_at_12.51.08-removebg-preview.png';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-xs transition-all duration-200">
      {/* Top Notification Bar */}
      <div className="bg-[#192a3d] text-white text-xs py-2 px-4 border-b border-[#243a53]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ffc200]" />
              <span className="hidden md:inline">11 Babatunde Labiyi Ave, Agundungbu,</span> Imota, Ikorodu, Lagos
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <a 
              href={`tel:${hotelInfo.phone}`} 
              className="flex items-center gap-1.5 hover:text-[#ffc200] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#ffc200]" />
              <span>{hotelInfo.phone}</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="text-[#ffc200] font-medium hidden lg:inline">24/7 Guaranteed Power & Free High-Speed Wi-Fi</span>
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1 hover:text-[#ffc200] text-slate-400 text-[11px] transition-colors"
              title="Staff & Management Portal"
            >
              <Shield className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
            <div className="h-14 w-14 shrink-0 flex items-center justify-center bg-slate-900 rounded-lg p-1.5 border border-[#ffc200]/30 shadow-xs">
              <img
                src={logoUrl}
                alt="Larry King Hotel & Suite Official Crest"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  // Fallback if network blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-[#192a3d] tracking-tight font-[Poppins] leading-tight group-hover:text-[#1559ed] transition-colors">
                Larry King
              </span>
              <span className="text-xs tracking-widest text-[#ffc200] uppercase font-semibold font-[Poppins]">
                Hotel & Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#1559ed] relative py-2 ${
                    isActive ? 'text-[#1559ed] font-semibold' : 'text-slate-700'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffc200] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-sm focus:ring-2 focus:ring-[#ffc200]/50"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Room</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/book"
              className="sm:hidden bg-[#ffc200] text-slate-950 px-3 py-1.5 rounded-md text-xs font-semibold"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-6 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-slate-100 text-[#1559ed] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/book"
                className="w-full flex items-center justify-center gap-2 bg-[#ffc200] text-slate-950 py-3 rounded-lg font-semibold text-center shadow-xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Your Room</span>
              </Link>
              <a
                href={`tel:${hotelInfo.phone}`}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium text-sm text-center"
              >
                <Phone className="w-4 h-4 text-[#ffc200]" />
                <span>Call Front Desk: {hotelInfo.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
