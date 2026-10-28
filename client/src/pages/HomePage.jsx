import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchFilter from '../components/room/SearchFilter';
import RoomCard from '../components/room/RoomCard';
import BookingModal from '../components/booking/BookingModal';
import { Award, Shield, Wifi, Coffee, Sparkles, Compass, CheckCircle, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setFeaturedRooms(res.data.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    if (filters.fromdate) params.append('fromdate', filters.fromdate);
    if (filters.todate) params.append('todate', filters.todate);
    if (filters.capacity) params.append('capacity', filters.capacity);
    if (filters.type && filters.type !== 'All') params.append('type', filters.type);
    navigate(`/rooms?${params.toString()}`);
  };

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="position-relative text-white d-flex align-items-center"
        style={{
          minHeight: '78vh',
          backgroundImage: 'linear-gradient(rgba(11, 19, 41, 0.65), rgba(11, 19, 41, 0.75)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-9">
              <span className="badge bg-warning text-dark px-3 py-2 text-uppercase fw-bold rounded-pill mb-3" style={{ letterSpacing: '1px' }}>
                Luxury Hospitality &bull; Oceanfront Sanctuary
              </span>
              <h1 className="display-3 fw-bold mb-3 text-white luxury-heading" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Elevate Your Stay to Unforgettable Heights
              </h1>
              <p className="lead text-light mb-5 fs-5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)', maxWidth: '750px', margin: '0 auto 2rem' }}>
                Immerse yourself in world-class design, panoramic ocean views, personalized concierge care, and Michelin-inspired culinary artistry.
              </p>
            </div>
          </div>

          {/* Search Filter Widget */}
          <div className="row justify-content-center mt-2">
            <div className="col-lg-11">
              <SearchFilter onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                  <Award size={28} />
                </div>
                <h6 className="fw-bold mb-1">Five-Star Excellence</h6>
                <p className="text-muted small mb-0">Consistently awarded top honors in hospitality and guest experience.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                  <Shield size={28} />
                </div>
                <h6 className="fw-bold mb-1">Guaranteed Best Rates</h6>
                <p className="text-muted small mb-0">Transparent pricing with zero hidden surcharges on official bookings.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                  <Wifi size={28} />
                </div>
                <h6 className="fw-bold mb-1">Ultra-Fast Fiber Wi-Fi</h6>
                <p className="text-muted small mb-0">Seamless connectivity across all private suites and beachfront terraces.</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                  <Coffee size={28} />
                </div>
                <h6 className="fw-bold mb-1">24/7 Room Service</h6>
                <p className="text-muted small mb-0">Artisanal breakfast in bed and round-the-clock bespoke dining.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites */}
      <section className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
            <div>
              <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Signature Lodging</span>
              <h2 className="display-5 fw-bold text-dark luxury-heading mb-0">Featured Rooms & Suites</h2>
            </div>
            <button
              onClick={() => navigate('/rooms')}
              className="btn btn-outline-dark mt-3 mt-md-0 d-inline-flex align-items-center gap-2 fw-semibold"
            >
              <span>Explore All Rooms</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status"></div>
              <p className="text-muted mt-2">Loading curated suites...</p>
            </div>
          ) : (
            <div className="row g-4">
              {featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <RoomCard room={room} onBookNow={handleBookNow} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hotel Highlights & Amenities */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Unrivaled Luxury</span>
              <h2 className="display-5 fw-bold text-dark luxury-heading mb-4">A Haven of Tranquility & Refinement</h2>
              <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                Nestled on the sun-kissed sands of Marina Boulevard, HotelPro Grand Resort blends timeless architecture with modern technological convenience. Whether you are retreating for a romantic getaway or orchestrating an executive summit, our dedicated staff guarantees meticulous hospitality at every touchpoint.
              </p>
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    <span className="small fw-semibold">Oceanfront Infinity Pool</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    <span className="small fw-semibold">Holistic Ayurvedic Spa</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    <span className="small fw-semibold">Private Cabana Service</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    <span className="small fw-semibold">Valet & Chauffeur Fleet</span>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/about')} className="btn btn-navy px-4 py-2">
                Learn More About Our Story
              </button>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"
                  alt="Resort Pool"
                  className="rounded-3 shadow-lg w-100 object-fit-cover"
                  style={{ height: '420px' }}
                />
                <div className="position-absolute bottom-0 start-0 m-4 bg-white p-3 rounded-3 shadow-lg border" style={{ maxWidth: '240px' }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <Sparkles size={18} />
                    <strong className="text-dark small">Guest Rating: 4.9 / 5.0</strong>
                  </div>
                  <p className="text-muted small mb-0">Based on over 1,200 verified guest reviews.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default HomePage;
