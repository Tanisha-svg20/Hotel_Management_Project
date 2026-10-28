import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Award, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-light pt-5 pb-4 mt-auto" style={{ backgroundColor: '#070d1e' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand & Vision */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-warning text-dark rounded-2 p-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <Hotel size={20} color="#0b1329" />
              </div>
              <h5 className="mb-0 fw-bold fs-4 text-white">Hotel<span className="text-warning">Pro</span></h5>
            </div>
            <p className="text-secondary small mb-4" style={{ lineHeight: '1.7' }}>
              Redefining luxury hospitality and seamless digital reservation experiences. Offering hand-curated suites, pristine beachside retreats, and world-class concierge service.
            </p>
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <span className="d-flex align-items-center gap-1"><Award size={16} className="text-warning" /> 5-Star Certified</span>
              <span className="d-flex align-items-center gap-1"><Clock size={16} className="text-warning" /> 24/7 Concierge</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white text-uppercase fw-bold mb-3 fs-6" style={{ letterSpacing: '1px' }}>Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-secondary text-decoration-none hover-white">Home</Link></li>
              <li><Link to="/rooms" className="text-secondary text-decoration-none hover-white">Rooms & Suites</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none hover-white">Our Heritage</Link></li>
              <li><Link to="/contact" className="text-secondary text-decoration-none hover-white">Customer Support</Link></li>
              <li><Link to="/rooms?type=Suite" className="text-secondary text-decoration-none hover-white">Executive Suites</Link></li>
            </ul>
          </div>

          {/* Guest Services */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white text-uppercase fw-bold mb-3 fs-6" style={{ letterSpacing: '1px' }}>Portals</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/customer" className="text-secondary text-decoration-none hover-white">Guest Dashboard</Link></li>
              <li><Link to="/customer/bookings" className="text-secondary text-decoration-none hover-white">Booking History</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-white">Member Login</Link></li>
              <li><Link to="/staff" className="text-secondary text-decoration-none hover-white">Staff Operations</Link></li>
              <li><Link to="/admin" className="text-secondary text-decoration-none hover-white">Admin Management</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-white text-uppercase fw-bold mb-3 fs-6" style={{ letterSpacing: '1px' }}>Contact & Location</h6>
            <ul className="list-unstyled small text-secondary d-flex flex-column gap-2 mb-3">
              <li className="d-flex align-items-start gap-2">
                <MapPin size={18} className="text-warning flex-shrink-0 mt-1" />
                <span>777 Ocean Drive, Marina Boulevard, Miami Beach, FL 33139</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={18} className="text-warning flex-shrink-0" />
                <span>+1 (305) 555-0199 / Reservations: Ext. 101</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={18} className="text-warning flex-shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
            <div className="bg-dark p-2 rounded-2 text-secondary small border border-secondary border-opacity-25">
              Secure payments powered by Stripe & Razorpay certified encryption.
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small gap-2">
          <div>
            &copy; {new Date().getFullYear()} HotelPro Resort & Management System. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span className="text-secondary text-decoration-none">Privacy Policy</span>
            <span>&bull;</span>
            <span className="text-secondary text-decoration-none">Terms of Service</span>
            <span>&bull;</span>
            <span className="text-secondary text-decoration-none">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

