import React from 'react';
import { Award, Compass, Heart, Users, Star, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)' }}>
      {/* Banner */}
      <section className="container mb-5 text-center">
        <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Our Legacy</span>
        <h1 className="display-4 fw-bold text-dark luxury-heading mb-3">The Art of Pure Hospitality</h1>
        <p className="lead text-muted fs-6" style={{ maxWidth: '720px', margin: '0 auto' }}>
          Established as an iconic seaside beacon, HotelPro harmonizes coastal elegance with contemporary luxury to curate bespoke, unforgettable guest moments.
        </p>
      </section>

      {/* Visual Section */}
      <section className="container mb-5">
        <div className="rounded-3 overflow-hidden shadow-lg position-relative" style={{ height: '420px' }}>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
            alt="Resort Exterior"
            className="w-100 h-100 object-fit-cover"
          />
          <div className="position-absolute bottom-0 start-0 p-4 text-white bg-gradient" style={{ background: 'linear-gradient(to top, rgba(11,19,41,0.9), transparent)', width: '100%' }}>
            <h4 className="fw-bold text-white mb-1">HotelPro Grand Resort & Spa</h4>
            <p className="mb-0 small text-light">Miami Beach, Florida &bull; Architectural Award of Distinction</p>
          </div>
        </div>
      </section>

      {/* Philosophy Pillars */}
      <section className="container mb-5">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border h-100">
              <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                <Heart size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Intuitive Care</h5>
              <p className="text-muted small mb-0">
                Anticipating our guests’ desires before they are spoken, creating tailored memories that linger long after check-out.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border h-100">
              <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                <Compass size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Sustainable Luxury</h5>
              <p className="text-muted small mb-0">
                Committed to eco-conscious resort operations, solar optimization, zero-waste cuisine, and ocean conservation.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="bg-white p-4 rounded-3 border h-100">
              <div className="bg-light rounded-circle d-inline-flex p-3 text-warning mb-3">
                <ShieldCheck size={28} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Digital Simplicity</h5>
              <p className="text-muted small mb-0">
                Pioneering full-stack hotel management with instant real-time room availability, keyless access, and verified invoicing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
