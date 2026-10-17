import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext.js';
import { useHotel } from '../context/HotelContext.js';
import { RoomType, PaymentMode } from '../types/index.js';
import { 
  Calendar, 
  Users, 
  Home, 
  CreditCard, 
  Building, 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Info 
} from 'lucide-react';

export const BookingCheckoutPage: React.FC = () => {
  const { queryParams, navigate } = useRouter();
  const { hotelInfo, paymentConfig, formatCurrency } = useHotel();

  // Helper date defaults
  const formatYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = formatYYYYMMDD(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYYYYMMDD(tomorrow);

  // Form states initialized from URL query params
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string>(queryParams.roomType || 'standard');
  const [checkInDate, setCheckInDate] = useState<string>(queryParams.checkIn || todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(queryParams.checkOut || tomorrowStr);
  const [adults, setAdults] = useState<number>(Number(queryParams.adults) || 1);
  const [children, setChildren] = useState<number>(Number(queryParams.children) || 0);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(Number(queryParams.rooms) || 1);

  // Guest details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('14:00');

  // Payment choice
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('pay_at_hotel');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const list: RoomType[] = await res.json();
          setRoomTypes(list);
          if (queryParams.roomType) {
            setSelectedRoomSlug(queryParams.roomType);
          } else if (list.length > 0) {
            setSelectedRoomSlug(list[0].slug);
          }
        }
      } catch (e) {
        console.error('Failed to load rooms for booking form', e);
      }
    }
    loadRooms();
  }, [queryParams.roomType]);

  const selectedRoom = roomTypes.find(r => r.slug === selectedRoomSlug) || roomTypes[0];

  // Calculate nights
  const start = new Date(checkInDate + 'T00:00:00Z');
  const end = new Date(checkOutDate + 'T00:00:00Z');
  const diffTime = end.getTime() - start.getTime();
  const numberOfNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  // Client preview pricing (Server will authoritatively calculate and charge)
  const nightlyRate = selectedRoom ? selectedRoom.baseRateNgn : 20000;
  const subtotal = nightlyRate * numberOfNights * numberOfRooms;
  const totalAmount = subtotal;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRoom) {
      setError('Please select a valid room category.');
      return;
    }

    if (checkInDate < todayStr) {
      setError('Check-in date cannot be in the past.');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be strictly after check-in date.');
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError('Please complete all required guest fields (Name, Email, and Phone).');
      return;
    }

    if (!agreedTerms) {
      setError('Please accept the booking terms and hotel policies to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        roomTypeId: selectedRoom.id,
        checkInDate,
        checkOutDate,
        adults,
        children,
        numberOfRooms,
        paymentMode,
        estimatedArrivalTime: estimatedArrival,
        guest: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim() || undefined,
          country: 'Nigeria',
          specialRequests: specialRequests.trim() || undefined
        }
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete reservation. Please try again or call the front desk.');
        setSubmitting(false);
        return;
      }

      // If online payment (Paystack) was selected and configured:
      if (paymentMode === 'paystack') {
        const payInitRes = await fetch('/api/payments/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingReference: data.bookingReference,
            callbackUrl: `${window.location.origin}/booking/confirmation/${data.bookingReference}`
          })
        });

        if (payInitRes.ok) {
          const payData = await payInitRes.json();
          if (payData.authorizationUrl) {
            window.location.href = payData.authorizationUrl;
            return;
          }
        }
      }

      // Navigate to confirmation page
      navigate(`/booking/confirmation/${data.bookingReference}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected network error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed] block mb-1">
            Guaranteed Reservation
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins]">
            Reserve Your Room
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete your guest information below. Transparent pricing with no hidden charges.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reservation Notice</p>
              <p className="mt-0.5 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Stay details, Guest details, Payment (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Stay Configuration */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1559ed] text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Select Dates &amp; Category</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Room Category
                  </label>
                  <select
                    value={selectedRoomSlug}
                    onChange={(e) => setSelectedRoomSlug(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  >
                    {roomTypes.map(r => (
                      <option key={r.slug} value={r.slug}>
                        {r.name} — {formatCurrency(r.baseRateNgn)} / night
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Number of Rooms
                  </label>
                  <select
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  >
                    <option value={1}>1 Room</option>
                    <option value={2}>2 Rooms</option>
                    <option value={3}>3 Rooms</option>
                    <option value={4}>4 Rooms</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Arrival Date (Check-in)
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (e.target.value >= checkOutDate) {
                        const d = new Date(e.target.value + 'T00:00:00Z');
                        d.setDate(d.getDate() + 1);
                        setCheckOutDate(formatYYYYMMDD(d));
                      }
                    }}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Departure Date (Check-out)
                  </label>
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Children (Under 12)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  >
                    <option value={0}>0 Children</option>
                    <option value={1}>1 Child</option>
                    <option value={2}>2 Children</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Guest Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1559ed] text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Primary Guest Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Babatunde"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Adeyemi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Booking confirmation will be sent here</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Phone / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 801 234 5678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Estimated Arrival Time
                  </label>
                  <select
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                  >
                    <option value="14:00">2:00 PM - 4:00 PM</option>
                    <option value="16:00">4:00 PM - 6:00 PM</option>
                    <option value="18:00">6:00 PM - 8:00 PM</option>
                    <option value="20:00">8:00 PM - 10:00 PM (Late Check-in)</option>
                    <option value="22:00">After 10:00 PM (Night Arrival)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Special Requests or Dietary Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Extra pillows, pool view preference, early check-in enquiry..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 font-[Poppins] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1559ed] text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Payment Preference</span>
              </h2>

              <div className="space-y-3">
                {/* Option 1: Pay at hotel */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMode === 'pay_at_hotel' ? 'border-[#1559ed] bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="pay_at_hotel"
                      checked={paymentMode === 'pay_at_hotel'}
                      onChange={() => setPaymentMode('pay_at_hotel')}
                      className="mt-1 text-[#1559ed] focus:ring-[#1559ed]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Pay at Hotel (Cash or POS)</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Guaranteed room hold with no upfront deduction. Pay with Nigerian debit card (POS) or cash upon arrival at front desk.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 2: Direct bank transfer */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMode === 'bank_transfer' ? 'border-[#1559ed] bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="bank_transfer"
                      checked={paymentMode === 'bank_transfer'}
                      onChange={() => setPaymentMode('bank_transfer')}
                      className="mt-1 text-[#1559ed] focus:ring-[#1559ed]"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-900">Direct Bank Transfer</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Transfer to Larry King Hotel &amp; Suite’s corporate bank account. Details are displayed on your confirmation page.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 3: Paystack Online Card Payment */}
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMode === 'paystack' ? 'border-[#1559ed] bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="paystack"
                      checked={paymentMode === 'paystack'}
                      onChange={() => setPaymentMode('paystack')}
                      className="mt-1 text-[#1559ed] focus:ring-[#1559ed]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Online Payment via Paystack</span>
                        {paymentConfig?.paystackConfigured ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Instant</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">Awaiting Live API Keys</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pay securely using Visa, Mastercard, Verve, USSD, or Bank Transfer via Paystack.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Agreement checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                    className="mt-0.5 rounded text-[#1559ed] focus:ring-[#1559ed]"
                  />
                  <span>
                    I confirm that the guest information provided is accurate and agree to the{' '}
                    <Link to="/booking-terms" className="text-[#1559ed] underline">Booking Terms &amp; Cancellation Policy</Link>{' '}
                    and <Link to="/privacy" className="text-[#1559ed] underline">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Summary Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-6">
              <h3 className="text-base font-bold text-slate-900 font-[Poppins] border-b border-slate-100 pb-3">
                Booking Summary
              </h3>

              {selectedRoom && (
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={selectedRoom.featuredImageUrl}
                      alt={selectedRoom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedRoom.name}</h4>
                    <p className="text-xs text-slate-500">{selectedRoom.bedType}</p>
                    <p className="text-xs text-[#1559ed] font-semibold mt-0.5">
                      {formatCurrency(selectedRoom.baseRateNgn)} / night
                    </p>
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-semibold text-slate-800">{checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-semibold text-slate-800">{checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-800">{numberOfNights} Night(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms &amp; Guests:</span>
                  <span className="font-semibold text-slate-800">{numberOfRooms} Room(s), {adults} Adult(s)</span>
                </div>
              </div>

              {/* Cost calculation */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes &amp; Fees:</span>
                  <span className="text-emerald-700">₦0.00 (Inclusive)</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Total Price:</span>
                  <span className="text-2xl font-bold text-[#1559ed] font-[Poppins]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#ffc200] hover:bg-[#e58c17] text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#ffc200]/40 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Reservation...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm &amp; Place Reservation</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1">
                <p>Instant confirmation reference generated immediately</p>
                <p className="flex items-center justify-center gap-1 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit encrypted data protection</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
