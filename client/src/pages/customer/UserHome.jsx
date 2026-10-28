import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, User, Compass, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const UserHome = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const upcomingBooking = bookings.find(b => b.status === 'confirmed' || b.status === 'checked-in');

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div className="card luxury-card p-4 p-md-5 border-0 text-white mb-4 position-relative overflow-hidden" style={{ backgroundColor: 'var(--primary-navy)' }}>
          <div className="row align-items-center position-relative z-1">
            <div className="col-lg-8">
              <span className="badge bg-warning text-dark px-3 py-1 mb-2 fw-semibold">HotelPro Loyalty Member</span>
              <h1 className="display-5 fw-bold mb-2 luxury-heading text-white">
                Welcome, {user?.name}
              </h1>
              <p className="lead text-light mb-4 fs-6 opacity-75">
                Manage your reservations, view digital receipts, or plan your next tranquil escape with member-exclusive privileges.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/rooms" className="btn btn-gold d-inline-flex align-items-center gap-2">
                  <Compass size={18} />
                  <span>Explore & Book Rooms</span>
                </Link>
                <Link to="/customer/bookings" className="btn btn-outline-light d-inline-flex align-items-center gap-2">
                  <Calendar size={18} />
                  <span>My Bookings ({bookings.length})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold">Total Stays Reserved</span>
                <Calendar size={20} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark mb-0">{bookings.length}</h3>
              <small className="text-muted">Lifetime reservations with HotelPro</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold">Active & Upcoming</span>
                <Clock size={20} className="text-warning" />
              </div>
              <h3 className="fw-bold text-dark mb-0">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length}
              </h3>
              <small className="text-muted">Confirmed or in-progress visits</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold">Completed Visits</span>
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <h3 className="fw-bold text-dark mb-0">
                {bookings.filter(b => b.status === 'checked-out').length}
              </h3>
              <small className="text-muted">Past memorable stays</small>
            </div>
          </div>
        </div>

        {/* Next Upcoming Reservation Spotlight */}
        {upcomingBooking ? (
          <div className="card luxury-card p-4 border-0 mb-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">Your Next Stay Spotlight</h5>
              <span className={`badge ${upcomingBooking.status === 'confirmed' ? 'badge-confirmed' : 'badge-checked-in'}`}>
                {upcomingBooking.status}
              </span>
            </div>
            <div className="row align-items-center g-3">
              <div className="col-md-3">
                <img
                  src={upcomingBooking.room?.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                  alt={upcomingBooking.room?.type}
                  className="rounded-3 w-100 object-fit-cover"
                  style={{ height: '140px' }}
                />
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-dark fs-5 mb-1">
                  {upcomingBooking.room?.type} &bull; Room #{upcomingBooking.room?.roomNumber}
                </h6>
                <p className="text-muted small mb-2">Booking Reference: <strong>#{upcomingBooking.bookingId}</strong></p>
                <div className="row g-2 small text-secondary">
                  <div className="col-6"><strong>Check-In:</strong> {new Date(upcomingBooking.fromdate).toLocaleDateString()}</div>
                  <div className="col-6"><strong>Check-Out:</strong> {new Date(upcomingBooking.todate).toLocaleDateString()}</div>
                  <div className="col-6"><strong>Duration:</strong> {upcomingBooking.totaldays} Nights</div>
                  <div className="col-6"><strong>Total Paid:</strong> ${upcomingBooking.totalAmount} USD</div>
                </div>
              </div>
              <div className="col-md-3 text-md-end">
                <Link to="/customer/bookings" className="btn btn-navy btn-sm px-3">
                  View Full Reservation
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-3 border text-center">
            <Calendar size={40} className="text-warning mx-auto mb-2" />
            <h6 className="fw-bold text-dark mb-1">No Upcoming Stays</h6>
            <p className="text-muted small mb-3">You don't have any upcoming reservations scheduled. Ready for a vacation?</p>
            <Link to="/rooms" className="btn btn-gold btn-sm px-4">
              Find Available Rooms
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
