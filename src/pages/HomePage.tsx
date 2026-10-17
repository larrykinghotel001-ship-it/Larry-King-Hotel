import React, { useState, useEffect } from 'react';
import { RoomType, Testimonial, GalleryItem } from '../types/index.js';
import { useHotel } from '../context/HotelContext.js';
import { Link } from '../context/RouterContext.js';
import { SearchBookingBar } from '../components/booking/SearchBookingBar.js';
import { RoomCard } from '../components/booking/RoomCard.js';
import { 
  Zap, 
  Waves, 
  Wifi, 
  Building, 
  Wind, 
  Coffee, 
  ShieldCheck, 
  PhoneCall, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { hotelInfo, getWhatsAppUrl } = useHotel();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [roomsRes, testRes, gallRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/testimonials'),
          fetch('/api/gallery')
        ]);

        if (roomsRes.ok) setRooms(await roomsRes.json());
        if (testRes.ok) setTestimonials(await testRes.json());
        if (gallRes.ok) setGallery(await gallRes.json());
      } catch (e) {
        console.error('Error loading home data:', e);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadHomeData();
  }, []);

  const verifiedFacilities = [
    {
      title: '24/7 Power Supply',
      desc: 'Dual synchronized heavy-duty diesel generators guarantee 100% uninterrupted electricity throughout your stay.',
      icon: Zap
    },
    {
      title: 'Swimming Pool',
      desc: 'Pristine, treated outdoor swimming pool with clean sun lounger deck for unwinding and weekend relaxation.',
      icon: Waves
    },
    {
      title: 'Free High-Speed Wi-Fi',
      desc: 'Dedicated enterprise fiber optic wireless internet covering all guest rooms, VIP lounge, and pool premises.',
      icon: Wifi
    },
    {
      title: '500-Seater Event Hall',
      desc: 'Spacious, fully air-conditioned banquet and convention hall equipped for weddings, birthdays, and corporate retreats.',
      icon: Building
    },
    {
      title: 'Air Conditioning',
      desc: 'Modern, whisper-quiet split air conditioning units with custom climate control in every room.',
      icon: Wind
    },
    {
      title: 'Breakfast Available',
      desc: 'Delicious freshly cooked local and continental breakfast served to order daily.',
      icon: Coffee
    },
    {
      title: 'Secure Parking Space',
      desc: 'Fenced, paved compound with 24-hour uniformed security personnel and monitored access gates.',
      icon: ShieldCheck
    },
    {
      title: 'Intercom House Phone',
      desc: 'Direct telephone line from your bedside to front desk reception and round-the-clock room service.',
      icon: PhoneCall
    }
  ];

  const heroImageUrl = 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-02-07-at-17.58.52.jpeg';

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
        {/* Background photo with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImageUrl}
            alt="Larry King Hotel and Suite Compound and Building in Imota Ikorodu"
            className="w-full h-full object-cover object-center filter brightness-50 contrast-105 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#ffc200]/20 border border-[#ffc200]/50 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-medium text-[#ffc200] animate-in fade-in duration-500">
            <span className="w-2 h-2 rounded-full bg-[#ffc200] animate-ping" />
            <span>Welcome to Imota, Ikorodu’s Premier Luxury Retreat</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-[Poppins] tracking-tight text-white max-w-4xl leading-tight sm:leading-tight mb-6">
            Experience Timeless Luxury
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl font-light mb-10 leading-relaxed">
            Discover comfort, attentive hospitality, and a relaxing stay at Larry King Hotel &amp; Suite in Imota, Ikorodu, Lagos.
          </p>

          {/* Real Search Bar Card */}
          <div className="w-full max-w-4xl text-left">
            <SearchBookingBar variant="hero" />
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / TRUST STRIP */}
      <section className="bg-white border-y border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-3">
            <div className="text-2xl font-bold text-[#1559ed] font-[Poppins]">24/7 Steady</div>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-medium">Power Supply Guaranteed</p>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-[#1559ed] font-[Poppins]">100% Secure</div>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-medium">Gated Premises &amp; Guards</p>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-[#1559ed] font-[Poppins]">500-Seater</div>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-medium">Banquet &amp; Event Hall</p>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-[#1559ed] font-[Poppins]">₦20k - ₦40k</div>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-medium">Transparent Room Rates</p>
          </div>
        </div>
      </section>

      {/* 3. ROOM CATEGORIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#1559ed] font-bold">Accommodations</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins] mt-2 mb-4">
            Hotel Rooms &amp; Suites
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose from our stylishly furnished, air-conditioned rooms designed for peaceful rest, productivity, and luxury. All room rates are published transparently.
          </p>
        </div>

        {loadingRooms ? (
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

        <div className="mt-12 text-center">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1559ed] hover:text-[#124bca] hover:underline"
          >
            <span>Explore All Room Amenities &amp; Policies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Mosaic */}
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-4/3">
                <img
                  src="https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-12-25-at-09.39.07.jpeg"
                  alt="Outdoor swimming pool at Larry King Hotel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-8 -right-8 w-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 z-20">
                <img
                  src="https://larrykinghotel.com/wp-content/uploads/2026/04/InShot_20251225_100527023.jpg"
                  alt="Compound and parking space"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-28 h-28 bg-[#ffc200]/20 rounded-full blur-2xl -z-10" />
            </div>

            {/* Content */}
            <div className="space-y-6 lg:pl-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#1559ed] font-bold">About Us</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins] mt-2">
                  Choose Us Once, And You Will Choose Us Always
                </h2>
              </div>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Situated in Agundungbu, Imota, Ikorodu, <strong>Larry King Hotel &amp; Suite</strong> was conceived to provide a tranquil sanctuary for travelers, corporate executives, and celebration hosts seeking first-rate hospitality away from the noise of the metropolis.
              </p>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                We believe hospitality is about genuine warmth, reliable conveniences, and peace of mind. From steady 24/7 power backed by dual heavy-duty generators to crystal-clear swimming pool recreation and an expansive 500-guest event hall, our dedicated staff ensures every stay is seamless and memorable.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dual Backup Generator Power</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secured On-site Parking</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Poolside Sun Loungers</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Warm &amp; Attentive Front Desk</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/about"
                  className="bg-[#192a3d] hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-xs"
                >
                  Discover More About Us
                </Link>
                <a
                  href={`tel:${hotelInfo.phone}`}
                  className="border border-slate-300 hover:border-slate-400 text-slate-800 px-5 py-3 rounded-lg font-semibold text-sm transition-colors"
                >
                  Call: {hotelInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOTEL FACILITIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#1559ed] font-bold">Classy Facilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins] mt-2 mb-4">
            Our Hotel Facilities
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need for an effortless, comfortable stay is prepared with attention to detail.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {verifiedFacilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#1559ed] flex items-center justify-center mb-5 group-hover:bg-[#1559ed] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {fac.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. GUEST TESTIMONIALS */}
      <section className="py-20 bg-[#141d27] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#ffc200] font-bold">Guest Experiences</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[Poppins] mt-2 mb-4 text-white">
              What Our Guests Say About Larry King Hotel &amp; Suite
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Real experiences shared by guests who spent their vacation, weekend, or corporate retreat with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div
                key={t.id}
                className="bg-slate-800/80 backdrop-blur-xs p-7 rounded-2xl border border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#ffc200] mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="font-bold text-white text-sm">{t.guestName}</h4>
                  <p className="text-xs text-[#ffc200]">{t.guestLocation || t.stayDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALLERY HIGHLIGHTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#1559ed] font-bold">Visual Tour</span>
            <h2 className="text-3xl font-bold text-slate-900 font-[Poppins] mt-2">
              Hotel &amp; Premises Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1559ed] hover:underline"
          >
            <span>View Full Photo Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.slice(0, 6).map(img => (
            <div
              key={img.id}
              className="group relative h-64 rounded-2xl overflow-hidden bg-slate-100 shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={img.imageUrl}
                alt={img.altText || img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                <span className="text-xs text-[#ffc200] uppercase font-semibold">{img.category}</span>
                <p className="font-bold text-sm">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. LOCATION & MAP DIRECTIONS */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#1559ed] font-bold">Directions &amp; Map</span>
                <h2 className="text-3xl font-bold text-slate-900 font-[Poppins] mt-2">
                  Visit Us in Imota, Ikorodu
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                Larry King Hotel &amp; Suite is easily accessible within the serene residential and commercial corridor of Agundungbu, Imota, Lagos.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <MapPin className="w-5 h-5 text-[#1559ed] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Exact Address</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <Phone className="w-5 h-5 text-[#1559ed] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Telephone Concierge</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <a href={`tel:${hotelInfo.phone}`} className="hover:text-[#1559ed] font-medium">{hotelInfo.phone}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <Mail className="w-5 h-5 text-[#1559ed] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Official Email Inquiries</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {hotelInfo.bookingEmail} | {hotelInfo.infoEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent('Larry King Hotel and Suite Imota Ikorodu Lagos')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1559ed] hover:bg-[#124bca] text-white text-xs font-semibold px-5 py-3 rounded-lg inline-flex items-center gap-2 shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
                <a
                  href={getWhatsAppUrl('directions')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-3 rounded-lg inline-flex items-center gap-2 shadow-sm"
                >
                  <span>Request WhatsApp Directions</span>
                </a>
              </div>
            </div>

            {/* Embedded Visual Map Preview Frame */}
            <div className="lg:col-span-7 h-96 rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-200 relative">
              <iframe
                title="Larry King Hotel & Suite Location Map"
                src="https://maps.google.com/maps?q=Imota,%20Ikorodu,%20Lagos,%20Nigeria&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                aria-label="Google Map of Imota, Ikorodu, Lagos"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md shadow-xs text-xs font-medium text-slate-800 border border-slate-200">
                Imota, Ikorodu, Lagos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL RESERVATION CTA */}
      <section className="bg-gradient-to-r from-[#192a3d] to-[#141d27] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#ffc200] font-bold">Unwind in Luxury</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[Poppins] tracking-tight text-white">
            Reserve Your Stay at Larry King Hotel &amp; Suite
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Standard rooms starting at ₦20,000 / night. Guaranteed steady electricity, sparkling pool, and serene atmosphere await you.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/book"
              className="bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 px-8 py-3.5 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Your Room Online</span>
            </Link>
            <a
              href={`tel:${hotelInfo.phone}`}
              className="border border-slate-600 hover:border-slate-400 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5 text-[#ffc200]" />
              <span>Call Reception</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
