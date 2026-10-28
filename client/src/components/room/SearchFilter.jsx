import React, { useState } from 'react';
import { Calendar, Users, Home, Search, RefreshCw } from 'lucide-react';

const SearchFilter = ({ onSearch, initialValues = {} }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [fromdate, setFromDate] = useState(initialValues.fromdate || tomorrow.toISOString().split('T')[0]);
  const [todate, setToDate] = useState(initialValues.todate || dayAfter.toISOString().split('T')[0]);
  const [capacity, setCapacity] = useState(initialValues.capacity || '1');
  const [type, setType] = useState(initialValues.type || 'All');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ fromdate, todate, capacity, type });
    }
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setCapacity('1');
    setType('All');
    if (onSearch) {
      onSearch({ fromdate: '', todate: '', capacity: '1', type: 'All' });
    }
  };

  return (
    <div className="bg-white rounded-3 shadow p-4 border border-light">
      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end">
          {/* Check-In Date */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
              <Calendar size={15} className="text-warning" />
              <span>Check-in Date</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={fromdate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* Check-Out Date */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
              <Calendar size={15} className="text-warning" />
              <span>Check-out Date</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={todate}
              min={fromdate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Guests */}
          <div className="col-lg-2 col-md-4">
            <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
              <Users size={15} className="text-warning" />
              <span>Guests</span>
            </label>
            <select
              className="form-select"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </div>

          {/* Room Type */}
          <div className="col-lg-2 col-md-4">
            <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
              <Home size={15} className="text-warning" />
              <span>Room Category</span>
            </label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family Suite">Family Suite</option>
              <option value="Presidential Suite">Presidential Suite</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="col-lg-2 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-gold w-100 d-flex align-items-center justify-content-center gap-2 py-2">
              <Search size={16} />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline-secondary px-2"
              title="Reset Filters"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;

