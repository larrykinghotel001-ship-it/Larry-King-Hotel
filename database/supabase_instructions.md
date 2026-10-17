# Larry King Hotel & Suite — Database & Production Deployment Guide

This document outlines instructions for database deployment on Supabase PostgreSQL, environment variable configuration, Paystack payment setup, and Vercel hosting.

---

## 1. Supabase PostgreSQL Setup

1. Create a new project at [https://supabase.com](https://supabase.com).
2. Choose a region close to your primary audience (e.g., EU / London or closest West Africa latency zone).
3. Navigate to the **SQL Editor** in your Supabase Dashboard.
4. Copy and execute `/database/schema.sql`.
5. Copy and execute `/database/seed.sql`.
6. Retrieve your database connection string from **Project Settings > Database > Connection String (URI)**.
7. Set `DATABASE_URL` in your production environment variables:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

---

## 2. Default Administrator Account Setup

The database initializes with a primary administrator account:
- **Email:** `admin@larrykinghotel.com`
- **Initial Password:** `ChangeThisStrongPassword2026!`

### Changing the Administrator Password
1. Log in to the administrator portal at `/admin/login`.
2. Go to **Settings** or run the secure CLI script to update your password with scrypt hashing.
3. Keep `ADMIN_JWT_SECRET` in `.env` securely guarded with at least 32 random characters.

---

## 3. Paystack Online Payment Integration (Optional)

1. Register or log in to your Paystack merchant dashboard at [https://dashboard.paystack.com](https://dashboard.paystack.com).
2. Under **Settings > API Keys & Webhooks**, copy your:
   - Secret Key (`sk_live_...` or `sk_test_...`)
   - Public Key (`pk_live_...` or `pk_test_...`)
3. Set your webhook URL in Paystack to:
   `https://your-domain.com/api/payments/paystack/webhook`
4. Update your production environment variables:
   ```env
   PAYSTACK_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_..."
   PAYSTACK_WEBHOOK_SECRET="your_paystack_webhook_signature_secret"
   ```
5. In **Admin > Settings > Payments**, toggle Paystack to **Enabled**.

*Note: If Paystack credentials are not configured, the booking engine continues to work with **Pay at Hotel** and **Direct Bank Transfer**.*

---

## 4. Transactional Email Provider

To send instant booking confirmations and alert front desk staff:
- Set `EMAIL_PROVIDER_API_KEY` (e.g. from Resend or SendGrid).
- Configure `EMAIL_FROM="Larry King Hotel & Suite <Booking@larrykinghotel.com>"`.
- Configure `HOTEL_NOTIFICATION_EMAIL="Info@larrykinghotel.com"`.

---

## 5. Deployment on Vercel

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and import the repository.
3. Set Framework Preset to **Vite** or Node.js.
4. Add all environment variables from `.env.example` in the Vercel Project Settings.
5. Deploy.
6. Configure your custom domain (`larrykinghotel.com`) under Vercel Project Settings > Domains.
