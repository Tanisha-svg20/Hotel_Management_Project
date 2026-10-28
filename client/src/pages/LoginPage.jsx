import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedUser.role === 'staff') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluator convenience
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="py-5 d-flex align-items-center" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-light)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card luxury-card border-0 shadow-lg p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="bg-warning text-dark rounded-circle d-inline-flex p-3 mb-3">
                  <Hotel size={32} color="#0b1329" />
                </div>
                <h3 className="fw-bold text-dark luxury-heading mb-1">Welcome to HotelPro</h3>
                <p className="text-muted small">Sign in to manage your reservations and profile.</p>
              </div>

              {/* Demo Account Pills */}
              <div className="bg-light p-3 rounded-3 border mb-4">
                <span className="d-block small text-muted fw-bold mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  Quick Demo Login (One-Click Fill)
                </span>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@hotelpro.com', 'Admin@123')}
                    className="btn btn-outline-danger btn-sm py-1 px-2"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('staff@hotelpro.com', 'Staff@123')}
                    className="btn btn-outline-info btn-sm py-1 px-2 text-dark"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('customer@hotelpro.com', 'User@123')}
                    className="btn btn-outline-primary btn-sm py-1 px-2"
                  >
                    Customer
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Mail size={16} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-dark">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-white border-start-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-gold w-100 py-2 fw-bold fs-6 mb-3"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    'Sign In to HotelPro'
                  )}
                </button>

                <div className="text-center small text-muted">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-warning fw-bold text-decoration-none">
                    Create an Account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
