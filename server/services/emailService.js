const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || '"HotelPro Reservations" <reservations@hotelpro.com>';

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransporter({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  console.log('[EmailService] SMTP transporter configured.');
} else {
  console.log('[EmailService] SMTP credentials not provided. Using development email logger.');
}

/**
 * Sends transactional email or logs safely in development
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html
      });
      console.log(`[EmailService] Live email dispatched to ${to}: ${info.messageId}`);
      return { sent: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] SMTP delivery failed to ${to}: ${err.message}`);
      return { sent: false, mode: 'smtp_failed', error: err.message };
    }
  }

  // Development logger mode
  console.log('--------------------------------------------------');
  console.log(`[EmailService (Dev Mode)] To: ${to}`);
  console.log(`[EmailService (Dev Mode)] Subject: ${subject}`);
  console.log(`[EmailService (Dev Mode)] Body Summary: ${text ? text.slice(0, 100) : 'HTML Template'}`);
  console.log('--------------------------------------------------');

  return {
    sent: true,
    mode: 'dev_logger',
    message: 'Development logger active: notification logged safely to console.'
  };
};

const sendBookingConfirmation = async (booking, room, user) => {
  const subject = `Booking Confirmation #${booking.bookingId} — HotelPro`;
  const text = `Dear ${booking.guestName}, your reservation #${booking.bookingId} for room ${room.type} (${room.roomNumber}) is confirmed from ${new Date(booking.fromdate).toLocaleDateString()} to ${new Date(booking.todate).toLocaleDateString()}. Total: $${booking.totalAmount}. Thank you for choosing HotelPro!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">HotelPro Reservation Confirmed</h2>
      <p>Dear <strong>${booking.guestName}</strong>,</p>
      <p>Thank you for choosing HotelPro. Your reservation has been successfully booked and confirmed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.bookingId}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Room:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${room.type} (Room #${room.roomNumber})</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-In:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.fromdate).toLocaleDateString()}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-Out:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(booking.todate).toLocaleDateString()}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Nights:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.totaldays}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold;">$${booking.totalAmount} USD</td></tr>
      </table>
      <p style="color: #64748b; font-size: 13px;">If you need to make changes or cancel, please visit your "My Bookings" dashboard on the HotelPro portal.</p>
    </div>
  `;

  return await sendEmail({ to: booking.guestEmail, subject, html, text });
};

const sendCancellationNotice = async (booking, room) => {
  const subject = `Reservation Cancellation #${booking.bookingId} — HotelPro`;
  const text = `Your reservation #${booking.bookingId} for room ${room.type} has been cancelled.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #b91c1c;">Reservation Cancelled</h2>
      <p>Dear ${booking.guestName},</p>
      <p>Your reservation <strong>#${booking.bookingId}</strong> has been cancelled.</p>
      <p>The room inventory has been returned to the schedule. If this was a mistake or you wish to re-book, please visit our website.</p>
    </div>
  `;
  return await sendEmail({ to: booking.guestEmail, subject, html, text });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendCancellationNotice
};

