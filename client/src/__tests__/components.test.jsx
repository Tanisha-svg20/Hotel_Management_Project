import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoomCard from '../components/room/RoomCard';
import SearchFilter from '../components/room/SearchFilter';
import InvoiceModal from '../components/booking/InvoiceModal';

describe('HotelPro Frontend Component Verification', () => {
  const mockRoom = {
    _id: 'room-101',
    roomNumber: '101',
    type: 'Deluxe',
    rent: 220,
    capacity: 2,
    description: 'An elegant coastal sanctuary with king-size bed and ocean balcony.',
    amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning'],
    photos: ['https://example.com/photo.jpg'],
    operationalStatus: 'available'
  };

  it('RoomCard renders room title, nightly rent, and capacity correctly', () => {
    const onBookNow = vi.fn();
    render(
      <BrowserRouter>
        <RoomCard room={mockRoom} onBookNow={onBookNow} />
      </BrowserRouter>
    );

    // Verify room number and type
    expect(screen.getByText(/Room #101/)).toBeDefined();
    expect(screen.getAllByText(/Deluxe/).length).toBeGreaterThan(0);

    // Verify price
    expect(screen.getByText('$220')).toBeDefined();

    // Verify capacity
    expect(screen.getByText(/Up to 2 Guests/)).toBeDefined();

    // Verify book action
    const bookBtn = screen.getByRole('button', { name: /book/i });
    fireEvent.click(bookBtn);
    expect(onBookNow).toHaveBeenCalledWith(mockRoom);
  });

  it('SearchFilter renders date pickers and submits selected criteria', () => {
    const onSearch = vi.fn();
    render(<SearchFilter onSearch={onSearch} initialValues={{ fromdate: '2026-11-01', todate: '2026-11-05', capacity: '2', type: 'Suite' }} />);

    expect(screen.getByText('Check-in Date')).toBeDefined();
    expect(screen.getByText('Check-out Date')).toBeDefined();

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    expect(onSearch).toHaveBeenCalledWith({
      fromdate: '2026-11-01',
      todate: '2026-11-05',
      capacity: '2',
      type: 'Suite'
    });
  });

  it('InvoiceModal displays official tax receipt with itemized charges', () => {
    const mockBooking = {
      bookingId: 'HP-BK-20261101-ABCD',
      guestName: 'Jonathan Miller',
      guestEmail: 'customer@hotelpro.com',
      guestPhone: '+1 555-010-0003',
      fromdate: '2026-11-01T00:00:00.000Z',
      todate: '2026-11-04T00:00:00.000Z',
      totaldays: 3,
      nightlyPriceSnapshot: 200,
      totalAmount: 678,
      status: 'confirmed',
      room: {
        roomNumber: '202',
        type: 'Double Suite'
      }
    };

    render(<InvoiceModal booking={mockBooking} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/TAX INVOICE/i)).toBeDefined();
    expect(screen.getByText(/Jonathan Miller/i)).toBeDefined();
    expect(screen.getByText(/PAID IN FULL/i)).toBeDefined();
    expect(screen.getByText(/\$678 USD/i)).toBeDefined();
  });
});
