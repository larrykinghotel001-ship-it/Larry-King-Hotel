import React, { createContext, useContext, useState, useEffect } from 'react';
import { HotelInfo, PaymentConfig } from '../types/index.js';

interface HotelContextType {
  hotelInfo: HotelInfo;
  paymentConfig: PaymentConfig | null;
  loading: boolean;
  formatCurrency: (amount: number) => string;
  getWhatsAppUrl: (messageType: 'general' | 'availability' | 'booking' | 'directions', customDetails?: string) => string;
}

const defaultHotelInfo: HotelInfo = {
  name: 'Larry King Hotel And Suite',
  displayName: 'Larry King Hotel & Suite',
  tagline: 'Where Comfort Meets Exceptional Hospitality',
  phone: '+234-9071286050',
  whatsapp: '2349071286050',
  bookingEmail: 'Booking@larrykinghotel.com',
  infoEmail: 'Info@larrykinghotel.com',
  address: '11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  policies: {
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in. Non-refundable within 24 hours of arrival.',
    taxRatePercent: 0,
    serviceFeePercent: 0,
    minimumStayNights: 1
  },
  facilities: []
};

const HotelContext = createContext<HotelContextType>({
  hotelInfo: defaultHotelInfo,
  paymentConfig: null,
  loading: false,
  formatCurrency: (val) => `₦${val.toLocaleString()}`,
  getWhatsAppUrl: () => '#'
});

export const useHotel = () => useContext(HotelContext);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(defaultHotelInfo);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [infoRes, payRes] = await Promise.all([
          fetch('/api/hotel-info'),
          fetch('/api/payments/config')
        ]);
        if (infoRes.ok) {
          const info = await infoRes.json();
          setHotelInfo(info);
        }
        if (payRes.ok) {
          const pay = await payRes.json();
          setPaymentConfig(pay);
        }
      } catch (err) {
        console.error('Failed to load hotel info from API, using verified defaults.', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return `${hotelInfo.currencySymbol || '₦'}${Number(amount || 0).toLocaleString('en-NG')}`;
  };

  const getWhatsAppUrl = (
    messageType: 'general' | 'availability' | 'booking' | 'directions',
    customDetails?: string
  ): string => {
    const rawNumber = hotelInfo.whatsapp.replace(/[^0-9]/g, '') || '2349071286050';
    let text = '';

    switch (messageType) {
      case 'general':
        text = `Hello Front Desk at Larry King Hotel & Suite. I would like to make an enquiry regarding accommodation and facilities.`;
        break;
      case 'availability':
        text = `Hello Larry King Hotel & Suite. I would like to enquire about room availability for my upcoming stay.`;
        break;
      case 'booking':
        text = customDetails 
          ? `Hello Larry King Hotel & Suite, I have a reservation enquiry regarding reference: ${customDetails}.`
          : `Hello Larry King Hotel & Suite, I have a question regarding my room reservation.`;
        break;
      case 'directions':
        text = `Hello Larry King Hotel & Suite. Please share driving directions to the hotel at 11 Babatunde Labiyi Avenue, Imota, Ikorodu.`;
        break;
    }

    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <HotelContext.Provider value={{ hotelInfo, paymentConfig, loading, formatCurrency, getWhatsAppUrl }}>
      {children}
    </HotelContext.Provider>
  );
};
