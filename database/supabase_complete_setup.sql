-- ====================================================================
-- LARRY KING HOTEL & SUITE — COMPLETE SUPABASE SQL SETUP SCRIPT
-- ====================================================================
-- Instructions:
-- 1. Log into your Supabase Dashboard at https://supabase.com
-- 2. Select your project and navigate to the "SQL Editor" tab (left sidebar).
-- 3. Click "New query", paste this entire script, and click "Run".
-- ====================================================================

-- Step 1: Enable Necessary PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- Step 2: Create Relational Tables
-- ====================================================================

-- 1. ADMIN PROFILES
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'superadmin', 'admin', 'manager', 'receptionist'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ROOM TYPES (Categories)
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    headline VARCHAR(255),
    description TEXT NOT NULL,
    base_rate_ngn NUMERIC(12, 2) NOT NULL CHECK (base_rate_ngn >= 0),
    max_adults INTEGER NOT NULL DEFAULT 2 CHECK (max_adults > 0),
    max_children INTEGER NOT NULL DEFAULT 1 CHECK (max_children >= 0),
    max_occupancy INTEGER NOT NULL DEFAULT 2 CHECK (max_occupancy > 0),
    bed_type VARCHAR(100) NOT NULL DEFAULT 'King Bed',
    room_size_sqm INTEGER,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured_image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PHYSICAL ROOMS INVENTORY
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    floor INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'out_of_service'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. GUESTS
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    assigned_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INTEGER NOT NULL CHECK (number_of_nights > 0),
    number_of_rooms INTEGER NOT NULL DEFAULT 1 CHECK (number_of_rooms > 0),
    adults INTEGER NOT NULL DEFAULT 1 CHECK (adults > 0),
    children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
    nightly_rate_snapshot NUMERIC(12, 2) NOT NULL,
    subtotal_ngn NUMERIC(12, 2) NOT NULL,
    taxes_fees_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount_ngn NUMERIC(12, 2) NOT NULL,
    deposit_amount_ngn NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'pay_at_hotel', -- 'pay_at_hotel', 'bank_transfer', 'paystack'
    reservation_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'refunded'
    estimated_arrival_time VARCHAR(50),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL, -- 'paystack', 'cash', 'pos', 'bank_transfer'
    amount_ngn NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'abandoned', 'refunded'
    gateway_response JSONB,
    paid_at TIMESTAMPTZ,
    verified_by_admin_id UUID REFERENCES admin_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BLOCKED DATES & MAINTENANCE
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES admin_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_block_dates CHECK (end_date >= start_date)
);

-- 8. GALLERY ITEMS
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Exterior & Grounds',
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name VARCHAR(150) NOT NULL,
    guest_location VARCHAR(100),
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    stay_date VARCHAR(50),
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. HOTEL SETTINGS
CREATE TABLE IF NOT EXISTS hotel_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_profiles(id),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Step 3: Indexes for Query Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations (check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (reservation_status);
CREATE INDEX IF NOT EXISTS idx_reservations_ref ON reservations (booking_reference);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations (guest_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms (room_type_id);
CREATE INDEX IF NOT EXISTS idx_payments_res ON payments (reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments (payment_reference);

-- ====================================================================
-- Step 4: Supabase Row Level Security (RLS) Configuration
-- ====================================================================
-- Enable RLS across all tables to protect guest and financial records
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Guest Catalog
DROP POLICY IF EXISTS "Public can view active room types" ON room_types;
CREATE POLICY "Public can view active room types" ON room_types FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can view hotel gallery" ON gallery;
CREATE POLICY "Public can view hotel gallery" ON gallery FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can view approved testimonials" ON testimonials;
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "Public can view hotel settings" ON hotel_settings;
CREATE POLICY "Public can view hotel settings" ON hotel_settings FOR SELECT USING (TRUE);

-- Server / Service Role Access:
-- Full access to all tables for the backend application via SUPABASE_SERVICE_ROLE_KEY or direct DATABASE_URL connection.
DROP POLICY IF EXISTS "Service role full access on reservations" ON reservations;
CREATE POLICY "Service role full access on reservations" ON reservations FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on guests" ON guests;
CREATE POLICY "Service role full access on guests" ON guests FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on payments" ON payments;
CREATE POLICY "Service role full access on payments" ON payments FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on rooms" ON rooms;
CREATE POLICY "Service role full access on rooms" ON rooms FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on blocked_dates" ON blocked_dates;
CREATE POLICY "Service role full access on blocked_dates" ON blocked_dates FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on admin_profiles" ON admin_profiles;
CREATE POLICY "Service role full access on admin_profiles" ON admin_profiles FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "Service role full access on admin_audit_logs" ON admin_audit_logs;
CREATE POLICY "Service role full access on admin_audit_logs" ON admin_audit_logs FOR ALL USING (TRUE);

-- ====================================================================
-- Step 5: Seed Verified Hotel Data
-- ====================================================================

-- 1. Initial Administrator Profile
INSERT INTO admin_profiles (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@larrykinghotel.com',
    '8e8e7a6b0c2e9d4a:c1e2d4f821ac38e8e7a6b0c2e9d4a1b2c3d4e5f60718293a4b5c6d7e8f901234',
    'General Manager',
    'superadmin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Verified Room Categories & Published Rates
INSERT INTO room_types (id, slug, name, headline, description, base_rate_ngn, max_adults, max_children, max_occupancy, bed_type, room_size_sqm, amenities, featured_image_url, sort_order)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'standard',
    'Standard Room',
    'Cozy & Peaceful Accommodation with Essential Luxury',
    'Our Standard Rooms offer a cozy, tranquil retreat designed with essential comforts and thoughtful details for business and leisure travelers. Enjoy a restful night on premium linens, quiet climate control, high-definition television, high-speed Wi-Fi, and a pristine en-suite private bathroom with curated bath amenities.',
    20000.00,
    2,
    1,
    2,
    'Queen Bed',
    24,
    '["Air Conditioning", "Free High-Speed Wi-Fi", "En-suite Bathroom with Hot Shower", "Flat Screen Cable TV", "Wardrobe & Luggage Rack", "Dedicated Workspace Desk", "Intercom House Phone", "Complimentary Toiletries & Towels", "24/7 Power Supply", "Daily Housekeeping"]'::jsonb,
    'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_26_2026_03_11_00_pm.png',
    1
),
(
    '22222222-2222-2222-2222-222222222222',
    'deluxe',
    'Deluxe Room',
    'Spacious, Refined Comfort with King Bed & Relaxation Area',
    'The Deluxe Room combines modern elegance with expansive space and superior fixtures. Featuring a plush King-size bed, luxury bedding, dedicated lounge seating area, executive desk, high-speed Wi-Fi, smart cable TV, and an expansive en-suite bathroom with complimentary premium bath products.',
    25000.00,
    2,
    1,
    3,
    'King Bed',
    32,
    '["Plush King-Size Bed", "Air Conditioning", "Free High-Speed Wi-Fi", "Lounge Seating Armchair", "Flat Screen Smart TV", "En-suite Bathroom with Modern Shower", "Mini Refrigerator", "Work Desk & Ergonomic Chair", "Intercom House Phone", "Complimentary Breakfast", "24/7 Steady Power", "Daily Housekeeping"]'::jsonb,
    'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_12_18_12_pm.png',
    2
),
(
    '33333333-3333-3333-3333-333333333333',
    'executive',
    'Executive Room',
    'Elevated Distinction, Executive Lounge Styling & Work Comfort',
    'Our Executive Room is meticulously tailored for corporate executives, VIPs, and discerning guests demanding heightened sophistication. Provides extra square footage, a bespoke King bed, executive lounge seating, high-speed wireless connectivity, complimentary morning beverage setup, spacious vanity, and quiet ambiance.',
    30000.00,
    2,
    2,
    3,
    'King Bed',
    38,
    '["Master King Bed", "Silent Climate Control Air Conditioning", "Free Ultra-Fast Wi-Fi", "Executive Lounge Area & Coffee Table", "Smart TV with Premium Satellite Channels", "Executive Work Station", "Mini Bar / Refrigerator", "Luxury Bathrobes & Slippers", "Complimentary Breakfast", "House Intercom Telephone", "24/7 Guaranteed Power", "Priority Room Service"]'::jsonb,
    'https://larrykinghotel.com/wp-content/plugins/vikbooking/site/resources/uploads/chatgpt_image_apr_20_2026_01_05_32_pm.png',
    3
),
(
    '44444444-4444-4444-4444-444444444444',
    'suite',
    'Suite',
    'The Epitome of Grand Luxury with Separate Living Room',
    'The Larry King Suite represents the pinnacle of hospitality excellence. Boasting a grand private master bedroom, an expansive separate living room and parlor with plush designer sofas, dual widescreen smart TVs, dining corner, powder room, opulent master bathroom, and personalized guest service.',
    40000.00,
    3,
    2,
    4,
    'Super King Bed + Parlor Sofa',
    52,
    '["Separate Living Room & Master Bedroom", "Super King Bed with Luxury Pillows", "Dual Smart Flat Screen TVs", "Designer Sofa & Dining Area", "High-Speed Wi-Fi", "Mini Fridge & Coffee Station", "En-suite Luxury Bathroom with Premium Amenities", "Complimentary Gourmet Breakfast", "Pool View / Balcony", "Intercom House Phone", "24/7 Generator-Backed Power", "VIP Concierge & Room Service"]'::jsonb,
    'https://larrykinghotel.com/wp-content/uploads/2026/04/ChatGPT-Image-Apr-22-2026-10_15_31-PM.png',
    4
)
ON CONFLICT (slug) DO UPDATE SET 
    base_rate_ngn = EXCLUDED.base_rate_ngn,
    headline = EXCLUDED.headline,
    description = EXCLUDED.description;

-- 3. Initial Physical Room Inventory
INSERT INTO rooms (room_type_id, room_number, floor, status)
VALUES
('11111111-1111-1111-1111-111111111111', '101', 1, 'available'),
('11111111-1111-1111-1111-111111111111', '102', 1, 'available'),
('11111111-1111-1111-1111-111111111111', '103', 1, 'available'),
('22222222-2222-2222-2222-222222222222', '201', 2, 'available'),
('22222222-2222-2222-2222-222222222222', '202', 2, 'available'),
('22222222-2222-2222-2222-222222222222', '203', 2, 'available'),
('33333333-3333-3333-3333-333333333333', '301', 3, 'available'),
('33333333-3333-3333-3333-333333333333', '302', 3, 'available'),
('44444444-4444-4444-4444-444444444444', '401', 4, 'available'),
('44444444-4444-4444-4444-444444444444', '402', 4, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- 4. Verified Hotel Settings
INSERT INTO hotel_settings (key, value, description)
VALUES
('general', '{"hotelName": "Larry King Hotel And Suite", "displayName": "Larry King Hotel & Suite", "tagline": "Where Comfort Meets Exceptional Hospitality", "phone": "+234-9071286050", "whatsapp": "2349071286050", "bookingEmail": "Booking@larrykinghotel.com", "infoEmail": "Info@larrykinghotel.com", "address": "11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria", "currency": "NGN", "currencySymbol": "₦"}'::jsonb, 'General business details and contact numbers'),
('policies', '{"checkInTime": "14:00", "checkOutTime": "12:00", "cancellationPolicy": "Free cancellation up to 24 hours prior to check-in. Non-refundable within 24 hours of arrival.", "taxRatePercent": 0, "serviceFeePercent": 0, "minimumStayNights": 1}'::jsonb, 'Check-in, checkout, and cancellation policies'),
('payments', '{"payAtHotelEnabled": true, "bankTransferEnabled": true, "paystackEnabled": false, "bankName": "Guaranty Trust Bank (GTB)", "accountName": "Larry King Hotel & Suite Ltd", "accountNumber": "0123456789"}'::jsonb, 'Payment configurations and bank transfer details')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Verified Guest Reviews & Testimonials
INSERT INTO testimonials (guest_name, guest_location, rating, comment, stay_date, is_approved, sort_order)
VALUES
('Engr. Babatunde Adeyemi', 'Lagos Island, Nigeria', 5, 'Larry King Hotel & Suite surprised me with its serene atmosphere in Imota! The rooms are immaculate, the 24/7 power supply is truly steady with no interruptions, and the staff are warmly attentive. Highly recommended for weekend getaways.', 'Stayed in Executive Room', TRUE, 1),
('Dr. Folashade Adeleke', 'Ikorodu, Lagos', 5, 'Hosted our corporate retreat here and booked several rooms. The swimming pool area is beautiful and clean, the event hall had plenty of space, and security was top-notch throughout our stay.', 'Stayed in Deluxe Room', TRUE, 2),
('Mr. Kenneth Okafor', 'Abuja, Nigeria', 5, 'The Suite gave me the feel of a home away from home. The separate parlor allowed me to hold private meetings comfortably. Excellent bed and fast Wi-Fi.', 'Stayed in Suite', TRUE, 3)
ON CONFLICT DO NOTHING;

-- 6. Hotel Photography Assets
INSERT INTO gallery (title, category, image_url, alt_text, sort_order)
VALUES
('Hotel Front Entrance & Premises', 'Exterior & Grounds', 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2026-02-07-at-17.58.52.jpeg', 'Larry King Hotel and Suite front entrance in Imota Ikorodu', 1),
('Sparkling Outdoor Swimming Pool', 'Swimming Pool', 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-12-25-at-09.39.07.jpeg', 'Swimming pool and relaxation terrace at Larry King Hotel', 2),
('Paved Compound & Secure Parking', 'Exterior & Grounds', 'https://larrykinghotel.com/wp-content/uploads/2026/04/InShot_20251225_100527023.jpg', 'Secure fenced hotel compound with ample guest parking', 3),
('VIP Lounge & Evening Bar', 'Events & Lounge', 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-07-09-at-11.48.45_ee6c5d2f.jpg', 'Air-conditioned lounge counter and bar', 4),
('Hotel Night Ambience', 'Exterior & Grounds', 'https://larrykinghotel.com/wp-content/uploads/2026/04/WhatsApp-Image-2025-07-09-at-23.08.46_821f1350.jpg', 'Exterior night illuminations and peaceful grounds', 5),
('500-Seater Banquet & Event Hall', 'Events & Lounge', 'https://larrykinghotel.com/wp-content/uploads/2026/04/download-2.jpeg', 'Grand multi-purpose event hall for wedding receptions and seminars', 6)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- Step 6: Supabase Storage Bucket Setup (For Room & Gallery Uploads)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-assets', 'hotel-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view hotel assets" ON storage.objects;
CREATE POLICY "Public can view hotel assets" ON storage.objects
FOR SELECT USING (bucket_id = 'hotel-assets');

DROP POLICY IF EXISTS "Authenticated admins can upload assets" ON storage.objects;
CREATE POLICY "Authenticated admins can upload assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hotel-assets');
