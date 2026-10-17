import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext.js';
import { MessageCircle, X, ChevronRight, HelpCircle, CalendarCheck, Compass, Info } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const { hotelInfo, getWhatsAppUrl } = useHotel();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      title: 'Room Availability Enquiry',
      desc: 'Ask about vacant rooms, suites & tonight’s rates',
      type: 'availability' as const,
      icon: CalendarCheck
    },
    {
      title: 'Reservation Support',
      desc: 'Assistance with an existing booking or changes',
      type: 'booking' as const,
      icon: HelpCircle
    },
    {
      title: 'Driving Directions',
      desc: 'Get navigation assistance to Imota, Ikorodu',
      type: 'directions' as const,
      icon: Compass
    },
    {
      title: 'General Inquiries',
      desc: 'Facilities, 500-seat event hall & pool access',
      type: 'general' as const,
      icon: Info
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#192a3d] text-white p-4 flex items-center justify-between border-b-2 border-[#ffc200]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight text-white">Larry King Front Desk</h4>
                <p className="text-emerald-400 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Direct WhatsApp Support
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close WhatsApp chat options"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick options */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
            Select a topic to start an instant WhatsApp conversation with front desk staff:
          </div>

          <div className="p-2 divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <a
                  key={opt.type}
                  href={getWhatsAppUrl(opt.type)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 transition-colors group text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-800">
                        {opt.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{opt.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                </a>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-white text-center border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Direct Phone: {hotelInfo.phone}
            </span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-emerald-400/40 group active:scale-95"
        aria-label="Chat with Larry King Hotel on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="text-sm font-semibold tracking-wide pr-1 hidden sm:inline">
          {isOpen ? 'Close Chat' : 'Chat on WhatsApp'}
        </span>
      </button>
    </div>
  );
};
