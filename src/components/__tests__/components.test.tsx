import { render, screen } from '@testing-library/react';
import HotelCard, { RatingBadge } from '@/components/hotels/HotelCard';
import { searchHref, whereFromParams } from '@/components/hotels/StaySearch';
import { BreakdownSummary, QuoteSummary } from '@/components/bookings/PriceSummary';
import PasswordRules from '@/components/auth/PasswordRules';
import TripCard from '@/components/bookings/TripCard';
import { example } from '@/services/api/__tests__/harness';
import type { HotelBooking, HotelCard as Hotel, Paginated, Quote } from '@/types/api';

const hotel = (example('hotels_list').body as Paginated<Hotel>).results[0];
const plan = { checkIn: '2026-11-01', checkOut: '2026-11-03', adults: 2, children: 0, infants: 0 };

describe('HotelCard', () => {
  it('shows the facts a traveller scans for and keeps the dates in the link', () => {
    render(<HotelCard hotel={hotel} query="in=2026-11-01&out=2026-11-03" />);
    expect(screen.getByText(hotel.name)).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument(); // no reviews yet
    expect(screen.getByText('₦55,000')).toBeInTheDocument(); // "From" the starting price
    expect(screen.getByRole('link')).toHaveAttribute('href', `/hotels/${hotel.id}?in=2026-11-01&out=2026-11-03`);
    expect(screen.getByRole('img', { name: '4-star hotel' })).toBeInTheDocument();
  });
  it('shows a rating with its review count', () => {
    render(<RatingBadge rating={4.56} reviews={12} />);
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});

describe('stay search links', () => {
  it('searches a picked place by id, near me by coordinates, or free words', () => {
    expect(searchHref({ label: 'Lekki, Lagos', city_id: 'c1' }, plan)).toBe('/hotels?city_id=c1&label=Lekki%2C+Lagos&in=2026-11-01&out=2026-11-03&adults=2');
    expect(searchHref({ label: 'Near me', near: { latitude: 6.4, longitude: 3.4 } }, plan)).toContain('near=1&lat=6.4&lng=3.4');
    expect(searchHref({ label: 'palm', search: ' palm ' }, plan, { star_rating: '5' })).toBe('/hotels?search=palm&in=2026-11-01&out=2026-11-03&adults=2&star_rating=5');
    expect(whereFromParams(new URLSearchParams('near=1&lat=6.4&lng=3.4'))).toMatchObject({ label: 'Near me', near: { latitude: 6.4, longitude: 3.4 } });
  });
});

describe('price summaries', () => {
  it('shows the quote as returned, and the split when paying at the hotel', () => {
    render(<QuoteSummary quote={example('quote_pay_at_hotel').body as Quote} />);
    expect(screen.getByText('₦131,437.50')).toBeInTheDocument();
    expect(screen.getByText('Pay now')).toBeInTheDocument();
    expect(screen.getByText('₦31,027.50')).toBeInTheDocument();
    expect(screen.getByText('₦100,410.00')).toBeInTheDocument();
  });
  it('adds up to the booking total: rooms after discount, add-ons, taxes and fees', () => {
    const b = example('booking_detail').body as HotelBooking;
    render(<BreakdownSummary breakdown={b.price_breakdown} currency={b.currency} services={b.services} />);
    expect(screen.getByText('Deep Tissue Massage')).toBeInTheDocument();
    expect(screen.getByText('Includes ₦16,500.00 off')).toBeInTheDocument();
    expect(screen.getAllByText('₦131,437.50')).toHaveLength(2); // total and paid
    expect(screen.queryByText('Balance due')).not.toBeInTheDocument();
  });
});

describe('PasswordRules', () => {
  it('ticks the rules that are met', () => {
    render(<PasswordRules password="Sunny-lagos" />);
    expect(screen.getByText('At least 8 characters').closest('li')).toHaveClass('text-success');
    expect(screen.getByText('A number').closest('li')).toHaveClass('text-muted');
    expect(screen.getByText('A special character, like ! @ # $ %').closest('li')).toHaveClass('text-muted');
  });
});

describe('TripCard', () => {
  it('shows the stay with its status in guest words', () => {
    const b = { ...(example('booking_detail').body as HotelBooking), status: 'checked_out' };
    render(<TripCard booking={b} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(b.confirmation_code)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/trips/${b.id}`);
  });
});
