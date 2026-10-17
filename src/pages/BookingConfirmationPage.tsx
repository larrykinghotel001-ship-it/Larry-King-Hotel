import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext.js';
import { useHotel } from '../context/HotelContext.js';
import { Reservation } from '../types/index.js';
import { 
  CheckCircle, 
  Printer, 
  MessageCircle, 
  Building, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface BookingConfirmationPageProps {
  referenceOverride?: string;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({ referenceOverride }) => {
  const { pathname } = useRouter();
  const { hotelInfo, paymentConfig, formatCurrency } = useHotel();

  const reference = referenceOverride || pathname.replace('/booking/confirmation/', '').trim();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    async function loadConfirmation() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/lookup/${encodeURIComponent(reference)}`);
        if (!res.ok) {
          setError('Booking reference not found. Please verify your reference code or contact front desk reception.');
          return;
        }
        const data = await res.json();
        setReservation(data);
      } catch (err: any) {
        setError(err.message || 'Error retrieving booking confirmation');
      } finally {
        setLoading(false);
      }
    }

    if (reference) {
      loadConfirmation();
    }
  }, [reference]);

  const copyToClipboard = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1559ed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verifying reservation confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Reservation Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">
            {error || 'Unable to locate a reservation with reference code ' + reference}
          </p>
          <div className="space-y-3">
            <Link
              to="/booking-lookup"
              className="block w-full bg-[#1559ed] text-white py-2.5 px-4 rounded-lg font-medium text-sm"
            >
              Search Reservation by Email &amp; Phone
            </Link>
            <Link
              to="/"
              className="block w-full border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg text-sm"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate WhatsApp message prefill
  const waPhone = hotelInfo.whatsapp.replace(/[^0-9]/g, '') || '2349071286050';
  const waText = `Hello Larry King Hotel & Suite. My name is ${reservation.guest?.firstName || ''} ${reservation.guest?.lastName || ''}. I have a confirmed reservation with Reference: ${reservation.bookingReference} for ${reservation.roomType?.name || 'Room'} from ${reservation.checkInDate} to ${reservation.checkOutDate}.`;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-10 sm:py-14 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Header Banner */}
          <div className="bg-[#192a3d] text-white p-6 sm:p-8 text-center border-b-4 border-[#ffc200]">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#ffc200] block mb-1">
              Reservation Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-[Poppins] tracking-tight">
              Thank You, {reservation.guest?.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Your room at Larry King Hotel &amp; Suite is reserved. We look forward to welcoming you to Imota, Ikorodu.
            </p>

            {/* Reference Badge */}
            <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20">
              <span className="text-xs text-slate-300 uppercase font-semibold">Booking Reference:</span>
              <span className="font-mono text-lg font-bold text-[#ffc200] tracking-wider">
                {reservation.bookingReference}
              </span>
              <button
                onClick={copyToClipboard}
                className="text-slate-300 hover:text-white transition-colors"
                title="Copy reference code"
              >
                {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Reservation Status & Payment Status */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Reservation Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {reservation.reservationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Payment Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${reservation.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {reservation.paymentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Summary Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Stay Details
              </h3>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Room Category</span>
                  <span className="font-bold text-slate-900">{reservation.roomType?.name} ({reservation.numberOfRooms} Room)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Check-in Date</span>
                  <span className="font-semibold text-slate-800">{reservation.checkInDate} (From 2:00 PM)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Check-out Date</span>
                  <span className="font-semibold text-slate-800">{reservation.checkOutDate} (By 12:00 PM)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-800">{reservation.numberOfNights} Night(s)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Guests</span>
                  <span className="font-semibold text-slate-800">{reservation.adults} Adult(s){reservation.children > 0 ? `, ${reservation.children} Child` : ''}</span>
                </div>
                <div className="p-3.5 flex justify-between bg-slate-50 font-bold">
                  <span className="text-slate-700">Total Charged Rate</span>
                  <span className="text-base text-[#1559ed]">{formatCurrency(reservation.totalAmountNgn)}</span>
                </div>
              </div>
            </div>

            {/* Guest Summary */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Guest Contact
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm space-y-1 text-slate-600">
                <p><strong className="text-slate-800">Name:</strong> {reservation.guest?.firstName} {reservation.guest?.lastName}</p>
                <p><strong className="text-slate-800">Email:</strong> {reservation.guest?.email}</p>
                <p><strong className="text-slate-800">Phone:</strong> {reservation.guest?.phone}</p>
                {reservation.guest?.specialRequests && (
                  <p><strong className="text-slate-800">Special Notes:</strong> {reservation.guest.specialRequests}</p>
                )}
              </div>
            </div>

            {/* Bank Transfer Instructions (If applicable) */}
            {reservation.paymentMode === 'bank_transfer' && reservation.paymentStatus !== 'paid' && (
              <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Building className="w-4 h-4" />
                  <span>Direct Bank Transfer Instructions</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Please initiate a bank transfer of <strong>{formatCurrency(reservation.totalAmountNgn)}</strong> to our corporate bank account:
                </p>
                <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1 font-mono text-slate-800">
                  <p><strong>Bank:</strong> {paymentConfig?.bankDetails.bankName || 'Guaranty Trust Bank (GTB)'}</p>
                  <p><strong>Account Name:</strong> {paymentConfig?.bankDetails.accountName || 'Larry King Hotel & Suite Ltd'}</p>
                  <p><strong>Account Number:</strong> {paymentConfig?.bankDetails.accountNumber || '0123456789'}</p>
                  <p><strong>Payment Narrative/Reference:</strong> {reservation.bookingReference}</p>
                </div>
                <p className="text-[11px] text-amber-700">
                  After transfer, kindly click the WhatsApp button below to share proof of transfer with our accountant.
                </p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="space-y-3 pt-2 print:hidden">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat with Front Desk on WhatsApp</span>
              </a>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <Link
                  to="/"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm text-center flex items-center justify-center transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>

            {/* Hotel Location & Emergency Assistance */}
            <div className="border-t border-slate-100 pt-6 text-xs text-slate-500 space-y-1 text-center">
              <p className="font-bold text-slate-800">Larry King Hotel &amp; Suite</p>
              <p>{hotelInfo.address}</p>
              <p>Front Desk Direct: <a href={`tel:${hotelInfo.phone}`} className="text-[#1559ed]">{hotelInfo.phone}</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
