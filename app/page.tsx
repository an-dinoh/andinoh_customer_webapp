"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, Star, MapPin, Building2, Plane, PartyPopper, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/common/Button";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken);
  }, []);

  const featuredHotels = [
    {
      id: "1",
      name: "Grand Plaza Hotel",
      city: "Lagos",
      country: "Nigeria",
      rating: 4.8,
      reviews: 245,
      price: 45000,
      featured: true,
    },
    {
      id: "2",
      name: "Luxury Suites & Spa",
      city: "Abuja",
      country: "Nigeria",
      rating: 4.9,
      reviews: 189,
      price: 55000,
      featured: true,
    },
    {
      id: "3",
      name: "Ocean View Resort",
      city: "Port Harcourt",
      country: "Nigeria",
      rating: 4.7,
      reviews: 312,
      price: 38000,
      featured: false,
    },
  ];

  const recentBookings = [
    {
      id: "1",
      type: "hotel",
      name: "Grand Plaza Hotel",
      location: "Lagos",
      date: "Dec 25-27, 2024",
      status: "confirmed",
    },
    {
      id: "2",
      type: "flight",
      name: "Lagos to Abuja",
      location: "LOS → ABV",
      date: "Jan 5, 2025",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "Hotels",
      icon: Building2,
      description: "Find your perfect stay",
      href: "/hotels",
      color: "bg-[#E8F4F8]",
      iconColor: "text-[#0F75BD]",
    },
    {
      title: "Flights",
      icon: Plane,
      description: "Book your next trip",
      href: "/flights",
      color: "bg-[#FEF3C7]",
      iconColor: "text-orange-600",
    },
    {
      title: "Events",
      icon: PartyPopper,
      description: "Reserve event spaces",
      href: "/events",
      color: "bg-[#F5F3FF]",
      iconColor: "text-purple-600",
    },
  ];

  // View for LOGGED-IN users
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back!</h1>
          <p className="text-sm sm:text-base text-[#5C5B59]">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.title}>
                  <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-4 sm:p-6 hover:border-[#0F75BD] transition-all group cursor-pointer">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${action.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5B59]">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Recent Bookings</h2>
            <Link href="/bookings" className="text-[#0F75BD] font-semibold text-xs sm:text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-[#E5E7EB] rounded-[22px] p-4 sm:p-6 hover:border-[#0F75BD] transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center flex-shrink-0">
                      {booking.type === "hotel" ? (
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F75BD]" />
                      ) : (
                        <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F75BD]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] truncate">{booking.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        <span className="text-xs sm:text-sm text-[#5C5B59] flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="truncate">{booking.location}</span>
                        </span>
                        <span className="text-xs sm:text-sm text-[#5C5B59] flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          {booking.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <span
                      className={`inline-block w-full sm:w-auto text-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                        booking.status === "confirmed"
                          ? "bg-[#ECFDF5] text-green-700"
                          : "bg-[#FEF3C7] text-orange-700"
                      }`}
                    >
                      {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Hotels */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Recommended for You</h2>
            <Link href="/hotels" className="text-[#0F75BD] font-semibold text-xs sm:text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredHotels.map((hotel) => (
              <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] flex items-center justify-center overflow-hidden">
                    <span className="text-5xl sm:text-6xl">🏨</span>

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                      </span>
                    </div>

                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                      <span className="px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 backdrop-blur-sm text-[#5C5B59]">
                        {hotel.reviews} reviews
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1 sm:mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5B59] mb-3">
                      {hotel.city}, {hotel.country}
                    </p>
                    <div className="border-t border-[#E5E7EB] my-3"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                        <p className="text-lg sm:text-xl font-bold text-[#0F75BD]">
                          ₦{hotel.price.toLocaleString()}
                          <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                        </p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-[#0F75BD] text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View for NON-LOGGED-IN users
  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Home</h1>
        <p className="text-sm sm:text-base text-[#5C5B59]">Browse hotels, flights, and events</p>
      </div>

      {/* Hotels Section */}
      <section className="mb-10 sm:mb-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Hotels</h2>
          <Link href="/hotels" className="text-[#0F75BD] font-semibold text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {featuredHotels.map((hotel) => (
            <Link href={`/hotels/${hotel.id}`} key={hotel.id} className="block group">
              <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Hotel Visual */}
                  <div className="md:w-64 h-32 md:h-auto bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] relative flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">🏨</span>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-[#1A1A1A]">{hotel.rating}</span>
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        {hotel.city}
                      </span>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-sm text-[#5C5B59] mb-2">
                          {hotel.city}, {hotel.country}
                        </p>
                        <p className="text-xs text-[#5C5B59]">{hotel.reviews} reviews</p>
                      </div>

                      {/* Price Section */}
                      <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end gap-3 lg:min-w-[160px] border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-3 lg:pt-0 lg:pl-4">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-[#5C5B59] mb-0.5 font-medium">From</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#0F75BD]">
                            ₦{hotel.price.toLocaleString()}
                            <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flights Section */}
      <section className="mb-10 sm:mb-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Flights</h2>
          <Link href="/flights" className="text-[#0F75BD] font-semibold text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {[
            { id: "1", route: "Lagos → Abuja", airline: "United Nigeria", price: 45000, duration: "1h 15m", stops: "Direct" },
            { id: "2", route: "Abuja → Port Harcourt", airline: "Air Peace", price: 52000, duration: "1h 30m", stops: "Direct" },
            { id: "3", route: "Lagos → Kano", airline: "Arik Air", price: 48000, duration: "2h 00m", stops: "Direct" },
          ].map((flight) => (
            <Link href={`/flights`} key={flight.id} className="block group">
              <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Flight Visual */}
                  <div className="md:w-64 h-32 md:h-auto bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] relative flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">✈️</span>

                    {/* Airline Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        {flight.airline}
                      </span>
                    </div>

                    {/* Direct Badge */}
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1.5 bg-[#F0F9FF] text-[#0F75BD] text-xs font-semibold rounded-lg border border-[#E8F4F8]">
                        {flight.stops}
                      </span>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                          {flight.route}
                        </h3>
                        <p className="text-sm text-[#5C5B59] mb-2">{flight.duration}</p>
                        <p className="text-xs text-[#5C5B59]">Economy</p>
                      </div>

                      {/* Price Section */}
                      <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end gap-3 lg:min-w-[160px] border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-3 lg:pt-0 lg:pl-4">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-[#5C5B59] mb-0.5 font-medium">From</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#0F75BD]">
                            ₦{flight.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section>
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Events</h2>
          <Link href="/events" className="text-[#0F75BD] font-semibold text-sm hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {[
            { id: "1", name: "Conference Hall A", venue: "Grand Plaza Hotel", capacity: 200, price: 150000, type: "Conference" },
            { id: "2", name: "Garden Pavilion", venue: "Ocean View Resort", capacity: 300, price: 250000, type: "Wedding" },
            { id: "3", name: "Rooftop Lounge", venue: "Luxury Suites", capacity: 100, price: 120000, type: "Party" },
          ].map((event) => (
            <Link href={`/events`} key={event.id} className="block group">
              <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Event Visual */}
                  <div className="md:w-64 h-32 md:h-auto bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] relative flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform">🎭</span>

                    {/* Capacity Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        {event.capacity} guests
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-lg">
                        {event.type}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-sm text-[#5C5B59]">{event.venue}</p>
                      </div>

                      {/* Price Section */}
                      <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end gap-3 lg:min-w-[160px] border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-3 lg:pt-0 lg:pl-4">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-[#5C5B59] mb-0.5 font-medium">From</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#0F75BD]">
                            ₦{event.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
