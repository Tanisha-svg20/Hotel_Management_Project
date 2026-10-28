import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been sent to our concierge desk!');
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '80vh' }}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="text-warning text-uppercase fw-bold small" style={{ letterSpacing: '1px' }}>Concierge Desk</span>
          <h1 className="display-4 fw-bold text-dark luxury-heading mb-2">Connect With Us</h1>
          <p className="lead text-muted fs-6" style={{ maxWidth: '650px', margin: '0 auto' }}>
            Have a special inquiry, group booking request, or event plan? Our dedicated team is at your service 24/7.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Details */}
          <div className="col-lg-5">
            <div className="card luxury-card p-4 border-0 h-100">
              <h4 className="fw-bold text-dark mb-4">HotelPro Resort Contact</h4>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-light p-2 rounded-circle text-warning flex-shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Resort Location</h6>
                  <p className="text-muted small mb-0">777 Ocean Drive, Marina Boulevard<br />Miami Beach, FL 33139, United States</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-light p-2 rounded-circle text-warning flex-shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Telephone & Concierge</h6>
                  <p className="text-muted small mb-0">+1 (305) 555-0199 (Front Desk)<br />Toll Free: 1-800-HOTELPRO</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-light p-2 rounded-circle text-warning flex-shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Email Enquiries</h6>
                  <p className="text-muted small mb-0">concierge@hotelpro.com<br />reservations@hotelpro.com</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mt-auto pt-3 border-top">
                <div className="bg-light p-2 rounded-circle text-warning flex-shrink-0">
                  <Clock size={22} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Service Hours</h6>
                  <p className="text-muted small mb-0">Front Desk & Valet: Open 24/7/365</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="col-lg-7">
            <div className="card luxury-card p-4 p-md-5 border-0">
              <h4 className="fw-bold text-dark mb-3">Send a Message</h4>
              {submitted ? (
                <div className="text-center py-5">
                  <CheckCircle2 size={56} className="text-success mx-auto mb-3" />
                  <h5 className="fw-bold">Thank You!</h5>
                  <p className="text-muted">We have received your message and will respond within 2 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-navy btn-sm">Send Another Note</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Airport Shuttle, VIP Dining, Wedding Venue"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold px-4 py-2 d-inline-flex align-items-center gap-2">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

