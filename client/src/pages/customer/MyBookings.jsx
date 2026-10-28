import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import InvoiceModal from '../../components/booking/InvoiceModal';
import { Calendar, Receipt, Ban, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load your booking records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The room will be returned to the schedule.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelled by customer via portal'
      });
      toast.success('Reservation successfully cancelled.');
      fetchBookings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel reservation.';
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const openInvoice = (booking) => {
    setSelectedInvoice(booking);
    setIsInvoiceOpen(true);
  };

  const filteredBookings = filter === 'All'
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Personal History</span>
            <h2 className="display-6 fw-bold text-dark luxury-heading mb-1">My Hotel Reservations</h2>
            <p className="text-muted small mb-0">View your active itineraries, download invoices, or manage reservations.</p>
          </div>
          <Link to="/rooms" className="btn btn-gold btn-sm mt-3 mt-md-0 px-3">
            + Book Another Room
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {['All', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`btn btn-sm px-3 text-capitalize ${filter === tab ? 'btn-navy fw-bold' : 'btn-white bg-white text-secondary border'}`}
            >
              {tab === 'All' ? 'All Bookings' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Bookings Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="text-muted mt-2">Loading reservations...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-5 rounded-3 border text-center">
            <AlertCircle size={48} className="text-warning mx-auto mb-3" />
            <h5 className="fw-bold text-dark">No Reservations Found</h5>
            <p className="text-muted small mb-3">No bookings match the selected status filter.</p>
            <Link to="/rooms" className="btn btn-navy btn-sm px-4">
              Browse Available Rooms
            </Link>
          </div>
        ) : (
          <div className="table-responsive bg-white rounded-3 border shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted text-uppercase">
                  <th>Booking ID</th>
                  <th>Room Info</th>
                  <th>Dates (From / To)</th>
                  <th>Duration</th>
                  <th>Total Amount</th>
                  <th>Guest Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="fw-bold text-dark small">#{b.bookingId}</span>
                      <small className="d-block text-muted" style={{ fontSize: '11px' }}>
                        Booked: {new Date(b.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={b.room?.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=100&q=80'}
                          alt={b.room?.type}
                          className="rounded object-fit-cover"
                          style={{ width: '42px', height: '42px' }}
                        />
                        <div>
                          <div className="fw-bold text-dark small">{b.room?.type || 'Room'}</div>
                          <small className="text-muted">Room #{b.room?.roomNumber}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">{new Date(b.fromdate).toLocaleDateString()}</div>
                      <small className="text-muted">to {new Date(b.todate).toLocaleDateString()}</small>
                    </td>
                    <td className="small text-muted">
                      {b.totaldays} {b.totaldays === 1 ? 'Night' : 'Nights'}
                    </td>
                    <td>
                      <span className="fw-bold text-dark small">${b.totalAmount}</span>
                      <small className="d-block text-success fw-medium" style={{ fontSize: '11px' }}>Paid</small>
                    </td>
                    <td className="small text-muted">
                      {b.guestPhone}
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${b.status}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          onClick={() => openInvoice(b)}
                          className="btn btn-outline-dark btn-sm p-1 px-2"
                          title="View Tax Invoice"
                        >
                          <Receipt size={14} className="me-1 inline" />
                          <span className="small">Receipt</span>
                        </button>
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            disabled={cancellingId === b._id}
                            className="btn btn-outline-danger btn-sm p-1 px-2"
                            title="Cancel Reservation"
                          >
                            <Ban size={14} className="me-1 inline" />
                            <span className="small">Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          booking={selectedInvoice}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
};

export default MyBookings;

