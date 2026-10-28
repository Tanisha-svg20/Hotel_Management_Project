import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldCheck, LayoutDashboard, Calendar, BedDouble, PlusCircle,
  Users, BarChart3, RefreshCw, Trash2, Edit, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Room Form State
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Deluxe',
    description: '',
    rent: '',
    capacity: 2,
    amenities: 'High-speed Wi-Fi, Smart TV, Air Conditioning, Room Service',
    photoUrl: ''
  });
  const [submittingRoom, setSubmittingRoom] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, roomsRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings?limit=50'),
        api.get('/rooms'),
        api.get('/admin/users'),
        api.get('/admin/reports')
      ]);

      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data);
      setRooms(roomsRes.data.data);
      setUsers(usersRes.data.data);
      setReports(reportsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load administrator dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  // Update User Role & Status
  const handleUpdateUserRole = async (userId, role, status) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role, status });
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.roomNumber || !newRoom.rent || !newRoom.description) {
      toast.error('Please fill in all required room fields.');
      return;
    }

    setSubmittingRoom(true);
    try {
      const payload = {
        ...newRoom,
        rent: Number(newRoom.rent),
        capacity: Number(newRoom.capacity),
        photos: newRoom.photoUrl ? [newRoom.photoUrl] : undefined
      };

      const res = await api.post('/rooms', payload);
      toast.success(res.data.message);
      setNewRoom({
        roomNumber: '',
        type: 'Deluxe',
        description: '',
        rent: '',
        capacity: 2,
        amenities: 'High-speed Wi-Fi, Smart TV, Air Conditioning, Room Service',
        photoUrl: ''
      });
      setActiveTab('rooms');
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setSubmittingRoom(false);
    }
  };

  // Deactivate Room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to deactivate this room?')) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      toast.success(res.data.message);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate room.');
    }
  };

  // Monthly Revenue Chart Data
  const monthlyChartData = {
    labels: reports?.monthlyRevenue?.map(r => r.month) || ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Revenue ($ USD)',
        data: reports?.monthlyRevenue?.map(r => r.revenue) || [1200, 2400, 1800, 3100, 2900, 3600],
        backgroundColor: '#0b1329',
        borderRadius: 4
      }
    ]
  };

  // Room Distribution Pie Data
  const roomPieData = {
    labels: reports?.roomTypeStats?.map(r => r._id) || ['Single', 'Double', 'Deluxe', 'Suite', 'Family Suite', 'Presidential Suite'],
    datasets: [
      {
        data: reports?.roomTypeStats?.map(r => r.totalRooms) || [1, 1, 1, 1, 1, 1],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#c59b27']
      }
    ]
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger">Restricted Access</span>
              <span className="text-muted small">System Operations</span>
            </div>
            <h2 className="display-6 fw-bold text-dark luxury-heading mb-0">HotelPro Admin Control Center</h2>
          </div>
          <button onClick={fetchAdminData} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1 mt-3 mt-md-0">
            <RefreshCw size={15} /> Refresh Analytics
          </button>
        </div>

        {/* Tab Navigation (MDBTabs style) */}
        <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 border shadow-sm">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'active' : ''}`}
            >
              <Calendar size={16} /> All Bookings ({bookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'rooms' ? 'active' : ''}`}
            >
              <BedDouble size={16} /> All Rooms ({rooms.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('addroom')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'addroom' ? 'active' : ''}`}
            >
              <PlusCircle size={16} /> Add Room
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('users')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={16} /> All Users ({users.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('reports')}
              className={`nav-link small d-flex align-items-center gap-2 ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <BarChart3 size={16} /> Analytics & Reports
            </button>
          </li>
        </ul>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div className="row g-4 mb-4">
              <div className="col-lg-3 col-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <span className="text-muted small fw-semibold text-uppercase">Verified Revenue</span>
                  <h3 className="fw-bold text-success mb-1">${stats?.revenue?.total || 0} USD</h3>
                  <small className="text-muted">Settled bookings to date</small>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <span className="text-muted small fw-semibold text-uppercase">Total Bookings</span>
                  <h3 className="fw-bold text-dark mb-1">{stats?.bookings?.total || 0}</h3>
                  <small className="text-muted">{stats?.bookings?.confirmed || 0} active & confirmed</small>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <span className="text-muted small fw-semibold text-uppercase">Active Rooms</span>
                  <h3 className="fw-bold text-primary mb-1">{stats?.rooms?.total || 0}</h3>
                  <small className="text-muted">{stats?.rooms?.available || 0} currently available</small>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <span className="text-muted small fw-semibold text-uppercase">Registered Users</span>
                  <h3 className="fw-bold text-warning mb-1">{stats?.users?.total || 0}</h3>
                  <small className="text-muted">Customers & hotel staff</small>
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="card luxury-card p-4 border-0 mb-4">
              <h5 className="fw-bold text-dark mb-3">Recent Guest Reservations</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light small text-muted text-uppercase">
                    <tr>
                      <th>Booking Ref</th>
                      <th>Guest Name</th>
                      <th>Room</th>
                      <th>Dates</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings?.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-bold text-dark small">#{b.bookingId}</td>
                        <td>{b.guestName}</td>
                        <td>{b.room?.type} (#{b.room?.roomNumber})</td>
                        <td className="small">{new Date(b.fromdate).toLocaleDateString()} &rarr; {new Date(b.todate).toLocaleDateString()}</td>
                        <td className="fw-bold text-success">${b.totalAmount}</td>
                        <td>
                          <span className={`badge badge-status badge-${b.status}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="card luxury-card p-4 border-0">
            <h5 className="fw-bold text-dark mb-3">All Customer Bookings</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Ref ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Schedule</th>
                    <th>Nights</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold small">#{b.bookingId}</td>
                      <td>
                        <div className="fw-bold small">{b.guestName}</div>
                        <small className="text-muted">{b.guestEmail}</small>
                      </td>
                      <td>{b.room?.type} (#{b.room?.roomNumber})</td>
                      <td className="small">{new Date(b.fromdate).toLocaleDateString()} to {new Date(b.todate).toLocaleDateString()}</td>
                      <td className="small">{b.totaldays}</td>
                      <td className="fw-bold text-success">${b.totalAmount}</td>
                      <td>
                        <span className={`badge badge-status badge-${b.status}`}>{b.status}</span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="checked-in">Checked In</option>
                          <option value="checked-out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ALL ROOMS */}
        {activeTab === 'rooms' && (
          <div className="card luxury-card p-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Hotel Inventory & Active Rooms</h5>
              <button onClick={() => setActiveTab('addroom')} className="btn btn-gold btn-sm">
                + Add New Room
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Room #</th>
                    <th>Type</th>
                    <th>Rent / Night</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Inventory</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id}>
                      <td className="fw-bold text-dark">#{room.roomNumber}</td>
                      <td>{room.type}</td>
                      <td className="fw-bold">${room.rent}</td>
                      <td>{room.capacity} Guests</td>
                      <td>
                        <span className={`badge badge-status badge-${room.operationalStatus}`}>
                          {room.operationalStatus}
                        </span>
                      </td>
                      <td>{room.count || 1} Unit(s)</td>
                      <td className="text-end">
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          title="Deactivate Room"
                        >
                          <Trash2 size={14} className="me-1 inline" />
                          <span className="small">Deactivate</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ADD ROOM */}
        {activeTab === 'addroom' && (
          <div className="card luxury-card p-4 p-md-5 border-0">
            <h5 className="fw-bold text-dark mb-4">Create New Hotel Room / Suite</h5>
            <form onSubmit={handleCreateRoom}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Room Number or ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 601"
                    required
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Room Type / Category</label>
                  <select
                    className="form-select"
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family Suite">Family Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Nightly Rent ($ USD)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 250"
                    required
                    min="1"
                    value={newRoom.rent}
                    onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Max Guest Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    required
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Photo Image URL (or Unsplash asset)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newRoom.photoUrl}
                    onChange={(e) => setNewRoom({ ...newRoom, photoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Amenities (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Room Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detailed architectural and feature description of this suite..."
                  required
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingRoom}
                className="btn btn-gold px-4 py-2"
              >
                {submittingRoom ? 'Creating Room...' : 'Save & Publish Room'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: ALL USERS */}
        {activeTab === 'users' && (
          <div className="card luxury-card p-4 border-0">
            <h5 className="fw-bold text-dark mb-3">User & Permission Management</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Assign Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-bold text-dark">{u.name}</td>
                      <td className="small">{u.email}</td>
                      <td className="small">{u.phone}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'staff' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u._id, e.target.value, u.status)}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card luxury-card p-4 border-0 h-100">
                <h5 className="fw-bold text-dark mb-3">Monthly Revenue Trends ($ USD)</h5>
                <div style={{ height: '300px' }}>
                  <Bar
                    data={monthlyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card luxury-card p-4 border-0 h-100">
                <h5 className="fw-bold text-dark mb-3">Room Type Distribution</h5>
                <div style={{ height: '300px' }}>
                  <Pie
                    data={roomPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
