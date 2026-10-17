export interface AdminProfile {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'manager' | 'receptionist';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  baseRateNgn: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  bedType: string;
  roomSizeSqm?: number;
  amenities: string[];
  featuredImageUrl: string;
  galleryImages: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalRoom {
  id: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_service';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  specialRequests?: string;
  createdAt: string;
}

export type ReservationStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'refunded';

export type PaymentMode = 
  | 'pay_at_hotel'
  | 'bank_transfer'
  | 'paystack';

export interface Reservation {
  id: string;
  bookingReference: string;
  guestId: string;
  roomTypeId: string;
  assignedRoomId?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number;
  numberOfRooms: number;
  adults: number;
  children: number;
  nightlyRateSnapshot: number;
  subtotalNgn: number;
  taxesFeesNgn: number;
  totalAmountNgn: number;
  depositAmountNgn: number;
  paymentMode: PaymentMode;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  estimatedArrivalTime?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Hydrated helper fields
  guest?: Guest;
  roomType?: RoomType;
  assignedRoom?: PhysicalRoom;
}

export interface PaymentRecord {
  id: string;
  reservationId: string;
  paymentReference: string;
  provider: 'paystack' | 'cash' | 'pos' | 'bank_transfer';
  amountNgn: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded';
  gatewayResponse?: any;
  paidAt?: string;
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  roomId?: string;
  roomTypeId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdBy?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  guestName: string;
  guestLocation?: string;
  rating: number;
  comment: string;
  stayDate?: string;
  isApproved: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface HotelSettings {
  general: {
    hotelName: string;
    displayName: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    bookingEmail: string;
    infoEmail: string;
    address: string;
    currency: string;
    currencySymbol: string;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    taxRatePercent: number;
    serviceFeePercent: number;
    minimumStayNights: number;
  };
  payments: {
    payAtHotelEnabled: boolean;
    bankTransferEnabled: boolean;
    paystackEnabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Exterior & Grounds' | 'Rooms & Suites' | 'Swimming Pool' | 'Events & Lounge' | 'Dining';
  imageUrl: string;
  altText: string;
  sortOrder: number;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}
