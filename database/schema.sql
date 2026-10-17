-- ====================================================================
-- LARRY KING HOTEL & SUITE — DATABASE SCHEMA (PostgreSQL / Supabase)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMIN PROFILES
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. ROOM IMAGES
CREATE TABLE IF NOT EXISTS room_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PHYSICAL ROOMS INVENTORY
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    floor INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'out_of_service'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GUESTS
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    id_type VARCHAR(50), -- 'national_id', 'passport', 'voters_card', 'drivers_license'
    id_number VARCHAR(100),
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 8. BLOCKED DATES & MAINTENANCE
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES admin_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_block_dates CHECK (end_date >= start_date)
);

-- 9. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_profiles(id),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'sms'
    template_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'queued'
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations (check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (reservation_status);
CREATE INDEX IF NOT EXISTS idx_reservations_ref ON reservations (booking_reference);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations (guest_id);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms (room_type_id);
CREATE INDEX IF NOT EXISTS idx_payments_res ON payments (reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments (payment_reference);
