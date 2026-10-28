import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { X, Calendar, User, Phone, Mail, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingModal = ({ room, isOpen, onClose, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [fromdate, setFromDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [todate, setToDate] = useState(dayAfter.toISOString().split('T')[0]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [cardOption, setCardOption] = useState('4242');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !room) return null;

  // Calculate nights and estimated pricing
  const checkIn = new Date(fromdate);
  const checkOut = new Date(todate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const baseRent = Math.round(room.rent * nights * 100) / 100;
  const tax = Math.round(baseRent * 0.10 * 100) / 100;
  const serviceFee = Math.round(baseRent * 0.03 * 100) / 100;
  const estimatedTotal = Math.round((baseRent + tax + serviceFee) * 100) / 100;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please log in or create an account to finalize your booking.');
      navigate('/login');
      return;
    }

    if (!fromdate || !todate || !guestName || !guestEmail || !guestPhone) {
      toast.error('Please complete all required reservation fields.');
      return;
    }

    if (new Date(fromdate) >= new Date(todate)) {
      toast.error('Check-out date must be strictly after check-in date.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomId: room._id,
        fromdate,
        todate,
        guestName,
        guestEmail,
        guestPhone,
        guestCount,
        specialRequests,
        cardLast4: cardOption,
        simulateFailure: cardOption === '0000'
      };

      const res = await api.post('/bookings', payload);
      const bookedData = res.data.data.booking;
      setConfirmedBooking(bookedData);
      toast.success('Reservation successfully confirmed!');

      if (onBookingSuccess) {
        onBookingSuccess(bookedData);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to complete booking. Room may be reserved.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(11, 19, 41, 0.75)', zIndex: 1055 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header */}
          <div className="modal-header text-white p-4" style={{ backgroundColor: 'var(--primary-navy)' }}>
            <div>
              <span className="badge bg-warning text-dark mb-1">Instant Reservation</span>
              <h5 className="modal-title fw-bold fs-4 mb-0">
                Book Room #{room.roomNumber} &bull; {room.type}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {confirmedBooking ? (
              <div className="text-center py-4">
                <div className="mb-3 text-success">
                  <CheckCircle2 size={64} className="mx-auto" />
                </div>
                <h4 className="fw-bold text-dark mb-1">Booking Confirmed!</h4>
                <p className="text-muted mb-4">
                  Reservation Reference: <strong className="text-primary fs-5">#{confirmedBooking.bookingId}</strong>
                </p>
                <div className="bg-light p-3 rounded-3 text-start mb-4 border">
                  <div className="row g-2 small">
                    <div className="col-6"><strong>Guest:</strong> {confirmedBooking.guestName}</div>
                    <div className="col-6"><strong>Total Paid:</strong> ${confirmedBooking.totalAmount} USD</div>
                    <div className="col-6"><strong>Check-In:</strong> {new Date(confirmedBooking.fromdate).toLocaleDateString()}</div>
                    <div className="col-6"><strong>Check-Out:</strong> {new Date(confirmedBooking.todate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-3">
                  <button onClick={() => navigate('/customer/bookings')} className="btn btn-navy px-4">
                    View My Bookings
                  </button>
                  <button onClick={onClose} className="btn btn-outline-secondary px-4">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div className="row g-4">
                  {/* Left Column: Dates & Guest Info */}
                  <div className="col-md-7">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">1. Reservation Schedule</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Check-In</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={fromdate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFromDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Check-Out</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={todate}
                          min={fromdate}
                          onChange={(e) => setToDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">2. Guest Details</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Email Address</label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Guests Count</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="1"
                          max={room.capacity}
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          required
                        />
                        <small className="text-muted">Max capacity: {room.capacity}</small>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Special Requests (Optional)</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          placeholder="e.g. Quiet room, late arrival, airport shuttle assistance"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Price Breakdown & Payment */}
                  <div className="col-md-5">
                    <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column">
                      <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Rate Breakdown</h6>
                      <ul className="list-unstyled small mb-3 flex-grow-1">
                        <li className="d-flex justify-content-between py-1">
                          <span className="text-muted">${room.rent} &times; {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                          <span className="fw-semibold">${baseRent}</span>
                        </li>
                        <li className="d-flex justify-content-between py-1">
                          <span className="text-muted">State & City Tourism Tax (10%)</span>
                          <span className="fw-semibold">${tax}</span>
                        </li>
                        <li className="d-flex justify-content-between py-1">
                          <span className="text-muted">Service & Resort Amenities (3%)</span>
                          <span className="fw-semibold">${serviceFee}</span>
                        </li>
                        <li className="dropdown-divider my-2"></li>
                        <li className="d-flex justify-content-between py-2 fs-5 fw-bold text-dark">
                          <span>Total Amount:</span>
                          <span className="text-success">${estimatedTotal} USD</span>
                        </li>
                      </ul>

                      {/* Payment Adapter Notice & Test Cards */}
                      <div className="bg-white p-3 rounded-2 border mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary small fw-bold">
                          <ShieldCheck size={18} />
                          <span>Payment Simulation & Gateways</span>
                        </div>
                        <label className="form-label small text-muted mb-1">Select Payment Scenario:</label>
                        <select
                          className="form-select form-select-sm mb-2"
                          value={cardOption}
                          onChange={(e) => setCardOption(e.target.value)}
                        >
                          <option value="4242">Approved Test Visa (Ending in 4242) — Successful</option>
                          <option value="0000">Declined Test Card (Ending in 0000) — Simulate Failure</option>
                        </select>
                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                          {cardOption === '4242'
                            ? '✓ Will authorize and confirm reservation.'
                            : '✗ Will simulate card decline and test failure handling.'}
                        </small>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-gold w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Verifying & Booking...</span>
                          </>
                        ) : (
                          <span>Pay & Confirm Reservation (${estimatedTotal})</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

