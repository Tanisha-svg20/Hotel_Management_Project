import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Hotel, User, LogOut, ShieldCheck, ClipboardCheck, Calendar, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications').then(res => {
        setUnreadNotifications(res.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3" style={{ backgroundColor: 'var(--primary-navy)' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" to="/">
          <div className="bg-warning text-dark rounded-2 p-1 d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px' }}>
            <Hotel size={22} color="#0b1329" />
          </div>
          <span style={{ letterSpacing: '0.5px' }}>Hotel<span className="text-warning">Pro</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-warning fw-semibold' : 'text-light'}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-warning fw-semibold' : 'text-light'}`} to="/rooms">
                Rooms & Suites
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-warning fw-semibold' : 'text-light'}`} to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'text-warning fw-semibold' : 'text-light'}`} to="/contact">
                Contact & Support
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 fw-semibold">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-gold btn-sm px-3">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/customer"
                  className="btn btn-outline-secondary btn-sm position-relative text-light border-0"
                  title="Notifications & Updates"
                >
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-warning btn-sm dropdown-toggle d-flex align-items-center gap-2 px-3 py-2 text-white"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <User size={16} className="text-warning" />
                  <span>Hi, {user?.name?.split(' ')[0]}</span>
                  {isAdmin && <span className="badge bg-danger ms-1">Admin</span>}
                  {isStaff && !isAdmin && <span className="badge bg-info text-dark ms-1">Staff</span>}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2" aria-labelledby="userDropdown" style={{ minWidth: '220px' }}>
                  <li className="px-3 py-2 border-bottom mb-1">
                    <p className="mb-0 fw-bold text-dark">{user?.name}</p>
                    <small className="text-muted text-truncate d-block">{user?.email}</small>
                  </li>

                  {/* Customer Links */}
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/customer">
                      <User size={16} /> My Account
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/customer/bookings">
                      <Calendar size={16} /> My Bookings
                    </Link>
                  </li>

                  {/* Staff Links */}
                  {isStaff && (
                    <>
                      <li className="dropdown-divider my-1"></li>
                      <li className="dropdown-header text-uppercase fs-xs fw-bold text-muted px-3 py-1">Staff Operations</li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-primary" to="/staff">
                          <ClipboardCheck size={16} /> Operations Hub
                        </Link>
                      </li>
                    </>
                  )}

                  {/* Admin Links */}
                  {isAdmin && (
                    <>
                      <li className="dropdown-divider my-1"></li>
                      <li className="dropdown-header text-uppercase fs-xs fw-bold text-muted px-3 py-1">Administration</li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger fw-semibold" to="/admin">
                          <ShieldCheck size={16} /> Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}

                  <li className="dropdown-divider my-1"></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

