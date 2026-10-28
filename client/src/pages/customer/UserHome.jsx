import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, User, Compass, Clock, CheckCircle2, ArrowRight, Bell, Shield, Phone, Mail, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const UserHome = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, notifsRes] = await Promise.all([
        api.get('/bookings/my'),
        api.get('/notifications')
      ]);
      setBookings(bookingsRes.data.data);
      setNotifications(notifsRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone });
      toast.success('Your profile details have been updated!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchData();
    } catch (err) {}
  };

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
                Manage your reservations, update your profile, or plan your next tranquil escape with member-exclusive privileges.
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

        {/* Tab Navigation */}
        <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 border shadow-sm">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Compass size={16} /> Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('profile')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} /> My Profile
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={16} /> Notifications ({notifications.filter(n => !n.isRead).length})
            </button>
          </li>
        </ul>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
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
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="card luxury-card p-4 p-md-5 border-0">
            <h4 className="fw-bold text-dark mb-4">Account Profile & Guest Information</h4>
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><User size={16} /></span>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Phone size={16} /></span>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address (Registered)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                  <small className="text-muted">Email is locked to your account identifier.</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Account Role</label>
                  <input
                    type="text"
                    className="form-control bg-light text-capitalize"
                    value={user?.role || 'Customer'}
                    disabled
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-gold px-4 py-2 d-inline-flex align-items-center gap-2"
              >
                <Save size={16} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="card luxury-card p-4 border-0">
            <h4 className="fw-bold text-dark mb-3">Notifications & Reservation Alerts</h4>
            {notifications.length === 0 ? (
              <p className="text-muted py-4 text-center">No notifications yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 rounded-2 border d-flex justify-content-between align-items-center ${n.isRead ? 'bg-light' : 'bg-white border-warning'}`}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-dark small">{n.title}</strong>
                        {!n.isRead && <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>NEW</span>}
                      </div>
                      <p className="text-muted small mb-0">{n.message}</p>
                      <small className="text-secondary" style={{ fontSize: '11px' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkNotificationRead(n._id)}
                        className="btn btn-outline-secondary btn-sm"
                        style={{ fontSize: '11px' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
