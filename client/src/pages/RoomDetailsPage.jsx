import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import BookingModal from '../components/booking/BookingModal';
import { Users, Wifi, Wind, Tv, Check, Star, ArrowLeft, Calendar, ShieldCheck, Heart } from 'lucide-react';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data.data);
      } catch (err) {
        console.error('Error fetching room details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h3>Room Not Found</h3>
        <p className="text-muted">The room you are looking for may have been removed.</p>
        <Link to="/rooms" className="btn btn-navy">Back to Rooms</Link>
      </div>
    );
  }

  const defaultPhoto = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
  const photos = room.photos && room.photos.length > 0 ? room.photos : [defaultPhoto];

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '85vh' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link to="/rooms" className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Back to Rooms
          </Link>
        </div>

        <div className="row g-4">
          {/* Left Column: Gallery & Details */}
          <div className="col-lg-8">
            <div className="bg-white rounded-3 shadow-sm border p-4 mb-4">
              {/* Main Photo */}
              <div className="rounded-3 overflow-hidden mb-3 position-relative" style={{ height: '420px' }}>
                <img
                  src={photos[activePhoto]}
                  alt={room.type}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => { e.target.src = defaultPhoto; }}
                />
                <span className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 text-warning px-3 py-2 rounded-pill fs-6">
                  Room #{room.roomNumber} &bull; {room.type}
                </span>
              </div>

              {/* Thumbnail Gallery */}
              {photos.length > 1 && (
                <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      onClick={() => setActivePhoto(idx)}
                      className={`rounded cursor-pointer border ${activePhoto === idx ? 'border-warning border-3' : 'opacity-75'}`}
                      style={{ width: '90px', height: '65px', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  ))}
                </div>
              )}

              {/* Title & Specifications */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h2 className="fw-bold text-dark luxury-heading mb-1">{room.type} Suite</h2>
                  <p className="text-muted small mb-0">HotelPro Grand Resort & Spa &bull; Miami Beach, FL</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-light text-dark border p-2 d-flex align-items-center gap-1">
                    <Users size={16} className="text-secondary" /> Up to {room.capacity} Guests
                  </span>
                  <span className="badge badge-available p-2 text-capitalize">
                    {room.operationalStatus}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2">Description</h5>
                <p className="text-muted" style={{ lineHeight: '1.8' }}>
                  {room.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-3">Room Amenities & Features</h5>
                <div className="row g-2">
                  {room.amenities?.map((amenity, idx) => (
                    <div key={idx} className="col-md-4 col-6">
                      <div className="d-flex align-items-center gap-2 p-2 bg-light rounded border">
                        <Check size={16} className="text-success flex-shrink-0" />
                        <span className="small text-dark fw-medium">{amenity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotel Policies */}
              <div className="border-top pt-4">
                <h6 className="fw-bold text-dark mb-2">Reservation & Check-In Policies</h6>
                <ul className="text-muted small mb-0 ps-3">
                  <li>Check-in: 3:00 PM | Check-out: 11:00 AM.</li>
                  <li>Complimentary cancellation up to 48 hours prior to check-in.</li>
                  <li>Smoke-free accommodations throughout all indoor areas.</li>
                </ul>
              </div>
            </div>

            {/* Guest Reviews Section */}
            <div className="bg-white rounded-3 shadow-sm border p-4">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <h5 className="fw-bold text-dark mb-0">Guest Reviews ({room.reviewCount || 0})</h5>
                {room.averageRating && (
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                    <Star size={16} fill="currentColor" className="me-1 inline" />
                    {room.averageRating} / 5.0
                  </span>
                )}
              </div>

              {room.reviews && room.reviews.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {room.reviews.map((rev) => (
                    <div key={rev._id} className="p-3 bg-light rounded border">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{rev.user?.name || 'Verified Guest'}</strong>
                        <div className="text-warning small">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted small mb-1">{rev.comment}</p>
                      <small className="text-muted fs-xs">{new Date(rev.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">No reviews yet for this suite. Be the first to experience it!</p>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Booking Action */}
          <div className="col-lg-4">
            <div className="card luxury-card p-4 sticky-top border-0 shadow-sm" style={{ top: '95px' }}>
              <div className="border-bottom pb-3 mb-3">
                <span className="text-muted small">Price per night</span>
                <div className="d-flex align-items-baseline gap-1">
                  <span className="display-6 fw-bold text-dark">${room.rent}</span>
                  <span className="text-muted">/ night</span>
                </div>
              </div>

              <div className="bg-light p-3 rounded border mb-3">
                <div className="d-flex align-items-center gap-2 text-success small mb-1">
                  <ShieldCheck size={18} />
                  <strong className="text-dark">Instant Confirmation Guaranteed</strong>
                </div>
                <p className="text-muted small mb-0">
                  Select your dates and complete your reservation in under two minutes.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-gold w-100 py-3 fw-bold fs-6 mb-3 shadow-sm"
              >
                Reserve This Suite Now
              </button>

              <div className="text-center text-muted small">
                <p className="mb-1">You won't be charged until booking confirmation.</p>
                <div className="d-flex justify-content-center gap-3 mt-2 text-secondary">
                  <span>&bull; Best Rate Guarantee</span>
                  <span>&bull; Free Wi-Fi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default RoomDetailsPage;
