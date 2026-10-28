import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Wifi, Wind, Tv, ArrowRight, Star } from 'lucide-react';

const RoomCard = ({ room, onBookNow }) => {
  const defaultPhoto = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
  const photo = room.photos && room.photos.length > 0 ? room.photos[0] : defaultPhoto;

  return (
    <div className="card luxury-card h-100 overflow-hidden border-0">
      <div className="position-relative overflow-hidden" style={{ height: '230px' }}>
        <img
          src={photo}
          alt={room.type}
          className="w-100 h-100 object-fit-cover transition"
          onError={(e) => { e.target.src = defaultPhoto; }}
        />
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-75 text-warning fw-semibold px-3 py-2 rounded-pill shadow-sm">
            {room.type}
          </span>
        </div>
        <div className="position-absolute top-0 end-0 m-3">
          <span className={`badge ${room.operationalStatus === 'available' ? 'badge-available' : 'badge-maintenance'} px-2 py-1`}>
            {room.operationalStatus}
          </span>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title fw-bold mb-0 text-dark">
            Room #{room.roomNumber} &bull; {room.type}
          </h5>
          <div className="d-flex align-items-center text-muted small">
            <Users size={16} className="me-1 text-secondary" />
            <span>Up to {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
          </div>
        </div>

        <p className="card-text text-muted small flex-grow-1 mb-3" style={{ lineHeight: '1.6' }}>
          {room.description.length > 120 ? `${room.description.substring(0, 120)}...` : room.description}
        </p>

        {/* Amenity tags */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {room.amenities?.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="badge bg-light text-secondary border px-2 py-1 small fw-normal">
              {amenity}
            </span>
          ))}
          {room.amenities?.length > 3 && (
            <span className="badge bg-light text-muted border px-2 py-1 small fw-normal">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
          <div>
            <span className="fs-4 fw-bold text-dark">${room.rent}</span>
            <span className="text-muted small"> / night</span>
          </div>
          <div className="d-flex gap-2">
            <Link to={`/rooms/${room._id}`} className="btn btn-outline-dark btn-sm px-3 fw-semibold">
              Details
            </Link>
            <button
              onClick={() => onBookNow && onBookNow(room)}
              className="btn btn-gold btn-sm px-3 d-flex align-items-center gap-1"
            >
              <span>Book</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
