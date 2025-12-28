"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Users, Plane, Building2, PartyPopper, Clock, CheckCircle, XCircle, AlertCircle, Download, Eye, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

type BookingType = "all" | "hotels" | "flights" | "events";
type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

interface Booking {
  id: string;
  type: "hotel" | "flight" | "event";
  status: BookingStatus;
  title: string;
  subtitle: string;
  date: string;
  details: string;
  amount: number;
  bookingRef: string;
}

export default function BookingsPage() {
  const [filter, setFilter] = useState<BookingType>("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Mock bookings data
  const allBookings: Booking[] = [
    {
      id: "1",
      type: "hotel",
      status: "confirmed",
      title: "Grand Plaza Hotel",
      subtitle: "Executive Double Room",
      date: "Feb 15-17, 2024",
      details: "Lagos, Nigeria • 2 nights • 2 guests",
      amount: 90000,
      bookingRef: "HTL-2024-001",
    },
    {
      id: "2",
      type: "flight",
      status: "confirmed",
      title: "Air Peace P47215",
      subtitle: "Lagos → Abuja",
      date: "Feb 20, 2024",
      details: "Economy • 1 passenger • Departure: 08:00",
      amount: 45000,
      bookingRef: "FLT-2024-002",
    },
    {
      id: "3",
      type: "event",
      status: "pending",
      title: "Conference Hall A",
      subtitle: "Grand Plaza Hotel",
      date: "Mar 5, 2024",
      details: "Corporate Meeting • 50 attendees • 09:00 - 17:00",
      amount: 150000,
      bookingRef: "EVT-2024-003",
    },
    {
      id: "4",
      type: "hotel",
      status: "completed",
      title: "Ocean View Resort",
      subtitle: "Premium Suite",
      date: "Jan 10-12, 2024",
      details: "Port Harcourt, Nigeria • 2 nights • 4 guests",
      amount: 150000,
      bookingRef: "HTL-2024-004",
    },
    {
      id: "5",
      type: "flight",
      status: "cancelled",
      title: "Arik Air W3302",
      subtitle: "Abuja → Lagos",
      date: "Jan 25, 2024",
      details: "Economy • 1 passenger • Cancelled by user",
      amount: 48000,
      bookingRef: "FLT-2024-005",
    },
    {
      id: "6",
      type: "event",
      status: "confirmed",
      title: "Garden Pavilion",
      subtitle: "Ocean View Resort",
      date: "Feb 28, 2024",
      details: "Wedding Reception • 200 attendees • 18:00 - 23:00",
      amount: 350000,
      bookingRef: "EVT-2024-006",
    },
  ];

  const filteredBookings = allBookings.filter((booking) => {
    const typeMatch = filter === "all" || booking.type === filter.slice(0, -1);
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      confirmed: "bg-[#ECFDF5] text-green-700",
      pending: "bg-[#FEF3C7] text-orange-700",
      cancelled: "bg-[#FEE2E2] text-red-700",
      completed: "bg-[#EFF6FF] text-blue-700",
    };

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: "hotel" | "flight" | "event") => {
    const icons = {
      hotel: "🏨",
      flight: "✈️",
      event: "🎭",
    };
    return icons[type];
  };

  const getTypeColor = (type: "hotel" | "flight" | "event") => {
    const colors = {
      hotel: "from-[#E8F4F8] to-[#F0F9FF]",
      flight: "from-[#E8F4F8] to-[#F0F9FF]",
      event: "from-[#E8F4F8] to-[#F0F9FF]",
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">My Bookings</h1>
        <p className="text-sm sm:text-base text-[#5C5B59]">Manage all your hotel, flight, and event bookings</p>
      </div>

      {/* Search Bar - Sticky */}
      <div className="sticky top-[80px] z-40 bg-white pb-4 -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 border-b border-[#E5E7EB]">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by booking reference, hotel, flight..."
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Booking Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Bookings" },
                    { value: "hotels", label: "Hotels", icon: Building2 },
                    { value: "flights", label: "Flights", icon: Plane },
                    { value: "events", label: "Events", icon: PartyPopper },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filter === option.value}
                        onChange={() => setFilter(option.value as BookingType)}
                        className="w-4 h-4 text-[#0F75BD]"
                      />
                      {option.icon && <option.icon className="w-4 h-4 text-[#5C5B59]" />}
                      <span className="text-sm text-[#5C5B59]">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Booking Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Statuses" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ].map((status) => (
                    <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === status.value}
                        onChange={() => setStatusFilter(status.value as BookingStatus | "all")}
                        className="w-4 h-4 text-[#0F75BD]"
                      />
                      <span className="text-sm text-[#5C5B59]">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bookings List */}
      <div className="mt-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm sm:text-base text-[#5C5B59]">
            <span className="font-semibold text-[#1A1A1A]">{filteredBookings.length}</span> bookings found
          </p>
          <select className="px-3 sm:px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD] w-full sm:w-auto">
            <option>Date: Newest First</option>
            <option>Date: Oldest First</option>
            <option>Amount: High to Low</option>
            <option>Amount: Low to High</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8F4F8] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#0F75BD]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2">No bookings found</h3>
            <p className="text-sm sm:text-base text-[#5C5B59] mb-6">
              You don't have any bookings matching the selected filters.
            </p>
            <Link href="/">
              <Button>Start Booking</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} hover className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Booking Visual */}
                  <div className={`md:w-64 h-32 md:h-auto bg-gradient-to-br ${getTypeColor(booking.type)} relative flex items-center justify-center`}>
                    <span className="text-5xl sm:text-6xl">{getTypeIcon(booking.type)}</span>

                    {/* Booking Ref Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <span className="text-xs font-bold text-[#0F75BD]">{booking.bookingRef}</span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg capitalize">
                        {booking.type}
                      </span>
                    </div>

                    {/* Status Badge - Bottom */}
                    <div className="absolute bottom-4 left-4">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex-1">
                        {/* Title & Status */}
                        <div className="mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1">
                            {booking.title}
                          </h3>
                          <p className="text-sm text-[#5C5B59] font-medium">{booking.subtitle}</p>
                        </div>

                        {/* Date & Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#5C5B59]">
                            <Calendar className="w-4 h-4 text-[#0F75BD]" />
                            <span className="font-medium">{booking.date}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#5C5B59] pl-6">{booking.details}</p>
                        </div>
                      </div>

                      {/* Price & Actions Section */}
                      <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-start lg:items-end gap-3 lg:min-w-[180px]">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-[#5C5B59] mb-0.5">Total Amount</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#0F75BD]">
                            ₦{booking.amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center w-full lg:w-auto">
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 w-full lg:min-w-[140px]">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
