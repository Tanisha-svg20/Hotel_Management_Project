import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="py-5 d-flex align-items-center text-center" style={{ minHeight: '75vh', backgroundColor: 'var(--bg-light)' }}>
      <div className="container">
        <div className="bg-warning text-dark rounded-circle d-inline-flex p-3 mb-4">
          <Hotel size={48} color="#0b1329" />
        </div>
        <h1 className="display-1 fw-bold text-dark luxury-heading mb-2">404</h1>
        <h3 className="fw-bold text-dark mb-3">Page Not Found</h3>
        <p className="text-muted mb-4 lead fs-6" style={{ maxWidth: '480px', margin: '0 auto 2rem' }}>
          The suite, page, or destination you requested does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-navy px-4 py-2 d-inline-flex align-items-center gap-2">
          <Home size={18} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
