import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { sendReservationEmail } from './notifications.js';

const router = express.Router();

// 1. GET PAYMENT CONFIGURATION STATUS
router.get('/config', (req, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const settings = db.getSettings();

  const isPaystackConfigured = Boolean(secretKey && secretKey.startsWith('sk_'));

  res.json({
    payAtHotelEnabled: settings.payments.payAtHotelEnabled,
    bankTransferEnabled: settings.payments.bankTransferEnabled,
    paystackConfigured: isPaystackConfigured,
    paystackEnabled: settings.payments.paystackEnabled && isPaystackConfigured,
    paystackPublicKey: isPaystackConfigured ? (publicKey || null) : null,
    bankDetails: {
      bankName: settings.payments.bankName,
      accountName: settings.payments.accountName,
      accountNumber: settings.payments.accountNumber
    }
  });
});

// 2. INITIALIZE PAYSTACK TRANSACTION (SERVER-SIDE)
router.post('/paystack/initialize', async (req, res) => {
  try {
    const { bookingReference, callbackUrl } = req.body;
    if (!bookingReference) {
      res.status(400).json({ error: 'Booking reference is required' });
      return;
    }

    const reservation = db.getReservationByReference(bookingReference);
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    if (reservation.paymentStatus === 'paid') {
      res.status(400).json({ error: 'This reservation has already been paid in full' });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || !secretKey.startsWith('sk_')) {
      res.status(503).json({
        error: 'Paystack is not configured with live merchant credentials yet. Please select "Pay at Hotel" or "Direct Bank Transfer" to complete your reservation.',
        code: 'PAYSTACK_UNCONFIGURED'
      });
      return;
    }

    // Paystack amounts are in kobo (1 NGN = 100 kobo)
    const amountKobo = Math.round(reservation.totalAmountNgn * 100);
    const guestEmail = reservation.guest?.email || 'guest@larrykinghotel.com';

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: guestEmail,
        amount: amountKobo,
        currency: 'NGN',
        reference: `LKH-PAY-${reservation.bookingReference}-${Date.now()}`,
        callback_url: callbackUrl || `${process.env.APP_URL || 'http://localhost:3000'}/booking/confirmation/${reservation.bookingReference}`,
        metadata: {
          bookingReference: reservation.bookingReference,
          reservationId: reservation.id,
          guestName: `${reservation.guest?.firstName} ${reservation.guest?.lastName}`,
          roomName: reservation.roomType?.name
        }
      })
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok || !data.status) {
      res.status(502).json({
        error: data.message || 'Failed to initialize payment gateway with Paystack.',
        details: data
      });
      return;
    }

    // Save pending payment record
    db.recordPayment({
      reservationId: reservation.id,
      paymentReference: data.data.reference,
      provider: 'paystack',
      amountNgn: reservation.totalAmountNgn,
      status: 'pending'
    });

    res.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference
    });
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    res.status(500).json({ error: error.message || 'Internal payment error' });
  }
});

// 3. VERIFY PAYSTACK TRANSACTION (SERVER-SIDE)
router.post('/paystack/verify', async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      res.status(400).json({ error: 'Transaction reference is required' });
      return;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      res.status(503).json({ error: 'Paystack secret key is missing' });
      return;
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.status) {
      res.status(400).json({
        error: verifyData.message || 'Payment verification failed',
        status: 'failed'
      });
      return;
    }

    const paymentInfo = verifyData.data;
    const metadata = paymentInfo.metadata || {};
    const bookingReference = metadata.bookingReference;

    if (!bookingReference) {
      res.status(400).json({ error: 'Invalid transaction metadata: missing bookingReference' });
      return;
    }

    const reservation = db.getReservationByReference(bookingReference);
    if (!reservation) {
      res.status(404).json({ error: 'Associated reservation record not found' });
      return;
    }

    // Amount validation: Paystack returns kobo
    const paidNgn = paymentInfo.amount / 100;
    if (paidNgn < reservation.totalAmountNgn) {
      res.status(400).json({
        error: `Underpayment detected. Expected ₦${reservation.totalAmountNgn}, received ₦${paidNgn}.`,
        status: 'partial'
      });
      return;
    }

    const isSuccess = paymentInfo.status === 'success';

    // Record verified payment
    db.recordPayment({
      reservationId: reservation.id,
      paymentReference: reference,
      provider: 'paystack',
      amountNgn: paidNgn,
      status: isSuccess ? 'success' : 'failed',
      gatewayResponse: paymentInfo,
      paidAt: paymentInfo.paid_at || new Date().toISOString()
    });

    if (isSuccess) {
      db.updateReservationStatus(reservation.id, 'confirmed', {
        paymentStatus: 'paid'
      });

      // Dispatch async confirmation emails
      const updatedReservation = db.getReservationById(reservation.id);
      if (updatedReservation) {
        sendReservationEmail('payment_confirmed', updatedReservation).catch(console.error);
        sendReservationEmail('booking_confirmed', updatedReservation).catch(console.error);
      }
    }

    res.json({
      success: isSuccess,
      paymentStatus: isSuccess ? 'paid' : paymentInfo.status,
      bookingReference,
      amountPaid: paidNgn,
      paidAt: paymentInfo.paid_at
    });
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
});

// 4. PAYSTACK WEBHOOK (WITH HMAC SHA512 SIGNATURE VERIFICATION)
router.post('/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    const paystackSignature = req.headers['x-paystack-signature'] as string;

    if (!webhookSecret || !paystackSignature) {
      res.status(400).send('Missing webhook signature configuration');
      return;
    }

    const rawBody = typeof req.body === 'string' ? req.body : req.body.toString();
    const hash = crypto.createHmac('sha512', webhookSecret).update(rawBody).digest('hex');

    if (hash !== paystackSignature) {
      console.warn('Paystack webhook signature mismatch detected!');
      res.status(400).send('Invalid webhook signature');
      return;
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data;
      const metadata = data.metadata || {};
      const bookingReference = metadata.bookingReference;

      if (bookingReference) {
        const reservation = db.getReservationByReference(bookingReference);
        if (reservation && reservation.paymentStatus !== 'paid') {
          db.recordPayment({
            reservationId: reservation.id,
            paymentReference: data.reference,
            provider: 'paystack',
            amountNgn: data.amount / 100,
            status: 'success',
            gatewayResponse: data,
            paidAt: data.paid_at
          });

          db.updateReservationStatus(reservation.id, 'confirmed', {
            paymentStatus: 'paid'
          });

          const updatedRes = db.getReservationById(reservation.id);
          if (updatedRes) {
            sendReservationEmail('payment_confirmed', updatedRes).catch(console.error);
          }
        }
      }
    }

    res.status(200).send('Webhook processed');
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook handler error');
  }
});

export default router;
