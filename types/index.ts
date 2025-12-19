// User & Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
  phone?: string;
}

// Hotel Types
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  isApproved: boolean;
  isFeatured?: boolean;
}

// Room Types
export type RoomType = "standard" | "deluxe" | "suite" | "presidential";
export type BedType = "single" | "double" | "twin" | "queen" | "king" | "sofa_bed";

export interface Room {
  id: string;
  hotelId: string;
  title: string;
  description: string;
  roomType: RoomType;
  bedType: BedType;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  roomSize: number;
  basePrice: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  hasBalcony?: boolean;
  hasSeaView?: boolean;
  hasCityView?: boolean;
}

// Event Space Types
export interface EventSpace {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacity: number;
  size: number;
  pricePerHour: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  suitableFor: string[];
}

// Flight Types
export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type FlightType = "one_way" | "round_trip" | "multi_city";

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departure: {
    airport: string;
    airportCode: string;
    city: string;
    country: string;
    time: string;
    terminal?: string;
    gate?: string;
  };
  arrival: {
    airport: string;
    airportCode: string;
    city: string;
    country: string;
    time: string;
    terminal?: string;
    gate?: string;
  };
  duration: string;
  stops: number;
  stopDetails?: Array<{
    airport: string;
    duration: string;
  }>;
  price: {
    economy: number;
    premiumEconomy?: number;
    business?: number;
    first?: number;
  };
  availableSeats: {
    economy: number;
    premiumEconomy?: number;
    business?: number;
    first?: number;
  };
  aircraft: string;
  amenities: string[];
}

export interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  flightType: FlightType;
}

// Booking Types
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type BookingType = "room" | "event" | "flight";

export interface RoomBooking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomTitle: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: "pending" | "paid" | "refunded";
  specialRequests?: string;
  createdAt: string;
}

export interface EventBooking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  eventSpaceId: string;
  eventSpaceName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  eventType: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: "pending" | "paid" | "refunded";
  specialRequests?: string;
  createdAt: string;
}

export interface FlightBooking {
  id: string;
  userId: string;
  flightId: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
  };
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    passportNumber?: string;
  }>;
  cabinClass: CabinClass;
  seatNumbers?: string[];
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: string;
}

export type Booking = RoomBooking | EventBooking | FlightBooking;

// Payment Types
export interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer" | "wallet";
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: "pending" | "success" | "failed";
  transactionId?: string;
  createdAt: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  hotelId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  createdAt: string;
  response?: {
    text: string;
    respondedAt: string;
  };
}

// Filter & Search Types
export interface HotelFilters {
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  amenities?: string[];
  roomType?: RoomType[];
  availability?: {
    checkIn: string;
    checkOut: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: "booking" | "payment" | "reminder" | "promotion";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
