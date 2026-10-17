import React from 'react';
import { useHotel } from '../context/HotelContext.js';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from '../context/RouterContext.js';

export const PrivacyPolicyPage: React.FC = () => {
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
              Legal &amp; Privacy
            </span>
            <h1 className="text-3xl font-bold text-slate-900 font-[Poppins]">
              Privacy Policy
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Effective Date: Last updated October 2026 • Larry King Hotel And Suite
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">1. Introduction</h2>
              <p>
                Larry King Hotel And Suite (&ldquo;the Hotel&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to respecting the privacy and data confidentiality of our guests, visitors, and corporate clients. This Privacy Policy details how we collect, store, utilize, and protect personal data gathered through our website and on-site hospitality operations at 11 Babatunde Labiyi Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">2. Information We Collect</h2>
              <p>When you make an accommodation reservation, register for an event, or submit an inquiry, we collect:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Primary contact details: Full name, telephone/WhatsApp number, and email address.</li>
                <li>Stay information: Arrival date, departure date, room category, number of guests, and special accommodation requests.</li>
                <li>Payment verification records: Transaction reference codes and payment status. We never collect or store raw debit/credit card numbers on our servers.</li>
                <li>Identification data: National ID, voter&rsquo;s card, or international passport presented upon physical check-in in compliance with Nigerian hospitality regulatory requirements.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">3. How Your Information Is Used</h2>
              <p>We process your personal information strictly for legitimate hospitality and business objectives:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>To confirm, process, and manage your room reservations and event hall bookings.</li>
                <li>To transmit booking receipts, payment confirmations, and stay notifications.</li>
                <li>To provide dedicated front desk assistance and customer support via telephone, email, or WhatsApp.</li>
                <li>To comply with statutory law enforcement and hospitality security regulations within Lagos State, Nigeria.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">4. Data Protection &amp; Confidentiality</h2>
              <p>
                We employ industry-standard encryption protocols (TLS/HTTPS) and database security measures. We do not sell, rent, or trade your personal information with any third-party marketing companies. Access to your reservation history is strictly restricted to authorized hotel staff.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-[Poppins]">5. Contact Us Regarding Your Data</h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to update or delete your contact records, please contact our management office:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
                <p><strong>Hotel:</strong> Larry King Hotel And Suite</p>
                <p><strong>Address:</strong> 11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria</p>
                <p><strong>Email:</strong> {hotelInfo.infoEmail} / {hotelInfo.bookingEmail}</p>
                <p><strong>Telephone:</strong> {hotelInfo.phone}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
