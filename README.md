# Larry King Hotel & Suite — Production Booking Engine & Management Platform

A full-stack, production-ready hotel booking website, real-time availability engine, and administrative management platform engineered for **Larry King Hotel & Suite** located in Imota, Ikorodu, Lagos, Nigeria.

---

## 1. Business Information

- **Business Name:** Larry King Hotel And Suite
- **Display Name:** Larry King Hotel & Suite
- **Official Website:** [https://larrykinghotel.com/](https://larrykinghotel.com/)
- **Business Address:** 11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria.
- **Telephone Concierge:** +234-9071286050
- **Direct WhatsApp:** +234 907 128 6050
- **Booking Inquiries:** Booking@larrykinghotel.com
- **General Inquiries:** Info@larrykinghotel.com

---

## 2. Verified Room Categories & Nightly Rates

All room categories are seeded from verified published rates:

1. **Standard Room** — ₦20,000 / night
   - *Features:* Air conditioning, high-speed Wi-Fi, en-suite bathroom with hot shower, flat-screen cable TV, wardrobe, workspace desk, intercom telephone, 24/7 steady power.
2. **Deluxe Room** — ₦25,000 / night
   - *Features:* Plush King-size bed, air conditioning, Wi-Fi, armchair relaxation seating, mini-refrigerator, smart TV, modern bathroom, complimentary breakfast.
3. **Executive Room** — ₦30,000 / night
   - *Features:* Master King bed, executive lounge seating area, enhanced workstation, silent climate control, satellite channels, priority room service, complimentary breakfast.
4. **Suite** — ₦40,000 / night
   - *Features:* Separate private master bedroom, grand parlor/living room with plush sofa, dual smart TVs, dining corner, pool balcony view, luxury bath amenities.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript (strict mode), Tailwind CSS, Lucide Icons, Poppins typography.
- **Backend:** Node.js, Express, tsx.
- **Data Persistence:**
  - Dual-mode architecture: Automatic file-backed persistent relational database (`data/hotel_database.json`) for zero-friction container execution.
  - Production PostgreSQL schema (`/database/schema.sql`) and repeatable seed data (`/database/seed.sql`) ready for Supabase or Cloud SQL.
- **Security & Auth:** Cryptographic `scryptSync` password hashing, JWT session signing, timing-safe equality verification, role-based admin access control, sanitization.
- **Validation:** Server-side schema validation via Zod.
- **Payment Gateway:** Paystack server-side initialization, server-to-server transaction verification, and HMAC SHA-512 webhook signature verification.
- **Communications:** WhatsApp deep-link generation with prefilled templates and transactional email adapter with Resend / SendGrid support.

---

## 4. Implemented Public Routes

| Route | Purpose |
|---|---|
| `/` | Homepage with hero booking bar, room cards, facilities, about us, testimonials, and gallery |
| `/about` | In-depth story, hospitality pillars, 500-seat event hall, and property policies |
| `/rooms` | Room category listings with rate transparency and amenity overviews |
| `/rooms/standard` | Standard Room dedicated details, full specifications, and instant booking CTA |
| `/rooms/deluxe` | Deluxe Room dedicated details, full specifications, and instant booking CTA |
| `/rooms/executive` | Executive Room dedicated details, full specifications, and instant booking CTA |
| `/rooms/suite` | Suite dedicated details, full specifications, and instant booking CTA |
| `/availability` | Real-time database availability search by check-in, check-out, and guest count |
| `/book` | Reservation checkout with guest validation, concurrency safety, and payment options |
| `/booking/confirmation/:reference` | Safe confirmation receipt, WhatsApp concierge button, and bank instructions |
| `/booking-lookup` | Self-service reservation finder requiring booking reference and guest email/phone |
| `/gallery` | Responsive categorized photo gallery with full-screen lightbox preview |
| `/contact` | Physical location, telephone, email, interactive contact form, and Google Maps embed |
| `/privacy` | Privacy policy compliant with hospitality confidentiality requirements |
| `/booking-terms` | Check-in (2:00 PM), check-out (12:00 PM), cancellation policy, and property rules |
| `/404` | Branded custom not-found recovery page |

---

## 5. Implemented Administrator Dashboard Routes

Protected behind server-side authentication (`requireAdmin`):

| Admin Route | Functionality |
|---|---|
| `/admin/login` | Secure administrator authentication with scrypt validation |
| `/admin/dashboard` | Real-time KPIs (Total Bookings, Revenue, Occupancy, Active Rooms, Recent Requests) |
| `/admin/bookings` | Full reservation management, search, status transitions, room assignment, CSV export |
| `/admin/rooms` | Physical room inventory control (Room numbers, floor assignments, operational status) |
| `/admin/room-types` | Category management: edit nightly rates (₦), descriptions, amenities, and photos |
| `/admin/availability` | Maintenance & blackout date blocking to prevent bookings during repairs/events |
| `/admin/gallery` | Add, preview, categorize, and delete live hotel photographs |
| `/admin/testimonials` | Review, approve, publish, and delete verified guest reviews |
| `/admin/content` | Live editing of homepage headlines, tagline, and brand copy |
| `/admin/settings` | General settings, WhatsApp number, tax rates, bank accounts, and Paystack status |

---

## 6. Initial Administrator Credentials

When the platform first boots, it initializes a default primary administrator account:

- **Email:** `admin@larrykinghotel.com`
- **Password:** `ChangeThisStrongPassword2026!`

*Security Note: Upon initial setup in production, log in to `/admin/login` and update your password.*

---

## 7. Local Development & Deployment

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm run test

# 3. Start development server (Port 3000)
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Deployment to Vercel
1. Import repository into Vercel.
2. Add environment variables from `.env.example` in Vercel Project Settings.
3. Deploy and bind custom domain `larrykinghotel.com`.
