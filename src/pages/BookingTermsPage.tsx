import React from 'react';
import { useHotel } from '../context/HotelContext.js';
import { Clock, ShieldAlert, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from '../context/RouterContext.js';

export const BookingTermsPage: React.FC = () => {
  const { hotelInfo } = useHotel();

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1559ed] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed] block mb-1">
              Guest Policies &amp; Rules
            </span>
            <h1 className="text-3xl font-bold text-slate-900 font-[Poppins]">
              Booking Terms &amp; Cancellation Policy
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Effective Date: Last updated October 2026 • Larry King Hotel And Suite
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1559ed]" />
                <span>1. Check-In &amp; Check-Out Timing</span>
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Check-in Time:</strong> 2:00 PM (14:00 West Africa Time). Early check-in is subject to room availability on the day of arrival.</li>
                <li><strong>Check-out Time:</strong> 12:00 PM noon (12:00 West Africa Time).</li>
                <li><strong>Late Check-Out:</strong> Check-out between 12:00 PM and 6:00 PM is subject to 50% of the room rate; check-out after 6:00 PM constitutes a full night&rsquo;s stay.</li>
                <li><strong>Guest Identification:</strong> Every adult guest checking into the hotel must produce a valid government-issued photographic ID (National Identification Card, Driver&rsquo;s License, Voter&rsquo;s Card, or International Passport).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1559ed]" />
                <span>2. Payment Terms &amp; Rates</span>
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>All room rates are quoted in Nigerian Naira (₦).</li>
                <li>Accepted payment methods include Nigerian Debit Cards (via on-site POS or Paystack online gateway), Cash, and Direct Bank Transfer to the hotel corporate account.</li>
                <li>For &ldquo;Pay at Hotel&rdquo; reservations, rooms are held until 6:00 PM on the arrival date unless a late arrival time has been specified or guaranteed by advance payment.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#1559ed]" />
                <span>3. Cancellation &amp; Refund Policy</span>
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Free Cancellation:</strong> You may cancel or modify your reservation up to <strong>24 hours prior</strong> to your scheduled check-in date without penalty.</li>
                <li><strong>Late Cancellation &amp; No-Show:</strong> Cancellations made within 24 hours of arrival or non-arrivals (No-Show) are subject to a cancellation fee equivalent to one night&rsquo;s room rate.</li>
                <li><strong>Refund Processing:</strong> Approved refunds for payments made via debit card or bank transfer will be processed within 3 to 5 business days after validation.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">4. Property Rules &amp; Guest Conduct</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Non-Smoking Indoors:</strong> Smoking of cigarettes, cigars, shisha, or electronic vapes is strictly prohibited inside guest rooms. Designated smoking zones are located outside in the terrace area.</li>
                <li><strong>Noise &amp; Serenity:</strong> To preserve the peace of all guests, excessive noise and loud audio after 10:00 PM are strictly prohibited in accommodation corridors.</li>
                <li><strong>Swimming Pool Safety:</strong> Pool usage is at guest risk. Children under 16 years must be accompanied by an adult. Glassware is not permitted around the pool deck.</li>
                <li><strong>Property Damage:</strong> Guests are liable for any physical damage caused to hotel furniture, electronics, linens, or fixtures during their stay.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">5. Inquiries &amp; Reservation Amendments</h2>
              <p>
                To modify or cancel a reservation, please contact our front desk with your unique Booking Reference:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
                <p><strong>Reservations Desk:</strong> {hotelInfo.bookingEmail}</p>
                <p><strong>Front Desk Phone:</strong> {hotelInfo.phone}</p>
                <p><strong>WhatsApp Support:</strong> +{hotelInfo.whatsapp}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
