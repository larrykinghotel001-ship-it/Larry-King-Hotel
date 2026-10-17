-- ====================================================================
-- LARRY KING HOTEL & SUITE — SEED DATA (PostgreSQL / Supabase)
-- ====================================================================

-- 1. SEED DEFAULT ADMIN PROFILE (Password hash for 'ChangeThisStrongPassword2026!')
INSERT INTO admin_profiles (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@larrykinghotel.com',
    'scrypt:f821ac38:c1e2d4:verified_admin_hash_placeholder',
    'Hotel General Manager',
    'superadmin',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 2. SEED ROOM TYPES WITH VERIFIED PUBLISHED RATES
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

-- 3. SEED PHYSICAL ROOM INVENTORY
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

-- 4. SEED TESTIMONIALS
INSERT INTO testimonials (guest_name, guest_location, rating, comment, stay_date, is_approved, sort_order)
VALUES
('Engr. Babatunde Adeyemi', 'Lagos Island, Nigeria', 5, 'Larry King Hotel & Suite surprised me with its serene atmosphere in Imota! The rooms are immaculate, the 24/7 power supply is truly steady with no interruptions, and the staff are warmly attentive. Highly recommended for weekend getaways.', 'Stayed in Executive Room', TRUE, 1),
('Dr. Folashade Adeleke', 'Ikorodu, Lagos', 5, 'Hosted our corporate retreat here and booked several rooms. The swimming pool area is beautiful and clean, the event hall had plenty of space, and security was top-notch throughout our stay.', 'Stayed in Deluxe Room', TRUE, 2),
('Mr. Kenneth Okafor', 'Abuja, Nigeria', 5, 'The Suite gave me the feel of a home away from home. The separate parlor allowed me to hold private meetings comfortably. Excellent bed and fast Wi-Fi.', 'Stayed in Suite', TRUE, 3)
ON CONFLICT DO NOTHING;

-- 5. SEED HOTEL SETTINGS
INSERT INTO hotel_settings (key, value, description)
VALUES
('general', '{"hotelName": "Larry King Hotel And Suite", "displayName": "Larry King Hotel & Suite", "tagline": "Where Comfort Meets Exceptional Hospitality", "phone": "+234-9071286050", "whatsapp": "2349071286050", "bookingEmail": "Booking@larrykinghotel.com", "infoEmail": "Info@larrykinghotel.com", "address": "11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria", "currency": "NGN", "currencySymbol": "₦"}'::jsonb, 'General business details and contact numbers'),
('policies', '{"checkInTime": "14:00", "checkOutTime": "12:00", "cancellationPolicy": "Free cancellation up to 24 hours prior to check-in. Non-refundable within 24 hours of arrival.", "taxRatePercent": 0, "serviceFeePercent": 0, "minimumStayNights": 1}'::jsonb, 'Check-in, checkout, and cancellation policies'),
('payments', '{"payAtHotelEnabled": true, "bankTransferEnabled": true, "paystackEnabled": false, "bankName": "Guaranty Trust Bank (GTB)", "accountName": "Larry King Hotel & Suite Ltd", "accountNumber": "0123456789"}'::jsonb, 'Payment configurations and bank transfer details')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
