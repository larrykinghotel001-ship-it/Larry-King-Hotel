import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AdminProfile,
  RoomType,
  PhysicalRoom,
  Guest,
  Reservation,
  PaymentRecord,
  BlockedDate,
  Testimonial,
  HotelSettings,
  GalleryItem,
  AuditLog,
  ReservationStatus,
  PaymentStatus,
  PaymentMode
} from './types.js';
import { hashPassword } from './auth.js';
import { supabase, isSupabaseConnected } from './supabase.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hotel_database.json');

interface DatabaseStore {
  adminProfiles: AdminProfile[];
  roomTypes: RoomType[];
  rooms: PhysicalRoom[];
  guests: Guest[];
  reservations: Reservation[];
  payments: PaymentRecord[];
  blockedDates: BlockedDate[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  settings: HotelSettings;
  auditLogs: AuditLog[];
}

// Initial seed data
const initialRoomTypes: RoomType[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'standard',
    name: 'Standard Room',
    headline: 'Cozy & Peaceful Accommodation with Essential Luxury',
    description: 'Our Standard Rooms offer a cozy, tranquil retreat designed with essential comforts and thoughtful details for business and leisure travelers. Enjoy a restful night on premium linens, quiet climate control, high-definition television, high-speed Wi-Fi, and a pristine en-suite private bathroom with curated bath amenities.',
    baseRateNgn: 20000,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 2,
    bedType: 'Queen Bed',
    roomSizeSqm: 24,
    amenities: [
      'Air Conditioning',
      'Free High-Speed Wi-Fi',
      'En-suite Bathroom with Hot Shower',
      'Flat Screen Cable TV',
      'Wardrobe & Luggage Rack',
      'Dedicated Workspace Desk',
      'Intercom House Phone',
      'Complimentary Toiletries & Towels',
      '24/7 Power Supply',
      'Daily Housekeeping'
    ],
    featuredImageUrl: 'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_26_2026_03_11_00_pm.png',
    galleryImages: [
      'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_26_2026_03_11_00_pm.png',
      'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-02-07-at-17.58.52.jpeg'
    ],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'deluxe',
    name: 'Deluxe Room',
    headline: 'Spacious, Refined Comfort with King Bed & Relaxation Area',
    description: 'The Deluxe Room combines modern elegance with expansive space and superior fixtures. Featuring a plush King-size bed, luxury bedding, dedicated lounge seating area, executive desk, high-speed Wi-Fi, smart cable TV, and an expansive en-suite bathroom with complimentary premium bath products.',
    baseRateNgn: 25000,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    bedType: 'King Bed',
    roomSizeSqm: 32,
    amenities: [
      'Plush King-Size Bed',
      'Air Conditioning',
      'Free High-Speed Wi-Fi',
      'Lounge Seating Armchair',
      'Flat Screen Smart TV',
      'En-suite Bathroom with Modern Shower',
      'Mini Refrigerator',
      'Work Desk & Ergonomic Chair',
      'Intercom House Phone',
      'Complimentary Breakfast',
      '24/7 Steady Power',
      'Daily Housekeeping'
    ],
    featuredImageUrl: 'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_12_18_12_pm.png',
    galleryImages: [
      'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_12_18_12_pm.png',
      'https://larrykinghotel.com/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-09-at-11.48.45_ee6c5d2f.jpg'
    ],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'executive',
    name: 'Executive Room',
    headline: 'Elevated Distinction, Executive Lounge Styling & Work Comfort',
    description: 'Our Executive Room is meticulously tailored for corporate executives, VIPs, and discerning guests demanding heightened sophistication. Provides extra square footage, a bespoke King bed, executive lounge seating, high-speed wireless connectivity, complimentary morning beverage setup, spacious vanity, and quiet ambiance.',
    baseRateNgn: 30000,
    maxAdults: 2,
    maxChildren: 2,
    maxOccupancy: 3,
    bedType: 'King Bed',
    roomSizeSqm: 38,
    amenities: [
      'Master King Bed',
      'Silent Climate Control Air Conditioning',
      'Free Ultra-Fast Wi-Fi',
      'Executive Lounge Area & Coffee Table',
      'Smart TV with Premium Satellite Channels',
      'Executive Work Station',
      'Mini Bar / Refrigerator',
      'Luxury Bathrobes & Slippers',
      'Complimentary Breakfast',
      'House Intercom Telephone',
      '24/7 Guaranteed Power',
      'Priority Room Service'
    ],
    featuredImageUrl: 'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_01_05_32_pm.png',
    galleryImages: [
      'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_01_05_32_pm.png',
      'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-12-25-at-09.39.07.jpeg'
    ],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    slug: 'suite',
    name: 'Suite',
    headline: 'The Epitome of Grand Luxury with Separate Living Room',
    description: 'The Larry King Suite represents the pinnacle of hospitality excellence. Boasting a grand private master bedroom, an expansive separate living room and parlor with plush designer sofas, dual widescreen smart TVs, dining corner, powder room, opulent master bathroom, and personalized guest service.',
    baseRateNgn: 40000,
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    bedType: 'Super King Bed + Parlor Sofa',
    roomSizeSqm: 52,
    amenities: [
      'Separate Living Room & Master Bedroom',
      'Super King Bed with Luxury Pillows',
      'Dual Smart Flat Screen TVs',
      'Designer Sofa & Dining Area',
      'High-Speed Wi-Fi',
      'Mini Fridge & Coffee Station',
      'En-suite Luxury Bathroom with Premium Amenities',
      'Complimentary Gourmet Breakfast',
      'Pool View / Balcony',
      'Intercom House Phone',
      '24/7 Generator-Backed Power',
      'VIP Concierge & Room Service'
    ],
    featuredImageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/ChatGPT-Image-Apr-22-2026-10_15_31-PM.png',
    galleryImages: [
      'https://larrykinghotel.com/wp-content/uploads/2026/04/ChatGPT-Image-Apr-22-2026-10_15_31-PM.png',
      'https://larrykinghotel.com/wp-content/uploads/2026/04/InShot_20251225_100527023.jpg'
    ],
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialRooms: PhysicalRoom[] = [
  { id: 'r-101', roomTypeId: '11111111-1111-1111-1111-111111111111', roomNumber: '101', floor: 1, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-102', roomTypeId: '11111111-1111-1111-1111-111111111111', roomNumber: '102', floor: 1, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-103', roomTypeId: '11111111-1111-1111-1111-111111111111', roomNumber: '103', floor: 1, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-201', roomTypeId: '22222222-2222-2222-2222-222222222222', roomNumber: '201', floor: 2, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-202', roomTypeId: '22222222-2222-2222-2222-222222222222', roomNumber: '202', floor: 2, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-203', roomTypeId: '22222222-2222-2222-2222-222222222222', roomNumber: '203', floor: 2, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-301', roomTypeId: '33333333-3333-3333-3333-333333333333', roomNumber: '301', floor: 3, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-302', roomTypeId: '33333333-3333-3333-3333-333333333333', roomNumber: '302', floor: 3, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-401', roomTypeId: '44444444-4444-4444-4444-444444444444', roomNumber: '401', floor: 4, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r-402', roomTypeId: '44444444-4444-4444-4444-444444444444', roomNumber: '402', floor: 4, status: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const initialTestimonials: Testimonial[] = [
  {
    id: 't-1',
    guestName: 'Engr. Babatunde Adeyemi',
    guestLocation: 'Lagos Island, Nigeria',
    rating: 5,
    comment: 'Larry King Hotel & Suite surprised me with its serene atmosphere in Imota! The rooms are immaculate, the 24/7 power supply is truly steady with no interruptions, and the staff are warmly attentive. Highly recommended for weekend getaways and business trips.',
    stayDate: 'Stayed in Executive Room',
    isApproved: true,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-2',
    guestName: 'Dr. Folashade Adeleke',
    guestLocation: 'Ikorodu, Lagos',
    rating: 5,
    comment: 'Hosted our corporate retreat here and booked several rooms. The swimming pool area is beautiful and clean, the event hall had plenty of space, and security was top-notch throughout our stay.',
    stayDate: 'Stayed in Deluxe Room',
    isApproved: true,
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 't-3',
    guestName: 'Mr. Kenneth Okafor',
    guestLocation: 'Abuja, Nigeria',
    rating: 5,
    comment: 'The Suite gave me the feel of a home away from home. The separate parlor allowed me to hold private meetings comfortably. Excellent bed and fast Wi-Fi.',
    stayDate: 'Stayed in Suite',
    isApproved: true,
    sortOrder: 3,
    createdAt: new Date().toISOString()
  }
];

const initialGallery: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Hotel Entrance & Front Compound',
    category: 'Exterior & Grounds',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-02-07-at-17.58.52.jpeg',
    altText: 'Larry King Hotel and Suite front entrance and premises in Imota Ikorodu',
    sortOrder: 1
  },
  {
    id: 'g-2',
    title: 'Outdoor Swimming Pool & Relaxing Terrace',
    category: 'Swimming Pool',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-12-25-at-09.39.07.jpeg',
    altText: 'Larry King Hotel sparkling swimming pool and sun loungers',
    sortOrder: 2
  },
  {
    id: 'g-3',
    title: 'Serene Compound & Secure Parking',
    category: 'Exterior & Grounds',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/InShot_20251225_100527023.jpg',
    altText: 'Paved secure parking lot and hotel grounds at Larry King Hotel',
    sortOrder: 3
  },
  {
    id: 'g-4',
    title: 'VIP Lounge & Bar Area',
    category: 'Events & Lounge',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-07-09-at-11.48.45_ee6c5d2f.jpg',
    altText: 'Lounge and bar counter for evening refreshments',
    sortOrder: 4
  },
  {
    id: 'g-5',
    title: 'Night Ambience & Illuminations',
    category: 'Exterior & Grounds',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-07-09-at-23.08.46_821f1350.jpg',
    altText: 'Larry King Hotel at night with illuminated grounds',
    sortOrder: 5
  },
  {
    id: 'g-6',
    title: 'Grand Event Hall (500-Seater Capacity)',
    category: 'Events & Lounge',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/download-2.jpeg',
    altText: 'Spacious banquet and event hall for weddings and corporate conferences',
    sortOrder: 6
  },
  {
    id: 'g-7',
    title: 'Deluxe Room Bedding & Atmosphere',
    category: 'Rooms & Suites',
    imageUrl: 'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_12_18_12_pm.png',
    altText: 'Deluxe room interior with King bed and modern furnishings',
    sortOrder: 7
  },
  {
    id: 'g-8',
    title: 'Executive Room Workspace & Lounge',
    category: 'Rooms & Suites',
    imageUrl: 'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_01_05_32_pm.png',
    altText: 'Executive room with premium workspace and seating area',
    sortOrder: 8
  },
  {
    id: 'g-9',
    title: 'The Larry King Luxury Suite Parlor',
    category: 'Rooms & Suites',
    imageUrl: 'https://larrykinghotel.com/wp-content/uploads/2026/04/ChatGPT-Image-Apr-22-2026-10_15_31-PM.png',
    altText: 'Luxury suite private parlor and master suite at Larry King Hotel',
    sortOrder: 9
  }
];

const initialSettings: HotelSettings = {
  general: {
    hotelName: 'Larry King Hotel And Suite',
    displayName: 'Larry King Hotel & Suite',
    tagline: 'Where Comfort Meets Exceptional Hospitality',
    phone: '+234-9071286050',
    whatsapp: '2349071286050',
    bookingEmail: 'Booking@larrykinghotel.com',
    infoEmail: 'Info@larrykinghotel.com',
    address: '11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria',
    currency: 'NGN',
    currencySymbol: '₦'
  },
  policies: {
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in. Non-refundable within 24 hours of arrival.',
    taxRatePercent: 0,
    serviceFeePercent: 0,
    minimumStayNights: 1
  },
  payments: {
    payAtHotelEnabled: true,
    bankTransferEnabled: true,
    paystackEnabled: false,
    bankName: 'Guaranty Trust Bank (GTB)',
    accountName: 'Larry King Hotel & Suite Ltd',
    accountNumber: '0123456789'
  }
};

class DatabaseManager {
  private store: DatabaseStore;

  constructor() {
    this.store = this.loadDatabase();
    this.syncFromSupabase();
  }

  private loadDatabase(): DatabaseStore {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (e) {
        console.error('Failed to parse database file. Initializing defaults.', e);
      }
    }

    // Default admin account
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeThisStrongPassword2026!';
    const defaultAdmin: AdminProfile = {
      id: 'admin-master-001',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@larrykinghotel.com',
      passwordHash: hashPassword(defaultPassword),
      fullName: 'General Manager',
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialStore: DatabaseStore = {
      adminProfiles: [defaultAdmin],
      roomTypes: initialRoomTypes,
      rooms: initialRooms,
      guests: [],
      reservations: [],
      payments: [],
      blockedDates: [],
      testimonials: initialTestimonials,
      gallery: initialGallery,
      settings: initialSettings,
      auditLogs: []
    };

    this.saveDatabase(initialStore);
    return initialStore;
  }

  private saveDatabase(store: DatabaseStore = this.store): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  public async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConnected) return;

    try {
      // 1. Fetch room categories
      const { data: remoteRoomTypes } = await supabase.from('room_types').select('*');
      if (remoteRoomTypes && remoteRoomTypes.length > 0) {
        this.store.roomTypes = remoteRoomTypes.map((rt: any) => ({
          id: rt.id,
          slug: rt.slug,
          name: rt.name,
          headline: rt.headline || '',
          description: rt.description,
          baseRateNgn: Number(rt.base_rate_ngn),
          maxAdults: rt.max_adults,
          maxChildren: rt.max_children,
          maxOccupancy: rt.max_occupancy,
          bedType: rt.bed_type,
          roomSizeSqm: rt.room_size_sqm,
          amenities: Array.isArray(rt.amenities) ? rt.amenities : [],
          featuredImageUrl: rt.featured_image_url,
          galleryImages: [rt.featured_image_url],
          isActive: rt.is_active,
          sortOrder: rt.sort_order || 0,
          createdAt: rt.created_at,
          updatedAt: rt.updated_at
        }));
      }

      // 2. Fetch physical rooms
      const { data: remoteRooms } = await supabase.from('rooms').select('*');
      if (remoteRooms && remoteRooms.length > 0) {
        this.store.rooms = remoteRooms.map((rm: any) => ({
          id: rm.id,
          roomTypeId: rm.room_type_id,
          roomNumber: rm.room_number,
          floor: rm.floor,
          status: rm.status,
          notes: rm.notes,
          createdAt: rm.created_at,
          updatedAt: rm.updated_at
        }));
      }

      // 3. Fetch testimonials
      const { data: remoteTestimonials } = await supabase.from('testimonials').select('*');
      if (remoteTestimonials && remoteTestimonials.length > 0) {
        this.store.testimonials = remoteTestimonials.map((t: any) => ({
          id: t.id,
          guestName: t.guest_name,
          guestLocation: t.guest_location,
          rating: t.rating,
          comment: t.comment,
          stayDate: t.stay_date,
          isApproved: t.is_approved,
          sortOrder: t.sort_order || 0,
          createdAt: t.created_at
        }));
      }

      // 4. Fetch gallery items
      const { data: remoteGallery } = await supabase.from('gallery').select('*');
      if (remoteGallery && remoteGallery.length > 0) {
        this.store.gallery = remoteGallery.map((g: any) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          imageUrl: g.image_url,
          altText: g.alt_text || g.title,
          sortOrder: g.sort_order || 0
        }));
      }

      this.saveDatabase();
      console.log('[Supabase Live Sync]: Successfully synchronized hotel catalogs from Supabase database.');
    } catch (err) {
      console.error('[Supabase Sync Notice]: Unable to fetch remote records, using local cache.', err);
    }
  }

  private async syncReservationToSupabase(reservation: Reservation, guest: Guest): Promise<void> {
    if (!isSupabaseConnected) return;

    try {
      // Upsert guest record in Supabase
      const { data: guestData } = await supabase
        .from('guests')
        .upsert({
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          address: guest.address || null,
          country: guest.country || 'Nigeria'
        }, { onConflict: 'email' })
        .select('id')
        .single();

      const guestId = guestData?.id || reservation.guestId;

      // Insert reservation into Supabase
      await supabase.from('reservations').insert({
        booking_reference: reservation.bookingReference,
        guest_id: guestId,
        room_type_id: reservation.roomTypeId,
        check_in_date: reservation.checkInDate,
        check_out_date: reservation.checkOutDate,
        number_of_nights: reservation.numberOfNights,
        number_of_rooms: reservation.numberOfRooms,
        adults: reservation.adults,
        children: reservation.children,
        nightly_rate_snapshot: reservation.nightlyRateSnapshot,
        subtotal_ngn: reservation.subtotalNgn,
        taxes_fees_ngn: reservation.taxesFeesNgn,
        total_amount_ngn: reservation.totalAmountNgn,
        deposit_amount_ngn: reservation.depositAmountNgn || 0,
        payment_mode: reservation.paymentMode,
        reservation_status: reservation.reservationStatus,
        payment_status: reservation.paymentStatus,
        estimated_arrival_time: reservation.estimatedArrivalTime || null,
        admin_notes: reservation.adminNotes || null
      });

      console.log(`[Supabase Reservation Sync]: Synced reservation ${reservation.bookingReference} to Supabase.`);
    } catch (err) {
      console.error('[Supabase Sync Warning]: Could not sync reservation to Supabase:', err);
    }
  }

  // --- ADMIN PROFILES ---
  public getAdminByEmail(email: string): AdminProfile | undefined {
    return this.store.adminProfiles.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  public getAdminById(id: string): AdminProfile | undefined {
    return this.store.adminProfiles.find(a => a.id === id);
  }

  public updateAdminLastLogin(id: string): void {
    const admin = this.store.adminProfiles.find(a => a.id === id);
    if (admin) {
      admin.lastLoginAt = new Date().toISOString();
      this.saveDatabase();
    }
  }

  public updateAdminPassword(id: string, newPasswordHash: string): boolean {
    const admin = this.store.adminProfiles.find(a => a.id === id);
    if (!admin) return false;
    admin.passwordHash = newPasswordHash;
    admin.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return true;
  }

  // --- ROOM TYPES ---
  public getAllRoomTypes(onlyActive: boolean = true): RoomType[] {
    let list = this.store.roomTypes;
    if (onlyActive) {
      list = list.filter(r => r.isActive);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getRoomTypeBySlug(slug: string): RoomType | undefined {
    return this.store.roomTypes.find(r => r.slug.toLowerCase() === slug.toLowerCase());
  }

  public getRoomTypeById(id: string): RoomType | undefined {
    return this.store.roomTypes.find(r => r.id === id);
  }

  public updateRoomType(id: string, updates: Partial<RoomType>): RoomType | null {
    const index = this.store.roomTypes.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.store.roomTypes[index] = {
      ...this.store.roomTypes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.store.roomTypes[index];
  }

  public createRoomType(data: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>): RoomType {
    const newRoomType: RoomType = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.store.roomTypes.push(newRoomType);
    this.saveDatabase();
    return newRoomType;
  }

  // --- PHYSICAL ROOMS ---
  public getAllRooms(): PhysicalRoom[] {
    return this.store.rooms;
  }

  public getRoomsByType(roomTypeId: string): PhysicalRoom[] {
    return this.store.rooms.filter(r => r.roomTypeId === roomTypeId);
  }

  public createRoom(room: Omit<PhysicalRoom, 'id' | 'createdAt' | 'updatedAt'>): PhysicalRoom {
    const newRoom: PhysicalRoom = {
      ...room,
      id: 'r-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.store.rooms.push(newRoom);
    this.saveDatabase();
    return newRoom;
  }

  public updateRoom(id: string, updates: Partial<PhysicalRoom>): PhysicalRoom | null {
    const room = this.store.rooms.find(r => r.id === id);
    if (!room) return null;
    Object.assign(room, updates, { updatedAt: new Date().toISOString() });
    this.saveDatabase();
    return room;
  }

  public deleteRoom(id: string): boolean {
    const prevLen = this.store.rooms.length;
    this.store.rooms = this.store.rooms.filter(r => r.id !== id);
    if (this.store.rooms.length !== prevLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- AVAILABILITY LOGIC ---
  public checkAvailability(checkIn: string, checkOut: string, adults: number = 1, children: number = 0) {
    // 1. Calculate number of nights
    const start = new Date(checkIn + 'T00:00:00Z');
    const end = new Date(checkOut + 'T00:00:00Z');
    const diffTime = end.getTime() - start.getTime();
    const numberOfNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    // Active blocked dates
    const blocked = this.store.blockedDates.filter(b => {
      return (b.startDate < checkOut && b.endDate > checkIn);
    });

    // Active reservations that occupy rooms
    const activeReservations = this.store.reservations.filter(res => {
      if (res.reservationStatus === 'cancelled' || res.reservationStatus === 'no_show') {
        return false;
      }
      return (res.checkInDate < checkOut && res.checkOutDate > checkIn);
    });

    const activeRoomTypes = this.getAllRoomTypes(true);

    const results = activeRoomTypes.map(rt => {
      // Physical rooms of this type
      const physicalRooms = this.store.rooms.filter(r => r.roomTypeId === rt.id && r.status === 'available');
      const totalInventory = physicalRooms.length;

      // Count booked rooms for this room type during this date window
      const bookedCount = activeReservations.reduce((sum, res) => {
        if (res.roomTypeId === rt.id) {
          return sum + res.numberOfRooms;
        }
        return sum;
      }, 0);

      // Blocked rooms/categories
      const blockedForType = blocked.filter(b => b.roomTypeId === rt.id || (b.roomId && physicalRooms.some(pr => pr.id === b.roomId))).length;

      const availableCount = Math.max(0, totalInventory - (bookedCount + blockedForType));
      const subtotal = rt.baseRateNgn * numberOfNights;
      const taxesFees = (subtotal * (this.store.settings.policies.taxRatePercent / 100)) + 
                        (subtotal * (this.store.settings.policies.serviceFeePercent / 100));
      const totalAmount = subtotal + taxesFees;

      return {
        roomType: rt,
        numberOfNights,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalInventory,
        bookedCount,
        availableCount,
        isAvailable: availableCount > 0 && (adults + children <= rt.maxOccupancy),
        nightlyRate: rt.baseRateNgn,
        subtotalNgn: subtotal,
        taxesFeesNgn: taxesFees,
        totalAmountNgn: totalAmount
      };
    });

    return {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights,
      adults,
      children,
      results
    };
  }

  // --- RESERVATIONS ---
  public generateUniqueBookingReference(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'LKH-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (this.store.reservations.some(r => r.bookingReference === code)) {
      return this.generateUniqueBookingReference();
    }
    return code;
  }

  public createReservation(data: {
    roomTypeId: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    numberOfRooms: number;
    paymentMode: PaymentMode;
    estimatedArrivalTime?: string;
    guest: Omit<Guest, 'id' | 'createdAt'>;
  }): { success: boolean; reservation?: Reservation; error?: string } {
    const roomType = this.getRoomTypeById(data.roomTypeId);
    if (!roomType || !roomType.isActive) {
      return { success: false, error: 'Selected room category is not available' };
    }

    // Availability validation check
    const avail = this.checkAvailability(data.checkInDate, data.checkOutDate, data.adults, data.children);
    const typeAvail = avail.results.find(r => r.roomType.id === data.roomTypeId);

    if (!typeAvail || typeAvail.availableCount < data.numberOfRooms) {
      return { success: false, error: 'Sorry, this room type is no longer available for your selected dates.' };
    }

    if (data.adults + data.children > roomType.maxOccupancy * data.numberOfRooms) {
      return { success: false, error: `Maximum guest capacity for ${data.numberOfRooms} ${roomType.name} is ${roomType.maxOccupancy * data.numberOfRooms} guests.` };
    }

    // Calculate nights & pricing from server rate
    const start = new Date(data.checkInDate + 'T00:00:00Z');
    const end = new Date(data.checkOutDate + 'T00:00:00Z');
    const diffTime = end.getTime() - start.getTime();
    const numberOfNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    const nightlyRateSnapshot = roomType.baseRateNgn;
    const subtotalNgn = nightlyRateSnapshot * numberOfNights * data.numberOfRooms;
    const taxesFeesNgn = (subtotalNgn * (this.store.settings.policies.taxRatePercent / 100)) + 
                         (subtotalNgn * (this.store.settings.policies.serviceFeePercent / 100));
    const totalAmountNgn = subtotalNgn + taxesFeesNgn;

    // Create or find guest
    let guest = this.store.guests.find(g => g.email.toLowerCase() === data.guest.email.toLowerCase());
    if (!guest) {
      guest = {
        id: 'g-' + crypto.randomUUID().slice(0, 8),
        ...data.guest,
        createdAt: new Date().toISOString()
      };
      this.store.guests.push(guest);
    } else {
      // Update phone or address
      guest.firstName = data.guest.firstName;
      guest.lastName = data.guest.lastName;
      guest.phone = data.guest.phone;
      if (data.guest.address) guest.address = data.guest.address;
    }

    const bookingReference = this.generateUniqueBookingReference();
    const reservationStatus: ReservationStatus = data.paymentMode === 'pay_at_hotel' ? 'confirmed' : 'pending';
    const paymentStatus: PaymentStatus = 'unpaid';

    // Auto assign physical room if 1 room requested
    let assignedRoomId: string | undefined = undefined;
    if (data.numberOfRooms === 1) {
      const activeResInSlot = this.store.reservations.filter(r => 
        (r.reservationStatus !== 'cancelled' && r.reservationStatus !== 'no_show') &&
        (r.checkInDate < data.checkOutDate && r.checkOutDate > data.checkInDate)
      );
      const bookedRoomIds = new Set(activeResInSlot.map(r => r.assignedRoomId).filter(Boolean));
      const freePhysicalRoom = this.store.rooms.find(r => r.roomTypeId === data.roomTypeId && r.status === 'available' && !bookedRoomIds.has(r.id));
      if (freePhysicalRoom) {
        assignedRoomId = freePhysicalRoom.id;
      }
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      bookingReference,
      guestId: guest.id,
      roomTypeId: roomType.id,
      assignedRoomId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numberOfNights,
      numberOfRooms: data.numberOfRooms,
      adults: data.adults,
      children: data.children,
      nightlyRateSnapshot,
      subtotalNgn,
      taxesFeesNgn,
      totalAmountNgn,
      depositAmountNgn: 0,
      paymentMode: data.paymentMode,
      reservationStatus,
      paymentStatus,
      estimatedArrivalTime: data.estimatedArrivalTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.reservations.push(reservation);
    this.saveDatabase();

    // Async sync to Supabase
    this.syncReservationToSupabase(reservation, guest).catch(err => {
      console.error('[Supabase Sync]: Failed to sync reservation:', err);
    });

    return {
      success: true,
      reservation: this.hydrateReservation(reservation)
    };
  }

  public getReservationByReference(reference: string, guestIdentifier?: string): Reservation | null {
    const res = this.store.reservations.find(r => r.bookingReference.toUpperCase() === reference.toUpperCase());
    if (!res) return null;

    const hydrated = this.hydrateReservation(res);

    if (guestIdentifier) {
      const cleanIdent = guestIdentifier.trim().toLowerCase();
      const guest = hydrated.guest;
      if (!guest) return null;
      const matchEmail = guest.email.toLowerCase() === cleanIdent;
      const cleanDigits = cleanIdent.replace(/[^0-9]/g, '');
      const phoneDigits = guest.phone.replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 4 && phoneDigits.includes(cleanDigits);
      const matchLastName = guest.lastName.toLowerCase() === cleanIdent;
      if (!matchEmail && !matchPhone && !matchLastName) {
        return null;
      }
    }

    return hydrated;
  }

  public getReservationById(id: string): Reservation | null {
    const res = this.store.reservations.find(r => r.id === id);
    if (!res) return null;
    return this.hydrateReservation(res);
  }

  public getAllReservations(filterStatus?: string, search?: string): Reservation[] {
    let list = this.store.reservations.map(r => this.hydrateReservation(r));

    if (filterStatus && filterStatus !== 'all') {
      list = list.filter(r => r.reservationStatus === filterStatus);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r => {
        return (
          r.bookingReference.toLowerCase().includes(q) ||
          r.guest?.firstName.toLowerCase().includes(q) ||
          r.guest?.lastName.toLowerCase().includes(q) ||
          r.guest?.email.toLowerCase().includes(q) ||
          r.guest?.phone.toLowerCase().includes(q) ||
          r.roomType?.name.toLowerCase().includes(q)
        );
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public updateReservationStatus(id: string, status: ReservationStatus, details?: {
    cancellationReason?: string;
    adminNotes?: string;
    paymentStatus?: PaymentStatus;
    assignedRoomId?: string | null;
  }): Reservation | null {
    const res = this.store.reservations.find(r => r.id === id);
    if (!res) return null;

    res.reservationStatus = status;
    if (status === 'cancelled') {
      res.cancelledAt = new Date().toISOString();
      if (details?.cancellationReason) res.cancellationReason = details.cancellationReason;
    }
    if (details?.adminNotes !== undefined) res.adminNotes = details.adminNotes;
    if (details?.paymentStatus !== undefined) res.paymentStatus = details.paymentStatus;
    if (details?.assignedRoomId !== undefined) {
      res.assignedRoomId = details.assignedRoomId === null ? undefined : details.assignedRoomId;
    }
    res.updatedAt = new Date().toISOString();

    this.saveDatabase();

    // Async sync to Supabase
    if (isSupabaseConnected) {
      (async () => {
        try {
          await supabase.from('reservations')
            .update({
              reservation_status: status,
              payment_status: details?.paymentStatus || res.paymentStatus,
              admin_notes: details?.adminNotes || res.adminNotes || null,
              cancellation_reason: res.cancellationReason || null
            })
            .eq('booking_reference', res.bookingReference);
        } catch (err: any) {
          console.error('[Supabase Status Sync Error]:', err);
        }
      })();
    }

    return this.hydrateReservation(res);
  }

  public recordPayment(data: {
    reservationId: string;
    paymentReference: string;
    provider: 'paystack' | 'cash' | 'pos' | 'bank_transfer';
    amountNgn: number;
    status: 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded';
    gatewayResponse?: any;
    paidAt?: string;
  }): PaymentRecord {
    const existing = this.store.payments.find(p => p.paymentReference === data.paymentReference);
    if (existing) {
      existing.status = data.status;
      if (data.gatewayResponse) existing.gatewayResponse = data.gatewayResponse;
      if (data.paidAt) existing.paidAt = data.paidAt;
      this.saveDatabase();
      return existing;
    }

    const record: PaymentRecord = {
      id: crypto.randomUUID(),
      ...data,
      currency: 'NGN',
      createdAt: new Date().toISOString()
    };
    this.store.payments.push(record);

    // Update reservation if payment succeeded
    if (data.status === 'success') {
      const res = this.store.reservations.find(r => r.id === data.reservationId);
      if (res) {
        res.paymentStatus = 'paid';
        res.reservationStatus = 'confirmed';
        res.updatedAt = new Date().toISOString();
      }
    }

    this.saveDatabase();
    return record;
  }

  private hydrateReservation(reservation: Reservation): Reservation {
    const guest = this.store.guests.find(g => g.id === reservation.guestId);
    const roomType = this.store.roomTypes.find(r => r.id === reservation.roomTypeId);
    const assignedRoom = reservation.assignedRoomId 
      ? this.store.rooms.find(r => r.id === reservation.assignedRoomId)
      : undefined;

    return {
      ...reservation,
      guest,
      roomType,
      assignedRoom
    };
  }

  // --- BLOCKED DATES ---
  public getBlockedDates(): BlockedDate[] {
    return this.store.blockedDates;
  }

  public addBlockedDate(data: Omit<BlockedDate, 'id' | 'createdAt'>): BlockedDate {
    const blocked: BlockedDate = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.store.blockedDates.push(blocked);
    this.saveDatabase();
    return blocked;
  }

  public removeBlockedDate(id: string): boolean {
    const prev = this.store.blockedDates.length;
    this.store.blockedDates = this.store.blockedDates.filter(b => b.id !== id);
    if (this.store.blockedDates.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- TESTIMONIALS ---
  public getTestimonials(onlyApproved: boolean = true): Testimonial[] {
    let list = this.store.testimonials;
    if (onlyApproved) {
      list = list.filter(t => t.isApproved);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public addTestimonial(data: Omit<Testimonial, 'id' | 'createdAt'>): Testimonial {
    const item: Testimonial = {
      ...data,
      id: 't-' + crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString()
    };
    this.store.testimonials.push(item);
    this.saveDatabase();
    return item;
  }

  public updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const t = this.store.testimonials.find(item => item.id === id);
    if (!t) return null;
    Object.assign(t, updates);
    this.saveDatabase();
    return t;
  }

  public deleteTestimonial(id: string): boolean {
    const prev = this.store.testimonials.length;
    this.store.testimonials = this.store.testimonials.filter(t => t.id !== id);
    if (this.store.testimonials.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- GALLERY ---
  public getGallery(): GalleryItem[] {
    return this.store.gallery.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public addGalleryItem(data: Omit<GalleryItem, 'id'>): GalleryItem {
    const item: GalleryItem = {
      ...data,
      id: 'g-' + crypto.randomUUID().slice(0, 8)
    };
    this.store.gallery.push(item);
    this.saveDatabase();
    return item;
  }

  public deleteGalleryItem(id: string): boolean {
    const prev = this.store.gallery.length;
    this.store.gallery = this.store.gallery.filter(g => g.id !== id);
    if (this.store.gallery.length !== prev) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- HOTEL SETTINGS ---
  public getSettings(): HotelSettings {
    return this.store.settings;
  }

  public updateSettings(updates: Partial<HotelSettings>): HotelSettings {
    this.store.settings = {
      ...this.store.settings,
      ...updates
    };
    this.saveDatabase();
    return this.store.settings;
  }

  // --- AUDIT LOGS ---
  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const item: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.store.auditLogs.unshift(item);
    // Keep max 500 audit logs
    if (this.store.auditLogs.length > 500) {
      this.store.auditLogs = this.store.auditLogs.slice(0, 500);
    }
    this.saveDatabase();
  }

  public getAuditLogs(limit: number = 100): AuditLog[] {
    return this.store.auditLogs.slice(0, limit);
  }

  // --- DASHBOARD KPIS ---
  public getDashboardStats() {
    const reservations = this.store.reservations;
    const totalBookings = reservations.length;
    const confirmedBookings = reservations.filter(r => r.reservationStatus === 'confirmed' || r.reservationStatus === 'checked_in');
    const pendingBookings = reservations.filter(r => r.reservationStatus === 'pending' || r.reservationStatus === 'awaiting_payment');
    
    const totalRevenueNgn = reservations
      .filter(r => r.paymentStatus === 'paid')
      .reduce((acc, r) => acc + r.totalAmountNgn, 0);

    const pendingRevenueNgn = reservations
      .filter(r => r.paymentStatus === 'unpaid' && r.reservationStatus !== 'cancelled')
      .reduce((acc, r) => acc + r.totalAmountNgn, 0);

    const totalRooms = this.store.rooms.length;
    const activeRooms = this.store.rooms.filter(r => r.status === 'available').length;

    // Recent 10 reservations
    const recentReservations = reservations
      .map(r => this.hydrateReservation(r))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return {
      totalBookings,
      confirmedCount: confirmedBookings.length,
      pendingCount: pendingBookings.length,
      totalRevenueNgn,
      pendingRevenueNgn,
      totalRooms,
      activeRooms,
      recentReservations
    };
  }
}

export const db = new DatabaseManager();
