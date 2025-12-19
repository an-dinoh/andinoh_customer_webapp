"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Plane, Building2, PartyPopper, Clock, CheckCircle, XCircle, AlertCircle, Download, Eye } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

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
  ];

  const filteredBookings = allBookings.filter((booking) => {
    const typeMatch = filter === "all" || booking.type === filter.slice(0, -1);
    const statusMatch = statusFilter === "all" || booking.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      confirmed: "bg-green-50 text-green-700",
      pending: "bg-yellow-50 text-yellow-700",
      cancelled: "bg-red-50 text-red-700",
      completed: "bg-blue-50 text-blue-700",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: "hotel" | "flight" | "event") => {
    const icons = {
      hotel: Building2,
      flight: Plane,
      event: PartyPopper,
    };
    const Icon = icons[type];
    return <Icon className="w-6 h-6 text-[#0F75BD]" />;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">My Bookings</h1>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  filter === "all"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59] hover:bg-[#E5E7EB]"
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setFilter("hotels")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                  filter === "hotels"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59] hover:bg-[#E5E7EB]"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Hotels
              </button>
              <button
                onClick={() => setFilter("flights")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                  filter === "flights"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59] hover:bg-[#E5E7EB]"
                }`}
              >
                <Plane className="w-4 h-4" />
                Flights
              </button>
              <button
                onClick={() => setFilter("events")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                  filter === "events"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59] hover:bg-[#E5E7EB]"
                }`}
              >
                <PartyPopper className="w-4 h-4" />
                Events
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
              className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-[#E8F4F8] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#0F75BD]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No bookings found</h3>
            <p className="text-[#5C5B59] mb-6">
              You don't have any bookings matching the selected filters.
            </p>
            <Link href="/">
              <Button>Start Booking</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Icon & Type */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(booking.type)}
                    </div>
                    <div className="flex-1 md:hidden">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-[#1A1A1A]">{booking.title}</h3>
                        {getStatusIcon(booking.status)}
                      </div>
                      <p className="text-sm text-[#5C5B59] mb-1">{booking.subtitle}</p>
                      <p className="text-xs text-[#5C5B59] mb-2">{booking.bookingRef}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="hidden md:flex flex-1 items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#1A1A1A]">{booking.title}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-[#5C5B59] mb-1">{booking.subtitle}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-[#5C5B59] mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.date}
                        </span>
                        <span>{booking.details}</span>
                      </div>
                      <p className="text-xs text-[#5C5B59] mt-2">
                        Booking Reference: {booking.bookingRef}
                      </p>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-xs text-[#5C5B59] mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-[#0F75BD] mb-4">
                        ₦{booking.amount.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {booking.status === "confirmed" && (
                          <Button size="sm" className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-xs text-[#5C5B59]">Total Amount</p>
                        <p className="text-xl font-bold text-[#0F75BD]">
                          ₦{booking.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#5C5B59] mb-3">
                      <Calendar className="w-4 h-4" />
                      {booking.date}
                    </div>
                    <p className="text-sm text-[#5C5B59] mb-3">{booking.details}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" fullWidth>
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      {booking.status === "confirmed" && (
                        <Button size="sm" fullWidth>
                          <Download className="w-4 h-4" />
                          Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4">
              <p className="text-sm text-[#5C5B59] mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{allBookings.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-[#5C5B59] mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {allBookings.filter((b) => b.status === "confirmed").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-[#5C5B59] mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {allBookings.filter((b) => b.status === "pending").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-[#5C5B59] mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-[#0F75BD]">
                ₦
                {allBookings
                  .filter((b) => b.status !== "cancelled")
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString()}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
