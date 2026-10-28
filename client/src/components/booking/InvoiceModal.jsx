import React from 'react';
import { Printer, X, Hotel, ShieldCheck } from 'lucide-react';

const InvoiceModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const checkInStr = new Date(booking.fromdate).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  const checkOutStr = new Date(booking.todate).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const nights = booking.totaldays || 1;
  const nightlyRate = booking.nightlyPriceSnapshot || (booking.room?.rent) || (booking.totalAmount / nights);
  const baseSubtotal = Math.round(nightlyRate * nights * 100) / 100;
  const tax = Math.round(baseSubtotal * 0.10 * 100) / 100;
  const serviceFee = Math.round(baseSubtotal * 0.03 * 100) / 100;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 19, 41, 0.75)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header Controls */}
          <div className="modal-header bg-light d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
            <h5 className="modal-title fw-bold text-dark mb-0">Official Booking Receipt</h5>
            <div className="d-flex gap-2">
              <button onClick={handlePrint} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1">
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button onClick={onClose} className="btn-close" aria-label="Close"></button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="modal-body p-5 bg-white" id="printable-receipt">
            {/* Top Letterhead */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="bg-warning text-dark rounded-2 p-1 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <Hotel size={22} color="#0b1329" />
                  </div>
                  <h3 className="fw-bold mb-0 text-dark">Hotel<span className="text-warning">Pro</span></h3>
                </div>
                <p className="text-muted small mb-0">
                  777 Ocean Drive, Marina Boulevard<br />
                  Miami Beach, FL 33139, United States<br />
                  Tel: +1 (305) 555-0199 &bull; reservations@hotelpro.com
                </p>
              </div>
              <div className="text-end">
                <h4 className="fw-bold text-secondary mb-1">TAX INVOICE</h4>
                <p className="mb-0 small text-muted">Invoice #: <strong>REC-{booking.bookingId}</strong></p>
                <p className="mb-0 small text-muted">Booking Reference: <strong>#{booking.bookingId}</strong></p>
                <p className="mb-0 small text-muted">Issued Date: {new Date(booking.createdAt || Date.now()).toLocaleDateString()}</p>
                <span className="badge bg-success mt-2 px-3 py-1">PAID IN FULL</span>
              </div>
            </div>

            {/* Billed To / Reservation Summary */}
            <div className="row g-4 mb-4">
              <div className="col-6">
                <h6 className="fw-bold text-dark text-uppercase small text-muted mb-2">Billed To</h6>
                <p className="mb-1 fw-bold text-dark">{booking.guestName}</p>
                <p className="mb-1 text-muted small">{booking.guestEmail}</p>
                <p className="mb-0 text-muted small">{booking.guestPhone}</p>
              </div>
              <div className="col-6">
                <h6 className="fw-bold text-dark text-uppercase small text-muted mb-2">Stay Schedule</h6>
                <p className="mb-1 text-dark small"><strong>Check-In:</strong> {checkInStr} (After 3:00 PM)</p>
                <p className="mb-1 text-dark small"><strong>Check-Out:</strong> {checkOutStr} (Before 11:00 AM)</p>
                <p className="mb-0 text-dark small"><strong>Duration:</strong> {nights} {nights === 1 ? 'Night' : 'Nights'} &bull; {booking.guestCount || 1} Guests</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr className="small text-muted text-uppercase">
                    <th>Description</th>
                    <th className="text-center">Rate</th>
                    <th className="text-center">Nights</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="fw-bold text-dark">{booking.room?.type || 'Hotel Room'} — Room #{booking.room?.roomNumber || 'Assigned on arrival'}</div>
                      <small className="text-muted">Standard Luxury Lodging Accommodations</small>
                    </td>
                    <td className="text-center">${nightlyRate}</td>
                    <td className="text-center">{nights}</td>
                    <td className="text-end fw-semibold">${baseSubtotal}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-muted small">State & Tourism Occupancy Tax (10%)</td>
                    <td className="text-end small">${tax}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-muted small">Resort Amenities & Service Fee (3%)</td>
                    <td className="text-end small">${serviceFee}</td>
                  </tr>
                  <tr className="table-light">
                    <td colSpan="3" className="text-end fw-bold text-dark fs-6">Grand Total Paid:</td>
                    <td className="text-end fw-bold text-success fs-6">${booking.totalAmount} USD</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Details Footer */}
            <div className="bg-light p-3 rounded-2 border d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <ShieldCheck size={18} className="text-success" />
                <span>Payment Settlement: Verified Development Adapter (Card Ending in 4242)</span>
              </div>
              <div className="text-muted small">
                Reservation Status: <strong className="text-capitalize text-dark">{booking.status}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
