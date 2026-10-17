import express from 'express';
import { db } from '../db.js';
import { AvailabilityQuerySchema, CreateBookingSchema } from '../validation.js';
import { sendReservationEmail } from './notifications.js';

const router = express.Router();

// 1. HOTEL GENERAL INFORMATION
router.get('/hotel-info', (req, res) => {
  const settings = db.getSettings();
  res.json({
    name: settings.general.hotelName,
    displayName: settings.general.displayName,
    tagline: settings.general.tagline,
    phone: settings.general.phone,
    whatsapp: settings.general.whatsapp,
    bookingEmail: settings.general.bookingEmail,
    infoEmail: settings.general.infoEmail,
    address: settings.general.address,
    currency: settings.general.currency,
    currencySymbol: settings.general.currencySymbol,
    policies: settings.policies,
    facilities: [
      { name: '24/7 Guaranteed Steady Power', description: 'Dual automated diesel generators guarantee uninterrupted electricity around the clock.', icon: 'Zap' },
      { name: 'Sparkling Swimming Pool', description: 'Crystal-clear outdoor swimming pool with sun loungers and tranquil poolside relaxation.', icon: 'Waves' },
      { name: 'High-Speed Wi-Fi', description: 'Complimentary fiber optic wireless internet throughout all rooms and public premises.', icon: 'Wifi' },
      { name: 'Grand 500-Seater Event Hall', description: 'Expansive, air-conditioned banquet and conference hall for weddings, meetings, and parties.', icon: 'Building' },
      { name: 'Silent Climate Control (AC)', description: 'Individual temperature control air conditioning in every room and suite.', icon: 'Wind' },
      { name: 'Complimentary Gourmet Breakfast', description: 'Freshly prepared breakfast served daily to energize your morning.', icon: 'Coffee' },
      { name: 'Secure On-Site Parking', description: 'Paved, fenced compound with 24-hour uniformed security guards and surveillance.', icon: 'ShieldCheck' },
      { name: 'Intercom House Phone', description: 'Instant one-touch front desk assistance, concierge, and room service.', icon: 'PhoneCall' }
    ]
  });
});

// 2. GET ALL ROOM TYPES
router.get('/rooms', (req, res) => {
  const roomTypes = db.getAllRoomTypes(true);
  res.json(roomTypes);
});

// 3. GET SINGLE ROOM TYPE BY SLUG OR ID
router.get('/rooms/:identifier', (req, res) => {
  const { identifier } = req.params;
  const room = db.getRoomTypeBySlug(identifier) || db.getRoomTypeById(identifier);
  if (!room) {
    res.status(404).json({ error: 'Room category not found' });
    return;
  }
  res.json(room);
});

// 4. CHECK ROOM AVAILABILITY
router.get('/availability', (req, res) => {
  const parseResult = AvailabilityQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid availability parameters',
      details: parseResult.error.flatten().fieldErrors
    });
    return;
  }

  const { checkIn, checkOut, adults, children } = parseResult.data;
  const today = new Date().toISOString().split('T')[0];

  if (checkIn < today) {
    res.status(400).json({ error: 'Arrival date cannot be in the past' });
    return;
  }

  const results = db.checkAvailability(checkIn, checkOut, adults, children);
  res.json(results);
});

// 5. CREATE A NEW RESERVATION
router.post('/bookings', async (req, res) => {
  try {
    const parseResult = CreateBookingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed. Please check your reservation information.',
        details: parseResult.error.flatten().fieldErrors
      });
      return;
    }

    const data = parseResult.data;
    const today = new Date().toISOString().split('T')[0];
    if (data.checkInDate < today) {
      res.status(400).json({ error: 'Check-in date cannot be in the past' });
      return;
    }

    const result = db.createReservation(data);
    if (!result.success || !result.reservation) {
      res.status(409).json({ error: result.error || 'Unable to complete reservation.' });
      return;
    }

    const reservation = result.reservation;

    // Send async emails
    sendReservationEmail('booking_received', reservation).catch(console.error);
    sendReservationEmail('staff_alert', reservation).catch(console.error);
    if (reservation.reservationStatus === 'confirmed') {
      sendReservationEmail('booking_confirmed', reservation).catch(console.error);
    }

    // Mask sensitive guest data in return response
    res.status(201).json({
      success: true,
      bookingReference: reservation.bookingReference,
      reservationId: reservation.id,
      reservationStatus: reservation.reservationStatus,
      paymentStatus: reservation.paymentStatus,
      totalAmountNgn: reservation.totalAmountNgn,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      numberOfNights: reservation.numberOfNights,
      numberOfRooms: reservation.numberOfRooms,
      paymentMode: reservation.paymentMode,
      guestName: `${reservation.guest?.firstName} ${reservation.guest?.lastName}`,
      guestEmail: reservation.guest?.email,
      roomName: reservation.roomType?.name
    });
  } catch (error: any) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'An unexpected error occurred while processing your booking' });
  }
});

// 6. SAFE BOOKING LOOKUP (Requires reference AND verification token or last name/phone)
router.get('/bookings/lookup/:reference', (req, res) => {
  const { reference } = req.params;
  const guestVerify = req.query.verify as string | undefined;

  const reservation = db.getReservationByReference(reference, guestVerify);
  if (!reservation) {
    res.status(404).json({
      error: 'Reservation not found. Please verify your Booking Reference and associated guest email, phone, or last name.'
    });
    return;
  }

  // Return safe snapshot
  res.json({
    bookingReference: reservation.bookingReference,
    reservationStatus: reservation.reservationStatus,
    paymentStatus: reservation.paymentStatus,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    numberOfNights: reservation.numberOfNights,
    numberOfRooms: reservation.numberOfRooms,
    adults: reservation.adults,
    children: reservation.children,
    nightlyRateSnapshot: reservation.nightlyRateSnapshot,
    subtotalNgn: reservation.subtotalNgn,
    taxesFeesNgn: reservation.taxesFeesNgn,
    totalAmountNgn: reservation.totalAmountNgn,
    paymentMode: reservation.paymentMode,
    createdAt: reservation.createdAt,
    roomType: {
      name: reservation.roomType?.name,
      slug: reservation.roomType?.slug,
      featuredImageUrl: reservation.roomType?.featuredImageUrl,
      bedType: reservation.roomType?.bedType
    },
    guest: {
      firstName: reservation.guest?.firstName,
      lastName: reservation.guest?.lastName,
      email: reservation.guest?.email,
      phone: reservation.guest?.phone,
      specialRequests: reservation.guest?.specialRequests
    }
  });
});

// 7. PUBLIC GALLERY
router.get('/gallery', (req, res) => {
  res.json(db.getGallery());
});

// 8. PUBLIC TESTIMONIALS
router.get('/testimonials', (req, res) => {
  res.json(db.getTestimonials(true));
});

export default router;
