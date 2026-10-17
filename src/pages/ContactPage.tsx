import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext.js';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { hotelInfo, getWhatsAppUrl } = useHotel();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAFBFC] min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[#1559ed] block mb-1">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Poppins]">
            Contact &amp; Location
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Have questions about room availability, event hall rentals, or driving directions to Imota, Ikorodu? Our hospitality team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-[Poppins]">
                Hotel Contact Information
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1559ed] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Physical Address</h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Telephone</h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      <a href={`tel:${hotelInfo.phone}`} className="hover:text-[#1559ed] font-medium">
                        {hotelInfo.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Email Enquiries</h3>
                    <div className="text-slate-600 text-xs sm:text-sm mt-1 space-y-0.5">
                      <p><a href={`mailto:${hotelInfo.bookingEmail}`} className="hover:text-[#1559ed]">{hotelInfo.bookingEmail}</a> (Reservations)</p>
                      <p><a href={`mailto:${hotelInfo.infoEmail}`} className="hover:text-[#1559ed]">{hotelInfo.infoEmail}</a> (General Enquiries)</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Operating Hours</h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      Front Desk &amp; Customer Support: 24 Hours / 7 Days
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href={getWhatsAppUrl('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-center text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Start Instant WhatsApp Chat</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent('Larry King Hotel and Suite Imota Ikorodu Lagos')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold py-3 px-4 rounded-xl text-center text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View Location in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form & Map (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 font-[Poppins] mb-4">
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">Message Received</h3>
                  <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                    Thank you, {name}. Our front desk reception team will respond to your enquiry via email or WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setMessage(''); }}
                    className="text-xs font-semibold text-emerald-800 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Kenneth Okafor"
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
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden"
                      >
                        <option value="General Enquiry">General Enquiry</option>
                        <option value="Room Booking Assistance">Room Booking Assistance</option>
                        <option value="500-Seater Event Hall Booking">500-Seater Event Hall Booking</option>
                        <option value="Pool Access & Day Visitors">Pool Access &amp; Day Visitors</option>
                        <option value="Corporate / Group Retreat">Corporate / Group Retreat</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please write your enquiry here..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1559ed] outline-hidden resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#1559ed] hover:bg-[#124bca] text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm text-sm transition-all flex items-center gap-2 focus:ring-2 focus:ring-[#1559ed]/50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Map Frame */}
            <div className="h-72 rounded-3xl overflow-hidden border border-slate-300 shadow-sm relative">
              <iframe
                title="Larry King Hotel & Suite Location Map"
                src="https://maps.google.com/maps?q=Imota,%20Ikorodu,%20Lagos,%20Nigeria&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
