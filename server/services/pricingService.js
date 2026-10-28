/**
 * Authoritative Server-Side Pricing Calculator
 * Client prices are NEVER trusted.
 */

const calculateBookingPrice = (nightlyRate, fromDate, toDate) => {
  const checkIn = new Date(fromDate);
  const checkOut = new Date(toDate);

  checkIn.setUTCHours(0, 0, 0, 0);
  checkOut.setUTCHours(0, 0, 0, 0);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const nights = Math.max(1, diffDays);

  const basePrice = Math.round(nightlyRate * nights * 100) / 100;
  // 10% Hotel Occupancy & Tourism Tax
  const taxAmount = Math.round(basePrice * 0.10 * 100) / 100;
  // 3% Service & Maintenance Fee
  const serviceFee = Math.round(basePrice * 0.03 * 100) / 100;
  const totalAmount = Math.round((basePrice + taxAmount + serviceFee) * 100) / 100;

  return {
    nightlyRate,
    nights,
    basePrice,
    taxAmount,
    serviceFee,
    totalAmount,
    currency: 'USD'
  };
};

module.exports = {
  calculateBookingPrice
};

