import { Reservation } from '../types.js';

export interface EmailResult {
  sent: boolean;
  provider: string;
  error?: string;
  messageId?: string;
}

export async function sendReservationEmail(
  type: 'booking_received' | 'booking_confirmed' | 'payment_confirmed' | 'booking_cancelled' | 'staff_alert',
  reservation: Reservation
): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Larry King Hotel & Suite <Booking@larrykinghotel.com>';
  const staffEmail = process.env.HOTEL_NOTIFICATION_EMAIL || 'Info@larrykinghotel.com';

  const guest = reservation.guest;
  const room = reservation.roomType;

  // If no API key configured, record that external service is unconfigured
  if (!apiKey) {
    console.log(`[Notification Alert]: Transactional email provider not configured. Simulated dispatch for event "${type}" on reservation ${reservation.bookingReference}`);
    return {
      sent: false,
      provider: 'none',
      error: 'EMAIL_PROVIDER_API_KEY is not configured in environment variables. Email notification queued internally.'
    };
  }

  // If Resend API key is present
  try {
    const toAddress = type === 'staff_alert' ? staffEmail : (guest?.email || staffEmail);
    const subjectMap: Record<string, string> = {
      booking_received: `Reservation Request Received: ${reservation.bookingReference} | Larry King Hotel & Suite`,
      booking_confirmed: `Booking Confirmed: ${reservation.bookingReference} | Larry King Hotel & Suite`,
      payment_confirmed: `Payment Received: ${reservation.bookingReference} | Larry King Hotel & Suite`,
      booking_cancelled: `Reservation Cancelled: ${reservation.bookingReference} | Larry King Hotel & Suite`,
      staff_alert: `New Reservation Alert: ${reservation.bookingReference} (${room?.name || 'Room'})`
    };

    const subject = subjectMap[type] || `Reservation Update: ${reservation.bookingReference}`;

    // Send via standard Resend REST endpoint
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toAddress],
        subject,
        html: generateEmailHtml(type, reservation)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        sent: false,
        provider: 'resend',
        error: `Provider error (${response.status}): ${errorText}`
      };
    }

    const data = await response.json();
    return {
      sent: true,
      provider: 'resend',
      messageId: data.id
    };
  } catch (err: any) {
    return {
      sent: false,
      provider: 'resend',
      error: err.message || 'Network failure when connecting to email provider'
    };
  }
}

function generateEmailHtml(type: string, res: Reservation): string {
  const g = res.guest;
  const r = res.roomType;
  const guestName = g ? `${g.firstName} ${g.lastName}` : 'Valued Guest';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #192a3d; padding: 28px; text-align: center; border-bottom: 3px solid #ffc200;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">LARRY KING HOTEL & SUITE</h1>
        <p style="color: #ffc200; margin: 6px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Where Comfort Meets Exceptional Hospitality</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="font-size: 20px; color: #192a3d; margin-top: 0;">Reservation Notice: ${res.bookingReference}</h2>
        <p>Dear ${guestName},</p>
        <p>Thank you for choosing Larry King Hotel & Suite in Imota, Ikorodu, Lagos. Below are your reservation details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Booking Reference:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #1559ed;">${res.bookingReference}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Room Category:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right;">${r?.name || 'Room'} (${res.numberOfRooms} room)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Check-in Date:</td>
            <td style="padding: 10px 0; text-align: right;">${res.checkInDate} (From 2:00 PM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Check-out Date:</td>
            <td style="padding: 10px 0; text-align: right;">${res.checkOutDate} (By 12:00 PM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Duration:</td>
            <td style="padding: 10px 0; text-align: right;">${res.numberOfNights} Night(s)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Reservation Status:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: right; text-transform: uppercase;">${res.reservationStatus}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b;">Payment Method:</td>
            <td style="padding: 10px 0; text-align: right;">${res.paymentMode.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr style="border-bottom: 2px solid #192a3d;">
            <td style="padding: 14px 0; font-weight: bold; font-size: 16px;">Total Amount:</td>
            <td style="padding: 14px 0; font-weight: bold; font-size: 18px; color: #1559ed; text-align: right;">₦${res.totalAmountNgn.toLocaleString()}</td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-left: 4px solid #ffc200; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 6px; font-size: 14px; color: #1e293b;">Hotel Location & Contact</h4>
          <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
            11 Babatunde Labiyi Avenue, off Olarewaju Shogbein Avenue, Agundungbu, Imota, Ikorodu, Lagos, Nigeria.<br/>
            Telephone: +234-9071286050 | WhatsApp: +234 907 128 6050<br/>
            Email: Booking@larrykinghotel.com | Info@larrykinghotel.com
          </p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b;">
        &copy; ${new Date().getFullYear()} Larry King Hotel & Suite. All rights reserved.
      </div>
    </div>
  `;
}
