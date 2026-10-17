import { z } from 'zod';

export const AvailabilityQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  adults: z.coerce.number().int().min(1).default(1),
  children: z.coerce.number().int().min(0).default(0),
  rooms: z.coerce.number().int().min(1).default(1),
}).refine(data => data.checkOut > data.checkIn, {
  message: 'Check-out date must be strictly after check-in date',
  path: ['checkOut']
});

export const CreateBookingSchema = z.object({
  roomTypeId: z.string().min(1, 'Room type is required'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  adults: z.coerce.number().int().min(1).default(1),
  children: z.coerce.number().int().min(0).default(0),
  numberOfRooms: z.coerce.number().int().min(1).default(1),
  paymentMode: z.enum(['pay_at_hotel', 'bank_transfer', 'paystack']).default('pay_at_hotel'),
  estimatedArrivalTime: z.string().optional(),
  guest: z.object({
    firstName: z.string().trim().min(2, 'First name is required'),
    lastName: z.string().trim().min(2, 'Last name is required'),
    email: z.string().trim().email('A valid email address is required'),
    phone: z.string().trim().min(7, 'A valid contact phone number is required'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('Nigeria'),
    specialRequests: z.string().max(1000).optional()
  })
}).refine(data => data.checkOutDate > data.checkInDate, {
  message: 'Departure date must be after arrival date',
  path: ['checkOutDate']
});

export const AdminLoginSchema = z.object({
  email: z.string().trim().email('Valid administrator email required'),
  password: z.string().min(6, 'Password is required')
});

export const BookingStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']),
  cancellationReason: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentStatus: z.enum(['unpaid', 'partially_paid', 'paid', 'refunded']).optional(),
  assignedRoomId: z.string().optional().nullable()
});

export const BlockDateSchema = z.object({
  roomId: z.string().optional().nullable(),
  roomTypeId: z.string().optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date format YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date format YYYY-MM-DD'),
  reason: z.string().min(3, 'Reason is required for date blocking')
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be greater than or equal to start date',
  path: ['endDate']
});
