import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardCheck, BedDouble, Bell, CheckCircle2, UserCheck, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [overview, setOverview] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [overviewRes, roomsRes, servicesRes] = await Promise.all([
        api.get('/staff/overview'),
        api.get('/staff/rooms'),
        api.get('/staff/services')
      ]);

      setOverview(overviewRes.data.data);
      setRooms(roomsRes.data.data);
      setServiceRequests(servicesRes.data.data);
    } catch (err) {
      console.error('Error fetching staff operations data:', err);
      toast.error('Failed to load operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCheckIn = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await api.post(`/staff/bookings/${bookingId}/check-in`);
      toast.success(res.data.message);
      fetchStaffData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await api.post(`/staff/bookings/${bookingId}/check-out`);
      toast.success(res.data.message);
      fetchStaffData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      const res = await api.patch(`/staff/rooms/${roomId}/status`, { operationalStatus: newStatus });
      toast.success(res.data.message);
      fetchStaffData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room status.');
    }
  };

  const handleServiceStatusChange = async (serviceId, newStatus) => {
    try {
      const res = await api.patch(`/staff/services/${serviceId}/status`, { status: newStatus });
      toast.success('Service ticket updated.');
      fetchStaffData();
    } catch (err) {
      toast.error('Failed to update service request.');
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <span className="badge bg-info text-dark mb-1">Front Desk & Housekeeping</span>
            <h2 className="display-6 fw-bold text-dark luxury-heading mb-1">Staff Operations Hub</h2>
            <p className="text-muted small mb-0">Manage guest check-ins, departures, room servicing, and operational tasks.</p>
          </div>
          <button onClick={fetchStaffData} className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1 mt-3 mt-md-0">
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>

        {/* Quick Summary Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-6">
            <div className="bg-white p-3 rounded-3 border shadow-sm">
              <span className="text-muted small fw-semibold">Arrivals Today</span>
              <h3 className="fw-bold text-primary mb-0">{overview?.checkInsToday?.length || 0}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="bg-white p-3 rounded-3 border shadow-sm">
              <span className="text-muted small fw-semibold">Departures Today</span>
              <h3 className="fw-bold text-dark mb-0">{overview?.checkOutsToday?.length || 0}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="bg-white p-3 rounded-3 border shadow-sm">
              <span className="text-muted small fw-semibold">Rooms Needing Cleaning</span>
              <h3 className="fw-bold text-warning mb-0">{overview?.roomsNeedingCleaning?.length || 0}</h3>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="bg-white p-3 rounded-3 border shadow-sm">
              <span className="text-muted small fw-semibold">Open Service Tickets</span>
              <h3 className="fw-bold text-danger mb-0">{overview?.openServiceRequests?.length || 0}</h3>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 border">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`nav-link small ${activeTab === 'checkin' ? 'active' : ''}`}
            >
              Front Desk (Check-In / Out)
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`nav-link small ${activeTab === 'rooms' ? 'active' : ''}`}
            >
              Housekeeping Room Board ({rooms.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('services')}
              className={`nav-link small ${activeTab === 'services' ? 'active' : ''}`}
            >
              Guest Service Tickets ({serviceRequests.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Check In / Out */}
        {activeTab === 'checkin' && (
          <div className="row g-4">
            {/* Arrivals */}
            <div className="col-lg-6">
              <div className="card luxury-card p-4 border-0 h-100">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <UserCheck size={18} className="text-primary" />
                    <span>Today's Expected Arrivals</span>
                  </h5>
                  <span className="badge bg-primary">{overview?.checkInsToday?.length || 0}</span>
                </div>

                {overview?.checkInsToday?.length === 0 ? (
                  <p className="text-muted small mb-0 py-3 text-center">No pending check-ins for today.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {overview?.checkInsToday?.map((b) => (
                      <div key={b._id} className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-dark d-block">{b.guestName}</strong>
                          <span className="text-muted small">
                            {b.room?.type} &bull; Room #{b.room?.roomNumber}
                          </span>
                          <small className="d-block text-secondary">Phone: {b.guestPhone}</small>
                        </div>
                        <button
                          onClick={() => handleCheckIn(b._id)}
                          disabled={actionLoading === b._id}
                          className="btn btn-primary btn-sm px-3"
                        >
                          {actionLoading === b._id ? 'Processing...' : 'Check In'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Departures */}
            <div className="col-lg-6">
              <div className="card luxury-card p-4 border-0 h-100">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <Clock size={18} className="text-secondary" />
                    <span>Today's Expected Departures</span>
                  </h5>
                  <span className="badge bg-dark">{overview?.checkOutsToday?.length || 0}</span>
                </div>

                {overview?.checkOutsToday?.length === 0 ? (
                  <p className="text-muted small mb-0 py-3 text-center">No guests checking out today.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {overview?.checkOutsToday?.map((b) => (
                      <div key={b._id} className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-dark d-block">{b.guestName}</strong>
                          <span className="text-muted small">
                            {b.room?.type} &bull; Room #{b.room?.roomNumber}
                          </span>
                          <small className="d-block text-secondary">Stayed: {b.totaldays} Nights</small>
                        </div>
                        <button
                          onClick={() => handleCheckOut(b._id)}
                          disabled={actionLoading === b._id}
                          className="btn btn-dark btn-sm px-3"
                        >
                          {actionLoading === b._id ? 'Processing...' : 'Check Out'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Housekeeping Room Board */}
        {activeTab === 'rooms' && (
          <div className="card luxury-card p-4 border-0">
            <h5 className="fw-bold text-dark mb-3">Room Inventory & Housekeeping Status</h5>
            <div className="row g-3">
              {rooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <div className="p-3 bg-light rounded-3 border h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">Room #{room.roomNumber}</h6>
                        <small className="text-muted">{room.type} &bull; Capacity: {room.capacity}</small>
                      </div>
                      <span className={`badge badge-status badge-${room.operationalStatus}`}>
                        {room.operationalStatus}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-top">
                      <label className="form-label small text-muted mb-1">Change Operational Status:</label>
                      <select
                        className="form-select form-select-sm"
                        value={room.operationalStatus}
                        onChange={(e) => handleRoomStatusChange(room._id, e.target.value)}
                      >
                        <option value="available">Available (Clean & Ready)</option>
                        <option value="cleaning">Cleaning (Housekeeping Needed)</option>
                        <option value="occupied">Occupied (Guest In Room)</option>
                        <option value="maintenance">Maintenance (Out of Order)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Service Requests */}
        {activeTab === 'services' && (
          <div className="card luxury-card p-4 border-0">
            <h5 className="fw-bold text-dark mb-3">Guest Service & Housekeeping Tickets</h5>
            {serviceRequests.length === 0 ? (
              <p className="text-muted py-4 text-center">No active service requests.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr className="small text-muted text-uppercase">
                      <th>Room</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th className="text-end">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((req) => (
                      <tr key={req._id}>
                        <td className="fw-bold text-dark">
                          Room #{req.room?.roomNumber || 'N/A'}
                        </td>
                        <td className="text-capitalize small">{req.type}</td>
                        <td>
                          <span className={`badge ${req.priority === 'urgent' ? 'bg-danger' : req.priority === 'high' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '300px' }}>
                          {req.description}
                        </td>
                        <td>
                          <span className={`badge ${req.status === 'resolved' ? 'bg-success' : req.status === 'in_progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <select
                            className="form-select form-select-sm d-inline-block w-auto"
                            value={req.status}
                            onChange={(e) => handleServiceStatusChange(req._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
