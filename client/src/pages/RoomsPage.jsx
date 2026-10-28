import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/room/RoomCard';
import SearchFilter from '../components/room/SearchFilter';
import BookingModal from '../components/booking/BookingModal';
import { SlidersHorizontal, BedDouble, AlertCircle } from 'lucide-react';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-asc');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL query params
  const fromdate = searchParams.get('fromdate') || '';
  const todate = searchParams.get('todate') || '';
  const capacity = searchParams.get('capacity') || '1';
  const type = searchParams.get('type') || 'All';

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromdate) params.append('fromdate', fromdate);
      if (todate) params.append('todate', todate);
      if (capacity && capacity !== '1') params.append('capacity', capacity);
      if (type && type !== 'All') params.append('type', type);

      const res = await api.get(`/rooms?${params.toString()}`);
      let fetchedRooms = res.data.data;

      // Sort results
      if (sortBy === 'price-asc') {
        fetchedRooms.sort((a, b) => a.rent - b.rent);
      } else if (sortBy === 'price-desc') {
        fetchedRooms.sort((a, b) => b.rent - a.rent);
      }

      setRooms(fetchedRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchParams, sortBy]);

  const handleSearch = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.fromdate) params.append('fromdate', newFilters.fromdate);
    if (newFilters.todate) params.append('todate', newFilters.todate);
    if (newFilters.capacity) params.append('capacity', newFilters.capacity);
    if (newFilters.type && newFilters.type !== 'All') params.append('type', newFilters.type);
    setSearchParams(params);
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Page Header */}
        <div className="text-center mb-5">
          <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Accommodations</span>
          <h1 className="display-4 fw-bold text-dark luxury-heading mb-2">Rooms & Executive Suites</h1>
          <p className="text-muted lead fs-6" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Choose from our collection of artfully designed rooms, oceanfront suites, and lavish penthouses.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-4">
          <SearchFilter
            onSearch={handleSearch}
            initialValues={{ fromdate, todate, capacity, type }}
          />
        </div>

        {/* Results Metadata & Sorting */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded-3 border">
          <div className="text-muted small mb-2 mb-md-0">
            Showing <strong className="text-dark">{rooms.length}</strong> available {rooms.length === 1 ? 'room' : 'rooms'}
            {fromdate && todate && ` for stay: ${new Date(fromdate).toLocaleDateString()} to ${new Date(todate).toLocaleDateString()}`}
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-flex align-items-center gap-1">
              <SlidersHorizontal size={14} /> Sort By:
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: '180px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Checking room availability...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-3 border p-5">
            <AlertCircle size={48} className="text-warning mx-auto mb-3" />
            <h4 className="fw-bold text-dark mb-1">No Rooms Available</h4>
            <p className="text-muted mb-4">
              We couldn't find any rooms matching your selected dates and criteria. Try adjusting your dates or room category.
            </p>
            <button
              onClick={() => handleSearch({ fromdate: '', todate: '', capacity: '1', type: 'All' })}
              className="btn btn-navy px-4"
            >
              View All Rooms
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {rooms.map((room) => (
              <div key={room._id} className="col-lg-4 col-md-6">
                <RoomCard room={room} onBookNow={handleBookNow} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoomsPage;
